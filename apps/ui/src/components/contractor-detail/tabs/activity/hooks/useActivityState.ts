import { useState } from 'react';
import type { Relationship } from '../types';

export const useActivityState = () => {
  const [expandedRelationships, setExpandedRelationships] = useState(new Set<string>());
  const [expandedContractAwards, setExpandedContractAwards] = useState(new Set<string>());
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [isAwardGrainOpen, setIsAwardGrainOpen] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showEventsDetail, setShowEventsDetail] = useState(false);
  const [eventsDetailRelationship, setEventsDetailRelationship] = useState<Relationship | null>(null);
  const [expandedCards, setExpandedCards] = useState(new Set<string>());
  const [activeTooltips, setActiveTooltips] = useState<Record<string, string | null>>({});

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

  // Award Grain popup handlers
  const openAwardGrain = (relationship: Relationship, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRelationship(relationship);
    setIsAwardGrainOpen(true);
  };

  const closeAwardGrain = () => {
    setIsAwardGrainOpen(false);
    setSelectedRelationship(null);
  };

  // Events popup handlers
  const openEventsPopup = (relationship: Relationship, event: React.MouseEvent) => {
    event.stopPropagation();
    const mockContract = {
      id: relationship.contracts[0]?.id || `${relationship.name}-001`,
      desc: `${relationship.name} Contract Activities`
    };
    setSelectedContract(mockContract);
    setIsEventsPopupOpen(true);
  };

  const closeEventsPopup = () => {
    setIsEventsPopupOpen(false);
    setSelectedContract(null);
  };

  // Events detail view handlers
  const openEventsDetail = (relationship: Relationship, originContainer: 'inflow' | 'outflow', event: React.MouseEvent) => {
    event.stopPropagation();
    setEventsDetailRelationship({ ...relationship, originContainer });
    setShowEventsDetail(true);
  };

  const closeEventsDetail = () => {
    setShowEventsDetail(false);
    setEventsDetailRelationship(null);
  };

  return {
    // State
    expandedRelationships,
    expandedContractAwards,
    selectedRelationship,
    isAwardGrainOpen,
    isEventsPopupOpen,
    selectedContract,
    showEventsDetail,
    eventsDetailRelationship,
    expandedCards,
    activeTooltips,
    setActiveTooltips,
    // Actions
    toggleRelationship,
    toggleCardExpansion,
    toggleAward,
    openAwardGrain,
    closeAwardGrain,
    openEventsPopup,
    closeEventsPopup,
    openEventsDetail,
    closeEventsDetail
  };
};