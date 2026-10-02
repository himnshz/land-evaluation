import { GoogleGenAI } from '@google/genai';
import type { RawGeospatialBundle } from './geospatialService.ts';
import type { Finding, SiteBoundary } from '../../src/types/site.ts';

export interface LLMReasoningOutput {
  executiveSummary: string;
  terrainAndDrainageSynthesis: string;
  geologySubsurfaceSynthesis: string;
  uncertaintyAndRiskBoundary: string;
  enhancedFindings: Finding[];
}

export async function generateSiteIntelligenceReasoning(
  bundle: RawGeospatialBundle,
  boundary: SiteBoundary,
  addressName: string
): Promise<LLMReasoningOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback synthesis if API key is not available
  const defaultOutput: LLMReasoningOutput = {
    executiveSummary: `Site analysis for ${addressName || 'selected parcel'} (${boundary.areaAcres} acres, ${boundary.areaSquareMeters.toLocaleString()} m²) indicates an average slope of ${bundle.elevation.slopePercentMean}% (${bundle.elevation.slopeCategory}) with ${bundle.elevation.elevationDeltaM}m total elevation relief across the plot. Gravity drainage trends in a ${bundle.hydrology.drainageDirection}. The site lies within the regional outcrop footprint of the ${bundle.geology.macroFormation} (${bundle.geology.lithologyType}). No site-specific boreholes or intrusive soil investigations exist on this parcel; all subsurface stratigraphy is derived from regional geological literature and requires direct physical verification before engineering decisions.`,
    terrainAndDrainageSynthesis: `Topographic analysis reveals elevation ranging from ${bundle.elevation.minElevationM}m to ${bundle.elevation.maxElevationM}m. The ${bundle.elevation.aspectCompass} aspect directs surface runoff toward the ${bundle.elevation.aspectCompass} parcel boundary. The lowest elevation sector serves as the primary collection zone for storm drainage. Because satellite DEM datasets cannot resolve sub-meter swales or buried culverts, physical inspection of localized stormwater pathways and ponding marks is essential.`,
    geologySubsurfaceSynthesis: `The regional geological context is dominated by ${bundle.geology.regionalGeologicalUnit}, characterized by ${bundle.geology.lithologyType}. ${bundle.geology.karstSolubleRockIndicator ? 'Because this formation contains soluble carbonate units, regional dissolution features (karst/voids) represent a known geological vulnerability.' : 'Bedrock competence is regionally supported, but depth-to-sound-rock varies.'} Importantly, regional geological mapping cannot be extrapolated to plot-level depth-to-bedrock without on-site exploratory drilling.`,
    uncertaintyAndRiskBoundary: `Crucial unknowns include: (1) True allowable soil bearing capacity, (2) Seasonal high groundwater level fluctuations, (3) Exact depth to competent bedrock, and (4) Presence of buried anomalies or compressible fill. This report is an initial decision-support intelligence tool, not a substitute for a geotechnical engineering investigation, legal boundary survey, or environmental audit.`,
    enhancedFindings: bundle.initialFindings
  };

  if (!apiKey) {
    return defaultOutput;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `You are the lead geotechnical and geospatial intelligence reasoning engine for TerraInspect.
Your purpose is to generate an EXPLAINABLE pre-purchase site profile for a parcel of land being considered for acquisition.

CRITICAL CONSTRAINTS - NEVER HALLUCINATE GEOLOGY:
1. NEVER invent boreholes, never fabricate exact rock depths or soil bearing capacities.
2. Clearly distinguish between:
   - VERIFIED: Directly supported by the retrieved dataset.
   - DATA-DERIVED: Calculated from available data (e.g. slope from DEM).
   - REGIONAL: Information describing the broader geological region rather than the exact property.
   - INFERRED: A reasoned interpretation based on available evidence.
   - UNKNOWN: Information that cannot currently be established.
   - FIELD-VERIFICATION-REQUIRED: Information that requires physical ground investigation.
3. Every finding MUST strictly follow the 7-component explainable schema:
   - Finding: What was identified?
   - Evidence: What data supports it?
   - Source: Where did the data come from?
   - Reasoning: Why does the evidence lead to this interpretation?
   - Confidence: High, Moderate, Low, or Unknown (with justification).
   - Unknowns: What information is missing?
   - Recommended Verification: What should be physically checked?
4. Do NOT make a BUY or DO NOT BUY decision. Provide objective, evidence-backed decision support.

SITE DATA ASSEMBLED:
- Address / Location: ${addressName} (${boundary.center.lat.toFixed(5)}, ${boundary.center.lng.toFixed(5)})
- Area: ${boundary.areaAcres} acres (${boundary.areaSquareMeters} m²), Perimeter: ${boundary.perimeterMeters} m
- Elevation: Min ${bundle.elevation.minElevationM}m, Max ${bundle.elevation.maxElevationM}m, Mean ${bundle.elevation.meanElevationM}m, Delta ${bundle.elevation.elevationDeltaM}m
- Slope: Mean ${bundle.elevation.slopePercentMean}% (${bundle.elevation.slopeCategory}), Max ${bundle.elevation.slopePercentMax}%
- Aspect: ${bundle.elevation.aspectDegree}° (${bundle.elevation.aspectCompass})
- Land Cover: ${bundle.surface.visibleLandCover}, Canopy: ${bundle.surface.canopyCoverageEstPercent}%, Impervious: ${bundle.surface.imperviousEstPercent}%
- Hydrology: Drainage ${bundle.hydrology.drainageDirection}, Accumulation: ${bundle.hydrology.waterAccumulationZone}, Water bodies: ${JSON.stringify(bundle.hydrology.nearbyWaterBodies)}
- Regional Geology: ${bundle.geology.macroFormation}, ${bundle.geology.lithologyType}, Age: ${bundle.geology.geologicalAge}, Fault Context: ${bundle.geology.faultContext}, Karst Soluble Indicator: ${bundle.geology.karstSolubleRockIndicator}
- Soil Context: ${bundle.soil.soilContextSummary}, Shrink-Swell Risk: ${bundle.soil.shrinkSwellExpansiveRisk}, Bedrock Depth Estimate: ${bundle.soil.bedrockDepthRegionalEstimateM} (Disclaimer: ${bundle.soil.soilDisclaimer})
- Subsurface Stratigraphy (Regional Conceptual): ${JSON.stringify(bundle.subsurface.stratigraphicLayers.map(l => ({ name: l.name, material: l.material, depth: l.depthRangeM, source: l.source, tag: l.evidenceTag })))}

OUTPUT FORMAT:
Return a valid JSON object matching this TypeScript structure:
{
  "executiveSummary": "string",
  "terrainAndDrainageSynthesis": "string",
  "geologySubsurfaceSynthesis": "string",
  "uncertaintyAndRiskBoundary": "string",
  "findings": [
    {
      "id": "string",
      "title": "string",
      "domain": "terrain" | "hydrology" | "surface" | "geology" | "soil" | "subsurface",
      "evidenceTag": "VERIFIED" | "DATA-DERIVED" | "REGIONAL" | "INFERRED" | "UNKNOWN" | "FIELD-VERIFICATION-REQUIRED",
      "finding": "string",
      "evidence": "string",
      "source": "string",
      "reasoning": "string",
      "confidence": "High" | "Moderate" | "Low" | "Unknown",
      "confidenceReason": "string",
      "unknowns": "string",
      "recommendedVerification": "string",
      "severity": "neutral" | "advisory" | "investigate" | "constraint",
      "location": {
        "lat": number,
        "lng": number,
        "label": "string",
        "zoneDescription": "string"
      }
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (parsed.executiveSummary && Array.isArray(parsed.findings) && parsed.findings.length > 0) {
        return {
          executiveSummary: parsed.executiveSummary,
          terrainAndDrainageSynthesis: parsed.terrainAndDrainageSynthesis || defaultOutput.terrainAndDrainageSynthesis,
          geologySubsurfaceSynthesis: parsed.geologySubsurfaceSynthesis || defaultOutput.geologySubsurfaceSynthesis,
          uncertaintyAndRiskBoundary: parsed.uncertaintyAndRiskBoundary || defaultOutput.uncertaintyAndRiskBoundary,
          enhancedFindings: parsed.findings
        };
      }
    }
  } catch (err) {
    console.error('Gemini reasoning fallback triggered:', err);
  }

  return defaultOutput;
}
