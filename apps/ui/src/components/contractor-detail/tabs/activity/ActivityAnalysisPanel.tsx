import {
	AlertTriangle,
	Building2,
	Eye,
	Star,
	Target,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import React, { useState } from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics } from "../../services/unified-data-adapter";

interface ActivityAnalysisPanelProps {
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	isLoading?: boolean;
}

export function ActivityAnalysisPanel({
	activityEvents,
	metrics,
	isLoading,
}: ActivityAnalysisPanelProps) {
	const [selectedPeriod, setSelectedPeriod] = useState<'90d' | '1yr'>('90d');

	// Mock partner intelligence data - in production this would come from analysis engine
	const partnerIntelligence = {
		topPartner: {
			name: "MegaCorp Industries",
			type: "prime",
			contribution: 28.1, // % of total revenue
			newBusiness: true,
			risk: "low",
		},
		emergingPartner: {
			name: "MegaCorp Industries",
			type: "prime",
			growth: 185, // % growth in 90 days
			isNew: false,
		},
		utilization: {
			underutilized: 2, // partners with <30% utilization but >12 months left
			overutilized: 1, // partners with >80% utilization
			balanced: 3,
		},
		riskFactors: {
			highUtilizationShortTime: 1, // High util + <6 months left
			newRelationships: 1,
			concentrationRisk: true, // >50% revenue from single source
		},
	};

	// Calculate actual net flow from unified metrics based on selected period
	const inflowValue = selectedPeriod === '90d'
		? (metrics?.ninetyDay?.awards || 0) // 90-day awards in millions
		: (metrics?.ttm?.awards || 0); // TTM awards in millions
	const outflowValue = selectedPeriod === '90d'
		? (metrics?.ninetyDay?.subcontracting || 0) // 90-day subcontracting in millions
		: (metrics?.ttm?.subcontracting || 0); // TTM subcontracting in millions
	const netFlowValue = inflowValue - outflowValue; // Net flow
	const getNetFlowColor = () => {
		if (netFlowValue > 0) return "#10B981"; // Emerald green for positive
		if (netFlowValue < 0) return "#FF4C4C"; // Red for negative
		return "#eab308"; // Yellow for zero
	};

	const getNetFlowBorderColor = () => {
		if (netFlowValue > 0) return "border-[#10B981]/30";
		if (netFlowValue < 0) return "border-[#FF4C4C]/30";
		return "border-[#eab308]/30";
	};

	return (
		<div
			className="h-full rounded-lg border border-gray-700"
			style={{ backgroundColor: "#223040" }}
		>
			{/* Header */}
			<div className="px-6 py-3">
				<div className="flex items-center justify-between">
					<h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
						ACTIVITY ANALYSIS
					</h4>
					<div className="flex gap-2">
						<button
							onClick={() => setSelectedPeriod('90d')}
							className={`px-3 py-1 text-xs rounded-full border transition-all ${
								selectedPeriod === '90d'
									? 'bg-[#D2AC38]/20 text-[#D2AC38] border-[#D2AC38]/40'
									: 'bg-gray-700/30 text-gray-400 border-gray-700/30 hover:bg-gray-600/30'
							}`}
						>
							90 Days
						</button>
						<button
							onClick={() => setSelectedPeriod('1yr')}
							className={`px-3 py-1 text-xs rounded-full border transition-all ${
								selectedPeriod === '1yr'
									? 'bg-[#D2AC38]/20 text-[#D2AC38] border-[#D2AC38]/40'
									: 'bg-gray-700/30 text-gray-400 border-gray-700/30 hover:bg-gray-600/30'
							}`}
						>
							1 Year
						</button>
					</div>
				</div>
			</div>

			{/* Content Area */}
			<div className="px-6 pb-6 pt-2 flex-1">
				{/* Simplified Activity Analysis - Key Metrics Only */}
				<div className="h-full flex flex-col justify-center space-y-3">
					{/* Section Headers Row */}
					<div className="grid grid-cols-3 gap-6 mb-4">
						<div className="text-center">
							<div className="text-sm uppercase tracking-wider font-semibold text-gray-400">
								Net Flow
							</div>
						</div>
						<div className="text-center">
							<div className="text-sm text-[#10B981] uppercase tracking-wider font-semibold">
								Obligation Inflows
							</div>
						</div>
						<div className="text-center">
							<div className="text-sm text-[#FF4C4C] uppercase tracking-wider font-semibold">
								Vendor Outflows
							</div>
						</div>
					</div>

					{/* Main Content: Balanced Layout */}
					<div className="grid grid-cols-3 gap-6 h-full">
						{/* Left Side: Net Flow Summary - Takes 1/3 */}
						<div className="flex flex-col justify-center text-center p-10 bg-gradient-to-br from-black/50 via-black/30 to-black/60 rounded-xl border-2 border-gray-600/50 relative overflow-hidden shadow-2xl">
							{/* Enhanced background accent with gradient */}
							<div className="absolute inset-0 opacity-10 bg-gray-500/20" />
							<div className="relative z-10">
								<div
									className="text-6xl font-extrabold mb-3"
									style={{ color: getNetFlowColor() }}
								>
									{netFlowValue > 0 ? "+" : ""}${netFlowValue}M
								</div>
								<div className="text-sm text-gray-400 uppercase tracking-widest font-medium">
									{selectedPeriod === '90d' ? '90 Day Period' : '1 Year Period'}
								</div>
							</div>
						</div>

						{/* Center: Inflows - Takes 1/3 */}
						<div className="space-y-3">
							<div className="bg-black/20 rounded-lg p-4 border border-[#10B981]/30 text-center relative overflow-hidden">
								<div className="absolute inset-0 bg-[#10B981]/5" />
								<div className="relative z-10">
									<div className="text-2xl font-bold text-[#10B981] mb-1">
										${inflowValue.toFixed(1)}M
									</div>
									<div className="text-xs text-gray-400 uppercase">Awards</div>
								</div>
							</div>
							<div className="bg-black/20 rounded-lg p-4 border border-[#10B981]/30 text-center relative overflow-hidden">
								<div className="absolute inset-0 bg-[#10B981]/5" />
								<div className="relative z-10">
									<div className="text-2xl font-bold text-[#10B981] mb-1">
										{metrics?.portfolio?.inflowRelationships || 0}
									</div>
									<div className="text-xs text-gray-400 uppercase">
										Inflow Relationships
									</div>
								</div>
							</div>
						</div>

						{/* Right: Outflows - Takes 1/3 */}
						<div className="space-y-3">
							<div className="bg-black/20 rounded-lg p-4 border border-[#FF4C4C]/30 text-center relative overflow-hidden">
								<div className="absolute inset-0 bg-[#FF4C4C]/5" />
								<div className="relative z-10">
									<div className="text-2xl font-bold text-[#FF4C4C] mb-1">
										${outflowValue.toFixed(1)}M
									</div>
									<div className="text-xs text-gray-400 uppercase">Awards</div>
								</div>
							</div>
							<div className="bg-black/20 rounded-lg p-4 border border-[#FF4C4C]/30 text-center relative overflow-hidden">
								<div className="absolute inset-0 bg-[#FF4C4C]/5" />
								<div className="relative z-10">
									<div className="text-2xl font-bold text-[#FF4C4C] mb-1">
										{metrics?.portfolio?.outflowRelationships || 0}
									</div>
									<div className="text-xs text-gray-400 uppercase">
										Outflow Relationships
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
