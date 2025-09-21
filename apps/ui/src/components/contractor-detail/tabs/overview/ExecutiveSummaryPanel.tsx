import React from 'react';
import { Card } from '../../../ui/card';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';

interface ExecutiveSummaryPanelProps {
  contractor: any;
}

export function ExecutiveSummaryPanel({ contractor }: ExecutiveSummaryPanelProps) {
  return (
    <Card className="h-full border-[#F97316]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#F97316]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/80 to-black/90 backdrop-blur-sm">
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
        <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
          EXECUTIVE SUMMARY
        </h3>
        <div className="flex-1">
          <div className="border border-gray-700 rounded-xl flex overflow-hidden h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            {/* Left side - Image with gradient */}
            <div className="relative" style={{ width: '40%' }}>
              <img
                src="/gg_industry_images/6_manufacturing.jpg"
                alt="Manufacturing"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/70"></div>
            </div>

            {/* Right side - AI Generated Content */}
            <div className="flex-1 px-6 py-4 flex flex-col justify-center">
              {/* Active Contractor Status Button */}
              <div
                className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full w-fit"
                style={{
                  backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
                  border: '1px solid #4a4a4a'
                }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span
                  className="text-xs text-gray-300 uppercase tracking-widest font-light"
                  style={{ fontFamily: 'Genos, sans-serif' }}
                >
                  Active Contractor
                </span>
              </div>

              {/* Section 1: 3-5 word summary */}
              <h4
                className="mb-3"
                style={{
                  fontFamily: 'Genos, sans-serif',
                  fontSize: '18px',
                  color: '#d2ac38',
                  lineHeight: '1.2'
                }}
              >
                Specialized defense systems fabricator
              </h4>

              {/* Section 2: Subtext */}
              <p className="text-gray-300 text-sm font-light leading-tight mb-3">
                Manufacturing armor systems and structural components for military vehicles and equipment.
              </p>

              {/* Section 3: Three bullet points */}
              <ul className="space-y-0.5" style={{ fontSize: '11px' }}>
                <li className="flex items-start">
                  <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
                  <span className="text-gray-300 leading-tight">Military vehicle armor and protective systems</span>
                </li>
                <li className="flex items-start">
                  <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
                  <span className="text-gray-300 leading-tight">Structural assemblies and precision hardware fabrication</span>
                </li>
                <li className="flex items-start">
                  <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
                  <span className="text-gray-300 leading-tight">Defense contractor subassembly manufacturing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p
            className="text-gray-500 uppercase tracking-wider"
            style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}
          >
            ANALYSIS AS OF {new Date().toLocaleString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).toUpperCase()}
          </p>
        </div>
      </div>
    </Card>
  );
}