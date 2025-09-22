import React from 'react';
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../../../logic/utils';
import { Activity, Package, Clock, Zap, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface ActivitySnapshotPanelProps {
  contractor: any;
  performanceData: any;
}

export function ActivitySnapshotPanel({ contractor, performanceData }: ActivitySnapshotPanelProps) {
  return (
    <div className="h-full rounded-lg border border-gray-700" style={{ backgroundColor: '#223040' }}>
      {/* Header */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
            ACTIVITY PERIOD
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
      <div className="p-6 flex-1">
        {/* Enhanced Activity Flow Display */}
        <div className="h-full flex flex-col">

          {/* Main Flow Visualization */}
          <div className="mb-8">
            <div className="flex items-center justify-between">

              {/* Inflow Side */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center mb-4 relative">
                  <TrendingUp className="w-6 h-6 text-[#22c55e]" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center">
                    <span className="text-xs text-black font-bold">8</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#22c55e] mb-1">$140M</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Award Inflows</div>
                <div className="text-xs text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-full">+18% vs Q3</div>
              </div>

              {/* Center Flow Arrow with Speed Indicator */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative mb-2">
                  <div className="w-20 h-1 bg-gradient-to-r from-[#22c55e] via-[#D2AC38] to-[#FF4C4C] relative rounded-full">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-0 h-0 border-l-[8px] border-l-[#FF4C4C] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#D2AC38] uppercase tracking-wider">Contract Velocity</div>
                <div className="text-xs text-gray-500">42 days avg</div>
              </div>

              {/* Outflow Side */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full bg-[#FF4C4C]/20 border border-[#FF4C4C]/40 flex items-center justify-center mb-4 relative">
                  <TrendingDown className="w-6 h-6 text-[#FF4C4C]" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4C4C] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#FF4C4C] mb-1">$39M</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Award Outflows</div>
                <div className="text-xs text-[#FF4C4C] bg-[#FF4C4C]/10 px-2 py-1 rounded-full">-5% vs Q3</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}