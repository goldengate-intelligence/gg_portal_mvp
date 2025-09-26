/**
 * Obligation Card View (Refactored)
 *
 * Main component for displaying obligation details - broken down into focused sub-components
 * This replaces the original 676-line ObligationCardView.tsx while preserving ALL functionality
 */

import React from 'react';
import type { ObligationCardViewProps } from './components/types/obligationCardTypes';
import { transformActivityToObligationEvents } from './utils/obligationTransformer';
import { generateObligationTerminology } from './utils/obligationCardUtils';
import { useAwardExpansion } from './hooks/useAwardExpansion';
import { useTooltipState } from './hooks/useTooltipState';
import { ObligationCardHeader } from './components/ObligationCardHeader';
import { ObligationContainer } from './components/ObligationContainer';

export function ObligationCardView({
  contractId,
  contractTitle,
  originContainer,
  activityEvents = [],
  onBack,
}: ObligationCardViewProps) {
  // Hooks for state management - exact same pattern as original
  const { expandedItems, toggleItemExpansion } = useAwardExpansion();
  const { activeTooltip, setActiveTooltip } = useTooltipState();

  // Generate obligation-specific terminology - exact same logic
  const terminology = generateObligationTerminology(originContainer);

  // Transform activity events to obligation events - preserving exact transformation logic
  const obligations = transformActivityToObligationEvents(
    activityEvents,
    contractId,
    originContainer
  );

  return (
    <div className="space-y-6">
      <ObligationCardHeader
        contractId={contractId}
        contractTitle={contractTitle}
        terminology={terminology}
        onBack={onBack}
      />

      <ObligationContainer
        obligations={obligations}
        terminology={terminology}
        expandedItems={expandedItems}
        activeTooltip={activeTooltip}
        onToggleExpansion={toggleItemExpansion}
        onSetTooltip={setActiveTooltip}
      />
    </div>
  );
}