import React from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics, PeerComparisonData } from "../../services/unified-data-adapter";
import { useExecutiveSummary, formatContractorDataForSummary } from "../../../../services/executive-summary";
import { IndustryImageMatchingService } from "../../../../services/industry-image-matching";

interface ExecutiveSummaryPanelProps {
	contractor: any; // Contractor basic info (name, uei, etc.)
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	peerData?: PeerComparisonData;
	isLoading?: boolean;
}

// Helper function to get the best matching industry image using sophisticated tag matching
function getBestIndustryImagePath(contractor: any, activityEvents: ActivityEvent[]): string {
	try {
		return IndustryImageMatchingService.getBestImageForContractor(contractor, activityEvents);
	} catch (error) {
		console.warn('Error in industry image matching, using fallback:', error);
		return "/gg_industry_images/16_other.jpg?v=3"; // fallback
	}
}

export function ExecutiveSummaryPanel({
	contractor,
	activityEvents,
	metrics,
	peerData,
	isLoading,
}: ExecutiveSummaryPanelProps) {
	// Format contractor data for AI summary generation
	const summaryData = formatContractorDataForSummary(contractor, activityEvents, metrics);

	// Use AI executive summary hook
	const { summary, isLoading: summaryLoading, error, isFromCache } = useExecutiveSummary(summaryData);

	// Determine if we should show loading state
	const showLoading = isLoading || summaryLoading;

	// Get the best matching industry image using comprehensive tag analysis
	const industryImagePath = React.useMemo(() => {
		return getBestIndustryImagePath(contractor, activityEvents);
	}, [contractor, activityEvents]);

	// Check if contractor is currently active based on performance periods
	const isContractorActive = () => {
		if (!activityEvents?.length) return false;

		const now = new Date();
		return activityEvents.some(event => {
			// Check both inflow and outflow events
			if (event.FLOW_DIRECTION === 'INFLOW' || event.FLOW_DIRECTION === 'OUTFLOW') {
				const startDate = new Date(event.start_date || event.AWARD_START_DATE);
				const endDate = new Date(event.end_date || event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);

				// Check if current date is within the performance period
				return startDate <= now && now <= endDate;
			}
			return false;
		});
	};

	const contractorActive = isContractorActive();
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
					EXECUTIVE SUMMARY
				</h3>
				<div className="flex-1">
					<div
						className="border border-gray-700 rounded-xl flex overflow-hidden h-full"
						style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
					>
						{/* Left side - Image with gradient */}
						<div className="relative overflow-hidden" style={{ width: "40%" }}>
							<div
								className="w-full h-full bg-cover bg-center bg-no-repeat"
								style={{
									backgroundImage: `url(${industryImagePath})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							/>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/70" />
						</div>

						{/* Right side - AI Generated Content */}
						<div className="flex-1 px-6 py-4 flex flex-col justify-center">
							{/* Active Contractor Status Button */}
							<div
								className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full w-fit"
								style={{
									backgroundColor: "#010204",
									border: "1px solid #4a4a4a",
								}}
							>
								<div className="relative flex items-center justify-center">
									<div className={`absolute w-2 h-2 rounded-full animate-ping opacity-75 ${contractorActive ? 'bg-green-400' : 'bg-red-400'}`} />
									<div className={`relative w-2 h-2 rounded-full ${contractorActive ? 'bg-green-400' : 'bg-red-400'}`} />
								</div>
								<span
									className="text-xs text-gray-300 uppercase tracking-widest font-light"
									style={{ fontFamily: "Genos, sans-serif" }}
								>
									{contractorActive ? 'Active Contractor' : 'Inactive Contractor'} {showLoading && '• Loading...'}
								</span>
							</div>

							{showLoading ? (
								/* Loading State */
								<div className="flex flex-col space-y-3 animate-pulse">
									<div className="h-5 bg-gray-700 rounded w-3/4"></div>
									<div className="h-4 bg-gray-700 rounded w-full"></div>
									<div className="space-y-1">
										<div className="h-3 bg-gray-700 rounded w-5/6"></div>
										<div className="h-3 bg-gray-700 rounded w-4/5"></div>
										<div className="h-3 bg-gray-700 rounded w-3/4"></div>
									</div>
								</div>
							) : error ? (
								/* Error State */
								<div className="text-red-400 text-sm">
									Unable to generate executive summary
								</div>
							) : summary ? (
								/* AI Generated Content */
								<>
									{/* Section 1: Headline (≤40 chars) */}
									<h4
										className="mb-3"
										style={{
											fontFamily: "Genos, sans-serif",
											fontSize: "18px",
											color: "#d2ac38",
											lineHeight: "1.2",
										}}
									>
										{summary.headline}
									</h4>

									{/* Section 2: Principal Activity (≤90 chars) */}
									<p className="text-gray-300 text-sm font-light leading-tight mb-3">
										{summary.principalActivity}
									</p>

									{/* Section 3: Three bullet points (≤55 chars each) */}
									<ul className="space-y-0.5" style={{ fontSize: "11px" }}>
										{summary.bulletPoints.map((bullet, index) => (
											<li key={index} className="flex items-start">
												<span style={{ color: "#D2AC38" }} className="mr-2">
													•
												</span>
												<span className="text-gray-300 leading-tight">
													{bullet}
												</span>
											</li>
										))}
									</ul>
								</>
							) : (
								/* Fallback Content */
								<>
									<h4
										className="mb-3"
										style={{
											fontFamily: "Genos, sans-serif",
											fontSize: "18px",
											color: "#d2ac38",
											lineHeight: "1.2",
										}}
									>
										Government Contractor
									</h4>
									<p className="text-gray-300 text-sm font-light leading-tight mb-3">
										Providing specialized services and solutions to government agencies.
									</p>
									<ul className="space-y-0.5" style={{ fontSize: "11px" }}>
										<li className="flex items-start">
											<span style={{ color: "#D2AC38" }} className="mr-2">•</span>
											<span className="text-gray-300 leading-tight">
												Professional services and solutions
											</span>
										</li>
										<li className="flex items-start">
											<span style={{ color: "#D2AC38" }} className="mr-2">•</span>
											<span className="text-gray-300 leading-tight">
												Government contracting expertise
											</span>
										</li>
										<li className="flex items-start">
											<span style={{ color: "#D2AC38" }} className="mr-2">•</span>
											<span className="text-gray-300 leading-tight">
												Specialized industry solutions
											</span>
										</li>
									</ul>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="mt-3 pt-3 border-t border-gray-700">
					<p
						className="text-gray-500 uppercase tracking-wider"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "12px" }}
					>
						ANALYSIS AS OF{" "}
						{new Date()
							.toLocaleString("en-US", {
								month: "numeric",
								day: "numeric",
								year: "numeric",
								hour: "numeric",
								minute: "2-digit",
								hour12: true,
							})
							.toUpperCase()}
					</p>
				</div>
			</div>
		</Card>
	);
}
