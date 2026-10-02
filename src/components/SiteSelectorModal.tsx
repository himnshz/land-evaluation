import React, { useState } from 'react';
import { PRESET_SITES } from '../data/presets';
import { PresetSite, LatLng } from '../types/site';
import {
  Search,
  MapPin,
  Sparkles,
  Navigation,
  CheckCircle2,
  X,
  Compass,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetSite) => void;
  onSelectCustomCoordinates: (lat: number, lng: number, addressName: string, radiusMeters: number) => void;
  isAnalyzing: boolean;
}

export const SiteSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onSelectCustomCoordinates,
  isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'search' | 'coordinates'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manual Coordinates State
  const [customLat, setCustomLat] = useState('30.2742');
  const [customLng, setCustomLng] = useState('-97.8015');
  const [customRadius, setCustomRadius] = useState('120');
  const [customLabel, setCustomLabel] = useState('Custom Austin Hill Country Parcel');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/search-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    const radius = parseFloat(customRadius) || 120;

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onSelectCustomCoordinates(lat, lng, customLabel || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`, radius);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E293B]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#1E293B] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#1E293B] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
              <Navigation className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-[#1E293B]">
                Select Land for Inspection
              </h2>
              <p className="text-xs text-[#64748B]">
                Choose a realistic geological scenario or search any coordinates worldwide
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

        {/* Tab Controls */}
        <div className="flex flex-wrap border-b-2 border-[#1E293B] bg-white p-3 gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-[#FBBF24] text-[#1E293B] shadow-[2px_2px_0px_#1E293B]'
                : 'bg-white text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5] text-[#8B5CF6]" />
            Curated Presets
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3.5 py-1.5 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#1E293B]'
                : 'bg-white text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            Search Address / Landmark
          </button>
          <button
            onClick={() => setActiveTab('coordinates')}
            className={`px-3.5 py-1.5 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'coordinates'
                ? 'bg-[#F472B6] text-white shadow-[2px_2px_0px_#1E293B]'
                : 'bg-white text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
            Manual Coordinates
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#FFFDF5]">
          {/* TAB 1: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] font-extrabold block">
                Select a benchmark land parcel to evaluate:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PRESET_SITES.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className="cursor-pointer group p-4 rounded-2xl border-2 border-[#1E293B] bg-white hover:bg-[#FFFDF5] shadow-[4px_4px_0px_#1E293B] hover:shadow-[6px_6px_0px_#1E293B] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-[#1E293B] font-['Outfit'] group-hover:text-[#8B5CF6] transition-colors">
                          {preset.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#1E293B] text-[#1E293B] shrink-0">
                          {preset.region}
                        </span>
                      </div>
                      <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t-2 border-[#F1F5F9] flex items-center justify-between text-[10px] font-mono font-bold text-[#64748B]">
                      <span>{preset.coordinates.lat.toFixed(4)}°, {preset.coordinates.lng.toFixed(4)}°</span>
                      <span className="text-[#8B5CF6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Select Site <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Search */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city, address, or geographic landmark (e.g. Austin, Boulder, Lake Travis)"
                    className="pop-input w-full pl-10 pr-3.5 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="candy-btn-primary px-5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" /> : <Search className="w-4 h-4 stroke-[2.5]" />}
                  Search
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2.5">
                  <span className="font-mono text-[10px] uppercase text-[#64748B] font-bold block">
                    Search Results ({searchResults.length}):
                  </span>
                  <div className="divide-y-2 divide-[#1E293B] border-2 border-[#1E293B] rounded-2xl overflow-hidden bg-white shadow-[3px_3px_0px_#1E293B]">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          onSelectCustomCoordinates(
                            item.lat,
                            item.lng,
                            item.displayName,
                            120
                          )
                        }
                        className="p-3.5 hover:bg-[#FFFDF5] cursor-pointer transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#F472B6] shrink-0 mt-0.5 stroke-[2.5]" />
                          <div>
                            <p className="text-[#1E293B] font-bold line-clamp-1">{item.displayName}</p>
                            <span className="text-[10px] font-mono text-[#64748B]">
                              {item.lat.toFixed(5)}°, {item.lng.toFixed(5)}°
                            </span>
                          </div>
                        </div>
                        <span className="text-[#8B5CF6] text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                          Select <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Coordinates */}
          {activeTab === 'coordinates' && (
            <form onSubmit={handleApplyCoordinates} className="space-y-4 max-w-lg bg-white p-5 rounded-2xl border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B]">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-mono text-[10px] uppercase text-[#1E293B] font-bold block mb-1">
                    Latitude (-90 to +90)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    required
                    className="pop-input w-full p-2.5 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase text-[#1E293B] font-bold block mb-1">
                    Longitude (-180 to +180)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    required
                    className="pop-input w-full p-2.5 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-mono text-[10px] uppercase text-[#1E293B] font-bold block mb-1">
                    Parcel Radius (Meters)
                  </label>
                  <input
                    type="number"
                    value={customRadius}
                    onChange={(e) => setCustomRadius(e.target.value)}
                    required
                    min="30"
                    max="1000"
                    className="pop-input w-full p-2.5 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase text-[#1E293B] font-bold block mb-1">
                    Location Label / Reference
                  </label>
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g. Lot 44 North Rim"
                    className="pop-input w-full p-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="candy-btn-yellow w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    Assembling Site Intelligence...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    Load & Anchor Coordinates
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
