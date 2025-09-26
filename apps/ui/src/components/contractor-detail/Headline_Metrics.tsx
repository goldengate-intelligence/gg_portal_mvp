import React from "react";
import { CONTRACTOR_DETAIL_COLORS, cn } from "../../logic/utils";
import type { UniversalMetrics } from "./services/unified-data-adapter";

interface MetricCardProps {
	title: string;
	value: string;
	accentColor: string;
	count: string;
	countLabel: string;
	timeframe: string;
	description: string;
}

function MetricCard({
	title,
	value,
	accentColor,
	count,
	countLabel,
	timeframe,
	description,
}: MetricCardProps) {
	return (
		<div className="rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/40 transition-all group relative overflow-hidden">
			{/* Gradient background for each card */}
			<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-lg" />

			{/* Subtle color accent bar - full height */}
			<div
				className="absolute left-0 top-0 bottom-0 w-[2px]"
				style={{ backgroundColor: accentColor }}
			/>

			{/* Content layer */}
			<div className="relative z-10">
				<div className="pl-2">
					<div
						className="text-gray-500 font-normal uppercase tracking-wide mb-3"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "12px" }}
					>
						{title}
					</div>

					<div className="space-y-2">
						<div className="flex items-baseline gap-1">
							<span
								className="font-medium"
								style={{
									color: accentColor,
									fontSize: "30px",
									lineHeight: "1",
								}}
							>
								{value}
							</span>
						</div>

						<div className="flex items-center justify-between text-[11px]">
							<div className="flex items-baseline gap-1.5">
								<span className="text-white font-medium">{count}</span>
								<span className="text-gray-500 uppercase tracking-wide">
									{countLabel}
								</span>
							</div>
							<span className="text-gray-600 uppercase tracking-wider">
								{timeframe}
							</span>
						</div>
					</div>

					<div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
						{description}
					</div>
				</div>
			</div>
		</div>
	);
}

interface HeadlineMetricsProps {
	metrics?: UniversalMetrics;
	isLoading?: boolean;
}

export function HeadlineMetrics({ metrics, isLoading }: HeadlineMetricsProps) {
	// Format currency values
	const formatCurrency = (amount: number): string => {
		if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
		if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
		if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
		return `$${amount.toLocaleString()}`;
	};

	// Use dynamic metrics data or fallback to loading/default values
	const metricsData = [
		{
			title: "LIFETIME OBLIGATIONS",
			value: isLoading ? "--" : formatCurrency((metrics?.lifetime.awards || 0) * 1e6),
			accentColor: "#F97316",
			count: isLoading ? "--" : (metrics?.lifetime.awardsCount || 0).toString(),
			countLabel: "awards",
			timeframe: "all time",
			description: "Total historical obligations",
		},
		{
			title: "ACTIVE OBLIGATIONS",
			value: isLoading ? "--" : formatCurrency((metrics?.active.awards || 0) * 1e6),
			accentColor: "#FFB84D",
			count: isLoading ? "--" : (metrics?.active.awardsCount || 0).toString(),
			countLabel: "awards",
			timeframe: "performing",
			description: "Currently active obligations",
		},
		{
			title: "REVENUE (TTM)",
			value: isLoading ? "--" : formatCurrency((metrics?.ttm.revenue || 0) * 1e6),
			accentColor: "#42D4F4",
			count: "Est",
			countLabel: "TTM",
			timeframe: "12 Months",
			description: "STRAIGHT-LINE RECOGNITION (SLR)",
		},
		{
			title: "CALCULATED PIPELINE",
			value: isLoading ? "--" : formatCurrency((metrics?.lifetime.calculatedPipeline || 0) * 1e6),
			accentColor: "#8B8EFF",
			count: "Est",
			countLabel: "Remaining",
			timeframe: "FORECAST",
			description: "LIFETIME MINUS RECOGNIZED",
		},
	];

	return (
		<div className="mt-6 grid grid-cols-4 gap-6">
			{metricsData.map((metric, index) => (
				<MetricCard key={index} {...metric} />
			))}
		</div>
	);
}
