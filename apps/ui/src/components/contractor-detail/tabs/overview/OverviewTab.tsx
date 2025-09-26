import React from "react";
import { AwardsAndRevenueHistoryPanel } from "./AwardsAndRevenueHistoryPanel";
import { ExecutiveSummaryPanel } from "./ExecutiveSummaryPanel";
import { PerformanceSnapshotPanel } from "./PerformanceSnapshotPanel";
import { PortfolioSnapshotPanel } from "./PortfolioSnapshotPanel";
import { TopRelationshipsPanel } from "./TopRelationshipsPanel";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics, PeerComparisonData, MonthlyMetricsData } from "../../services/unified-data-adapter";

interface OverviewTabProps {
	contractor?: any; // Contractor basic info (name, uei, etc.)
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	peerData?: PeerComparisonData;
	monthlyHistory: MonthlyMetricsData[];
	revenueTimeAggregation: string;
	revenueTimePeriod: string;
	onRevenueTimeAggregationChange: (value: string) => void;
	onRevenueTimePeriodChange: (value: string) => void;
	isLoading?: boolean;
}

export function OverviewTab({
	contractor,
	activityEvents,
	metrics,
	peerData,
	monthlyHistory,
	revenueTimeAggregation,
	revenueTimePeriod,
	onRevenueTimeAggregationChange,
	onRevenueTimePeriodChange,
	isLoading,
}: OverviewTabProps) {
	return (
		<div className="space-y-6">
			{/* Command Center Dashboard - Updated Grid Layout */}
			<div className="grid grid-cols-4 gap-6 items-stretch">
				{/* UPPER LEFT: Executive Summary */}
				<div className="col-span-2">
					<ExecutiveSummaryPanel
						contractor={contractor}
						activityEvents={activityEvents}
						metrics={metrics}
						peerData={peerData}
						isLoading={isLoading}
					/>
				</div>

				{/* UPPER RIGHT: Portfolio Snapshot */}
				<div className="col-span-1">
					<PortfolioSnapshotPanel
						activityEvents={activityEvents}
						metrics={metrics}
						isLoading={isLoading}
					/>
				</div>

				{/* UPPER FAR RIGHT: Performance Snapshot */}
				<div className="col-span-1">
					<PerformanceSnapshotPanel
						activityEvents={activityEvents}
						metrics={metrics}
						peerData={peerData}
						isLoading={isLoading}
					/>
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
						monthlyHistory={monthlyHistory}
						isLoading={isLoading}
					/>
				</div>

				{/* RIGHT: Top Relationships */}
				<div className="col-span-1">
					<TopRelationshipsPanel
						activityEvents={activityEvents}
						metrics={metrics}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
