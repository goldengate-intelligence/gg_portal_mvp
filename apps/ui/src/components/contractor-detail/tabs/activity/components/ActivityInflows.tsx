import type React from "react";
import type { Relationship } from "../types";
import { RelationshipCard } from "./RelationshipCard";

interface ActivityInflowsProps {
	sortedInflowRelationships: {
		agencies: Relationship[];
		primes: Relationship[];
	};
	expandedCards: Set<string>;
	activeTooltips: Record<string, string | null>;
	onToggleExpansion: (relationshipName: string) => void;
	onSetActiveTooltip: (cardKey: string, tooltip: string | null) => void;
	onOpenAwardCardView: (
		relationship: Relationship,
		originContainer: "inflow" | "outflow",
		event: React.MouseEvent,
	) => void;
}

export function ActivityInflows({
	sortedInflowRelationships,
	expandedCards,
	activeTooltips,
	onToggleExpansion,
	onSetActiveTooltip,
	onOpenAwardCardView,
}: ActivityInflowsProps) {
	const totalInflows =
		sortedInflowRelationships.agencies.length +
		sortedInflowRelationships.primes.length;

	return (
		<div
			className="flex-1 overflow-visible rounded-xl border border-gray-700"
			style={{ backgroundColor: "#223040" }}
		>
			<div className="p-4">
				<div className="mb-3">
					<h5
						className="text-sm font-semibold text-gray-400 uppercase tracking-wider"
						style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
					>
						INFLOWS • {totalInflows}
					</h5>
				</div>

				<div className="space-y-2">
					{/* Agencies Section */}
					{sortedInflowRelationships.agencies.map((relationship) => {
						const cardKey = `${relationship.name}-inflow`;
						return (
							<RelationshipCard
								key={`agency-${relationship.name}`}
								relationship={relationship}
								type="inflow"
								isExpanded={expandedCards.has(relationship.name)}
								activeTooltip={activeTooltips[cardKey] || null}
								onToggleExpansion={onToggleExpansion}
								onSetActiveTooltip={(tooltip) =>
									onSetActiveTooltip(cardKey, tooltip)
								}
								onOpenAwardCardView={(relationship, _, event) =>
									onOpenAwardCardView(relationship, "inflow", event)
								}
							/>
						);
					})}

					{/* Prime Contractors Section */}
					{sortedInflowRelationships.primes.map((relationship) => {
						const cardKey = `${relationship.name}-inflow`;
						return (
							<RelationshipCard
								key={`prime-${relationship.name}`}
								relationship={relationship}
								type="inflow"
								isExpanded={expandedCards.has(relationship.name)}
								activeTooltip={activeTooltips[cardKey] || null}
								onToggleExpansion={onToggleExpansion}
								onSetActiveTooltip={(tooltip) =>
									onSetActiveTooltip(cardKey, tooltip)
								}
								onOpenAwardCardView={(relationship, _, event) =>
									onOpenAwardCardView(relationship, "inflow", event)
								}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
