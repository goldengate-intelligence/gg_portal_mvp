import React from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";

interface PerformanceSummaryPanelProps {
	performanceData: any;
}

export function PerformanceSummaryPanel({
	performanceData,
}: PerformanceSummaryPanelProps) {
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
								<h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
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
												stroke="#84cc16"
												strokeWidth="8"
												fill="none"
												strokeDasharray={`${2 * Math.PI * 72 * 0.8} ${2 * Math.PI * 72}`}
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
												className="text-5xl font-light"
												style={{ color: "#84cc16" }}
											>
												80
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
										<p className="text-xs text-gray-500 font-sans leading-tight">
											<span style={{ color: "#D2AC38" }}>80th</span> percentile
											among <span style={{ color: "#D2AC38" }}>247</span> peers
											in Q4
											<br />
											with primary NAICS of{" "}
											<span style={{ color: "#D2AC38" }}>332312</span>
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
												<span className="text-xs text-gray-500 w-12 text-right">
													$12.4M
												</span>
												<span className="text-xs text-gray-500 mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: "#84cc16" }}
												>
													82
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full bg-[#84cc16]"
												style={{ width: "82%" }}
											/>
										</div>
									</div>

									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												ESTIMATED REVENUE (TTM)
											</span>
											<div className="flex items-center">
												<span className="text-xs text-gray-500 w-12 text-right">
													$8.7M
												</span>
												<span className="text-xs text-gray-500 mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: "#84cc16" }}
												>
													76
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full bg-[#84cc16]"
												style={{ width: "76%" }}
											/>
										</div>
									</div>

									<div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
										<div className="flex items-center justify-between mb-1">
											<span
												className="text-xs text-gray-400 uppercase tracking-wider"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												ESTIMATED TOTAL PIPELINE
											</span>
											<div className="flex items-center">
												<span className="text-xs text-gray-500 w-12 text-right">
													$45.2M
												</span>
												<span className="text-xs text-gray-500 mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: "#15803d" }}
												>
													91
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full bg-[#15803d]"
												style={{ width: "91%" }}
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
												<span className="text-xs text-gray-500 w-12 text-right">
													3.2 yrs
												</span>
												<span className="text-xs text-gray-500 mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: "#eab308" }}
												>
													68
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full bg-[#eab308]"
												style={{ width: "68%" }}
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
												<span className="text-xs text-gray-500 w-12 text-right">
													+24%
												</span>
												<span className="text-xs text-gray-500 mx-2">|</span>
												<span
													className="text-sm font-light w-6 text-right"
													style={{ color: "#84cc16" }}
												>
													85
												</span>
											</div>
										</div>
										<div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
											<div
												className="h-full bg-[#84cc16]"
												style={{ width: "85%" }}
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
								<h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
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
										<div className="text-2xl font-light text-[#84cc16]">
											Strong
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
										<div className="text-2xl font-light text-white">332312</div>
									</div>
									<div
										className="text-gray-400 text-center font-sans"
										style={{ fontSize: "10px" }}
									>
										Fabricated Structural Metal Manufacturing
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
										<div className="text-2xl font-light text-white">Q4</div>
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
											247
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
								<h4 className="font-sans text-xs uppercase tracking-wider text-gray-500 mb-3">
									STRONGEST ATTRIBUTE
								</h4>

								{/* Strength Metric - Centered */}
								<div className="flex flex-col items-center gap-2">
									<div className="relative">
										<div className="w-20 h-20 rounded-full border-4 border-gray-600/50 bg-gradient-to-br from-[#15803d]/30 to-[#15803d]/10 flex items-center justify-center">
											<div className="text-[#15803d] text-2xl font-medium">
												91
											</div>
										</div>
										<div className="absolute -top-1 -right-1 w-7 h-7 bg-[#15803d] rounded-full flex items-center justify-center border-2 border-gray-900">
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
											Business Development
										</div>
										<div className="text-[#15803d] text-sm uppercase tracking-wide">
											Elite Performance
										</div>
									</div>
								</div>

								{/* Insight Text */}
								<div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#15803d]/10 to-transparent border-l-2 border-[#15803d]">
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
								<h4 className="font-sans text-xs uppercase tracking-wider text-gray-500 mb-3">
									WEAKEST ATTRIBUTE
								</h4>

								{/* Opportunity Metric - Centered */}
								<div className="flex flex-col items-center gap-2">
									<div className="relative">
										<div className="w-20 h-20 rounded-full border-4 border-gray-600/50 bg-gradient-to-br from-[#eab308]/30 to-[#eab308]/10 flex items-center justify-center">
											<div className="text-[#eab308] text-2xl font-medium">
												68
											</div>
										</div>
										<div className="absolute -top-1 -right-1 w-7 h-7 bg-[#eab308] rounded-full flex items-center justify-center border-2 border-gray-900">
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
											Contract Retention
										</div>
										<div className="text-[#eab308] text-sm uppercase tracking-wide">
											Growth Opportunity
										</div>
									</div>
								</div>

								{/* Insight Text */}
								<div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#eab308]/10 to-transparent border-l-2 border-[#eab308]">
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
