import React from 'react';
import { MissingDataItem, FieldInvestigationRecommendation } from '../types/site';
import {
  HelpCircle,
  HardHat,
  Clock,
  Sparkles,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { PlayfulBadge } from './PlayfulDecoration';

interface Props {
  missingData: MissingDataItem[];
  recommendations: FieldInvestigationRecommendation[];
}

export const SiteActionPlan: React.FC<Props> = ({ missingData, recommendations }) => {
  return (
    <div className="space-y-6">
      {/* 2-Column Action Plan Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Missing Data Inventory */}
        <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 text-[#1E293B] shadow-[6px_6px_0px_0px_#FBBF24] relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBBF24] border-2 border-[#1E293B] flex items-center justify-center text-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
                <HelpCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-base font-['Outfit'] text-[#1E293B]">
                  Information Gaps & Unknowns
                </h3>
                <p className="text-xs text-[#64748B]">
                  Remote satellite & database limits requiring on-ground truth
                </p>
              </div>
            </div>
            <PlayfulBadge color="yellow" size="sm">
              {missingData.length} Gaps
            </PlayfulBadge>
          </div>

          {/* Items list */}
          <div className="space-y-3.5">
            {missingData.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#FFFDF5] border-2 border-[#1E293B] text-xs space-y-2 shadow-[2px_2px_0px_#1E293B] hover:translate-x-1 transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#1E293B] font-extrabold tracking-wider bg-white px-2 py-0.5 rounded-full border border-[#1E293B]">
                    {item.domain}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#1E293B] bg-[#FBBF24] px-2 py-0.5 rounded-full border border-[#1E293B]">
                    Unresolved
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#1E293B] font-['Outfit']">
                  {item.missingItem}
                </h4>
                <p className="text-[#475569] text-xs font-medium leading-relaxed">
                  <strong className="text-[#1E293B]">Due Diligence Impact:</strong>{' '}
                  {item.impactOnSiteDueDiligence}
                </p>
                <div className="pt-1.5 flex items-center gap-1.5 text-xs text-[#8B5CF6] font-bold font-mono">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Action: {item.recommendedInvestigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recommended Field Investigations */}
        <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 text-[#1E293B] shadow-[6px_6px_0px_0px_#8B5CF6] relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1E293B] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[2px_2px_0px_#1E293B]">
                <HardHat className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-base font-['Outfit'] text-[#1E293B]">
                  Pre-Purchase Field Protocol
                </h3>
                <p className="text-xs text-[#64748B]">
                  Targeted engineering investigations required prior to closing
                </p>
              </div>
            </div>
            <PlayfulBadge color="purple" size="sm">
              {recommendations.length} Scopes
            </PlayfulBadge>
          </div>

          {/* Recommendations List */}
          <div className="space-y-3.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-[#FFFDF5] border-2 border-[#1E293B] text-xs space-y-2.5 shadow-[2px_2px_0px_#1E293B] hover:translate-x-1 transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border-2 border-[#1E293B] shadow-[1px_1px_0px_#1E293B] ${
                      rec.priority === 'Essential'
                        ? 'bg-[#F472B6] text-white'
                        : 'bg-[#FBBF24] text-[#1E293B]'
                    }`}
                  >
                    ★ {rec.priority} Priority
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 stroke-[2.5]" />
                    {rec.suggestedTiming}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#1E293B] font-['Outfit']">
                  {rec.investigationType}
                </h4>

                <p className="text-[#334155] leading-relaxed font-medium">
                  {rec.scope}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-[#1E293B]">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#64748B] font-bold block">
                      Discipline
                    </span>
                    <span className="font-bold text-[#1E293B] text-xs font-mono">
                      {rec.discipline}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#1E293B]">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#64748B] font-bold block">
                      Trigger Finding
                    </span>
                    <span className="font-bold text-[#8B5CF6] text-xs truncate block" title={rec.triggerFinding}>
                      {rec.triggerFinding}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
