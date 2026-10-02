import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  assembleGeospatialBundle,
  computePolygonGeometry
} from './server/api/geospatialService.ts';
import { generateSiteIntelligenceReasoning } from './server/api/geminiReasoner.ts';
import type { SiteBoundary, SiteIntelligenceProfile } from './src/types/site.ts';
import { PRESET_SITES } from './src/data/presets.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Healthcheck endpoint for Cloud Run
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  // API Route: Get preset parcels
  app.get('/api/presets', (_req, res) => {
    res.json({ presets: PRESET_SITES });
  });

  // API Route: Reverse Geocode coordinates to place name
  app.post('/api/reverse-geocode', async (req, res) => {
    try {
      const { lat, lng } = req.body;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        res.status(400).json({ error: 'Valid lat and lng required' });
        return;
      }

      // Query OpenStreetMap Nominatim with timeout
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const geoRes = await fetch(url, {
          headers: { 'User-Agent': 'TerraInspect-MVP/1.0' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const displayName = geoData.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          res.json({ addressName: displayName, details: geoData.address });
          return;
        }
      } catch {
        // Fallback below
      }

      res.json({ addressName: `Parcel at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Geocoding error' });
    }
  });

  // API Route: Search location name
  app.post('/api/search-location', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&limit=5`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const searchRes = await fetch(url, {
          headers: { 'User-Agent': 'TerraInspect-MVP/1.0' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const results = searchData.map((item: any) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type,
            bbox: item.boundingbox
          }));
          res.json({ results });
          return;
        }
      } catch {
        // Fallback
      }

      // Check presets for match
      const matched = PRESET_SITES.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.region.toLowerCase().includes(query.toLowerCase())
      );
      res.json({
        results: matched.map((p) => ({
          displayName: `${p.name}, ${p.region}`,
          lat: p.coordinates.lat,
          lng: p.coordinates.lng,
          type: 'preset'
        }))
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Search error' });
    }
  });

  // API Route: Core Site Analysis Pipeline
  app.post('/api/analyze-site', async (req, res) => {
    try {
      const { boundary, addressName } = req.body as {
        boundary: SiteBoundary;
        addressName?: string;
      };

      if (!boundary || !boundary.coordinates || boundary.coordinates.length < 3) {
        res.status(400).json({ error: 'Valid site boundary polygon coordinates required' });
        return;
      }

      // Recalculate geometry for strict mathematical accuracy
      const geom = computePolygonGeometry(boundary.coordinates);
      const accurateBoundary: SiteBoundary = {
        ...boundary,
        areaSquareMeters: geom.areaSquareMeters,
        areaAcres: geom.areaAcres,
        perimeterMeters: geom.perimeterMeters
      };

      const resolvedAddress = addressName || `Parcel Coordinates (${accurateBoundary.center.lat.toFixed(4)}, ${accurateBoundary.center.lng.toFixed(4)})`;

      // Step 1: Geospatial + Geological data assembly & normalization
      const rawBundle = await assembleGeospatialBundle(accurateBoundary, resolvedAddress);

      // Step 2: LLM reasoning layer interprets evidence and enforces anti-hallucination structure
      const reasoning = await generateSiteIntelligenceReasoning(rawBundle, accurateBoundary, resolvedAddress);

      // Step 3: Compile comprehensive explainable site intelligence profile
      const siteId = `terra-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const profile: SiteIntelligenceProfile = {
        siteId,
        timestamp: new Date().toISOString(),
        location: {
          addressName: resolvedAddress,
          lat: accurateBoundary.center.lat,
          lng: accurateBoundary.center.lng,
          areaSquareMeters: accurateBoundary.areaSquareMeters,
          areaAcres: accurateBoundary.areaAcres,
          perimeterMeters: accurateBoundary.perimeterMeters,
          boundary: accurateBoundary
        },
        elevation: rawBundle.elevation,
        surface: rawBundle.surface,
        hydrology: rawBundle.hydrology,
        geology: rawBundle.geology,
        soil: rawBundle.soil,
        subsurface: rawBundle.subsurface,
        findings: reasoning.enhancedFindings,
        missingDataInventory: rawBundle.missingData,
        recommendedFieldInvestigations: rawBundle.fieldRecommendations,
        dataProvenances: rawBundle.provenances,
        llmInterpretation: {
          executiveSummary: reasoning.executiveSummary,
          terrainAndDrainageSynthesis: reasoning.terrainAndDrainageSynthesis,
          geologySubsurfaceSynthesis: reasoning.geologySubsurfaceSynthesis,
          uncertaintyAndRiskBoundary: reasoning.uncertaintyAndRiskBoundary
        }
      };

      res.json({ success: true, profile });
    } catch (err: any) {
      console.error('Error during site analysis:', err);
      res.status(500).json({ error: err.message || 'Internal error during site analysis pipeline' });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const portNum = Number(PORT);
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`TerraInspect MVP server running on http://0.0.0.0:${portNum}`);
  });
}

startServer();
