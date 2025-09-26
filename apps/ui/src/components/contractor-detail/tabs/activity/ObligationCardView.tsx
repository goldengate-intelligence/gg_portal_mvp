import {
	ArrowLeft,
	Building2,
	Calendar,
	DollarSign,
	Folder,
	MapPin,
	Paperclip,
	Pin,
	Search,
} from "lucide-react";
import React from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";
import { NAICSPSCDisplay } from "../../../shared/NAICSPSCDisplay";
import { formatMoney } from "../../../../shared";

interface Event {
	event_id: string;
	event_type: "PRIME" | "SUBAWARD";
	event_date: string;
	recipient_name: string;
	recipient_uei: string;
	event_amount: number;
	prime_contractor_name: string | null;
	awarding_agency_name: string;
	awarding_sub_agency_name: string;
	naics_code: string;
	naics_description: string;
	recipient_state: string;
	pop_state: string;
	contract_total_value: number;
	award_piid: string;
	action_type: string;
	fiscal_year: number;
	extent_competed: string;
	contract_pricing_type: string;
	small_business_flags: string[];
	parent_company_name: string | null;
	start_date: string;
	end_date: string;
	utilization: number;
	psc_code?: string;
	ai_description?: string;
}

interface ObligationCardViewProps {
	contractId: string;
	contractTitle: string;
	onBack: () => void;
	originContainer?: "inflow" | "outflow";
	activityEvents?: any[]; // Add activity events for real data
}


export function ObligationCardView({
	contractId,
	contractTitle,
	onBack,
	originContainer = "inflow",
	activityEvents = [],
}: ObligationCardViewProps) {
	const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
	const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
		new Set(),
	);

	// Terminology based on origin container type - different data for inflow vs outflow
	const terminology = {
		container: "Unique Obligation Count",
		title: originContainer === "outflow" ? "Obligation Outflows" : "Obligation Inflows",
		items: originContainer === "outflow" ? "Obligation Outflows" : "Obligation Inflows",
	};

	// Filter activity events for this specific contract and flow direction
	const filteredEvents = activityEvents.filter((event: any) =>
		event.AWARD_KEY === contractId &&
		event.FLOW_DIRECTION?.toLowerCase() === originContainer
	);

	// Transform activity events into Event format for display
	const obligations: Event[] = filteredEvents.length > 0
		? filteredEvents.map((event: any, index: number) => ({
			event_id: event.EVENT_ID || `${contractId}-${index}`,
			event_type: event.EVENT_TYPE || "PRIME",
			event_date: event.EVENT_DATE || new Date().toISOString().split('T')[0],
			recipient_name: event.RELATED_ENTITY_NAME || "Unknown Entity",
			recipient_uei: event.RELATED_ENTITY_UEI || `UEI_${index.toString().padStart(9, '0')}`,
			event_amount: event.EVENT_AMOUNT || 0,
			prime_contractor_name: event.EVENT_TYPE === 'SUBAWARD' ? event.CONTRACTOR_NAME : null,
			awarding_agency_name: event.RELATED_ENTITY_TYPE === 'GOVERNMENT' ? event.RELATED_ENTITY_NAME : "Unknown Agency",
			awarding_sub_agency_name: "Sub-agency",
			naics_code: event.NAICS_CODE || "000000",
			naics_description: event.NAICS_DESCRIPTION || "Professional Services",
			recipient_state: event.CONTRACTOR_STATE || "Unknown",
			pop_state: event.PERFORMANCE_STATE || "Unknown",
			contract_total_value: event.AWARD_TOTAL_VALUE || 0,
			award_piid: event.AWARD_KEY || contractId,
			action_type: "EVENT", // Could be enhanced to detect NEW/MOD patterns
			fiscal_year: event.FISCAL_YEAR || new Date().getFullYear(),
			extent_competed: "UNKNOWN", // Not available in ActivityEvent
			contract_pricing_type: event.AWARD_TYPE || "UNKNOWN",
			small_business_flags: [], // Not available in ActivityEvent
			parent_company_name: null, // Not available in ActivityEvent
			start_date: event.AWARD_START_DATE || "",
			end_date: event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE || "",
			utilization: 50, // Placeholder - would need calculation
			psc_code: event.PSC_CODE || "",
			ai_description: event.NAICS_DESCRIPTION || `${originContainer} event for ${event.RELATED_ENTITY_NAME || 'contract services'}`
		}))
		: [
			// Fallback message when no data available
			{
				event_id: `${contractId}-no-data`,
				event_type: "PRIME" as const,
				event_date: new Date().toISOString().split('T')[0],
				recipient_name: "No obligation data available",
				recipient_uei: "N/A",
				event_amount: 0,
				prime_contractor_name: null,
				awarding_agency_name: "N/A",
				awarding_sub_agency_name: "",
				naics_code: "000000",
				naics_description: `No ${originContainer} obligation events found for this contract`,
				recipient_state: "N/A",
				pop_state: "N/A",
				contract_total_value: 0,
				award_piid: contractId,
				action_type: "N/A",
				fiscal_year: new Date().getFullYear(),
				extent_competed: "N/A",
				contract_pricing_type: "N/A",
				small_business_flags: [],
				parent_company_name: null,
				start_date: "",
				end_date: "",
				utilization: 0,
				psc_code: "",
				ai_description: `No detailed obligation events are available for this ${originContainer} contract. This may indicate the contract is in early stages or the data is still being processed.`
			}
		];

	// Using shared formatMoney utility with millions formatting
	const formatMoneyMillions = (value: number): string => {
		return formatMoney(value, { forceUnit: 'M' });
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getEventTypeColor = (type: string) => {
		return type === "PRIME" ? "#5BC0EB" : "#FF4C4C";
	};

	const getUtilizationColor = (utilization: number) => {
		if (utilization < 25) return "#15803d"; // Forest green (0-<25%)
		if (utilization < 50) return "#84cc16"; // Chartreuse (25-<50%)
		if (utilization < 75) return "#eab308"; // Yellow (50-<75%)
		return "#dc2626"; // Red (75-100%)
	};

	const toggleItemExpansion = (itemId: string) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(itemId)) {
			newExpanded.delete(itemId);
		} else {
			newExpanded.add(itemId);
		}
		setExpandedItems(newExpanded);
	};

	const getTemperatureStatus = (actionDate: string) => {
		const actionDateObj = new Date(actionDate);
		const currentDate = new Date("2025-09-19"); // Current date
		const daysDiff = Math.floor(
			(currentDate.getTime() - actionDateObj.getTime()) / (1000 * 60 * 60 * 24),
		);

		if (daysDiff <= 30)
			return { label: "HOT", color: "#dc2626", bgColor: "#dc262610" }; // Red
		if (daysDiff <= 365)
			return { label: "WARM", color: "#f87171", bgColor: "#f8717110" }; // Light red
		return { label: "COLD", color: "#3b82f6", bgColor: "#3b82f610" }; // Blue
	};

	return (
		<Card
			className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
			style={{ backgroundColor: "#111726" }}
		>
			<div className="p-4 relative z-10">
				{/* Back Button and Header */}
				<div className="flex items-center justify-between mb-4">
					<h3
						className="font-bold tracking-wide text-gray-200 uppercase"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
					>
						{terminology.title} • {contractId}
					</h3>
					<button
						onClick={onBack}
						className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-gray-300 hover:text-white"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="text-sm">Back to Awards</span>
					</button>
				</div>


				{/* Obligations Container */}
				<div
					className="flex-1 overflow-auto rounded-xl border border-gray-700"
					style={{ backgroundColor: "#223040" }}
				>
					<div className="p-4">
						<div className="mb-3">
							<h5
								className="text-sm font-semibold text-gray-400 uppercase tracking-wider"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								{terminology.container} • {obligations.length}
							</h5>
						</div>

						<div className="space-y-2">
							{obligations
								.sort((a, b) => {
									// Sort by most recent event_date first (newest to oldest)
									const dateA = new Date(a.event_date);
									const dateB = new Date(b.event_date);
									return dateB.getTime() - dateA.getTime();
								})
								.map((event, index) => {
									const eventKey = event.EVENT_ID;
									const isExpanded = expandedItems.has(eventKey);
									const tempStatus = getTemperatureStatus(event.event_date);

									return (
										<div
											key={index}
											className={
												"border rounded-xl cursor-pointer overflow-visible relative bg-black/40 transition-all duration-300 group"
											}
											style={{
												borderColor: `${tempStatus.color}50`, // Use temperature color
												boxShadow: `0 0 0 1px ${tempStatus.color}40`,
												transition: "all 0.3s ease",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.boxShadow = `0 0 0 1px ${tempStatus.color}80, 0 0 20px ${tempStatus.color}40, 0 0 40px ${tempStatus.color}20`;
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.boxShadow = `0 0 0 1px ${tempStatus.color}40`;
											}}
											onClick={() => toggleItemExpansion(eventKey)}
										>
											{/* Header Section */}
											<div
												className={`relative ${isExpanded ? "rounded-t-xl" : "rounded-xl"}`}
											>
												<div
													className={`absolute inset-0.5 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/50 transition-all duration-300 ${isExpanded ? "rounded-t-xl" : "rounded-xl"}`}
												/>
												<div className="relative z-10 p-4">
													{/* Obligation Info */}
													<div className="flex items-start justify-between">
														{/* Left side - Award PIID and details */}
														<div className="flex flex-col justify-start flex-1 min-w-0 mr-4">
															<div className="flex items-center gap-2 mb-0">
																<h3
																	className="text-[#D2AC38] leading-tight uppercase mb-0 transition-colors duration-300 cursor-default font-bold"
																	style={{
																		fontFamily:
																			"system-ui, -apple-system, sans-serif",
																		fontSize: "24px",
																	}}
																>
																	{event.EVENT_ID}
																</h3>
															</div>

															{/* Last Action */}
															<div className="uppercase tracking-wide">
																<div className="font-medium text-gray-300/80 text-sm tracking-wider">
																	LATEST ACTION:{" "}
																	{formatDate(event.event_date).toUpperCase()}
																</div>
																<NAICSPSCDisplay naicsCode={event.naics_code} pscCode={event.psc_code} />
															</div>
														</div>

														{/* Right side - Icon container and Temperature bubble */}
														<div className="flex flex-col items-end gap-3">
															{/* Icon Bubble Container - 4 ICONS (no calendar since this is final level) */}
															<div className="flex items-center px-3 py-1 bg-gray-600/20 border border-gray-600/40 rounded-full gap-2 transition-all duration-200 hover:bg-gray-600/30 hover:border-gray-600/60">
																{/* Expand/Collapse Indicator */}
																<div
																	className="relative"
																	onMouseEnter={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(`expand-${index}`);
																	}}
																	onMouseLeave={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(null);
																	}}
																>
																	<div
																		className={`p-0.5 rounded cursor-pointer hover:bg-[#D2AC38]/30 hover:scale-110 transition-all duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
																		onClick={(e) => {
																			e.stopPropagation();
																			e.preventDefault();
																			setActiveTooltip(null);
																			toggleItemExpansion(eventKey);
																		}}
																	>
																		<svg
																			className="w-4 h-4 text-[#D2AC38] hover:text-[#D2AC38]/80"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={2}
																				d="M19 9l-7 7-7-7"
																			/>
																		</svg>
																	</div>
																	{activeTooltip === `expand-${index}` && (
																		<div
																			className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap"
																			style={{
																				zIndex: 9999,
																				top: isExpanded
																					? "calc(100% + 8px)"
																					: "auto",
																				bottom: isExpanded
																					? "auto"
																					: "calc(100% + 8px)",
																				left: "50%",
																				transform: "translateX(-50%)",
																			}}
																		>
																			{isExpanded
																				? "Collapse details"
																				: "Expand details"}
																		</div>
																	)}
																</div>

																{/* Smart Research Icon */}
																<div
																	className="p-0.5 rounded cursor-pointer relative hover:bg-purple-500/30 hover:scale-110 transition-all duration-300"
																	onMouseEnter={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(
																			`smart-research-${index}`,
																		);
																	}}
																	onMouseLeave={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(null);
																	}}
																>
																	<svg
																		className="w-4 h-4 text-purple-400 hover:text-purple-300"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<circle
																			cx="11"
																			cy="11"
																			r="8"
																			strokeWidth={2}
																		/>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="m21 21-4.35-4.35M8 11h6m-3-3v6"
																		/>
																	</svg>
																	{activeTooltip ===
																		`smart-research-${index}` && (
																		<div
																			className="fixed px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap"
																			style={{
																				zIndex: 9999,
																				bottom: "calc(100% + 10px)",
																				left: "50%",
																				transform: "translateX(-50%)",
																			}}
																		>
																			AI engages context-driven research
																		</div>
																	)}
																</div>

																{/* Document Attachment Icon */}
																<div
																	className="p-0.5 rounded cursor-pointer relative hover:bg-cyan-500/30 hover:scale-110 transition-all duration-300"
																	onMouseEnter={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(`attach-${index}`);
																	}}
																	onMouseLeave={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(null);
																	}}
																>
																	<svg
																		className="w-4 h-4 text-cyan-400 hover:text-cyan-300"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
																		/>
																	</svg>
																	{activeTooltip === `attach-${index}` && (
																		<div
																			className="fixed px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap"
																			style={{
																				zIndex: 9999,
																				bottom: "calc(100% + 10px)",
																				left: "50%",
																				transform: "translateX(-50%)",
																			}}
																		>
																			Attach documents for your knowledge base
																		</div>
																	)}
																</div>

																{/* Document Manager/Folder */}
																<div
																	className="p-0.5 rounded cursor-pointer relative hover:bg-teal-500/30 hover:scale-110 transition-all duration-300"
																	onMouseEnter={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(`folder-${index}`);
																	}}
																	onMouseLeave={(e) => {
																		e.stopPropagation();
																		setActiveTooltip(null);
																	}}
																>
																	<svg
																		className="w-4 h-4 text-teal-400 hover:text-teal-300"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
																		/>
																	</svg>
																	{activeTooltip === `folder-${index}` && (
																		<div
																			className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap"
																			style={{
																				zIndex: 9999,
																				bottom: "calc(100% + 10px)",
																				right: "0",
																				transform: "translateX(0)",
																			}}
																		>
																			View contents of your knowledge base
																		</div>
																	)}
																</div>
															</div>

															{/* Temperature Status Bubble */}
															<div
																className="px-2 py-0.5 rounded-full text-xs transition-all duration-300 hover:scale-105"
																style={{
																	color: tempStatus.color,
																	backgroundColor: tempStatus.bgColor,
																	border: `1px solid ${tempStatus.color}40`,
																}}
															>
																{tempStatus.label}
															</div>
														</div>
													</div>

													{/* Timeline Heuristic - Period of Performance - Full Width */}
													{!isExpanded && (
														<div className="mt-3 space-y-2">
															<div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
																<div
																	className="h-full rounded-full transition-all duration-300"
																	style={{
																		width: `${(() => {
																			const start = new Date(
																				event.start_date,
																			);
																			const end = new Date(event.end_date);
																			const today = new Date();
																			const total =
																				end.getTime() - start.getTime();
																			const elapsed = Math.max(
																				0,
																				today.getTime() - start.getTime(),
																			);
																			const percent = Math.min(
																				100,
																				Math.max(0, (elapsed / total) * 100),
																			);
																			return Math.max(percent, 3);
																		})()}%`,
																		backgroundColor: (() => {
																			const start = new Date(
																				event.start_date,
																			);
																			const end = new Date(event.end_date);
																			const today = new Date();
																			const total =
																				end.getTime() - start.getTime();
																			const elapsed = Math.max(
																				0,
																				today.getTime() - start.getTime(),
																			);
																			const percent = Math.min(
																				100,
																				Math.max(0, (elapsed / total) * 100),
																			);

																			if (percent < 25) return "#15803d"; // Forest green (0-<25%)
																			if (percent < 50) return "#84cc16"; // Chartreuse (25-<50%)
																			if (percent < 75) return "#eab308"; // Yellow (50-<75%)
																			return "#dc2626"; // Red (75-100%)
																		})(),
																	}}
																/>
															</div>
															<div className="flex items-center justify-between">
																<div
																	className="text-xs text-gray-400"
																	style={{
																		fontFamily:
																			"system-ui, -apple-system, sans-serif",
																	}}
																>
																	<span className="text-gray-500">
																		Performance Period:
																	</span>
																	<span className="ml-1">
																		{formatDate(event.start_date)}
																	</span>
																	<span className="mx-1">-</span>
																	<span>{formatDate(event.end_date)}</span>
																</div>
																<span
																	className="text-xs text-gray-400"
																	style={{
																		fontFamily:
																			"system-ui, -apple-system, sans-serif",
																	}}
																>
																	{(() => {
																		const start = new Date(event.start_date);
																		const end = new Date(event.end_date);
																		const today = new Date();
																		const total =
																			end.getTime() - start.getTime();
																		const elapsed = Math.max(
																			0,
																			today.getTime() - start.getTime(),
																		);
																		const percent = Math.min(
																			100,
																			Math.max(0, (elapsed / total) * 100),
																		);
																		return `${Math.round(percent)}% Elapsed`;
																	})()}
																</span>
															</div>
														</div>
													)}
												</div>
											</div>

											{/* Expanded Content Section */}
											{isExpanded && (
												<div className="relative z-10 p-4">
													<div className="grid grid-cols-4 gap-4">
														<div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
															<span
																className="text-gray-400 text-xs uppercase block mb-2"
																style={{ fontFamily: "Genos, sans-serif" }}
															>
																Obligation Amount
															</span>
															<span
																className="font-bold text-xl block"
																style={{ color: "#F97316" }}
															>
																{formatMoneyMillions(event.event_amount)}
															</span>
														</div>
														<div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
															<span
																className="text-gray-400 text-xs uppercase block mb-2"
																style={{ fontFamily: "Genos, sans-serif" }}
															>
																Recorded Outlays
															</span>
															<span
																className="font-bold text-xl block"
																style={{ color: "#10B981" }}
															>
																{formatMoney(event.event_amount * 0.6)}
															</span>
														</div>
														<div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
															<span
																className="text-gray-400 text-xs uppercase block mb-2"
																style={{ fontFamily: "Genos, sans-serif" }}
															>
																Utilization
															</span>
															<span
																className="font-bold text-xl block"
																style={{
																	color: getUtilizationColor(
																		event.utilization,
																	),
																}}
															>
																{event.utilization}%
															</span>
														</div>
														<div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
															<span
																className="text-gray-400 text-xs uppercase block mb-2"
																style={{ fontFamily: "Genos, sans-serif" }}
															>
																Recipient Count
															</span>
															<span
																className="font-bold text-xl block"
																style={{ color: "#FFB84D" }}
															>
																{event.event_type === "PRIME"
																	? "1"
																	: Math.floor(Math.random() * 2) + 1}
															</span>
														</div>
													</div>
												</div>
											)}
										</div>
									);
								})}
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}