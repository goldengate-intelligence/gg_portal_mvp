import React from "react";
import {
	getContractorMetrics,
	getContractorMetricsByName,
	getDefaultMetrics,
} from "./services/contractor-metrics-adapter";

// Asset types
interface Asset {
	id: string;
	companyName: string;
	naicsDescription: string;
	marketType: "civilian" | "defense";
	uei: string;
	activeAwards: {
		value: string;
	};
}

interface GroupAsset {
	id: string;
	type: "group";
	companyName: string;
	groupName: string;
	naicsDescription: string;
	marketType: "civilian" | "defense";
	uei: string;
	activeAwards: {
		value: string;
	};
	memberAssets: Asset[];
	entityCount: number;
	aggregatedMetrics: {
		lifetime: string;
		revenue: string;
		pipeline: string;
	};
}

interface PortfolioMetricsProps {
	assets: (Asset | GroupAsset)[];
}

export function PortfolioMetrics({ assets }: PortfolioMetricsProps) {
	// Utility functions for financial calculations
	const parseFinancialValue = (value: string): number => {
		const numStr = value.replace(/[$,]/g, "");
		const multiplier = numStr.includes("B")
			? 1000000000
			: numStr.includes("M")
				? 1000000
				: numStr.includes("K")
					? 1000
					: 1;
		return Number.parseFloat(numStr.replace(/[BMK]/g, "")) * multiplier;
	};

	const formatFinancialValue = (value: number): string => {
		if (value >= 1000000000) {
			return `$${(value / 1000000000).toFixed(1)}B`;
		}
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(1)}K`;
		}
		return `$${value.toFixed(0)}`;
	};

	// Get individual asset metrics using contractor metrics service
	const getMemberMetrics = (asset: Asset) => {
		// First try to get metrics by UEI
		let contractorMetrics = getContractorMetrics(asset.uei);

		// If not found by UEI, try by company name
		if (!contractorMetrics) {
			contractorMetrics = getContractorMetricsByName(asset.companyName);
		}

		// If still not found, use default metrics
		if (!contractorMetrics) {
			contractorMetrics = getDefaultMetrics(asset.uei, asset.companyName);
		}

		return {
			revenue: contractorMetrics.revenue,
			lifetime: contractorMetrics.lifetimeAwards,
			pipeline: contractorMetrics.pipeline,
		};
	};

	// Calculate portfolio totals
	const calculatePortfolioTotals = () => {
		let totalActiveAwards = 0;
		let totalLifetime = 0;
		let totalRevenue = 0;
		let totalPipeline = 0;
		let totalContracts = 0;

		assets.forEach((asset) => {
			// Add active awards value
			totalActiveAwards += parseFinancialValue(asset.activeAwards.value);

			if ("type" in asset && asset.type === "group") {
				// For groups, use aggregated metrics
				totalLifetime += parseFinancialValue(asset.aggregatedMetrics.lifetime);
				totalRevenue += parseFinancialValue(asset.aggregatedMetrics.revenue);
				totalPipeline += parseFinancialValue(asset.aggregatedMetrics.pipeline);
				totalContracts += asset.memberAssets.length; // Count member assets
			} else {
				// For individual assets, get their individual metrics
				const metrics = getMemberMetrics(asset);
				totalLifetime += parseFinancialValue(metrics.lifetime);
				totalRevenue += parseFinancialValue(metrics.revenue);
				totalPipeline += parseFinancialValue(metrics.pipeline);
				totalContracts += 1; // Count as one contract
			}
		});

		return {
			activeAwards: formatFinancialValue(totalActiveAwards),
			lifetime: formatFinancialValue(totalLifetime),
			revenue: formatFinancialValue(totalRevenue),
			pipeline: formatFinancialValue(totalPipeline),
			contracts: totalContracts,
		};
	};

	const totals = calculatePortfolioTotals();

	const metrics = [
		{
			title: "PORTFOLIO LIFETIME AWARDS",
			value: totals.lifetime,
			accentColor: "#F97316",
			count: totals.contracts.toString(),
			countLabel: "entities",
			timeframe: "all time",
			description: "Total historical value",
		},
		{
			title: "PORTFOLIO ACTIVE AWARDS",
			value: totals.activeAwards,
			accentColor: "#FFB84D",
			count: totals.contracts.toString(),
			countLabel: "entities",
			timeframe: "performing",
			description: "Currently active",
		},
		{
			title: "PORTFOLIO ESTIMATED REVENUE (TTM)",
			value: totals.revenue,
			accentColor: "#42D4F4",
			count: "Est",
			countLabel: "recognized",
			timeframe: "12 months",
			description: "STRAIGHT-LINE RECOGNITION (SLR)",
		},
		{
			title: "PORTFOLIO ESTIMATED PIPELINE",
			value: totals.pipeline,
			accentColor: "#8B8EFF",
			count: "Est",
			countLabel: "potential",
			timeframe: "forecast",
			description: "LIFETIME AWDS MINUS SLR",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{metrics.map((metric, index) => (
				<div
					key={metric.title}
					className="rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/40 transition-all group relative overflow-hidden"
				>
					{/* Gradient background for each card */}
					<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-lg" />

					{/* Subtle color accent bar - full height */}
					<div
						className="absolute left-0 top-0 bottom-0 w-[2px]"
						style={{ backgroundColor: metric.accentColor }}
					/>

					{/* Content layer */}
					<div className="relative z-10">
						<div className="pl-2">
							<div
								className="text-gray-500 font-normal uppercase tracking-wide mb-3"
								style={{ fontFamily: "Genos, sans-serif", fontSize: "12px" }}
							>
								{metric.title}
							</div>

							<div className="space-y-2">
								<div className="flex items-baseline gap-1">
									<span
										className="font-medium"
										style={{
											color: metric.accentColor,
											fontSize: "30px",
											lineHeight: "1",
										}}
									>
										{metric.value}
									</span>
								</div>

								<div className="flex items-center justify-between text-[11px]">
									<div className="flex items-baseline gap-1.5">
										<span className="text-white/70 font-medium">
											{metric.count}
										</span>
										<span className="text-gray-500 uppercase tracking-wide">
											{metric.countLabel}
										</span>
									</div>
									<span className="text-gray-600 uppercase tracking-wider">
										{metric.timeframe}
									</span>
								</div>
							</div>

							<div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
								{metric.description}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
