import { useState } from "react";
import type { Relationship } from "../types";

export const useActivityState = () => {
	const [expandedRelationships, setExpandedRelationships] = useState(
		new Set<string>(),
	);
	const [expandedContractAwards, setExpandedContractAwards] = useState(
		new Set<string>(),
	);
	const [showAwardCardView, setShowAwardCardView] = useState(false);
	const [awardCardRelationship, setAwardCardRelationship] =
		useState<Relationship | null>(null);
	const [showObligationCardView, setShowObligationCardView] = useState(false);
	const [obligationCardContract, setObligationCardContract] = useState<{contractId: string, contractTitle: string, originContainer?: "inflow" | "outflow"} | null>(null);
	const [expandedCards, setExpandedCards] = useState(new Set<string>());
	const [activeTooltips, setActiveTooltips] = useState<
		Record<string, string | null>
	>({});

	// Toggle functions
	const toggleRelationship = (name: string) => {
		const newExpanded = new Set(expandedRelationships);
		if (newExpanded.has(name)) {
			newExpanded.delete(name);
		} else {
			newExpanded.add(name);
		}
		setExpandedRelationships(newExpanded);
	};

	const toggleCardExpansion = (relationshipName: string) => {
		const newExpanded = new Set(expandedCards);
		if (newExpanded.has(relationshipName)) {
			newExpanded.delete(relationshipName);
		} else {
			newExpanded.add(relationshipName);
		}
		setExpandedCards(newExpanded);
	};

	const toggleAward = (awardId: string) => {
		const newExpanded = new Set(expandedContractAwards);
		if (newExpanded.has(awardId)) {
			newExpanded.delete(awardId);
		} else {
			newExpanded.add(awardId);
		}
		setExpandedContractAwards(newExpanded);
	};


	// Award card view handlers
	const openAwardCardView = (
		relationship: Relationship,
		originContainer: "inflow" | "outflow",
		event: React.MouseEvent,
	) => {
		event.stopPropagation();
		setAwardCardRelationship({ ...relationship, originContainer });
		setShowAwardCardView(true);
	};

	const closeAwardCardView = () => {
		setShowAwardCardView(false);
		setAwardCardRelationship(null);
	};

	// Obligation card view handlers
	const openObligationCardView = (contractId: string, contractTitle: string, originContainer?: "inflow" | "outflow") => {
		console.log('Opening obligation card view for:', contractId, contractTitle, 'from:', originContainer);
		// Keep award card view state intact, just open obligation view on top
		setObligationCardContract({ contractId, contractTitle, originContainer });
		setShowObligationCardView(true);
	};

	const closeObligationCardView = () => {
		setShowObligationCardView(false);
		setObligationCardContract(null);
		// Don't need to restore AwardCardView since we never closed it
	};

	return {
		// State
		expandedRelationships,
		expandedContractAwards,
		showAwardCardView,
		awardCardRelationship,
		showObligationCardView,
		obligationCardContract,
		expandedCards,
		activeTooltips,
		setActiveTooltips,
		// Actions
		toggleRelationship,
		toggleCardExpansion,
		toggleAward,
		openAwardCardView,
		closeAwardCardView,
		openObligationCardView,
		closeObligationCardView,
	};
};
