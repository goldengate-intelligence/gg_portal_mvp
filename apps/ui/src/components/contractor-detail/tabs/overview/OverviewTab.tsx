import React from 'react';
import { ExecutiveSummaryPanel } from './ExecutiveSummaryPanel';
import { PortfolioSnapshotPanel } from './PortfolioSnapshotPanel';
import { PerformanceSnapshotPanel } from './PerformanceSnapshotPanel';
import { AwardsAndRevenueHistoryPanel } from './AwardsAndRevenueHistoryPanel';
import { TopRelationshipsPanel } from './TopRelationshipsPanel';

interface OverviewTabProps {
  contractor: any;
  performanceData: any;
  networkData: any;
  revenueTimeAggregation: string;
  revenueTimePeriod: string;
  onRevenueTimeAggregationChange: (value: string) => void;
  onRevenueTimePeriodChange: (value: string) => void;
  getFilteredRevenueData: () => any[];
}

export function OverviewTab({
  contractor,
  performanceData,
  networkData,
  revenueTimeAggregation,
  revenueTimePeriod,
  onRevenueTimeAggregationChange,
  onRevenueTimePeriodChange,
  getFilteredRevenueData
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Command Center Dashboard - Updated Grid Layout */}
      <div className="grid grid-cols-4 gap-6 items-stretch">

        {/* UPPER LEFT: Executive Summary */}
        <div className="col-span-2 flex w-full">
          <ExecutiveSummaryPanel contractor={contractor} />
        </div>

        {/* UPPER RIGHT: Portfolio Snapshot */}
        <div className="col-span-1 flex w-full">
          <PortfolioSnapshotPanel contractor={contractor} networkData={networkData} />
        </div>

        {/* UPPER FAR RIGHT: Performance Snapshot */}
        <div className="col-span-1 flex w-full">
          <PerformanceSnapshotPanel contractor={contractor} performanceData={performanceData} />
        </div>
      </div>

      {/* Second Row: Charts */}
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT: Awards & Revenue History */}
        <div className="col-span-1">
          <AwardsAndRevenueHistoryPanel
            revenueTimeAggregation={revenueTimeAggregation}
            revenueTimePeriod={revenueTimePeriod}
            onRevenueTimeAggregationChange={onRevenueTimeAggregationChange}
            onRevenueTimePeriodChange={onRevenueTimePeriodChange}
            getFilteredRevenueData={getFilteredRevenueData}
          />
        </div>

        {/* RIGHT: Top Relationships */}
        <div className="col-span-1">
          <TopRelationshipsPanel networkData={networkData} />
        </div>
      </div>
    </div>
  );
}