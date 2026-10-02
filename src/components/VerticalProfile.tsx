import React, { useState } from 'react';
import { SiteIntelligenceProfile, Finding } from '../types/site';
import { ExplainableFindingCard } from './ExplainableFindingCard';
import { GeologicalCrossSection } from './GeologicalCrossSection';
import {
  CloudSun,
  TreePine,
  Mountain,
  Droplets,
  Layers,
  ArrowDown,
  Info,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  profile: SiteIntelligenceProfile;
  selectedFindingId?: string | null;
  onSelectFinding?: (findingId: string) => void;
  onOpenProvenance?: (sourceName: string) => void;
}

type VerticalLevel =
  | 'environmental'
  | 'surface'
  | 'topography'
  | 'hydrology'
  | 'geology_soil'
  | 'subsurface';

export const VerticalProfile: React.FC<Props> = ({
  profile,
  selectedFindingId,
  onSelectFinding,
  onOpenProvenance
}) => {
  const [activeLevel, setActiveLevel] = useState<VerticalLevel>('topography');

  const levels: {
    id: VerticalLevel;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeColor: 'yellow' | 'mint' | 'purple' | 'pink' | 'slate';
    findingsCount: number;
  }[] = [
    {
      id: 'environmental',
      title: 'Atmospheric & Climate',
      subtitle: 'Solar exposure, regional macro-climate, wind orientation',
      icon: CloudSun,
      accentColor: '#FBBF24',
      badgeColor: 'yellow',
      findingsCount: profile.findings.filter((f) => f.domain === 'surface').length
    },
    {
      id: 'surface',
      title: 'Site Surface & Cover',
      subtitle: 'Visible ground cover, vegetation density, surface disturbance',
      icon: TreePine,
      accentColor: '#34D399',
      badgeColor: 'mint',
      findingsCount: profile.findings.filter((f) => f.domain === 'surface').length
    },
    {
      id: 'topography',
      title: 'Topography & Slope',
      subtitle: 'Elevation profile, slope gradient %, aspect, local relief',
      icon: Mountain,
      accentColor: '#8B5CF6',
      badgeColor: 'purple',
      findingsCount: profile.findings.filter((f) => f.domain === 'terrain').length
    },
    {
      id: 'hydrology',
      title: 'Drainage & Hydrology',
      subtitle: 'Runoff direction, accumulation depression, nearby waterways',
      icon: Droplets,
      accentColor: '#38BDF8',
      badgeColor: 'slate',
      findingsCount: profile.findings.filter((f) => f.domain === 'hydrology').length
    },
    {
      id: 'geology_soil',
      title: 'Geology & Soil Horizon',
      subtitle: 'Bedrock lithology, geological formation, soil series, expansive clay',
      icon: Layers,
      accentColor: '#F472B6',
      badgeColor: 'pink',
      findingsCount: profile.findings.filter((f) => f.domain === 'geology' || f.domain === 'soil').length
    },
    {
      id: 'subsurface',
      title: 'Subsurface Stratigraphy',
      subtitle: 'Conceptual geological column, rock transition, aquifer horizon',
      icon: ArrowDown,
      accentColor: '#F59E0B',
      badgeColor: 'yellow',
      findingsCount: profile.findings.filter((f) => f.domain === 'subsurface').length
    }
  ];

  return (
    <div className="space-y-6">
      {/* Vertical Stratigraphic Conceptual Navigator */}
      <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#1E293B]">
        <div className="flex items-center justify-between mb-3.5 px-1">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] text-sm uppercase tracking-wider text-[#1E293B] font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 stroke-[2.5] text-[#8B5CF6]" />
              Vertical Stratigraphic Intelligence
            </span>
            <span className="text-[#64748B] text-xs hidden sm:inline font-medium">
              (Surface Downward into Bedrock)
            </span>
          </div>
          <PlayfulBadge color="purple" size="sm">
            6 Geotechnical Tiers
          </PlayfulBadge>
        </div>

        {/* Vertical Tiers Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
          {levels.map((lvl, idx) => {
            const Icon = lvl.icon;
            const isActive = activeLevel === lvl.id;

            return (
              <button
                key={lvl.id}
                onClick={() => setActiveLevel(lvl.id)}
                className={`text-left p-3 rounded-xl border-2 border-[#1E293B] transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#FFFDF5] shadow-[4px_4px_0px_0px_#1E293B] translate-x-[-1px] translate-y-[-1px] ring-2 ring-[#8B5CF6]'
                    : 'bg-white hover:bg-[#F8FAFC] hover:shadow-[3px_3px_0px_0px_#1E293B] opacity-90 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-mono text-[10px] text-[#1E293B] font-extrabold bg-[#F1F5F9] px-1.5 py-0.5 rounded-md border border-[#1E293B]">
                    0{idx + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full border border-[#1E293B] flex items-center justify-center text-white"
                    style={{ backgroundColor: lvl.accentColor }}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1E293B] font-['Outfit'] line-clamp-1">
                    {lvl.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#64748B] block mt-0.5 font-semibold">
                    {lvl.findingsCount} findings
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Panels for Selected Vertical Tier */}
      <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 sm:p-6 text-[#1E293B] space-y-6 shadow-[6px_6px_0px_0px_#1E293B]">
        {/* Tier 1: Environmental / Atmospheric */}
        {activeLevel === 'environmental' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBBF24] border-2 border-[#1E293B] flex items-center justify-center text-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                  <CloudSun className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit'] text-[#1E293B]">
                    Atmospheric, Solar & Environmental Context
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Solar trajectory, prevailing winds, and regional micro-climatic setting
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-1.5">
                <span className="font-mono text-[10px] uppercase text-[#8B5CF6] font-bold block">
                  Solar Aspect / Orientation
                </span>
                <p className="text-base font-extrabold text-[#1E293B] font-mono">
                  {profile.elevation.aspectCompass} ({profile.elevation.aspectDegree}°)
                </p>
                <p className="text-[#475569] text-xs">
                  Slope orientation directly dictates daily direct solar radiation angle and passive thermal heating.
                </p>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-1.5">
                <span className="font-mono text-[10px] uppercase text-[#34D399] font-bold block">
                  Vegetative Canopy Cover
                </span>
                <p className="text-base font-extrabold text-[#1E293B] font-mono">
                  ~{profile.surface.canopyCoverageEstPercent}% Estimated Canopy
                </p>
                <p className="text-[#475569] text-xs">
                  Provides localized shade attenuation; clearing will impact micro-topographic moisture regimes.
                </p>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-1.5">
                <span className="font-mono text-[10px] uppercase text-[#F472B6] font-bold block">
                  Impervious Surface Ratio
                </span>
                <p className="text-base font-extrabold text-[#1E293B] font-mono">
                  ~{profile.surface.imperviousEstPercent}% Impervious
                </p>
                <p className="text-[#475569] text-xs">
                  Predominantly natural unpaved land cover allowing precipitation infiltration into soil horizon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tier 2: Surface & Land Cover */}
        {activeLevel === 'surface' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#34D399] border-2 border-[#1E293B] flex items-center justify-center text-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                  <TreePine className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit'] text-[#1E293B]">
                    Site Surface Characteristics & Land Cover
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Spectral vegetation indices, bare ground exposure, and historical disturbance
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenProvenance?.('Sentinel-2')}
                className="candy-btn-secondary px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Provenance: ESA WorldCover</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#8B5CF6] font-bold block">
                  Identified Land Cover & Density
                </span>
                <p className="text-sm font-bold text-[#1E293B]">{profile.surface.visibleLandCover}</p>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Spectral Density:</strong> {profile.surface.vegetationDensity}
                </p>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#F472B6] font-bold block">
                  Ground Exposure & Disturbance
                </span>
                <p className="text-sm font-bold text-[#1E293B]">{profile.surface.exposedGround}</p>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Earthmoving Assessment:</strong> {profile.surface.surfaceDisturbanceNotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tier 3: Topography & Slope */}
        {activeLevel === 'topography' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
                  <Mountain className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit'] text-[#1E293B]">
                    Topography, Elevation & Slope Analysis
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Continuous elevation delta, slope gradient category, and spatial relief
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenProvenance?.('Copernicus')}
                className="candy-btn-secondary px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Provenance: Copernicus DEM</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Topography Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] uppercase text-[#64748B] font-bold block">
                  Mean Elevation
                </span>
                <p className="text-xl font-extrabold text-[#1E293B] font-mono mt-1">
                  {profile.elevation.meanElevationM} m
                </p>
                <span className="text-[10px] text-[#64748B] font-mono block mt-1">
                  Range: {profile.elevation.minElevationM}m – {profile.elevation.maxElevationM}m
                </span>
              </div>

              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] uppercase text-[#8B5CF6] font-bold block">
                  Total Vertical Relief
                </span>
                <p className="text-xl font-extrabold text-[#8B5CF6] font-mono mt-1">
                  {profile.elevation.elevationDeltaM} m
                </p>
                <span className="text-[10px] text-[#64748B] font-mono block mt-1">
                  High-to-low elevation span
                </span>
              </div>

              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] uppercase text-[#F59E0B] font-bold block">
                  Average Slope
                </span>
                <p className="text-xl font-extrabold text-[#F59E0B] font-mono mt-1">
                  {profile.elevation.slopePercentMean}%
                </p>
                <span className="text-[10px] text-[#64748B] font-mono block mt-1">
                  Class: {profile.elevation.slopeCategory}
                </span>
              </div>

              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] uppercase text-[#38BDF8] font-bold block">
                  Aspect (Orientation)
                </span>
                <p className="text-xl font-extrabold text-[#0284C7] font-mono mt-1">
                  {profile.elevation.aspectCompass}
                </p>
                <span className="text-[10px] text-[#64748B] font-mono block mt-1">
                  {profile.elevation.aspectDegree}° Azimuth
                </span>
              </div>
            </div>

            {/* 9-Point Elevation Grid Sampling Table */}
            <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2.5">
              <span className="font-mono text-[10px] uppercase text-[#1E293B] font-extrabold block">
                9-Node Elevation Sampling Grid
              </span>
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
                {profile.elevation.gridPoints.map((pt) => (
                  <div
                    key={pt.position}
                    className="p-2.5 rounded-xl bg-white border-2 border-[#1E293B] shadow-[1px_1px_0px_#1E293B] flex flex-col"
                  >
                    <span className="text-[10px] text-[#64748B] font-bold">{pt.position}</span>
                    <span className="text-[#1E293B] font-extrabold text-sm">{pt.elevationM} m</span>
                    <span
                      className={`text-[10px] font-bold mt-0.5 ${
                        pt.relativeHeightM > 0
                          ? 'text-[#10B981]'
                          : pt.relativeHeightM < 0
                          ? 'text-[#F43F5E]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {pt.relativeHeightM >= 0 ? `+${pt.relativeHeightM}` : pt.relativeHeightM}m rel
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tier 4: Hydrology & Drainage */}
        {activeLevel === 'hydrology' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8] border-2 border-[#1E293B] flex items-center justify-center text-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                  <Droplets className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit'] text-[#1E293B]">
                    Hydrology, Drainage Vectors & Proximity
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Surface runoff vectors, localized ponding depressions, and nearby aquatic features
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenProvenance?.('OpenStreetMap')}
                className="candy-btn-secondary px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Provenance: OSM & Hydro</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#0284C7] font-bold block">
                  Surface Drainage Behavior
                </span>
                <p className="font-bold text-sm text-[#0284C7]">
                  {profile.hydrology.drainageDirection}
                </p>
                <p className="text-[#475569] leading-relaxed text-xs">
                  {profile.hydrology.surfaceRunoffTendency}
                </p>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#F472B6] font-bold block">
                  Topographic Accumulation Zone
                </span>
                <p className="font-medium text-[#1E293B] text-xs leading-relaxed">
                  {profile.hydrology.waterAccumulationZone}
                </p>
              </div>
            </div>

            {/* Nearby Water Bodies */}
            <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2.5">
              <span className="font-mono text-[10px] uppercase text-[#1E293B] font-extrabold block">
                Proximity to Surrounding Water Bodies & Drainage Features
              </span>
              <div className="space-y-2">
                {profile.hydrology.nearbyWaterBodies.map((wb, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border-2 border-[#1E293B] flex items-center justify-between text-xs shadow-[1px_1px_0px_#1E293B]"
                  >
                    <div>
                      <strong className="text-[#1E293B] text-sm font-['Outfit']">{wb.name}</strong>
                      <span className="text-[#64748B] text-[11px] block">{wb.type}</span>
                    </div>
                    <span className="font-mono text-[#1E293B] font-bold text-xs bg-[#FBBF24] px-2.5 py-1 rounded-full border border-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
                      ~{wb.distanceM} m ({wb.direction})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tier 5: Geology & Soil */}
        {activeLevel === 'geology_soil' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F472B6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
                  <Layers className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit'] text-[#1E293B]">
                    Geological Formation & Regional Soil Context
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Macro lithology, bedrock epoch, tectonic context, and soil shrink-swell risk
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenProvenance?.('Macrostrat')}
                className="candy-btn-secondary px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Provenance: Macrostrat & HWSD</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#8B5CF6] font-bold block">
                  Regional Bedrock Formation
                </span>
                <h4 className="text-sm font-bold text-[#1E293B] font-['Outfit']">{profile.geology.macroFormation}</h4>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Unit:</strong> {profile.geology.regionalGeologicalUnit}
                </p>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Lithology:</strong> {profile.geology.lithologyType}
                </p>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Geological Age:</strong> {profile.geology.geologicalAge}
                </p>
                {profile.geology.karstSolubleRockIndicator && (
                  <div className="p-3 rounded-xl bg-[#FEF3C7] border-2 border-[#1E293B] text-[#92400E] text-[11px] mt-2 shadow-[2px_2px_0px_#1E293B]">
                    ⚠️ <strong>Karst Soluble Carbonate Formation:</strong> High regional susceptibility to subterranean dissolution cavities and sinkhole activity.
                  </div>
                )}
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#F472B6] font-bold block">
                  Soil Association & Geotechnical Context
                </span>
                <h4 className="text-sm font-bold text-[#1E293B] font-['Outfit']">{profile.soil.soilContextSummary}</h4>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Parent Material:</strong> {profile.soil.parentMaterial}
                </p>
                <p className="text-[#475569] text-xs">
                  <strong className="text-[#1E293B]">Drainage Class:</strong> {profile.soil.drainageClass}
                </p>
                <p className="text-xs">
                  <strong className="text-[#1E293B]">Expansive Clay Risk:</strong>{' '}
                  <span className="text-[#D97706] font-mono font-bold">
                    {profile.soil.shrinkSwellExpansiveRisk}
                  </span>
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] text-[11px] italic mt-2">
                  {profile.soil.soilDisclaimer}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tier 6: Subsurface Stratigraphy */}
        {activeLevel === 'subsurface' && (
          <div className="space-y-4">
            <GeologicalCrossSection
              subsurface={profile.subsurface}
              onOpenProvenance={onOpenProvenance}
            />
          </div>
        )}

        {/* Associated Explainable Findings for this Level */}
        <div className="pt-5 border-t-2 border-[#1E293B]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-['Outfit'] uppercase tracking-wider text-[#1E293B] font-extrabold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8B5CF6] border border-[#1E293B]" />
              Explainable Findings for this Tier
            </h4>
            <span className="text-[11px] font-mono text-[#64748B] font-semibold">
              Click map icon on card to locate on parcel
            </span>
          </div>

          <div className="space-y-4">
            {profile.findings
              .filter((f) => {
                if (activeLevel === 'environmental' || activeLevel === 'surface') {
                  return f.domain === 'surface';
                }
                if (activeLevel === 'topography') return f.domain === 'terrain';
                if (activeLevel === 'hydrology') return f.domain === 'hydrology';
                if (activeLevel === 'geology_soil') return f.domain === 'geology' || f.domain === 'soil';
                if (activeLevel === 'subsurface') return f.domain === 'subsurface' || f.domain === 'geology';
                return true;
              })
              .map((finding) => (
                <ExplainableFindingCard
                  key={finding.id}
                  finding={finding}
                  isSelected={selectedFindingId === finding.id}
                  onSelect={() => onSelectFinding?.(finding.id)}
                  onOpenProvenance={onOpenProvenance}
                />
              ))}

            {profile.findings.filter((f) => {
              if (activeLevel === 'environmental' || activeLevel === 'surface') return f.domain === 'surface';
              if (activeLevel === 'topography') return f.domain === 'terrain';
              if (activeLevel === 'hydrology') return f.domain === 'hydrology';
              if (activeLevel === 'geology_soil') return f.domain === 'geology' || f.domain === 'soil';
              if (activeLevel === 'subsurface') return f.domain === 'subsurface';
              return true;
            }).length === 0 && (
              <div className="p-5 rounded-2xl bg-[#FFFDF5] border-2 border-[#1E293B] text-xs text-[#64748B] font-medium shadow-[2px_2px_0px_#1E293B]">
                No specific localized constraints flagged in this tier. General regional characteristics apply.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
