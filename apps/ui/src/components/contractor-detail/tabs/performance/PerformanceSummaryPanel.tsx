import React from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";
import { useNAICSDescription } from "../../../../services/reference-data/useReferenceData";
import { getPerformanceTier } from "../../utils/performance-tier";

interface PerformanceSummaryPanelProps {
	performanceData: any;
	unifiedMetrics?: any; // Add unified metrics from Snowflake
	peerData?: any; // Add peer comparison data
	contractor?: any; // Contractor basic info
	isLoading?: boolean;
}

export function PerformanceSummaryPanel({
	performanceData,
	unifiedMetrics,
	peerData,
	contractor,
	isLoading,
}: PerformanceSummaryPanelProps) {
	// Format currency values
	const formatCurrency = (amount: number): string => {
		if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
		if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
		if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
		return `$${amount.toLocaleString()}`;
	};

	// Format percentage
	const formatPercentage = (value: number): string => {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(0)}%`;
	};
	// Get color based on quartile performance score
	const getPerformanceColor = (score: number) => {
		if (score >= 75) return "#15803d"; // Deep green
		if (score >= 50) return "#84cc16"; // Chartreuse
		if (score >= 25) return "#eab308"; // Yellow
		return "#ef4444"; // Red
	};

	// Extract data from real Snowflake sources
	const naicsCode = peerData?.peerGroup?.naicsCode || "332312";
	const groupSize = peerData?.peerGroup?.groupSize || 247;
	const entityClassification = unifiedMetrics?.entityClassification || "Pure Prime";
	const compositeScore = peerData?.scores?.composite || 80;

	// Calculate strongest and weakest attributes dynamically
	const allScores = peerData?.scores ? [
		{ name: "Awards Captured", score: peerData.scores.awards },
		{ name: "Revenue Recognition", score: peerData.scores.revenue },
		{ name: "Pipeline Development", score: peerData.scores.pipeline },
		{ name: "Portfolio Duration", score: peerData.scores.duration },
		{ name: "Network Activity", score: peerData.scores.networkActivity },
		{ name: "Blended Growth", score: peerData.scores.growth }
	] : [];

	const strongest = allScores.length > 0
		? allScores.reduce((max, current) => current.score > max.score ? current : max)
		: { name: "Business Development", score: 91 };

	const weakest = allScores.length > 0
		? allScores.reduce((min, current) => current.score < min.score ? current : min)
		: { name: "Contract Retention", score: 68 };

	// Individual scores from real data
	const awardsScore = peerData?.scores?.awards || 82;
	const revenueScore = peerData?.scores?.revenue || 76;
	const pipelineScore = peerData?.scores?.pipeline || 91;
	const durationScore = peerData?.scores?.duration || 68;
	const growthScore = peerData?.scores?.growth || 85;

	// Real metrics from Snowflake (amounts in millions, converted for display)
	const awardsValue = formatCurrency((unifiedMetrics?.ttm?.awards || 12.4) * 1e6);
	const revenueValue = formatCurrency((unifiedMetrics?.ttm?.revenue || 8.7) * 1e6);
	const pipelineValue = formatCurrency((unifiedMetrics?.lifetime?.calculatedPipeline || 45.2) * 1e6);
	const durationYears = (unifiedMetrics?.portfolio?.avgContractDuration || 38.4) / 12; // months to years
	const growthRate = formatPercentage(unifiedMetrics?.growth?.revenueYoY || 24);

	// Get NAICS description with CSV + Haiku AI fallback
	const { description: naicsDescription, isLoading: naicsLoading } = useNAICSDescription(naicsCode);

	// Calculate performance tier using shared logic
	const performanceTier = getPerformanceTier(compositeScore);

	return (
		<Card
			className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
			style={{ backgroundColor: "#111726" }}
		>
			<div className="p-4 h-full flex flex-col relative z-10">
				<h3
					className="font-bold tracking-wide mb-3 text-gray-200 uppercase"
					style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
				>
					Performance Summary
				</h3>
				<div className="flex-1">
					{/* Two Container Layout */}
					<div className="grid grid-cols-2 gap-8 mb-4 relative">
						{/* Vertical Divider */}
						<div className="absolute left-1/2 top-0 -bottom-4 w-px bg-gray-700/30 transform -translate-x-1/2 z-10" />

						{/* Left Container - Performance Scores */}
						<div
							className="rounded-xl backdrop-blur-sm p-4 relative"
							style={{
								backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
							}}
						>
							<div className="flex items-center justify-between mb-2">
								<h4 className="font-sans text-xs uppercase tracking-wider text-white">
									PERFORMANCE SCORES
								</h4>
								<div className="flex items-center gap-2">
									<span
										className="w-1.5 h-1.5 rounded-full animate-pulse"
										style={{
											backgroundColor: "#22c55e",
											boxShadow: "0 0 10px rgba(34,197,94,0.5)",
										}}
									/>
									<span
										className="text-[10px] tracking-wider font-light"
										style={{
											fontFamily: "Genos, sans-serif",
											color: "#22c55e",
										}}
									>
										TRACKING
									</span>
								</div>
							</div>
							<div className="flex items-start gap-6 h-64">
								{/* Composite Score - Larger radial */}
								<div className="relative flex flex-col items-center">
									<div className="relative w-40 h-40">
										<svg className="w-40 h-40 transform -rotate-90">
											<circle
												cx="80"
												cy="80"
												r="72"
												stroke="#374151"
												strokeWidth="8"
												fill="none"
											/>
											<circle
												cx="80"
												cy="80"
												r="72"
												stroke={getPerformanceColor(compositeScore)}
												strokeWidth="8"
												fill="none"
												strokeDasharray={`${2 * Math.PI * 72 * (compositeScore / 100)} ${2 * Math.PI * 72}`}
												strokeLinecap="round"
											/>
											<circle
												cx="80"
												cy="80"
												r="64"
												fill="#030508"
												stroke="#D2AC38"
												strokeWidth="1"
											/>
										</svg>
										<div className="absolute inset-0 flex flex-col items-center justify-center">
											<div
												className="text-5xl font-light text-white"
											>
												{compositeScore}
											</div>
											<div
												className="text-xs uppercase tracking-wider -mb-1"
												style={{
													fontFamily: "Genos, sans-serif",
													color: "#D2AC38",
												}}
											>
												COMPOSITE
											</div>
											<div
												className="text-xs uppercase tracking-wider"
												style={{
													fontFamily: "Genos, sans-serif",
													color: "#D2AC38",
												}}
											>
												SCORE
											</div>
										</div>
									</div>
									{/* Subtitle below radial */}
									<div className="mt-3 pt-3 border-t border-gray-700 text-center">
										<p className="text-xs text-white font-sans leading-tight">
											<span style={{ color: "#D2AC38" }}>{compositeScore}th</span> percentile
											among <span style={{ color: "#D2AC38" }}>{groupSize}</span> peers
											in {entityClassification}
											<br />
											with primary NAICS of{" "}
											<span style={{ color: "#D2AC38" }}>{naicsCode}</span>
										</p>
									</div>
								</div>
								{/* Subscores - Compact containers */}
								<div className="flex-1 space-y-2 max-w-sm">
									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												AWARDS CAPTURED (TTM)
											</span>
											<div className="flex items-center">
												<span className="text-xs text-white w-12 text-right">
													{awardsValue}
												</span>
												<span className="text-xs text-white mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: getPerformanceColor(awardsScore) }}
												>
													{awardsScore}
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full"
												style={{
													width: `${awardsScore}%`,
													backgroundColor: getPerformanceColor(awardsScore)
												}}
											/>
										</div>
									</div>

									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												REVENUE (TTM)
											</span>
											<div className="flex items-center">
												<span className="text-xs text-white w-12 text-right">
													{revenueValue}
												</span>
												<span className="text-xs text-white mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: getPerformanceColor(revenueScore) }}
												>
													{revenueScore}
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full"
												style={{
													width: `${revenueScore}%`,
													backgroundColor: getPerformanceColor(revenueScore)
												}}
											/>
										</div>
									</div>

									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												CALCULATED PIPELINE
											</span>
											<div className="flex items-center">
												<span className="text-xs text-white w-12 text-right">
													{pipelineValue}
												</span>
												<span className="text-xs text-white mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: getPerformanceColor(pipelineScore) }}
												>
													{pipelineScore}
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full"
												style={{
													width: `${pipelineScore}%`,
													backgroundColor: getPerformanceColor(pipelineScore)
												}}
											/>
										</div>
									</div>

									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												PORTFOLIO DURATION
											</span>
											<div className="flex items-center">
												<span className="text-xs text-white w-12 text-right">
													{durationYears.toFixed(1)} yrs
												</span>
												<span className="text-xs text-white mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: getPerformanceColor(durationScore) }}
												>
													{durationScore}
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full"
												style={{
													width: `${durationScore}%`,
													backgroundColor: getPerformanceColor(durationScore)
												}}
											/>
										</div>
									</div>

									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												BLENDED GROWTH
											</span>
											<div className="flex items-center">
												<span className="text-xs text-white w-12 text-right">
													{growthRate}
												</span>
												<span className="text-xs text-white mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: getPerformanceColor(growthScore) }}
												>
													{growthScore}
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full"
												style={{
													width: `${growthScore}%`,
													backgroundColor: getPerformanceColor(growthScore)
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Container - Peer Group Details */}
						<div
							className="rounded-xl backdrop-blur-sm p-4 relative"
							style={{
								backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
							}}
						>
							<div className="flex items-center justify-between mb-2">
								<h4 className="font-sans text-xs uppercase tracking-wider text-white">
									PEER GROUP DETAILS
								</h4>
								<div className="flex items-center gap-2">
									<span
										className="w-1.5 h-1.5 rounded-full animate-pulse"
										style={{
											backgroundColor: "#22c55e",
											boxShadow: "0 0 10px rgba(34,197,94,0.5)",
										}}
									/>
									<span
										className="text-[10px] tracking-wider font-light"
										style={{
											fontFamily: "Genos, sans-serif",
											color: "#22c55e",
										}}
									>
										TRACKING
									</span>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 h-64">
								<div className="bg-black/40 rounded-lg p-4 flex flex-col">
									<div
										className="text-xs uppercase tracking-wider text-center"
										style={{
											fontFamily: "Genos, sans-serif",
											color: "#D2AC38",
										}}
									>
										PERFORMANCE
									</div>
									<div className="flex-1 flex items-center justify-center">
										<div
											className="text-2xl font-light"
											style={{ color: performanceTier.color }}
										>
											{performanceTier.label}
										</div>
									</div>
									<div
										className="text-gray-400 text-center font-sans"
										style={{ fontSize: "10px" }}
									>
										Tier
									</div>
								</div>
								<div className="bg-black/40 rounded-lg p-4 flex flex-col">
									<div
										className="text-xs uppercase tracking-wider text-center"
										style={{
											fontFamily: "Genos, sans-serif",
											color: "#D2AC38",
										}}
									>
										NAICS CODE
									</div>
									<div className="flex-1 flex items-center justify-center">
										<div className="text-2xl font-light text-white">{naicsCode}</div>
									</div>
									<div
										className="text-gray-400 text-center font-sans"
										style={{ fontSize: "10px" }}
									>
										{naicsLoading ? "Loading..." : (naicsDescription || "Industry Classification")}
									</div>
								</div>
								<div className="bg-black/40 rounded-lg p-4 flex flex-col">
									<div
										className="text-xs uppercase tracking-wider text-center"
										style={{
											fontFamily: "Genos, sans-serif",
											color: "#D2AC38",
										}}
									>
										SIZE QUARTILE
									</div>
									<div className="flex-1 flex items-center justify-center">
										<div className="text-2xl font-light text-white">{entityClassification}</div>
									</div>
									<div
										className="text-gray-400 text-center font-sans"
										style={{ fontSize: "10px" }}
									>
										Lifetime Awards
									</div>
								</div>
								<div className="bg-black/40 rounded-lg p-4 flex flex-col">
									<div
										className="text-xs uppercase tracking-wider text-center"
										style={{
											fontFamily: "Genos, sans-serif",
											color: "#D2AC38",
										}}
									>
										GROUP SIZE
									</div>
									<div className="flex-1 flex items-center justify-center">
										<div className="text-2xl font-light text-white text-center">
											{groupSize}
										</div>
									</div>
									<div
										className="text-gray-400 text-center font-sans"
										style={{ fontSize: "10px" }}
									>
										Peer Count
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Performance Analysis Section - Split into Two Containers */}
					<div className="pt-4 border-t border-gray-700/50">
						<div className="grid grid-cols-2 gap-8 relative">
							{/* Vertical Divider */}
							<div className="absolute left-1/2 -top-4 bottom-0 w-px bg-gray-700/30 transform -translate-x-1/2 z-10" />

							{/* Strongest Attribute Container */}
							<div
								className="rounded-xl backdrop-blur-sm p-4"
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
								}}
							>
								{/* Header */}
								<div className="flex items-center justify-between mb-3">
									<h4 className="font-sans text-xs uppercase tracking-wider text-white">
										STRONGEST ATTRIBUTE
									</h4>
									<div className="flex items-center gap-2">
										<span
											className="w-1.5 h-1.5 rounded-full animate-pulse"
											style={{
												backgroundColor: "#22c55e",
												boxShadow: "0 0 10px rgba(34,197,94,0.5)",
											}}
										/>
										<span
											className="text-[10px] tracking-wider font-light"
											style={{
												fontFamily: "Genos, sans-serif",
												color: "#22c55e",
											}}
										>
											TRACKING
										</span>
									</div>
								</div>

								{/* Strength Metric - Centered */}
								<div className="flex flex-col items-center gap-2">
									<div className="relative">
										<div
											className="w-20 h-20 rounded-full border-4 bg-black/40 flex items-center justify-center"
											style={{ borderColor: getPerformanceColor(strongest?.score || 91) }}
										>
											<div
												className="text-2xl font-medium text-white"
											>
												{strongest?.score || 91}
											</div>
										</div>
										<div
											className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-gray-900"
											style={{ backgroundColor: getPerformanceColor(strongest?.score || 91) }}
										>
											<svg
												className="w-4 h-4 text-white"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M5 16L4 6L8 10L10 5L12 10L14 5L16 10L20 6L19 16H5Z" />
											</svg>
										</div>
									</div>
									<div className="text-center">
										<div className="text-white text-lg font-medium">
											{strongest.name}
										</div>
										<div
											className="text-sm uppercase tracking-wide"
											style={{ color: getPerformanceColor(strongest.score) }}
										>
											{strongest.score >= 90 ? "Elite Performance" :
											 strongest.score >= 75 ? "Strong Performance" :
											 strongest.score >= 50 ? "Above Average" : "Needs Improvement"}
										</div>
									</div>
								</div>

								{/* Insight Text */}
								<div
									className="mt-3 p-2 rounded-lg bg-gradient-to-r to-transparent border-l-2"
									style={{
										backgroundColor: `${getPerformanceColor(strongest.score)}10`,
										borderLeftColor: getPerformanceColor(strongest.score)
									}}
								>
									<div className="text-white text-sm">
										Exceptional pipeline value places contractor in elite tier
										for business development capabilities
									</div>
								</div>
							</div>

							{/* Weakest Attribute Container */}
							<div
								className="rounded-xl backdrop-blur-sm p-4"
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
								}}
							>
								{/* Header */}
								<div className="flex items-center justify-between mb-3">
									<h4 className="font-sans text-xs uppercase tracking-wider text-white">
										WEAKEST ATTRIBUTE
									</h4>
									<div className="flex items-center gap-2">
										<span
											className="w-1.5 h-1.5 rounded-full animate-pulse"
											style={{
												backgroundColor: "#22c55e",
												boxShadow: "0 0 10px rgba(34,197,94,0.5)",
											}}
										/>
										<span
											className="text-[10px] tracking-wider font-light"
											style={{
												fontFamily: "Genos, sans-serif",
												color: "#22c55e",
											}}
										>
											TRACKING
										</span>
									</div>
								</div>

								{/* Opportunity Metric - Centered */}
								<div className="flex flex-col items-center gap-2">
									<div className="relative">
										<div
											className="w-20 h-20 rounded-full border-4 bg-black/40 flex items-center justify-center"
											style={{ borderColor: getPerformanceColor(weakest?.score || 68) }}
										>
											<div
												className="text-2xl font-medium text-white"
											>
												{weakest?.score || 68}
											</div>
										</div>
										<div
											className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-gray-900"
											style={{ backgroundColor: getPerformanceColor(weakest?.score || 68) }}
										>
											<svg
												className="w-4 h-4 text-black"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
									</div>
									<div className="text-center">
										<div className="text-white text-lg font-medium">
											{weakest.name}
										</div>
										<div
											className="text-sm uppercase tracking-wide"
											style={{ color: getPerformanceColor(weakest.score) }}
										>
											{weakest.score < 25 ? "Critical Area" :
											 weakest.score < 50 ? "Growth Opportunity" :
											 weakest.score < 75 ? "Improvement Needed" : "Minor Weakness"}
										</div>
									</div>
								</div>

								{/* Insight Text */}
								<div
									className="mt-3 p-2 rounded-lg bg-gradient-to-r to-transparent border-l-2"
									style={{
										backgroundColor: `${getPerformanceColor(weakest.score)}10`,
										borderLeftColor: getPerformanceColor(weakest.score)
									}}
								>
									<div className="text-white text-sm">
										Portfolio duration suggests opportunities to extend contract
										lifecycles and improve retention
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
