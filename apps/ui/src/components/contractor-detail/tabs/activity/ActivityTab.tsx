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
      <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
        <div className="p-4 h-full flex flex-col relative z-10">
          <h3 className="font-bold tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            ACTIVITY SUMMARY
          </h3>
          <div className="flex-1">
            {/* Full Width: Activity Analysis */}
            <ActivityAnalysisPanel
              contractor={contractor}
              performanceData={performanceData}
            />
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