import React from "react";
import { useDesignPatterns } from "../../../../hooks/useDesignPatterns";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics } from "../../services/unified-data-adapter";
import { useNAICSDescription, usePSCDescription } from "../../../../services/reference-data";

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

interface PortfolioSnapshotPanelProps {
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	isLoading?: boolean;
}

export function PortfolioSnapshotPanel({
	activityEvents,
	metrics,
	isLoading,
}: PortfolioSnapshotPanelProps) {
	const { Typography, PanelWrapper } = useDesignPatterns();

	// Calculate portfolio metrics from activity events and unified metrics
	const getTopClient = () => {
		// TOP CLIENT = Largest inflow relationship by dollar value
		if (!activityEvents?.length) return "--";

		const inflowClients = new Map<string, number>();
		activityEvents.forEach(event => {
			if (event.FLOW_DIRECTION === 'INFLOW' && event.RELATED_ENTITY_NAME && event.EVENT_AMOUNT) {
				const currentValue = inflowClients.get(event.RELATED_ENTITY_NAME) || 0;
				inflowClients.set(event.RELATED_ENTITY_NAME, currentValue + (event.EVENT_AMOUNT || 0));
			}
		});
		const topClient = Array.from(inflowClients.entries()).sort((a, b) => b[1] - a[1])[0];
		return topClient?.[0] || "--";
	};

	const getTopNAICS = () => {
		// TOP NAICS = Largest dollar value in active contracts portfolio
		if (!activityEvents?.length) return "--";

		const naicsValues = new Map<string, number>();
		activityEvents.forEach(event => {
			// Filter for active contracts (current performing)
			const startDate = new Date(event.AWARD_START_DATE);
			const endDate = new Date(event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);
			const now = new Date();

			if (event.NAICS_CODE && startDate <= now && endDate >= now && event.AWARD_TOTAL_VALUE) {
				const currentValue = naicsValues.get(event.NAICS_CODE) || 0;
				naicsValues.set(event.NAICS_CODE, currentValue + (event.AWARD_TOTAL_VALUE || 0));
			}
		});
		const topNaics = Array.from(naicsValues.entries()).sort((a, b) => b[1] - a[1])[0];
		return topNaics?.[0] || "--";
	};

	const getTopPSC = () => {
		// TOP PSC = Largest dollar value in active contracts portfolio
		if (!activityEvents?.length) return "--";

		const pscValues = new Map<string, number>();
		activityEvents.forEach(event => {
			// Filter for active contracts (current performing)
			const startDate = new Date(event.AWARD_START_DATE);
			const endDate = new Date(event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);
			const now = new Date();

			if (event.PSC_CODE && startDate <= now && endDate >= now && event.AWARD_TOTAL_VALUE) {
				const currentValue = pscValues.get(event.PSC_CODE) || 0;
				pscValues.set(event.PSC_CODE, currentValue + (event.AWARD_TOTAL_VALUE || 0));
			}
		});
		const topPsc = Array.from(pscValues.entries()).sort((a, b) => b[1] - a[1])[0];
		return topPsc?.[0] || "--";
	};

	const getPortfolioDuration = () => {
		// PORTFOLIO DURATION comes from universal metrics
		const avgDurationMonths = metrics?.portfolio?.avgContractDuration || 0;
		if (avgDurationMonths === 0) {
			return "--";
		}
		return `${(avgDurationMonths / 12).toFixed(1)} Years`;
	};

	const topNAICS = getTopNAICS();
	const topPSC = getTopPSC();

	// Use reference data hooks - only for NAICS
	const { description: naicsDescription } = useNAICSDescription(topNAICS);

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
					PORTFOLIO SNAPSHOT
				</h3>

				<div className="flex-1 flex flex-col justify-between">
					<div className="space-y-3">
						<SimpleDisplay
							label="TOP CLIENT"
							value={getTopClient()}
						/>
						<div>
							<SimpleDisplay
								label="TOP NAICS"
								value={topNAICS}
							/>
							{naicsDescription && (
								<p className="text-xs text-gray-400 mt-1 px-3 italic">
									{naicsDescription}
								</p>
							)}
						</div>
						<SimpleDisplay
							label="TOP PSC"
							value={topPSC}
						/>
						<SimpleDisplay
							label="PORTFOLIO DURATION"
							value={getPortfolioDuration()}
						/>
					</div>
				</div>

				<div className="mt-3 pt-3 border-t border-gray-700">
					<p
						className="text-gray-500 uppercase tracking-wider"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "12px" }}
					>
						DURATION IS VALUE-WEIGHTED AVG LIFESPAN
					</p>
				</div>
			</div>
		</Card>
	);
}
