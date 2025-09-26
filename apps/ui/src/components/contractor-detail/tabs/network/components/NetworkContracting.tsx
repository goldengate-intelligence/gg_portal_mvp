/**
 * Network Contracting Component
 *
 * Left panel showing network contracting relationships and stats
 */

import React from 'react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../index';
import { NetworkStatsBar } from './NetworkStatsBar';
import { NetworkRelationshipList } from './NetworkRelationshipList';
import type { NetworkContractingProps } from './types/networkDistributionTypes';

export const NetworkContracting: React.FC<NetworkContractingProps> = ({
  distributionData,
  isLoading
}) => {
  return (
    <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
          Network Contracting
        </h4>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] text-[#22c55e] font-light" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>
            TRACKING
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative rounded-lg overflow-hidden min-h-[316px]">
        <div className="h-full border border-gray-700 backdrop-blur-sm rounded-lg p-3 flex flex-col" style={{ backgroundColor: '#03070F' }}>

          {/* Stats Bar */}
          <NetworkStatsBar
            distributionData={distributionData}
            isLoading={isLoading}
          />

          {/* Flow Indicator */}
          <div className="relative mb-2">
            <div className="h-[2px] bg-gradient-to-r from-[#9B7EBD] via-[#5BC0EB] to-[#FF4C4C] rounded-full opacity-60" />
          </div>

          {/* Three Column Content */}
          <div className="grid grid-cols-3 gap-4 flex-1">

            {/* Left: Agency Direct Awards */}
            <div className="col-span-1">
              <div className="h-full">
                <NetworkRelationshipList
                  relationships={distributionData?.agencyDirectAwards?.relationships}
                  isLoading={isLoading}
                  type="agency"
                  colorTheme={{
                    border: '[#9B7EBD]',
                    text: 'text-[#22c55e]'
                  }}
                  emptyMessage="No agency awards found"
                />
              </div>
            </div>

            {/* Middle: Prime Sub Awards */}
            <div className="col-span-1">
              <div className="h-full">
                <NetworkRelationshipList
                  relationships={distributionData?.primeSubAwards?.relationships}
                  isLoading={isLoading}
                  type="prime"
                  colorTheme={{
                    border: '[#5BC0EB]',
                    text: 'text-[#22c55e]'
                  }}
                  emptyMessage="No prime sub awards found"
                />
              </div>
            </div>

            {/* Right: Vendor Procurement */}
            <div className="col-span-1">
              <div className="h-full">
                <NetworkRelationshipList
                  relationships={distributionData?.vendorProcurement?.relationships}
                  isLoading={isLoading}
                  type="vendor"
                  colorTheme={{
                    border: '[#FF4C4C]',
                    text: 'text-red-400'
                  }}
                  emptyMessage="No vendor procurement found"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};