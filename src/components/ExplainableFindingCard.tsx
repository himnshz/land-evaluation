import React from 'react';
import { Finding, EvidenceCategory } from '../types/site';
import {
  ShieldAlert,
  HelpCircle,
  MapPin,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Compass,
  Sparkles
} from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  finding: Finding;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenProvenance?: (sourceName: string) => void;
}

export const getEvidenceBadgeConfig = (tag: EvidenceCategory) => {
  switch (tag) {
    case 'VERIFIED':
      return {
        bg: 'bg-[#34D399] text-[#1E293B]',
        label: 'VERIFIED',
        desc: 'Directly supported by retrieved dataset'
      };
    case 'DATA-DERIVED':
      return {
        bg: 'bg-[#8B5CF6] text-white',
        label: 'DATA-DERIVED',
        desc: 'Calculated directly from elevation/geospatial datasets'
      };
    case 'REGIONAL':
      return {
        bg: 'bg-[#F472B6] text-white',
        label: 'REGIONAL',
        desc: 'Macro geological/soil map context; not parcel-specific'
      };
    case 'INFERRED':
      return {
        bg: 'bg-[#FBBF24] text-[#1E293B]',
        label: 'INFERRED',
        desc: 'Reasoned interpretation based on available evidence'
      };
    case 'UNKNOWN':
      return {
        bg: 'bg-[#F1F5F9] text-[#64748B]',
        label: 'UNKNOWN',
        desc: 'Information cannot currently be established'
      };
    case 'FIELD-VERIFICATION-REQUIRED':
      return {
        bg: 'bg-[#F43F5E] text-white',
        label: 'FIELD VERIFICATION REQUIRED',
        desc: 'Requires physical on-ground sampling or drilling'
      };
  }
};

export const ExplainableFindingCard: React.FC<Props> = ({
  finding,
  isSelected,
  onSelect,
  onOpenProvenance
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const badge = getEvidenceBadgeConfig(finding.evidenceTag);

  const getSeverityTheme = () => {
    switch (finding.severity) {
      case 'constraint':
        return {
          shadow: 'shadow-[6px_6px_0px_0px_#F472B6]',
          badgeColor: 'bg-[#F472B6] text-white',
          tag: 'Constraint',
          iconBg: 'bg-[#F472B6]',
          icon: <AlertTriangle className="w-4 h-4 stroke-[2.5] text-white" />
        };
      case 'investigate':
        return {
          shadow: 'shadow-[6px_6px_0px_0px_#FBBF24]',
          badgeColor: 'bg-[#FBBF24] text-[#1E293B]',
          tag: 'Investigate',
          iconBg: 'bg-[#FBBF24]',
          icon: <Search className="w-4 h-4 stroke-[2.5] text-[#1E293B]" />
        };
      case 'advisory':
        return {
          shadow: 'shadow-[6px_6px_0px_0px_#8B5CF6]',
          badgeColor: 'bg-[#8B5CF6] text-white',
          tag: 'Advisory',
          iconBg: 'bg-[#8B5CF6]',
          icon: <Compass className="w-4 h-4 stroke-[2.5] text-white" />
        };
      default:
        return {
          shadow: 'shadow-[6px_6px_0px_0px_#34D399]',
          badgeColor: 'bg-[#34D399] text-[#1E293B]',
          tag: 'Favorable',
          iconBg: 'bg-[#34D399]',
          icon: <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-[#1E293B]" />
        };
    }
  };

  const theme = getSeverityTheme();

  return (
    <div
      id={`finding-${finding.id}`}
      className={`relative bg-white border-2 border-[#1E293B] rounded-2xl transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'ring-4 ring-[#8B5CF6] shadow-[8px_8px_0px_0px_#1E293B] translate-x-[-2px] translate-y-[-2px]'
          : `${theme.shadow} hover:shadow-[8px_8px_0px_0px_#1E293B] hover:-translate-y-0.5`
      }`}
    >
      {/* Decorative top header strip with floating icon */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3 bg-[#FFFDF5] border-b-2 border-[#1E293B]">
        <div className="flex items-start gap-3 flex-1">
          {/* Floating Icon Circle Badge */}
          <div
            className={`w-9 h-9 rounded-xl border-2 border-[#1E293B] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1E293B] ${theme.iconBg}`}
          >
            {theme.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {/* Evidence Tag Pill */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] ${badge.bg}`}
                title={badge.desc}
              >
                {badge.label}
              </span>

              {/* Domain Pill */}
              <span className="text-[10px] font-mono font-bold uppercase text-[#1E293B] bg-[#F1F5F9] border-2 border-[#1E293B] px-2 py-0.5 rounded-full shadow-[2px_2px_0px_#1E293B]">
                {finding.domain}
              </span>

              {/* Confidence Pill */}
              <span className="text-[10px] font-mono font-bold text-[#1E293B] bg-white border-2 border-[#1E293B] px-2 py-0.5 rounded-full shadow-[2px_2px_0px_#1E293B]">
                {finding.confidence} Confidence
              </span>
            </div>

            <h4 className="text-base font-bold text-[#1E293B] font-['Outfit'] tracking-tight">
              {finding.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {finding.location && (
            <button
              onClick={onSelect}
              className="px-2.5 py-1 rounded-full bg-[#FFFDF5] hover:bg-[#FBBF24] border-2 border-[#1E293B] text-[#1E293B] text-xs font-bold font-mono transition-transform hover:scale-105 active:scale-95 shadow-[2px_2px_0px_#1E293B] flex items-center gap-1 cursor-pointer"
              title="Pinpoint finding on map"
            >
              <MapPin className="w-3.5 h-3.5 stroke-[2.5] text-[#8B5CF6]" />
              <span className="hidden sm:inline">Map</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F1F5F9] border-2 border-[#1E293B] text-[#1E293B] shadow-[2px_2px_0px_#1E293B] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label={expanded ? 'Collapse finding details' : 'Expand finding details'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      {expanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs text-[#1E293B] bg-white">
          {/* Finding Core Statement */}
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8B5CF6] font-extrabold block mb-1">
              OBSERVATION & ASSESSMENT
            </span>
            <p className="text-[#1E293B] font-semibold text-sm leading-relaxed">
              {finding.finding}
            </p>
          </div>

          {/* Evidence & Data Source 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Supporting Evidence */}
            <div className="bg-[#F8FAFC] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#1E293B] font-bold flex items-center gap-1.5 mb-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#34D399] border border-[#1E293B] flex items-center justify-center text-[#1E293B]">
                  ✓
                </span>
                Supporting Evidence
              </span>
              <p className="text-[#334155] leading-relaxed font-medium">{finding.evidence}</p>
            </div>

            {/* Data Source */}
            <div className="bg-[#F8FAFC] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#1E293B] font-bold flex items-center gap-1.5 mb-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#F472B6] border border-[#1E293B] flex items-center justify-center text-white">
                  ⚑
                </span>
                Data Source & Provenance
              </span>
              <div className="flex items-center justify-between gap-1.5">
                <p className="text-[#334155] leading-normal font-mono text-[11px] font-semibold">
                  {finding.source}
                </p>
                {onOpenProvenance && (
                  <button
                    onClick={() => onOpenProvenance(finding.source)}
                    className="w-6 h-6 rounded-full bg-white hover:bg-[#8B5CF6] hover:text-white border-2 border-[#1E293B] text-[#1E293B] flex items-center justify-center transition-colors shadow-[1px_1px_0px_#1E293B] cursor-pointer"
                    title="View data provenance"
                  >
                    <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reasoning & Technical Interpretation */}
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#1E293B] font-bold flex items-center gap-1.5 mb-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FBBF24] border border-[#1E293B] flex items-center justify-center text-[#1E293B] font-extrabold text-[9px]">
                i
              </span>
              Reasoning & Technical Interpretation
            </span>
            <p className="text-[#334155] leading-relaxed">{finding.reasoning}</p>
            {finding.confidenceReason && (
              <div className="mt-2 pt-2 border-t border-dashed border-[#CBD5E1] text-[11px] text-[#64748B]">
                <strong className="font-mono text-[#1E293B]">Confidence Basis: </strong>
                {finding.confidenceReason}
              </div>
            )}
          </div>

          {/* Unknowns & Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Unknown Data */}
            <div className="bg-white p-3 rounded-xl border-2 border-[#1E293B] border-dashed shadow-[2px_2px_0px_#1E293B]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] font-bold flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 stroke-[2.5] text-[#64748B]" />
                Unknown / Missing Data
              </span>
              <p className="text-[#64748B] leading-relaxed text-[11px] font-medium">
                {finding.unknowns}
              </p>
            </div>

            {/* Recommended Field Verification */}
            <div className="bg-[#FFFBEB] p-3 rounded-xl border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#D97706] font-extrabold flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5] text-[#D97706]" />
                Required Physical Verification
              </span>
              <p className="text-[#92400E] leading-relaxed text-[11px] font-semibold">
                {finding.recommendedVerification}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
