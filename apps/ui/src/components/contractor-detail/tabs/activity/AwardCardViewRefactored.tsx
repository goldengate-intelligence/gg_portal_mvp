/**
 * Award Card View (Refactored)
 *
 * Main component for displaying award details - broken down into focused sub-components
 * This replaces the original 751-line AwardCardView.tsx
 */

import React from 'react';
import type { AwardCardViewProps } from './components/types/awardCardTypes';
import { transformContractsToEvents } from './utils/contractTransformer';
import { generateTerminology } from './utils/awardCardUtils';
import { useAwardExpansion } from './hooks/useAwardExpansion';
import { useTooltipState } from './hooks/useTooltipState';
import { AwardCardHeader } from './components/AwardCardHeader';
import { AwardContainer } from './components/AwardContainer';

export function AwardCardView({
  relationship,
  type,
  onBack,
  onOpenObligationCardView,
}: AwardCardViewProps) {
  // Hooks for state management
  const { expandedItems, toggleItemExpansion } = useAwardExpansion();
  const { activeTooltip, setActiveTooltip } = useTooltipState();

  // Generate terminology based on relationship type
  const terminology = generateTerminology(relationship, type);

  // Transform relationship contracts into Event format for display
  const obligations = transformContractsToEvents(relationship);

  return (
    <div className="space-y-6">
      <AwardCardHeader
        title={terminology.title}
        relationshipName={relationship?.name || "Unknown"}
        terminology={terminology}
        onBack={onBack}
      />

      <AwardContainer
        awards={obligations}
        terminology={terminology}
        type={type}
        expandedItems={expandedItems}
        activeTooltip={activeTooltip}
        onToggleExpansion={toggleItemExpansion}
        onSetTooltip={setActiveTooltip}
        onOpenObligationCardView={onOpenObligationCardView}
      />
    </div>
  );
}