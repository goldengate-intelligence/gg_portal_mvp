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
      <span className="text-xs font-normal tracking-wide text-gray-100" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {value}
      </span>
    </div>
  );
}

interface PortfolioSnapshotPanelProps {
  contractor: any;
  networkData: any;
}

export function PortfolioSnapshotPanel({ contractor, networkData }: PortfolioSnapshotPanelProps) {
  const { Typography, PanelWrapper } = useDesignPatterns();

  return (
    <Card className="w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
      <div className="p-4 h-full flex flex-col relative z-10">
        <h3 className="font-bold tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
          PORTFOLIO SNAPSHOT
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <SimpleDisplay
              label="TOP CLIENT"
              value={networkData?.relationships?.asSubcontractor?.partners?.[0]?.primeName || "MegaCorp Industries"}
            />
            <SimpleDisplay
              label="TOP NAICS"
              value={contractor?.primaryNaicsCode || '332312'}
            />
            <SimpleDisplay
              label="TOP PSC"
              value="5110"
            />
            <SimpleDisplay
              label="PORTFOLIO DURATION"
              value="3.2 Years"
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p
            className="text-gray-500 uppercase tracking-wider"
            style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}
          >
            DURATION IS VALUE-WEIGHTED AVG LIFESPAN
          </p>
        </div>
      </div>
    </Card>
  );
}