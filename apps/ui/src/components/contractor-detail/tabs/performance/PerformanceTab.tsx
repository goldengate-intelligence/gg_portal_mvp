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
	isLoading = false,
}: PerformanceTabProps) {
	return (
		<div className="space-y-6">
			{(performanceData?.metrics &&
			Array.isArray(performanceData.metrics) &&
			performanceData.metrics.length > 0) || unifiedMetrics ? (
				<>
					{/* Performance Summary - Full Width Panel */}
					<div className="w-full mb-6">
						<PerformanceSummaryPanel
							performanceData={performanceData}
							unifiedMetrics={unifiedMetrics}
							peerData={peerData}
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
							peerData={peerData}
							unifiedMetrics={unifiedMetrics}
							isLoading={isLoading}
						/>
					</div>
				</>
			) : (
				<div className="flex items-center justify-center h-64">
					<div className="text-gray-500 text-center">
						<div className="text-lg mb-2">No Performance Data Available</div>
						<div className="text-sm">
							Performance metrics will appear here when data is loaded.
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
