import React from "react";
import { Card } from "../../../ui/card";
import { AwardCardView } from "./AwardCardView";
import { ObligationCardView } from "./ObligationCardView";
import { ActivityInflows } from "./components/ActivityInflows";
import { ActivityOutflows } from "./components/ActivityOutflows";
import { useActivityState } from "./hooks/useActivityState";
import { useContractData } from "./hooks/useContractData";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics } from "../../services/unified-data-adapter";

interface ActivityDetailPanelProps {
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	isLoading?: boolean;
}

export function ActivityDetailPanel({
	activityEvents,
	metrics,
	isLoading,
}: ActivityDetailPanelProps) {
	const {
		showAwardCardView,
		awardCardRelationship,
		showObligationCardView,
		obligationCardContract,
		expandedCards,
		activeTooltips,
		setActiveTooltips,
		toggleCardExpansion,
		openAwardCardView,
		closeAwardCardView,
		openObligationCardView,
		closeObligationCardView,
	} = useActivityState();

	const { sortedInflowRelationships, outflowRelationships } = useContractData(activityEvents);

	// Handle tooltip setting for specific card keys
	const handleSetActiveTooltip = (cardKey: string, tooltip: string | null) => {
		setActiveTooltips((prev) => ({ ...prev, [cardKey]: tooltip }));
	};

	// If showing obligation card view, render that view instead (highest priority)
	if (showObligationCardView && obligationCardContract) {
		return (
			<ObligationCardView
				contractId={obligationCardContract.contractId}
				contractTitle={obligationCardContract.contractTitle}
				onBack={closeObligationCardView}
				originContainer={obligationCardContract.originContainer}
				activityEvents={activityEvents}
			/>
		);
	}

	// If showing award card view, render that view instead
	if (showAwardCardView && awardCardRelationship) {
		return (
			<AwardCardView
				relationship={awardCardRelationship}
				type={awardCardRelationship.originContainer || "inflow"}
				onBack={closeAwardCardView}
				onOpenObligationCardView={openObligationCardView}
			/>
		);
	}

	return (
		<Card
			className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
			style={{ backgroundColor: "#111726" }}
		>
			<div className="p-4 relative z-10">
				<div className="flex items-center justify-between mb-3">
					<h3
						className="font-bold tracking-wide text-gray-200 uppercase"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
					>
						Activity Rollups
					</h3>
				</div>

				{/* Stacked Inner Containers */}
				<div className="space-y-4">
					{/* Contract Inflows Container */}
					<ActivityInflows
						sortedInflowRelationships={sortedInflowRelationships}
						expandedCards={expandedCards}
						activeTooltips={activeTooltips}
						onToggleExpansion={toggleCardExpansion}
						onSetActiveTooltip={handleSetActiveTooltip}
						onOpenAwardCardView={openAwardCardView}
					/>

					{/* Contract Outflows Container */}
					<ActivityOutflows
						outflowRelationships={outflowRelationships}
						expandedCards={expandedCards}
						activeTooltips={activeTooltips}
						onToggleExpansion={toggleCardExpansion}
						onSetActiveTooltip={handleSetActiveTooltip}
						onOpenAwardCardView={openAwardCardView}
					/>
				</div>
			</div>

		</Card>
	);
}
