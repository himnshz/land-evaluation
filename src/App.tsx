import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { VerticalProfile } from './components/VerticalProfile';
import { GeologicalCrossSection } from './components/GeologicalCrossSection';
import { ExplainableFindingCard } from './components/ExplainableFindingCard';
import { SiteActionPlan } from './components/SiteActionPlan';
import { SiteSelectorModal } from './components/SiteSelectorModal';
import { DataProvenanceModal } from './components/DataProvenanceModal';
import { SiteReportModal } from './components/SiteReportModal';
import { MemphisConfetti, PlayfulBadge, Squiggle } from './components/PlayfulDecoration';
import { PRESET_SITES } from './data/presets';
import { SiteBoundary, SiteIntelligenceProfile, PresetSite, LatLng } from './types/site';
import { createCircularPolygon, buildSiteBoundary } from './utils/geometry';
import {
  Layers,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Compass,
  Mountain,
  Droplets,
  HardHat,
  Filter,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Site & Intelligence State
  const [boundary, setBoundary] = useState<SiteBoundary | null>(null);
  const [profile, setProfile] = useState<SiteIntelligenceProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'vertical' | 'cross_section' | 'findings' | 'action_plan'>('vertical');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);

  // Finding category filter
  const [domainFilter, setDomainFilter] = useState<string>('all');

  // Load default preset on initial mount (Austin Hill Country Karst)
  useEffect(() => {
    const defaultPreset = PRESET_SITES[0];
    loadPresetSite(defaultPreset);
  }, []);

  const runAnalysis = async (siteBoundary: SiteBoundary, addressName?: string) => {
    setIsAnalyzing(true);
    setAnalysisStep('Assembling elevation grid from Copernicus DEM...');

    try {
      setAnalysisStep('Analyzing topographic slope, aspect, and hydraulic drainage vectors...');
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Connecting regional bedrock lithology and soil classification models...');
      }, 600);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Synthesizing evidence-backed reasoning and unknown constraints...');
      }, 1200);

      const res = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boundary: siteBoundary, addressName })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setBoundary(data.profile.location.boundary);
        }
      } else {
        const errorData = await res.json();
        console.error('Analysis error:', errorData);
      }
    } catch (err) {
      console.error('Failed to run site analysis:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const loadPresetSite = (preset: PresetSite) => {
    const coords = createCircularPolygon(preset.coordinates, preset.defaultRadiusMeters, 8);
    const newBoundary = buildSiteBoundary(coords, preset.coordinates);
    setBoundary(newBoundary);
    setIsSelectorOpen(false);
    runAnalysis(newBoundary, `${preset.name}, ${preset.region}`);
  };

  const loadCustomCoordinates = (lat: number, lng: number, addressName: string, radiusMeters: number) => {
    const center: LatLng = { lat, lng };
    const coords = createCircularPolygon(center, radiusMeters, 8);
    const newBoundary = buildSiteBoundary(coords, center);
    setBoundary(newBoundary);
    setIsSelectorOpen(false);
    runAnalysis(newBoundary, addressName);
  };

  const handleBoundaryUpdate = (coords: [number, number][], center: LatLng) => {
    const updated = buildSiteBoundary(coords, center);
    setBoundary(updated);
  };

  const handleOpenProvenance = (sourceName?: string) => {
    setHighlightedSource(sourceName || null);
    setIsProvenanceOpen(true);
  };

  const handleSelectFinding = (findingId: string) => {
    setSelectedFindingId(findingId);
    const finding = profile?.findings.find((f) => f.id === findingId);
    if (finding) {
      const el = document.getElementById(`finding-${findingId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const filteredFindings = profile?.findings.filter((f) => {
    if (domainFilter === 'all') return true;
    return f.domain === domainFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-[#FFFDF5] bg-dot-grid text-[#1E293B] flex flex-col antialiased relative">
      {/* Decorative Memphis Confetti in Background */}
      <MemphisConfetti />

      {/* Navbar */}
      <Navbar
        profile={profile}
        boundary={boundary}
        isAnalyzing={isAnalyzing}
        isDrawingMode={isDrawingMode}
        onToggleDrawingMode={() => {
          if (isDrawingMode && boundary) {
            runAnalysis(boundary, profile?.location.addressName);
          }
          setIsDrawingMode(!isDrawingMode);
        }}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenProvenance={() => handleOpenProvenance()}
        onOpenReport={() => setIsReportOpen(true)}
        onReanalyze={() => {
          if (boundary) runAnalysis(boundary, profile?.location.addressName);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-7">
        {/* Loading Overlay / Progress Notification */}
        {isAnalyzing && (
          <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-[6px_6px_0px_#FBBF24] animate-bounce">
            <div className="w-10 h-10 rounded-full bg-[#FBBF24] border-2 border-[#1E293B] flex items-center justify-center text-[#1E293B] shrink-0">
              <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <span className="font-mono text-xs uppercase tracking-wider text-[#8B5CF6] font-extrabold block">
                Executing Explainable Site Intelligence Pipeline
              </span>
              <p className="text-xs sm:text-sm text-[#1E293B] font-bold mt-0.5">
                {analysisStep || 'Synthesizing evidence layers...'}
              </p>
            </div>
          </div>
        )}

        {/* Top Split: Interactive Map & Executive Parcel Telemetry */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Map Column */}
          <div className="lg:col-span-8 flex flex-col min-h-[460px]">
            <InteractiveMap
              boundary={boundary}
              elevation={profile?.elevation}
              hydrology={profile?.hydrology}
              findings={profile?.findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={handleSelectFinding}
              isDrawingMode={isDrawingMode}
              onBoundaryUpdate={handleBoundaryUpdate}
              onFinishEditing={() => {
                setIsDrawingMode(false);
                if (boundary) {
                  runAnalysis(boundary, profile?.location.addressName);
                }
              }}
              center={boundary?.center}
            />
          </div>

          {/* Right Column: Anchored Site Quick Telemetry Sticker Card */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-white border-2 border-[#1E293B] rounded-3xl p-5 sm:p-6 space-y-4 shadow-[6px_6px_0px_0px_#1E293B] relative">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F472B6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[1px_1px_0px_#1E293B]">
                    <Compass className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-['Outfit'] text-xs uppercase tracking-wider text-[#1E293B] font-extrabold">
                    Anchored Parcel
                  </span>
                </div>
                <PlayfulBadge color="yellow" size="sm">
                  Active Audit
                </PlayfulBadge>
              </div>

              <h2 className="text-base font-bold text-[#1E293B] font-['Outfit'] mt-3 line-clamp-2">
                {profile?.location.addressName || 'Target Land Parcel'}
              </h2>
              <p className="text-xs font-mono font-semibold text-[#8B5CF6] mt-1">
                {boundary
                  ? `${boundary.center.lat.toFixed(5)}°N, ${boundary.center.lng.toFixed(5)}°W`
                  : 'Coordinates pending'}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FFFDF5] p-3 rounded-2xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] text-[#64748B] font-bold block">Parcel Footprint</span>
                <span className="font-mono font-extrabold text-[#8B5CF6] text-base">
                  {boundary?.areaAcres || '0.00'} ac
                </span>
                <span className="text-[10px] text-[#64748B] font-mono block">
                  ({boundary?.areaSquareMeters.toLocaleString() || '0'} m²)
                </span>
              </div>

              <div className="bg-[#FFFDF5] p-3 rounded-2xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] text-[#64748B] font-bold block">Average Slope</span>
                <span className="font-mono font-extrabold text-[#F59E0B] text-base">
                  {profile?.elevation.slopePercentMean || 0}%
                </span>
                <span className="text-[10px] text-[#64748B] font-mono block truncate">
                  {profile?.elevation.slopeCategory || 'Evaluating'}
                </span>
              </div>

              <div className="bg-[#FFFDF5] p-3 rounded-2xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] text-[#64748B] font-bold block">Elevation Relief</span>
                <span className="font-mono font-extrabold text-[#1E293B] text-base">
                  {profile?.elevation.elevationDeltaM || 0} m
                </span>
                <span className="text-[10px] text-[#64748B] font-mono block">
                  {profile?.elevation.minElevationM}m – {profile?.elevation.maxElevationM}m
                </span>
              </div>

              <div className="bg-[#FFFDF5] p-3 rounded-2xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <span className="font-mono text-[10px] text-[#64748B] font-bold block">Surface Drainage</span>
                <span className="font-mono font-extrabold text-[#0284C7] text-base">
                  {profile?.elevation.aspectCompass || 'Flat'}ward
                </span>
                <span className="text-[10px] text-[#64748B] font-mono block">
                  {profile?.elevation.aspectDegree || 0}° Azimuth
                </span>
              </div>
            </div>

            {/* Geological Formation Mini-Card */}
            <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#F472B6] font-extrabold block">
                Regional Bedrock Context
              </span>
              <p className="font-bold text-[#1E293B] font-['Outfit'] line-clamp-1">
                {profile?.geology.macroFormation || 'Awaiting geological join...'}
              </p>
              <p className="text-[11px] text-[#475569] line-clamp-2 font-medium">
                {profile?.geology.lithologyType}
              </p>
              {profile?.geology.karstSolubleRockIndicator && (
                <div className="mt-1.5 font-mono text-[10px] text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#1E293B] font-bold flex items-center gap-1">
                  <span>⚠️ Regional Karst Hazard</span>
                </div>
              )}
            </div>

            {/* View Full Report Candy Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="candy-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>Open 13-Section Report</span>
              <span className="w-4 h-4 rounded-full bg-white text-[#8B5CF6] flex items-center justify-center font-bold text-[10px]">
                →
              </span>
            </button>
          </div>
        </section>

        {/* View Selection Tabs (Candy Tabs) */}
        <section className="flex items-center gap-2.5 overflow-x-auto pb-1 select-none">
          <button
            onClick={() => setActiveTab('vertical')}
            className={`px-4 py-2 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'vertical'
                ? 'bg-[#8B5CF6] text-white shadow-[3px_3px_0px_#1E293B] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-[#1E293B] hover:bg-[#F1F5F9] shadow-[2px_2px_0px_#1E293B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
            Vertical Profile (Surface to Bedrock)
          </button>

          <button
            onClick={() => setActiveTab('cross_section')}
            className={`px-4 py-2 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'cross_section'
                ? 'bg-[#F472B6] text-white shadow-[3px_3px_0px_#1E293B] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-[#1E293B] hover:bg-[#F1F5F9] shadow-[2px_2px_0px_#1E293B]'
            }`}
          >
            <Mountain className="w-3.5 h-3.5 stroke-[2.5]" />
            Geological Cross-Section
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={`px-4 py-2 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'findings'
                ? 'bg-[#FBBF24] text-[#1E293B] shadow-[3px_3px_0px_#1E293B] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-[#1E293B] hover:bg-[#F1F5F9] shadow-[2px_2px_0px_#1E293B]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            Explainable Findings Ledger ({profile?.findings.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('action_plan')}
            className={`px-4 py-2 rounded-full border-2 border-[#1E293B] text-xs font-bold font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'action_plan'
                ? 'bg-[#34D399] text-[#1E293B] shadow-[3px_3px_0px_#1E293B] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-[#1E293B] hover:bg-[#F1F5F9] shadow-[2px_2px_0px_#1E293B]'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 stroke-[2.5]" />
            Due Diligence Action Plan
          </button>
        </section>

        {/* TAB 1: Vertical Profile View */}
        {activeTab === 'vertical' && profile && (
          <VerticalProfile
            profile={profile}
            selectedFindingId={selectedFindingId}
            onSelectFinding={handleSelectFinding}
            onOpenProvenance={handleOpenProvenance}
          />
        )}

        {/* TAB 2: Standalone Geological Cross-Section */}
        {activeTab === 'cross_section' && profile && (
          <GeologicalCrossSection
            subsurface={profile.subsurface}
            onOpenProvenance={handleOpenProvenance}
          />
        )}

        {/* TAB 3: Complete Explainable Findings Ledger */}
        {activeTab === 'findings' && profile && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-[#1E293B] p-3.5 rounded-2xl shadow-[4px_4px_0px_#1E293B] text-xs">
              <div className="flex flex-wrap items-center gap-2 font-mono">
                <Filter className="w-3.5 h-3.5 text-[#8B5CF6] stroke-[2.5]" />
                <span className="text-[#64748B] font-bold">Filter Domain:</span>
                {['all', 'terrain', 'hydrology', 'geology', 'soil', 'surface'].map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setDomainFilter(dom)}
                    className={`px-3 py-1 rounded-full text-xs uppercase font-extrabold transition-all border border-[#1E293B] cursor-pointer ${
                      domainFilter === dom
                        ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#1E293B]'
                        : 'bg-[#FFFDF5] text-[#1E293B] hover:bg-[#FBBF24]'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>

              <span className="text-[#64748B] text-xs font-mono font-bold">
                Showing {filteredFindings.length} of {profile.findings.length} findings
              </span>
            </div>

            {/* Findings Stack */}
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <div key={finding.id} id={`finding-${finding.id}`}>
                  <ExplainableFindingCard
                    finding={finding}
                    isSelected={selectedFindingId === finding.id}
                    onSelect={() => handleSelectFinding(finding.id)}
                    onOpenProvenance={handleOpenProvenance}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Action Plan & Missing Data */}
        {activeTab === 'action_plan' && profile && (
          <SiteActionPlan
            missingData={profile.missingDataInventory}
            recommendations={profile.recommendedFieldInvestigations}
          />
        )}
      </main>

      {/* Footer & Anti-Hallucination Philosophy */}
      <footer className="mt-12 bg-white border-t-2 border-[#1E293B] py-6 px-4 text-xs text-[#1E293B] shadow-[0_-4px_0_0_#1E293B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FBBF24] border border-[#1E293B] flex items-center justify-center text-[#1E293B] shrink-0">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            </div>
            <p className="text-xs font-medium text-[#475569]">
              <strong className="text-[#1E293B]">TerraInspect Anti-Hallucination Architecture:</strong> Subsurface models are tagged by confidence and provenance. Regional maps are never presented as site boreholes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#1E293B] font-mono text-xs font-bold">
            <button
              onClick={() => handleOpenProvenance()}
              className="hover:text-[#8B5CF6] transition underline cursor-pointer"
            >
              Data Sources
            </button>
            <span>•</span>
            <button
              onClick={() => setIsReportOpen(true)}
              className="hover:text-[#8B5CF6] transition underline cursor-pointer"
            >
              Inspection Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SiteSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectPreset={loadPresetSite}
        onSelectCustomCoordinates={loadCustomCoordinates}
        isAnalyzing={isAnalyzing}
      />

      {profile && isProvenanceOpen && (
        <DataProvenanceModal
          provenances={profile.dataProvenances}
          highlightSourceName={highlightedSource}
          onClose={() => setIsProvenanceOpen(false)}
        />
      )}

      {profile && isReportOpen && (
        <SiteReportModal
          profile={profile}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
