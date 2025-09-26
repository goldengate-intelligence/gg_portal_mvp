import React from "react";
import { CompetitivePositionPanel } from "./CompetitivePositionPanel";
import { PerformanceSummaryPanel } from "./PerformanceSummaryPanel";
import type { UniversalMetrics, PeerComparisonData } from "../../services/unified-data-adapter";

interface PerformanceTabProps {
	performanceData: any; // Legacy performance data
	benchmarkData: any;
	yAxisMetric: string;
	xAxisMetric: string;
	onYAxisMetricChange: (value: string) => void;
	onXAxisMetricChange: (value: string) => void;
	// New unified data props
	unifiedMetrics?: UniversalMetrics;
	peerData?: PeerComparisonData;
	contractor?: any; // Contractor basic info (name, uei, etc.)
	isLoading?: boolean;
}

export function PerformanceTab({
	performanceData,
	benchmarkData,
	yAxisMetric,
	xAxisMetric,
	onYAxisMetricChange,
	onXAxisMetricChange,
	unifiedMetrics,
	peerData,
	contractor,
	isLoading = false,
}: PerformanceTabProps) {
	return (
		<div className="space-y-6">
			{/* Performance Summary - Full Width Panel */}
			<div className="w-full mb-6">
				<PerformanceSummaryPanel
					performanceData={performanceData}
					unifiedMetrics={unifiedMetrics}
					peerData={peerData}
					contractor={contractor}
					isLoading={isLoading}
				/>
			</div>

			{/* Competitive Position Panel */}
			<div className="w-full">
				<CompetitivePositionPanel
					benchmarkData={benchmarkData}
					yAxisMetric={yAxisMetric}
					xAxisMetric={xAxisMetric}
					onYAxisMetricChange={onYAxisMetricChange}
					onXAxisMetricChange={onXAxisMetricChange}
					contractorUEI={contractor?.uei || ''}
				/>
			</div>
		</div>
	);
}
