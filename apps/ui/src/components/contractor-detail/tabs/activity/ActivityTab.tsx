import React, { useState } from 'react';
import { ActivitySnapshotPanel } from './ActivitySnapshotPanel';
import { ActivityAnalysisPanel } from './ActivityAnalysisPanel';
import { ActivityDetailPanel } from './ActivityDetailPanel';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';

interface ActivityTabProps {
  contractor: any;
  performanceData: any;
}

export function ActivityTab({ contractor, performanceData }: ActivityTabProps) {
  return (
    <div className="space-y-4">
      {/* Top: Split Panel - Activity Summary + Contracting Analysis */}
      <Card className="h-full border-[#F97316]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#F97316]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #F97316 1px, transparent 1px),
              linear-gradient(180deg, #F97316 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0" style={{ background: 'linear-gradient(135deg, #F9731620, transparent)' }} />
        <div className="p-4 h-full flex flex-col relative z-10">
          <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            ACTIVITY SUMMARY
          </h3>
          <div className="flex-1 flex gap-4">
            {/* Left Half: Activity Analysis */}
            <div className="flex-1">
              <ActivityAnalysisPanel
                contractor={contractor}
                performanceData={performanceData}
              />
            </div>

            {/* Right Half: Activity Snapshot */}
            <div className="flex-1">
              <ActivitySnapshotPanel
                contractor={contractor}
                performanceData={performanceData}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom: Detailed Contracting Activity Panel */}
      <ActivityDetailPanel
        contractor={contractor}
        performanceData={performanceData}
      />
    </div>
  );
}