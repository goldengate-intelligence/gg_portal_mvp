/**
 * Award Container
 *
 * Container for the awards list with header
 */

import React from 'react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../index';
import type { Event, Terminology } from './types/awardCardTypes';
import { AwardItem } from './AwardItem';

interface AwardContainerProps {
  awards: Event[];
  terminology: Terminology;
  type: "inflow" | "outflow";
  expandedItems: Set<string>;
  activeTooltip: string | null;
  onToggleExpansion: (itemId: string) => void;
  onSetTooltip: (tooltip: string | null) => void;
  onOpenObligationCardView: (
    contractId: string,
    contractTitle: string,
    originContainer?: "inflow" | "outflow"
  ) => void;
}

export const AwardContainer: React.FC<AwardContainerProps> = ({
  awards,
  terminology,
  type,
  expandedItems,
  activeTooltip,
  onToggleExpansion,
  onSetTooltip,
  onOpenObligationCardView
}) => {
  // Sort awards by most recent event_date first
  const sortedAwards = [...awards].sort((a, b) => {
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
            {terminology.container} • {awards.length}
          </h5>
        </div>

        <div className="space-y-4">
          {sortedAwards.map((award, index) => (
            <AwardItem
              key={award.award_key}
              award={award}
              index={index}
              type={type}
              terminology={terminology}
              isExpanded={expandedItems.has(award.award_key)}
              activeTooltip={activeTooltip}
              onToggleExpansion={onToggleExpansion}
              onSetTooltip={onSetTooltip}
              onOpenObligationCardView={onOpenObligationCardView}
            />
          ))}

          {awards.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No {terminology.items.toLowerCase()} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};