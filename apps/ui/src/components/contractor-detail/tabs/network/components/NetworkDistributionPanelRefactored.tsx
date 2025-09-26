/**
 * Network Distribution Panel (Refactored)
 *
 * Main component for displaying network distribution analysis - broken down into focused sub-components
 * This replaces the original 426-line NetworkDistributionPanel.tsx while preserving ALL functionality
 */

import React from 'react';
import { Card } from "../../../../ui/card";
import { processNetworkDistribution, type NetworkDistributionData } from '../../../../../services/network-insights/networkDistributionService';
import { NetworkContracting } from './NetworkContracting';
import { NetworkLocations } from './NetworkLocations';
import type { NetworkDistributionPanelProps } from './types/networkDistributionTypes';

export function NetworkDistributionPanel({
  contractor,
  networkData,
  activityEvents,
  isLoading
}: NetworkDistributionPanelProps) {

  // State to track which dot is being hovered
  const [hoveredDot, setHoveredDot] = React.useState<string | null>(null);

  // Process activity events into network distribution data
  const distributionData: NetworkDistributionData | null = React.useMemo(() => {
    if (!activityEvents || activityEvents.length === 0) return null;
    return processNetworkDistribution(activityEvents);
  }, [activityEvents]);

  return (
    <div className="col-span-2">
      <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
        <div className="p-4 relative flex flex-col h-full">
          <h3 className="font-bold tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            NETWORK DISTRIBUTION
          </h3>

          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Left side: Network Contracting */}
            <NetworkContracting
              distributionData={distributionData}
              isLoading={isLoading || false}
            />

            {/* Right side: Network Locations */}
            <NetworkLocations
              contractor={contractor}
              distributionData={distributionData}
              activityEvents={activityEvents}
              hoveredDot={hoveredDot}
              onDotHover={setHoveredDot}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}