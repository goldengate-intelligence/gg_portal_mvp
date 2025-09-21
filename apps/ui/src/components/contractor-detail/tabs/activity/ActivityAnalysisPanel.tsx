import React from 'react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';
import { Building2, Users, AlertTriangle, Star, TrendingUp, TrendingDown, Eye, Target } from 'lucide-react';

interface ActivityAnalysisPanelProps {
  contractor: any;
  performanceData: any;
}

export function ActivityAnalysisPanel({ contractor, performanceData }: ActivityAnalysisPanelProps) {
  // Mock partner intelligence data - in production this would come from analysis engine
  const partnerIntelligence = {
    topPartner: {
      name: "MegaCorp Industries",
      type: "prime",
      contribution: 28.1, // % of total revenue
      newBusiness: true,
      risk: "low"
    },
    emergingPartner: {
      name: "MegaCorp Industries",
      type: "prime",
      growth: 185, // % growth in 90 days
      isNew: false
    },
    utilization: {
      underutilized: 2, // partners with <30% utilization but >12 months left
      overutilized: 1,  // partners with >80% utilization
      balanced: 3
    },
    riskFactors: {
      highUtilizationShortTime: 1, // High util + <6 months left
      newRelationships: 1,
      concentrationRisk: true // >50% revenue from single source
    }
  };

  return (
    <div className="h-full rounded-lg border border-gray-700" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      {/* Header */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
            ACTIVITY ANALYSIS
          </h4>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
            <span className="text-[10px] tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif', color: '#22c55e' }}>
              TRACKING
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Key Partners - Text Focused */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Client</div>
            <div className={`text-lg font-bold mb-1 ${
              partnerIntelligence.topPartner.type === 'agency' ? 'text-[#9B7EBD]' :
              partnerIntelligence.topPartner.type === 'prime' ? 'text-[#5BC0EB]' :
              'text-[#FF4C4C]'
            }`}>{partnerIntelligence.topPartner.name}</div>
            <div className="text-xs text-gray-400">{partnerIntelligence.topPartner.contribution}% of Active Awards</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Most Active Relationship (TTM)</div>
            <div className={`text-lg font-bold mb-1 ${
              partnerIntelligence.emergingPartner.type === 'agency' ? 'text-[#9B7EBD]' :
              partnerIntelligence.emergingPartner.type === 'prime' ? 'text-[#5BC0EB]' :
              'text-[#FF4C4C]'
            }`}>{partnerIntelligence.emergingPartner.name}</div>
            <div className="text-xs text-gray-400">$425M Awarded</div>
          </div>
        </div>

        {/* Status Reports */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status Reports</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-green-400 rounded-full mt-2"></div>
              <span className="text-xs text-gray-300">Award inflows ($272M) outpacing outflows ($50M) by 5.4x in last 90 days</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2"></div>
              <span className="text-xs text-gray-300">MegaCorp concentration at 28.1% of active awards creates dependency risk</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-red-400 rounded-full mt-2"></div>
              <span className="text-xs text-gray-300">$252M in contract value expiring in next 90 days requires renewal attention</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}