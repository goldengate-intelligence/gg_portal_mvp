import React from 'react';
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../../../lib/utils';
import { Activity, Package, Clock, Zap, TrendingUp, Calendar } from 'lucide-react';

interface ActivitySnapshotPanelProps {
  contractor: any;
  performanceData: any;
}

export function ActivitySnapshotPanel({ contractor, performanceData }: ActivitySnapshotPanelProps) {
  return (
    <div className="h-full rounded-lg border border-gray-700" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      {/* Header */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
            ACTIVITY SNAPSHOT - 90 DAY REPORT
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
        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* New Business */}
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#22c55e] mx-auto mb-2" />
            <div className="text-xl font-bold text-[#22c55e]">$272M</div>
            <div className="text-xs text-gray-400">Award Inflows (Last 90d)</div>
          </div>

          {/* Subcontractor Awards */}
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <Package className="w-5 h-5 text-[#FF4C4C] mx-auto mb-2" />
            <div className="text-xl font-bold text-[#FF4C4C]">$50M</div>
            <div className="text-xs text-gray-400">Sub Outflows (Last 90d)</div>
          </div>

          {/* At Risk */}
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <Clock className="w-5 h-5 text-[#eab308] mx-auto mb-2" />
            <div className="text-xl font-bold text-[#eab308]">$252M</div>
            <div className="text-xs text-gray-400">Expiring Value (Next 90d)</div>
          </div>
        </div>

        {/* Net Position & Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-black/10 rounded">
            <span className="text-sm text-gray-400">Net Position</span>
            <span className="text-lg font-bold text-[#22c55e]">+$222M</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-black/10 rounded">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">Activity Level</span>
            </div>
            <span className="text-sm font-bold text-red-400">HOT</span>
          </div>
        </div>
      </div>
    </div>
  );
}