import React from 'react';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../../logic/utils';

interface MetricCardProps {
  title: string;
  value: string;
  accentColor: string;
  count: string;
  countLabel: string;
  timeframe: string;
  description: string;
}

function MetricCard({ title, value, accentColor, count, countLabel, timeframe, description }: MetricCardProps) {
  return (
    <div className="rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/40 transition-all group relative overflow-hidden">
      {/* Gradient background for each card */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-lg"></div>

      {/* Subtle color accent bar - full height */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: accentColor }}></div>

      {/* Content layer */}
      <div className="relative z-10">

      <div className="pl-2">
        <div className="text-gray-500 font-normal uppercase tracking-wide mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
          {title}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="font-medium" style={{ color: accentColor, fontSize: '30px', lineHeight: '1' }}>
              {value}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-medium">{count}</span>
              <span className="text-gray-500 uppercase tracking-wide">{countLabel}</span>
            </div>
            <span className="text-gray-600 uppercase tracking-wider">{timeframe}</span>
          </div>
        </div>

        <div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
          {description}
        </div>
      </div>
      </div>
    </div>
  );
}

export function HeadlineMetrics() {
  const metrics = [
    {
      title: 'LIFETIME AWARDS',
      value: '$1.2B',
      accentColor: '#F97316',
      count: '278',
      countLabel: 'contracts',
      timeframe: 'all time',
      description: 'Total historical value'
    },
    {
      title: 'ACTIVE AWARDS',
      value: '$480M',
      accentColor: '#FFB84D',
      count: '92',
      countLabel: 'contracts',
      timeframe: 'performing',
      description: 'Currently active'
    },
    {
      title: 'REVENUE TTM',
      value: '$112.5M',
      accentColor: '#42D4F4',
      count: 'Est',
      countLabel: 'recognized',
      timeframe: '12 months',
      description: 'STRAIGHT-LINE RECOGNITION (SLR)'
    },
    {
      title: 'PIPELINE',
      value: '$337.5M',
      accentColor: '#8B8EFF',
      count: 'Est',
      countLabel: 'potential',
      timeframe: 'forecast',
      description: 'LIFETIME AWDS MINUS SLR'
    }
  ];

  return (
    <div className="mt-6 grid grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}