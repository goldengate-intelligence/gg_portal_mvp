/**
 * Obligation Container
 *
 * Container for obligations list with header - preserving exact sorting and display logic
 */

import React from 'react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../index';
import type { ObligationEvent, ObligationTerminology } from './types/obligationCardTypes';
import { ObligationItem } from './ObligationItem';

interface ObligationContainerProps {
  obligations: ObligationEvent[];
  terminology: ObligationTerminology;
  expandedItems: Set<string>;
  activeTooltip: string | null;
  onToggleExpansion: (itemId: string) => void;
  onSetTooltip: (tooltip: string | null) => void;
}

export const ObligationContainer: React.FC<ObligationContainerProps> = ({
  obligations,
  terminology,
  expandedItems,
  activeTooltip,
  onToggleExpansion,
  onSetTooltip
}) => {
  // Sort by most recent event_date first (exact same logic as original)
  const sortedObligations = [...obligations].sort((a, b) => {
    const dateA = new Date(a.event_date);
    const dateB = new Date(b.event_date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div
      className="rounded-xl p-4 border border-gray-700/50 shadow-lg"
      style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
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

        <div className="space-y-4">
          {sortedObligations.map((obligation, index) => (
            <ObligationItem
              key={obligation.EVENT_ID}
              obligation={obligation}
              index={index}
              terminology={terminology}
              isExpanded={expandedItems.has(obligation.EVENT_ID)}
              activeTooltip={activeTooltip}
              onToggleExpansion={onToggleExpansion}
              onSetTooltip={onSetTooltip}
            />
          ))}

          {obligations.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No {terminology.items.toLowerCase()} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};