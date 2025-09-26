/**
 * Map Legend Component
 *
 * Legend for the network locations map showing dot color meanings
 */

import React from 'react';
import type { MapLegendProps } from './types/networkDistributionTypes';

export const MapLegend: React.FC<MapLegendProps> = () => {
  return (
    <div className="mt-2">
      <div className="flex justify-center gap-4 font-light" style={{ fontSize: '14px' }}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#D2AC38]"></div>
          <span className="text-[#D2AC38]">Contractor HQ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#5BC0EB]"></div>
          <span className="text-[#5BC0EB]">Parent HQ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#FF4C4C]"></div>
          <span className="text-[#FF4C4C]">Child HQ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
          <span className="text-[#22c55e]">Place of Performance</span>
        </div>
      </div>
    </div>
  );
};