/**
 * Network Stats Bar Component
 *
 * Displays the three-column stats header for network contracting data
 */

import React from 'react';
import { formatMoney } from '../../../index';
import type { NetworkStatsBarProps } from './types/networkDistributionTypes';

export const NetworkStatsBar: React.FC<NetworkStatsBarProps> = ({
  distributionData,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-2">
      <div className="text-center">
        <div className="text-[12px] uppercase tracking-wider text-[#9B7EBD]" style={{ fontFamily: 'Genos, sans-serif' }}>
          Agency Clients
        </div>
        <div className="py-0.5">
          <div className="font-bold text-[#22c55e] leading-tight" style={{ fontSize: '38px' }}>
            {isLoading ? '--' : formatMoney(distributionData?.agencyDirectAwards?.totalAmount || 0)}
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-[12px] uppercase tracking-wider text-[#5BC0EB]" style={{ fontFamily: 'Genos, sans-serif' }}>
          Prime Clients
        </div>
        <div className="py-0.5">
          <div className="font-bold text-[#22c55e] leading-tight" style={{ fontSize: '38px' }}>
            {isLoading ? '--' : formatMoney(distributionData?.primeSubAwards?.totalAmount || 0)}
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-[12px] uppercase tracking-wider text-[#FF4C4C]" style={{ fontFamily: 'Genos, sans-serif' }}>
          Sub Vendors
        </div>
        <div className="py-0.5">
          <div className="font-bold text-red-400 leading-tight" style={{ fontSize: '38px' }}>
            {isLoading ? '--' : formatMoney(distributionData?.vendorProcurement?.totalAmount || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};