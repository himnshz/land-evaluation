import React from 'react';
import { DataProvenance } from '../types/site';
import { Database, X, ShieldAlert, CheckCircle, Clock, Globe, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  provenances: DataProvenance[];
  highlightSourceName?: string | null;
  onClose: () => void;
}

export const DataProvenanceModal: React.FC<Props> = ({
  provenances,
  highlightSourceName,
  onClose
}) => {
  const [selectedId, setSelectedId] = React.useState<string>(
    provenances.find(
      (p) =>
        highlightSourceName &&
        (p.sourceName.toLowerCase().includes(highlightSourceName.toLowerCase()) ||
          p.datasetName.toLowerCase().includes(highlightSourceName.toLowerCase()))
    )?.id || provenances[0]?.id || ''
  );

  const selected = provenances.find((p) => p.id === selectedId) || provenances[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#1E293B]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#1E293B] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#1E293B] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#1E293B] flex items-center justify-between bg-[#FFFDF5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
              <Database className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-[#1E293B] flex items-center gap-2">
                Data Provenance & Source Registry
              </h2>
              <p className="text-xs text-[#64748B]">
                Full transparency into datasets, spatial resolutions, processing pipelines, and limitations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F1F5F9] border-2 border-[#1E293B] text-[#1E293B] shadow-[2px_2px_0px_#1E293B] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#1E293B]">
          {/* Left: Datasets List */}
          <div className="md:col-span-5 p-3.5 overflow-y-auto max-h-[40vh] md:max-h-none space-y-2 bg-[#FFFDF5]">
            <span className="font-mono text-[10px] uppercase text-[#64748B] font-extrabold px-1 mb-1 block">
              Active Geodata Sources ({provenances.length})
            </span>

            {provenances.map((prov) => {
              const isSelected = prov.id === selectedId;
              return (
                <button
                  key={prov.id}
                  onClick={() => setSelectedId(prov.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 border-[#1E293B] transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-white shadow-[3px_3px_0px_#8B5CF6] translate-x-1 ring-2 ring-[#8B5CF6]'
                      : 'bg-white/80 hover:bg-white hover:shadow-[2px_2px_0px_#1E293B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1E293B] font-['Outfit'] line-clamp-1">
                      {prov.sourceName.split('(')[0]}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#1E293B] ${
                        prov.status === 'available'
                          ? 'bg-[#34D399] text-[#1E293B]'
                          : 'bg-[#FBBF24] text-[#1E293B]'
                      }`}
                    >
                      {prov.status === 'available' ? 'Available' : 'Regional'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] line-clamp-1 font-medium">{prov.datasetName}</p>
                </button>
              );
            })}
          </div>

          {/* Right: Dataset Deep-Dive */}
          <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-[#1E293B] bg-white">
            {selected ? (
              <>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8B5CF6] font-extrabold block mb-1">
                    Source & Organization
                  </span>
                  <h3 className="text-lg font-bold font-['Outfit'] text-[#1E293B]">{selected.sourceName}</h3>
                  <p className="text-[#64748B] text-xs mt-0.5 font-medium">{selected.datasetName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                    <span className="font-mono text-[10px] text-[#64748B] font-bold flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 stroke-[2.5]" /> Retrieval Timestamp
                    </span>
                    <p className="font-mono text-[#1E293B] font-bold">{selected.retrievalDate}</p>
                  </div>
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                    <span className="font-mono text-[10px] text-[#64748B] font-bold flex items-center gap-1 mb-1">
                      <Layers className="w-3 h-3 stroke-[2.5]" /> Spatial Resolution
                    </span>
                    <p className="font-mono text-[#8B5CF6] font-bold">{selected.resolution}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                    <span className="font-mono text-[10px] text-[#64748B] font-bold flex items-center gap-1 mb-1">
                      <Globe className="w-3 h-3 stroke-[2.5]" /> Geographic Coverage
                    </span>
                    <p className="text-[#1E293B] font-medium">{selected.geographicCoverage}</p>
                  </div>
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                    <span className="font-mono text-[10px] text-[#64748B] font-bold flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 stroke-[2.5] text-[#10B981]" /> Data Type
                    </span>
                    <p className="text-[#1E293B] font-medium">{selected.dataType}</p>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase text-[#1E293B] font-bold block mb-1">
                    Processing & Ingestion Pipeline
                  </span>
                  <p className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] text-[#334155] leading-relaxed font-medium shadow-[2px_2px_0px_#1E293B]">
                    {selected.processingPerformed}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase text-[#F43F5E] font-extrabold flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" /> Known Limitations & Uncertainty
                  </span>
                  <div className="bg-[#FFF1F2] p-3.5 rounded-xl border-2 border-[#1E293B] text-[#9F1239] leading-relaxed text-xs font-semibold shadow-[2px_2px_0px_#1E293B]">
                    {selected.limitations}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[#64748B]">Select a data provenance record on the left.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8B5CF6] stroke-[2.5]" />
            <span className="font-medium text-[#1E293B]">TerraInspect maintains immutable audit records for all datasets.</span>
          </div>
          <button
            onClick={onClose}
            className="candy-btn-secondary px-4 py-1 text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
