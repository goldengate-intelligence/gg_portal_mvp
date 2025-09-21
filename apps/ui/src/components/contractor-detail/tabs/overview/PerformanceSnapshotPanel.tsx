import React from 'react';
import { Card } from "../../../ui/card";
import { useDesignPatterns } from '../../../../hooks/useDesignPatterns';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';

// Simple display component to replace SimpleDisplay
function SimpleDisplay({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-700/30 rounded-lg backdrop-blur-sm" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      <span className="text-xs text-gray-400 uppercase tracking-wider font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
        {label}
      </span>
      <span className="text-sm font-normal tracking-wide text-gray-100" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {value}
      </span>
    </div>
  );
}

// Color-coded display component for percentages
function PercentageDisplay({ label, value }: { label: string; value: string }) {
  // Extract numeric value from percentage string
  const numericValue = parseFloat(value.replace('%', ''));

  // Determine color based on rules
  let textColor: string;
  if (numericValue >= 1) {
    textColor = '#10B981'; // Green
  } else if (numericValue > -1 && numericValue < 1) {
    textColor = '#F59E0B'; // Yellow
  } else {
    textColor = '#EF4444'; // Red
  }

  return (
    <div className="flex items-center justify-between p-3 border border-gray-700/30 rounded-lg backdrop-blur-sm" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      <span className="text-xs text-gray-400 uppercase tracking-wider font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
        {label}
      </span>
      <span className="text-sm font-normal tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: textColor }}>
        {value}
      </span>
    </div>
  );
}

interface PerformanceSnapshotPanelProps {
  contractor: any;
  performanceData: any;
}

export function PerformanceSnapshotPanel({ contractor, performanceData }: PerformanceSnapshotPanelProps) {
  const { Typography, PanelWrapper } = useDesignPatterns();

  return (
    <Card className="w-full h-full border-[#F97316]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#F97316]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
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
        <h3
          className={Typography.panelTitle}
          style={Typography.panelTitleFont}
        >
          PERFORMANCE SNAPSHOT
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <SimpleDisplay
              label="PERFORMANCE SCORE"
              value={performanceData?.scores?.composite || 80}
            />
            <PercentageDisplay
              label="AWARDS GROWTH"
              value="18.2%"
            />
            <PercentageDisplay
              label="REVENUE GROWTH"
              value="12.7%"
            />
            <PercentageDisplay
              label="PIPELINE GROWTH"
              value="24.5%"
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p
            className="text-gray-500 uppercase tracking-wider"
            style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}
          >
            ROLLING YEAR-OVER-YEAR PERFORMANCE
          </p>
        </div>
      </div>
    </Card>
  );
}