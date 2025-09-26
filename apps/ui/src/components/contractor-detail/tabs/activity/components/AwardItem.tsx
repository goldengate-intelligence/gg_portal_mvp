/**
 * Award Item
 *
 * Individual award card component
 */

import React from 'react';
import { Card } from '../../../../../ui/card';
import { CONTRACTOR_DETAIL_COLORS } from '../../../index';
import type { AwardItemProps } from './types/awardCardTypes';
import { getLatestActionDate } from '../utils/awardCardUtils';
import { AwardItemHeader } from './AwardItemHeader';
import { AwardItemToolbar } from './AwardItemToolbar';
import { AwardItemExpandedContent } from './AwardItemExpandedContent';

export const AwardItem: React.FC<AwardItemProps> = ({
  award,
  index,
  type,
  terminology,
  isExpanded,
  activeTooltip,
  onToggleExpansion,
  onSetTooltip,
  onOpenObligationCardView
}) => {
  const latestActionDate = getLatestActionDate(award);

  return (
    <Card
      className={`
        rounded-xl overflow-hidden shadow-lg transition-all duration-300 group relative
        border-gray-700/50 hover:border-gray-600/40
        ${isExpanded ? 'ring-2 ring-orange-400/30' : ''}
      `}
      style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-gray-800/10 to-gray-900/20 rounded-xl" />

      <div className="p-4 relative z-10">
        <AwardItemHeader
          award={award}
          latestActionDate={latestActionDate}
        />

        <AwardItemToolbar
          award={award}
          index={index}
          type={type}
          activeTooltip={activeTooltip}
          onSetTooltip={onSetTooltip}
          onToggleExpansion={onToggleExpansion}
          onOpenObligationCardView={onOpenObligationCardView}
        />

        {isExpanded && (
          <AwardItemExpandedContent award={award} />
        )}
      </div>
    </Card>
  );
};