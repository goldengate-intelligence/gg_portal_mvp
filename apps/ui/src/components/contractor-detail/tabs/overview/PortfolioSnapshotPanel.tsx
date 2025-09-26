import React from "react";
import { useDesignPatterns } from "../../../../hooks/useDesignPatterns";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics } from "../../services/unified-data-adapter";

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
		const allNaicsValues = new Map<string, number>(); // Fallback for all contracts

		activityEvents.forEach(event => {
			// Handle multiple possible NAICS field variations
			const naicsCode = event.NAICS_CODE || event.naics_code || event.NAICS || event.naics;
			const eventAmount = event.EVENT_AMOUNT || event.event_amount || event.AWARD_TOTAL_VALUE;

			if (naicsCode && eventAmount) {
				// Add to all contracts
				const allCurrentValue = allNaicsValues.get(naicsCode) || 0;
				allNaicsValues.set(naicsCode, allCurrentValue + eventAmount);

				// Filter for active contracts (current performing)
				const startDate = new Date(event.start_date || event.AWARD_START_DATE);
				const endDate = new Date(event.end_date || event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);
				const now = new Date();

				// Check if dates are valid and if contract is active
				if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) &&
				    startDate <= now && endDate >= now) {
					const currentValue = naicsValues.get(naicsCode) || 0;
					naicsValues.set(naicsCode, currentValue + eventAmount);
				}
			}
		});

		// Try active contracts first, fall back to all contracts
		const activeTopNaics = Array.from(naicsValues.entries()).sort((a, b) => b[1] - a[1])[0];
		const allTopNaics = Array.from(allNaicsValues.entries()).sort((a, b) => b[1] - a[1])[0];

		return activeTopNaics?.[0] || allTopNaics?.[0] || "--";
	};

	const getTopPSC = () => {
		// TOP PSC = Largest dollar value in active contracts portfolio
		if (!activityEvents?.length) return "--";

		const pscValues = new Map<string, number>();
		const allPscValues = new Map<string, number>(); // Fallback for all contracts

		activityEvents.forEach(event => {
			// Handle multiple possible PSC field variations
			const pscCode = event.PSC_CODE || event.psc_code || event.PSC || event.psc;
			const eventAmount = event.EVENT_AMOUNT || event.event_amount || event.AWARD_TOTAL_VALUE;

			if (pscCode && eventAmount) {
				// Add to all contracts
				const allCurrentValue = allPscValues.get(pscCode) || 0;
				allPscValues.set(pscCode, allCurrentValue + eventAmount);

				// Filter for active contracts (current performing)
				const startDate = new Date(event.start_date || event.AWARD_START_DATE);
				const endDate = new Date(event.end_date || event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);
				const now = new Date();

				// Check if dates are valid and if contract is active
				if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) &&
				    startDate <= now && endDate >= now) {
					const currentValue = pscValues.get(pscCode) || 0;
					pscValues.set(pscCode, currentValue + eventAmount);
				}
			}
		});

		// Try active contracts first, fall back to all contracts
		const activeTopPsc = Array.from(pscValues.entries()).sort((a, b) => b[1] - a[1])[0];
		const allTopPsc = Array.from(allPscValues.entries()).sort((a, b) => b[1] - a[1])[0];

		return activeTopPsc?.[0] || allTopPsc?.[0] || "--";
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
						<SimpleDisplay
							label="TOP NAICS"
							value={topNAICS}
						/>
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
