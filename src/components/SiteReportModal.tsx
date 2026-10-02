import React from 'react';
import { SiteIntelligenceProfile } from '../types/site';
import { getEvidenceBadgeConfig } from './ExplainableFindingCard';
import {
  FileText,
  Printer,
  Download,
  X,
  MapPin,
  Mountain,
  Compass,
  Droplets,
  Layers,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  profile: SiteIntelligenceProfile;
  onClose: () => void;
}

export const SiteReportModal: React.FC<Props> = ({ profile, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# TerraInspect Site Intelligence Report
**Report ID:** ${profile.siteId}
**Date of Assessment:** ${new Date(profile.timestamp).toLocaleString()}
**Target Location:** ${profile.location.addressName}
**Coordinates:** ${profile.location.lat.toFixed(5)}°N, ${profile.location.lng.toFixed(5)}°W
**Parcel Footprint:** ${profile.location.areaAcres} Acres (${profile.location.areaSquareMeters.toLocaleString()} m²)

---

## 1. Site Overview
${profile.llmInterpretation.executiveSummary}

## 2. Location & Boundary
- Center Latitude: ${profile.location.lat.toFixed(6)}
- Center Longitude: ${profile.location.lng.toFixed(6)}
- Area: ${profile.location.areaAcres} acres (${profile.location.areaSquareMeters} m²)
- Perimeter: ${profile.location.perimeterMeters} m

## 3. Terrain & Elevation
- Elevation Range: ${profile.elevation.minElevationM} m to ${profile.elevation.maxElevationM} m (Datum: Mean Sea Level)
- Local Relief Delta: ${profile.elevation.elevationDeltaM} m
- Average Slope: ${profile.elevation.slopePercentMean}% (${profile.elevation.slopeCategory})
- Slope Aspect: ${profile.elevation.aspectDegree}° (${profile.elevation.aspectCompass})
- Landform: ${profile.elevation.terrainForm}

## 4. Surface Conditions
- Visible Land Cover: ${profile.surface.visibleLandCover}
- Vegetative Density: ${profile.surface.vegetationDensity}
- Ground Exposure: ${profile.surface.exposedGround}
- Surface Disturbance: ${profile.surface.surfaceDisturbanceNotes}

## 5. Hydrology
- Primary Surface Drainage: ${profile.hydrology.drainageDirection}
- Topographic Accumulation: ${profile.hydrology.waterAccumulationZone}
- Runoff Velocity Potential: ${profile.hydrology.surfaceRunoffTendency}
- Regional Groundwater Context: ${profile.hydrology.groundwaterDepthContext}

## 6. Geological Context
- Macro Bedrock Formation: ${profile.geology.macroFormation}
- Regional Geological Unit: ${profile.geology.regionalGeologicalUnit}
- Dominant Lithology: ${profile.geology.lithologyType}
- Chronostratigraphic Age: ${profile.geology.geologicalAge}
- Tectonic / Fault Context: ${profile.geology.faultContext}
- Karst Soluble Rock Susceptibility: ${profile.geology.karstSolubleRockIndicator ? 'YES (Regional carbonate dissolution hazard)' : 'NO (Non-karstic)'}

## 7. Soil & Near-Surface Conditions
- Regional Soil Context: ${profile.soil.soilContextSummary}
- Parent Material: ${profile.soil.parentMaterial}
- Expansive Clay Shrink-Swell Risk: ${profile.soil.shrinkSwellExpansiveRisk}
- Disclaimer: ${profile.soil.soilDisclaimer}

## 8. Subsurface Stratigraphy (Regional Model)
${profile.subsurface.stratigraphicLayers.map((l, i) => `Layer ${i + 1}: ${l.name} (${l.depthRangeM || 'Unresolved depth'}) - ${l.material} [${l.evidenceTag}]`).join('\n')}

*Subsurface Disclaimer:* ${profile.subsurface.boreholeDisclaimer}

## 9. Key Findings & Explainable Reasoning
${profile.findings.map((f, i) => `
### Finding ${i + 1}: ${f.title} [${f.evidenceTag} - ${f.confidence} Confidence]
- **Observation:** ${f.finding}
- **Evidence:** ${f.evidence}
- **Source:** ${f.source}
- **Reasoning:** ${f.reasoning}
- **Unknowns:** ${f.unknowns}
- **Recommended Verification:** ${f.recommendedVerification}
`).join('\n')}

## 10. Unknown & Missing Data Inventory
${profile.missingDataInventory.map((m) => `- [${m.domain}] ${m.missingItem}: ${m.impactOnSiteDueDiligence} (Investigation: ${m.recommendedInvestigation})`).join('\n')}

## 11. Recommended Field Investigations
${profile.recommendedFieldInvestigations.map((r) => `- [${r.priority}] ${r.discipline} - ${r.investigationType}: ${r.scope} (Trigger: ${r.triggerFinding})`).join('\n')}
    `;

    navigator.clipboard.writeText(md.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E293B]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white border-2 border-[#1E293B] rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#1E293B] overflow-hidden print:border-none print:max-h-none print:overflow-visible print:rounded-none">
        {/* Header Actions (hidden in print) */}
        <div className="p-4 sm:p-5 border-b-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-[#1E293B]">
                Site Intelligence Inspection Report
              </h2>
              <p className="text-xs text-[#64748B]">
                13-Section Evidence-Backed Geotechnical & Environmental Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyMarkdown}
              className="candy-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
              {copied ? 'Copied MD' : 'Copy MD'}
            </button>
            <button
              onClick={handlePrint}
              className="candy-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F1F5F9] border-2 border-[#1E293B] text-[#1E293B] shadow-[2px_2px_0px_#1E293B] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ml-1"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-[#1E293B] bg-white print:text-black print:p-4 print:space-y-6 print:overflow-visible">
          {/* Document Header Banner */}
          <div className="border-b-2 border-[#1E293B] pb-6 bg-[#FFFDF5] p-6 rounded-2xl border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] print:shadow-none print:bg-transparent print:border-none print:p-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <PlayfulBadge color="yellow" size="sm" className="mb-2">
                  TERRAINSPECT DUE DILIGENCE SYSTEM
                </PlayfulBadge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] font-['Outfit'] tracking-tight">
                  Comprehensive Site Intelligence Report
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
                  Explainable surface-to-subsurface pre-purchase land evaluation
                </p>
              </div>

              <div className="bg-white print:bg-zinc-100 p-3.5 rounded-xl border-2 border-[#1E293B] text-xs space-y-1 font-mono text-right print:text-left shadow-[2px_2px_0px_#1E293B]">
                <div>
                  <span className="text-[#64748B]">Report Ref: </span>
                  <span className="text-[#1E293B] font-bold">{profile.siteId}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Generated: </span>
                  <span className="text-[#1E293B] font-semibold">
                    {new Date(profile.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B]">Decision Mandate: </span>
                  <span className="text-[#8B5CF6] font-bold">Objective Decision Support</span>
                </div>
              </div>
            </div>

            {/* Crucial Ethical Boundary Statement */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#FEF3C7] border-2 border-[#1E293B] text-xs text-[#92400E] flex items-start gap-2.5 shadow-[2px_2px_0px_#1E293B] print:shadow-none">
              <AlertTriangle className="w-4 h-4 stroke-[2.5] text-[#D97706] shrink-0 mt-0.5" />
              <p className="font-medium">
                <strong>System Notice:</strong> This report is an evidence-backed site intelligence tool. It does not provide automated "Buy" or "Do Not Buy" recommendations, legal title verification, or structural foundation engineering design. Physical field investigation by licensed professionals is required for all capital acquisition decisions.
              </p>
            </div>
          </div>

          {/* Section 1: Site Overview */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px]">01</span>
              Site Overview & Executive Synthesis
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-[#334155] bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] font-medium print:shadow-none">
              {profile.llmInterpretation.executiveSummary}
            </p>
          </section>

          {/* Section 2: Location & Map Anchoring */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#F472B6] text-white text-[10px]">02</span>
              Geographic Location & Boundary Geometry
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Latitude</span>
                <span className="font-mono font-bold text-[#1E293B] text-sm">
                  {profile.location.lat.toFixed(5)}° N
                </span>
              </div>
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Longitude</span>
                <span className="font-mono font-bold text-[#1E293B] text-sm">
                  {profile.location.lng.toFixed(5)}° W
                </span>
              </div>
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Calculated Area</span>
                <span className="font-mono font-bold text-[#8B5CF6] text-sm">
                  {profile.location.areaAcres} Acres
                </span>
              </div>
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Boundary Perimeter</span>
                <span className="font-mono font-bold text-[#1E293B] text-sm">
                  {profile.location.perimeterMeters.toLocaleString()} m
                </span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] font-mono font-semibold">
              Target address / identifier: {profile.location.addressName}
            </p>
          </section>

          {/* Section 3: Terrain & Elevation */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#FBBF24] text-[#1E293B] text-[10px]">03</span>
              Terrain, Elevation & Slope Analysis
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Elevation Bounds</span>
                <span className="font-mono font-bold text-[#1E293B]">
                  {profile.elevation.minElevationM}m – {profile.elevation.maxElevationM}m MSL
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
                  Delta: {profile.elevation.elevationDeltaM}m relief
                </span>
              </div>
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Mean Slope</span>
                <span className="font-mono font-bold text-[#1E293B]">
                  {profile.elevation.slopePercentMean}% ({profile.elevation.slopeCategory})
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
                  Max slope: {profile.elevation.slopePercentMax}%
                </span>
              </div>
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="text-[#64748B] block text-[10px] font-mono font-bold">Aspect (Orientation)</span>
                <span className="font-mono font-bold text-[#0284C7]">
                  {profile.elevation.aspectDegree}° ({profile.elevation.aspectCompass})
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
                  General fall direction
                </span>
              </div>
            </div>
            <p className="text-xs text-[#334155] leading-relaxed bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] font-medium shadow-[2px_2px_0px_#1E293B] print:shadow-none">
              {profile.llmInterpretation.terrainAndDrainageSynthesis}
            </p>
          </section>

          {/* Section 4: Surface Conditions */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#34D399] text-[#1E293B] text-[10px]">04</span>
              Surface Characteristics & Land Cover
            </h2>
            <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:shadow-none">
              <div>
                <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Visible Land Cover</span>
                <p className="font-bold text-[#1E293B]">{profile.surface.visibleLandCover}</p>
                <p className="text-[11px] text-[#64748B] mt-1">Density: {profile.surface.vegetationDensity}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Exposed Ground / Rock Outcrop</span>
                <p className="font-bold text-[#1E293B]">{profile.surface.exposedGround}</p>
                <p className="text-[11px] text-[#64748B] mt-1">Surface Disturbance: {profile.surface.surfaceDisturbanceNotes}</p>
              </div>
            </div>
          </section>

          {/* Section 5: Hydrology */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#38BDF8] text-[#1E293B] text-[10px]">05</span>
              Hydrology & Drainage Context
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                  <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Drainage Direction</span>
                  <p className="font-bold text-[#0284C7]">{profile.hydrology.drainageDirection}</p>
                  <p className="text-[#475569] mt-1">{profile.hydrology.surfaceRunoffTendency}</p>
                </div>
                <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                  <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Water Accumulation Potential</span>
                  <p className="font-bold text-[#1E293B]">{profile.hydrology.waterAccumulationZone}</p>
                </div>
              </div>
              <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
                <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Regional Groundwater Context</span>
                <p className="text-[#334155] font-medium">{profile.hydrology.groundwaterDepthContext}</p>
              </div>
            </div>
          </section>

          {/* Section 6: Geological Context */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px]">06</span>
              Regional Bedrock Geology & Tectonics
            </h2>
            <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:shadow-none">
              <div>
                <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Macro Formation</span>
                <p className="font-bold text-[#1E293B]">{profile.geology.macroFormation}</p>
                <p className="text-[#64748B] mt-1">Regional Unit: {profile.geology.regionalGeologicalUnit}</p>
                <p className="text-[#64748B]">Lithology: {profile.geology.lithologyType}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#64748B] font-bold block mb-0.5">Tectonic & Hazard Setting</span>
                <p className="text-[#334155] font-medium">{profile.geology.faultContext}</p>
                <p className="text-[#64748B] mt-1">Seismic Context: {profile.geology.seismicContext}</p>
                <p className="mt-1 font-mono text-[#D97706] font-bold">
                  {profile.geology.karstSolubleRockIndicator
                    ? '⚠️ Host rock is soluble carbonate (Karst/sinkhole susceptibility)'
                    : '✓ Non-karstic host rock lithology'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Soil Conditions */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#F472B6] text-white text-[10px]">07</span>
              Soil & Near-Surface Ground
            </h2>
            <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2 text-xs print:shadow-none">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] font-bold block">Soil Association</span>
                  <p className="font-bold text-[#1E293B]">{profile.soil.soilContextSummary}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] font-bold block">Parent Material</span>
                  <p className="font-bold text-[#1E293B]">{profile.soil.parentMaterial}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] font-bold block">Expansive Clay Risk</span>
                  <p className="font-bold text-[#D97706]">
                    {profile.soil.shrinkSwellExpansiveRisk} Shrink-Swell
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[11px] text-[#64748B] italic">
                {profile.soil.soilDisclaimer}
              </div>
            </div>
          </section>

          {/* Section 8: Subsurface Stratigraphy */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#FBBF24] text-[#1E293B] text-[10px]">08</span>
              Subsurface Stratigraphy (Regional Conceptual Succession)
            </h2>
            <div className="space-y-2.5">
              {profile.subsurface.stratigraphicLayers.map((layer, idx) => {
                const badge = getEvidenceBadgeConfig(layer.evidenceTag);
                return (
                  <div
                    key={layer.layerId}
                    className="p-3.5 rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] shadow-[2px_2px_0px_#1E293B] text-xs flex flex-wrap items-start justify-between gap-2 print:shadow-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1E293B]">
                          Layer {idx + 1}: {layer.name}
                        </span>
                        <span className="font-mono text-[#8B5CF6] font-bold text-[11px]">
                          ({layer.depthRangeM || 'Depth unresolved'})
                        </span>
                      </div>
                      <p className="text-[#334155] font-medium mt-1">{layer.material}</p>
                      <p className="text-[#64748B] text-[11px] mt-0.5">{layer.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-[#1E293B] ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <p className="text-[10px] font-mono text-[#64748B] mt-1 font-semibold">Source: {layer.source}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[#64748B] italic">
              {profile.subsurface.boreholeDisclaimer}
            </p>
          </section>

          {/* Section 9 & 10: Key Findings & Evidence-Backed Reasoning */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px]">09 & 10</span>
              Key Findings, Evidence & Explainable Reasoning
            </h2>
            <div className="space-y-3.5">
              {profile.findings.map((f, i) => {
                const badge = getEvidenceBadgeConfig(f.evidenceTag);
                return (
                  <div
                    key={f.id}
                    className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] text-xs space-y-2.5 print:shadow-none"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CBD5E1] pb-2">
                      <span className="font-bold text-[#1E293B] font-['Outfit'] text-sm">
                        {i + 1}. {f.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-[#1E293B] ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-[10px] text-[#64748B] font-semibold">
                          Confidence: {f.confidence}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#334155]">
                      <div>
                        <strong className="text-[#1E293B] font-mono text-[10px] uppercase block mb-0.5">
                          Observation
                        </strong>
                        <p className="font-medium">{f.finding}</p>
                      </div>
                      <div>
                        <strong className="text-[#1E293B] font-mono text-[10px] uppercase block mb-0.5">
                          Supporting Evidence & Source
                        </strong>
                        <p className="font-medium">{f.evidence} ({f.source})</p>
                      </div>
                    </div>
                    <div>
                      <strong className="text-[#1E293B] font-mono text-[10px] uppercase block mb-0.5">
                        Reasoning & Interpretation
                      </strong>
                      <p className="text-[#475569] leading-relaxed">{f.reasoning}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#CBD5E1] text-[11px]">
                      <div>
                        <strong className="text-[#64748B] font-mono uppercase block">Unknowns</strong>
                        <p className="text-[#64748B]">{f.unknowns}</p>
                      </div>
                      <div>
                        <strong className="text-[#D97706] font-mono uppercase block">
                          Field Verification Required
                        </strong>
                        <p className="text-[#92400E] font-medium">{f.recommendedVerification}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 11: Unknown / Missing Data Inventory */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#FBBF24] text-[#1E293B] text-[10px]">11</span>
              Unknown & Missing Data Inventory
            </h2>
            <div className="overflow-x-auto rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-[#FFFDF5] text-[#1E293B] font-mono uppercase text-[10px] border-b-2 border-[#1E293B]">
                  <tr>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Missing Item</th>
                    <th className="p-3">Due Diligence Impact</th>
                    <th className="p-3">Resolution Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1] text-[#334155]">
                  {profile.missingDataInventory.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FFFDF5]">
                      <td className="p-3 font-mono text-[11px] font-bold text-[#8B5CF6]">{m.domain}</td>
                      <td className="p-3 font-semibold text-[#1E293B]">{m.missingItem}</td>
                      <td className="p-3 text-[#64748B]">{m.impactOnSiteDueDiligence}</td>
                      <td className="p-3 text-[#D97706] font-bold">{m.recommendedInvestigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 12: Recommended Field Investigations */}
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#34D399] text-[#1E293B] text-[10px]">12</span>
              Recommended Field Investigation Plan
            </h2>
            <div className="space-y-2.5">
              {profile.recommendedFieldInvestigations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] text-xs flex flex-wrap items-start justify-between gap-2 print:shadow-none"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border border-[#1E293B] ${
                          rec.priority === 'Essential'
                            ? 'bg-[#F472B6] text-white'
                            : 'bg-[#FBBF24] text-[#1E293B]'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <strong className="text-[#1E293B] font-['Outfit'] text-sm">
                        {rec.discipline}: {rec.investigationType}
                      </strong>
                    </div>
                    <p className="text-[#334155] font-medium mt-1">{rec.scope}</p>
                    <p className="text-[#64748B] text-[11px] mt-0.5">Triggered by: {rec.triggerFinding}</p>
                  </div>
                  <span className="font-mono text-[11px] text-[#1E293B] font-bold bg-white px-2.5 py-1 rounded-full border border-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
                    Timing: {rec.suggestedTiming}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 13: Data Provenance & Limitations */}
          <section className="space-y-3 pb-6">
            <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-[#1E293B] flex items-center gap-2 border-b-2 border-[#1E293B] pb-2">
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px]">13</span>
              Data Sources, Resolutions & System Limitations
            </h2>
            <div className="space-y-2.5 text-xs">
              {profile.dataProvenances.map((prov) => (
                <div
                  key={prov.id}
                  className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] print:shadow-none"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#8B5CF6] font-bold mb-1">
                    <strong>{prov.sourceName}</strong>
                    <span>{prov.resolution}</span>
                  </div>
                  <p className="text-[#64748B] text-[11px]">
                    <span className="font-bold text-[#1E293B]">Limitations: </span>
                    {prov.limitations}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
