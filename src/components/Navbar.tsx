import React from 'react';
import { SiteIntelligenceProfile, SiteBoundary } from '../types/site';
import {
  Compass,
  FileText,
  Database,
  Search,
  MapPin,
  Edit3,
  Check,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  profile: SiteIntelligenceProfile | null;
  boundary: SiteBoundary | null;
  isAnalyzing: boolean;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  onOpenSelector: () => void;
  onOpenProvenance: () => void;
  onOpenReport: () => void;
  onReanalyze: () => void;
}

export const Navbar: React.FC<Props> = ({
  profile,
  boundary,
  isAnalyzing,
  isDrawingMode,
  onToggleDrawingMode,
  onOpenSelector,
  onOpenProvenance,
  onOpenReport,
  onReanalyze
}) => {
  return (
    <header className="bg-[#FFFDF5] border-b-2 border-[#1E293B] text-[#1E293B] px-4 py-3 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_4px_0_0_#1E293B]">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B] hover:rotate-6 transition-transform">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#1E293B] font-['Outfit']">
                Terra<span className="text-[#8B5CF6]">Inspect</span>
              </span>
              <PlayfulBadge color="yellow" size="sm">
                MVP
              </PlayfulBadge>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium tracking-tight hidden sm:block">
              Explainable Site Intelligence System
            </p>
          </div>
        </div>

        {/* Anchored Parcel Chip */}
        {boundary && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-[#1E293B] text-xs font-semibold shadow-[2px_2px_0px_#1E293B]">
            <div className="w-4 h-4 rounded-full bg-[#F472B6] border border-[#1E293B] flex items-center justify-center text-white">
              <MapPin className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span className="text-[#1E293B] max-w-[210px] truncate" title={profile?.location.addressName}>
              {profile?.location.addressName || `${boundary.center.lat.toFixed(4)}°, ${boundary.center.lng.toFixed(4)}°`}
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="text-[#8B5CF6] font-bold">{boundary.areaAcres} ac</span>
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Change / Select Land */}
        <button
          onClick={onOpenSelector}
          className="candy-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5] text-[#8B5CF6]" />
          <span className="hidden sm:inline">Change Land / Presets</span>
          <span className="sm:hidden">Select</span>
        </button>

        {/* Boundary Edit Mode Toggle */}
        {boundary && (
          <button
            onClick={onToggleDrawingMode}
            className={`px-3.5 py-1.5 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              isDrawingMode
                ? 'bg-[#FBBF24] text-[#1E293B] shadow-[2px_2px_0px_#1E293B] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-[#1E293B] hover:bg-[#F1F5F9] shadow-[3px_3px_0px_#1E293B]'
            }`}
            title="Adjust boundary polygon points"
          >
            {isDrawingMode ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#1E293B]" />
            ) : (
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5] text-[#1E293B]" />
            )}
            <span className="hidden md:inline">{isDrawingMode ? 'Finish Edit' : 'Edit Boundary'}</span>
          </button>
        )}

        {/* Re-analyze / Refresh */}
        {boundary && (
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F1F5F9] border-2 border-[#1E293B] text-[#1E293B] shadow-[2px_2px_0px_#1E293B] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Re-run Geospatial & Geological Analysis"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6] stroke-[2.5]" />
            ) : (
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        )}

        {/* Data Provenance "Why am I seeing this?" */}
        <button
          onClick={onOpenProvenance}
          className="candy-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
          title="Inspect data source provenance and resolutions"
        >
          <Database className="w-3.5 h-3.5 stroke-[2.5] text-[#F472B6]" />
          <span className="hidden md:inline">Data Sources</span>
        </button>

        {/* Generate Inspection Report - The Candy Button */}
        {profile && (
          <button
            onClick={onOpenReport}
            className="candy-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Inspection Report</span>
            <span className="w-4 h-4 rounded-full bg-white text-[#8B5CF6] flex items-center justify-center font-bold text-[10px] ml-0.5">
              →
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
