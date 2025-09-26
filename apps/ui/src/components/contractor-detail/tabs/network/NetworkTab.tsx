import React from 'react';
import { Database } from 'lucide-react';
import { NetworkSummaryPanel } from './components/NetworkSummaryPanel';
import { NetworkDistributionPanel } from './components/NetworkDistributionPanel';
import type { ActivityEvent } from './types';

interface NetworkTabProps {
  contractorUEI: string;
  contractor?: any;
  activityEvents: ActivityEvent[];
  networkData?: any;
  isLoading?: boolean;
}

export default function NetworkTab({
  contractorUEI,
  contractor,
  activityEvents,
  networkData,
  isLoading = false
}: NetworkTabProps) {
  return (
    <div className="space-y-6 min-h-[70vh]">
      {/* First Row - Network Summary Panel */}
      <NetworkSummaryPanel
        contractor={contractor || { uei: contractorUEI, name: 'Loading...' }}
        networkData={networkData}
        activityEvents={activityEvents}
        isLoading={isLoading}
      />

      {/* Second Row - Network Distribution Panel */}
      <NetworkDistributionPanel
        contractor={contractor || { uei: contractorUEI, name: 'Loading...' }}
        networkData={networkData}
        activityEvents={activityEvents}
        isLoading={isLoading}
      />
    </div>
  );
}