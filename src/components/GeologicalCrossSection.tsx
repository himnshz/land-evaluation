import React from 'react';
import { SubsurfaceData, StratigraphicLayer } from '../types/site';
import { getEvidenceBadgeConfig } from './ExplainableFindingCard';
import { Layers, AlertTriangle, Droplets, Info, Sparkles, ExternalLink } from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  subsurface: SubsurfaceData;
  onOpenProvenance?: (sourceName: string) => void;
}

export const GeologicalCrossSection: React.FC<Props> = ({
  subsurface,
  onOpenProvenance
}) => {
  const [selectedLayer, setSelectedLayer] = React.useState<StratigraphicLayer | null>(
    subsurface.stratigraphicLayers[0] || null
  );

  return (
    <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 sm:p-6 text-[#1E293B] shadow-[6px_6px_0px_0px_#1E293B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
            <Layers className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-lg font-['Outfit'] text-[#1E293B]">
              Conceptual Stratigraphic Column
            </h3>
            <p className="text-xs text-[#64748B]">
              Subsurface profile from ground elevation into regional bedrock substrate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!subsurface.boreholeDataAvailable && (
            <PlayfulBadge color="yellow" size="sm">
              <Info className="w-3 h-3 stroke-[2.5] inline mr-1" />
              Regional Model (No Borehole On-Site)
            </PlayfulBadge>
          )}
        </div>
      </div>

      {/* Cross section visualization layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Stratigraphic Diagram */}
        <div className="lg:col-span-6 bg-[#FFFDF5] p-4 sm:p-5 rounded-2xl border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#1E293B] mb-3 pb-2 border-b-2 border-[#1E293B]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] border border-[#1E293B]" />
              GROUND SURFACE (0.0 m)
            </span>
            <span className="text-[#64748B]">DATUM: LOCAL DEM</span>
          </div>

          {/* Visual Ground Profile */}
          <div className="relative mb-3.5 h-3 bg-gradient-to-r from-[#10B981] via-[#FBBF24] to-[#8B5CF6] rounded-full border-2 border-[#1E293B] shadow-[1px_1px_0px_#1E293B] overflow-hidden" />

          {/* Stratigraphic Layers Stack */}
          <div className="space-y-3">
            {subsurface.stratigraphicLayers.map((layer, index) => {
              const badge = getEvidenceBadgeConfig(layer.evidenceTag);
              const isSelected = selectedLayer?.layerId === layer.layerId;

              return (
                <div
                  key={layer.layerId}
                  onClick={() => setSelectedLayer(layer)}
                  className={`cursor-pointer rounded-xl border-2 border-[#1E293B] transition-all p-3.5 relative overflow-hidden ${
                    isSelected
                      ? 'bg-white shadow-[4px_4px_0px_0px_#8B5CF6] translate-x-1 ring-2 ring-[#8B5CF6]'
                      : 'bg-white/80 hover:bg-white hover:shadow-[3px_3px_0px_0px_#1E293B]'
                  }`}
                >
                  {/* Left accent strip simulating rock/soil layer */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-3 border-r-2 border-[#1E293B]"
                    style={{ backgroundColor: layer.color || '#FBBF24' }}
                  />

                  <div className="pl-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-[#1E293B]">
                        Layer {index + 1}: {layer.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#1E293B] bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
                        {layer.depthRangeM || 'Depth unresolved'}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569] font-medium line-clamp-1">
                      {layer.material}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[#1E293B] ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B] font-semibold">
                        Confidence: {layer.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Groundwater Context Indicator */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#ECFDF5] border-2 border-[#1E293B] flex items-start gap-2.5 text-xs text-[#065F46] shadow-[2px_2px_0px_#1E293B]">
            <div className="w-6 h-6 rounded-full bg-[#34D399] border border-[#1E293B] flex items-center justify-center text-[#1E293B] shrink-0 mt-0.5">
              <Droplets className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono uppercase font-bold text-[10px] text-[#065F46] block">
                Regional Groundwater Hydrogeology
              </span>
              <p className="text-[#047857] text-xs font-medium mt-0.5">
                {subsurface.regionalAquiferContext}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Layer Inspector */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#1E293B] shadow-[4px_4px_0px_0px_#1E293B]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#1E293B]">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#1E293B] font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5] text-[#8B5CF6]" />
              Stratigraphic Horizon Details
            </h4>
            {selectedLayer && (
              <span className="text-xs font-mono font-bold text-[#8B5CF6] bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#1E293B]">
                {selectedLayer.layerId}
              </span>
            )}
          </div>

          {selectedLayer ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-bold block mb-1">
                  Formation / Unit Name
                </span>
                <h3 className="text-base font-bold text-[#1E293B] font-['Outfit']">
                  {selectedLayer.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FFFDF5] p-2.5 rounded-xl border-2 border-[#1E293B]">
                  <span className="text-[#64748B] text-[9px] font-mono uppercase font-bold block mb-0.5">
                    Depth Interval
                  </span>
                  <span className="font-mono font-bold text-[#1E293B]">
                    {selectedLayer.depthRangeM || 'Unresolved depth'}
                  </span>
                </div>
                <div className="bg-[#FFFDF5] p-2.5 rounded-xl border-2 border-[#1E293B]">
                  <span className="text-[#64748B] text-[9px] font-mono uppercase font-bold block mb-0.5">
                    Evidence Status
                  </span>
                  <span className="font-mono font-bold text-[#8B5CF6]">
                    {selectedLayer.evidenceTag}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-bold block mb-1">
                  Lithological Material Description
                </span>
                <p className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] text-[#1E293B] leading-relaxed font-medium">
                  {selectedLayer.material}
                </p>
              </div>

              <div>
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-bold block mb-1">
                  Engineering / Geological Behavior
                </span>
                <p className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] text-[#475569] leading-relaxed">
                  {selectedLayer.description}
                </p>
              </div>

              <div className="pt-1">
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-bold block mb-1">
                  Data Provenance & Source
                </span>
                <div className="flex items-center justify-between bg-[#FFFDF5] p-2.5 rounded-xl border-2 border-[#1E293B] font-mono text-[11px]">
                  <span className="text-[#8B5CF6] font-bold">{selectedLayer.source}</span>
                  {onOpenProvenance && (
                    <button
                      onClick={() => onOpenProvenance(selectedLayer.source)}
                      className="px-2 py-0.5 rounded-full bg-white hover:bg-[#8B5CF6] hover:text-white border border-[#1E293B] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-[#FEF3C7] border-2 border-[#1E293B] text-[11px] text-[#92400E] flex items-start gap-2 shadow-[2px_2px_0px_#1E293B]">
                <AlertTriangle className="w-4 h-4 stroke-[2.5] text-[#D97706] shrink-0 mt-0.5" />
                <span className="font-medium">
                  Notice: Depth intervals are synthesized from regional literature and do not substitute for on-site exploratory borings.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#64748B]">Select a stratigraphic layer to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
