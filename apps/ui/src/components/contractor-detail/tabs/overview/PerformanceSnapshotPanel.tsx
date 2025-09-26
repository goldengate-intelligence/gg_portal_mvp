import React from "react";
import { useDesignPatterns } from "../../../../hooks/useDesignPatterns";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics, PeerComparisonData } from "../../services/unified-data-adapter";

// Simple display component to replace SimpleDisplay
function SimpleDisplay({
	label,
	value,
}: { label: string; value: string | number }) {
	return (
		<div
			className="flex items-center justify-between p-3 border border-gray-700/30 rounded-lg backdrop-blur-sm"
			style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
		>
			<span
				className="text-xs text-gray-400 uppercase tracking-wider font-normal"
				style={{ fontFamily: "Genos, sans-serif" }}
			>
				{label}
			</span>
			<span
				className="text-xs font-normal tracking-wide text-gray-100"
				style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
			>
				{value}
			</span>
		</div>
	);
}

// Color-coded display component for percentages
function PercentageDisplay({ label, value }: { label: string; value: string }) {
	// Extract numeric value from percentage string
	const numericValue = Number.parseFloat(value.replace("%", ""));

	// Determine color based on rules
	let textColor: string;
	if (numericValue >= 1) {
		textColor = "#10B981"; // Green
	} else if (numericValue > -1 && numericValue < 1) {
		textColor = "#F59E0B"; // Yellow
	} else {
		textColor = "#EF4444"; // Red
	}

	return (
		<div
			className="flex items-center justify-between p-3 border border-gray-700/30 rounded-lg backdrop-blur-sm"
			style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
		>
			<span
				className="text-xs text-gray-400 uppercase tracking-wider font-normal"
				style={{ fontFamily: "Genos, sans-serif" }}
			>
				{label}
			</span>
			<span
				className="text-xs font-normal tracking-wide"
				style={{
					fontFamily: "system-ui, -apple-system, sans-serif",
					color: textColor,
				}}
			>
				{value}
			</span>
		</div>
	);
}

interface PerformanceSnapshotPanelProps {
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	peerData?: PeerComparisonData;
	isLoading?: boolean;
}

export function PerformanceSnapshotPanel({
	activityEvents,
	metrics,
	peerData,
	isLoading,
}: PerformanceSnapshotPanelProps) {
	const { Typography, PanelWrapper } = useDesignPatterns();

	// Calculate performance score (0-100) based on growth metrics
	const calculatePerformanceScore = () => {
		if (!metrics?.growth) return 80;

		const { awards, revenue, pipeline } = metrics.growth;
		const avgGrowth = (awards + revenue + pipeline) / 3;

		// Convert growth percentage to score (0-100)
		// Positive growth above 10% = good score
		if (avgGrowth >= 10) return Math.min(95, 80 + avgGrowth / 2);
		if (avgGrowth >= 0) return 70 + avgGrowth;
		return Math.max(30, 70 + avgGrowth * 2);
	};

	return (
		<Card
			className="w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
			style={{ backgroundColor: "#111726" }}
		>
			<div className="p-4 h-full flex flex-col relative z-10">
				<h3
					className="font-bold tracking-wide mb-3 text-gray-200 uppercase"
					style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
				>
					PERFORMANCE SNAPSHOT
				</h3>

				<div className="flex-1 flex flex-col justify-between">
					<div className="space-y-3">
						<SimpleDisplay
							label="PERFORMANCE SCORE"
							value={Math.round(calculatePerformanceScore())}
						/>
						<SimpleDisplay
							label="AWARDS CAPTURED (TTM)"
							value={metrics?.ttm?.awards ? `$${metrics.ttm.awards.toFixed(1)}M` : '--'}
						/>
						<PercentageDisplay
							label="AWARDS GROWTH (YOY)"
							value={`${metrics?.growth?.awardsYoY?.toFixed(1) || '--'}%`}
						/>
						<PercentageDisplay
							label="REVENUE GROWTH (YOY)"
							value={`${metrics?.growth?.revenueYoY?.toFixed(1) || '--'}%`}
						/>
					</div>
				</div>

				<div className="mt-3 pt-3 border-t border-gray-700">
					<p
						className="text-gray-500 uppercase tracking-wider"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "12px" }}
					>
						ROLLING YEAR-OVER-YEAR PERFORMANCE
					</p>
				</div>
			</div>
		</Card>
	);
}
