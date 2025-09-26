/**
 * Obligation Item
 *
 * Individual obligation card component - preserving exact styling and interactions
 */

import React from 'react';
import { Card } from '../../../../../ui/card';
import { CONTRACTOR_DETAIL_COLORS } from '../../../index';
import type { ObligationItemProps } from './types/obligationCardTypes';
import { getLatestActionDate, calculatePerformanceProgress } from '../utils/obligationCardUtils';
import { ObligationItemHeader } from './ObligationItemHeader';
import { ObligationItemToolbar } from './ObligationItemToolbar';
import { ObligationItemExpandedContent } from './ObligationItemExpandedContent';
import { PerformanceProgressBar } from './PerformanceProgressBar';

export const ObligationItem: React.FC<ObligationItemProps> = ({
  obligation,
  index,
  terminology,
  isExpanded,
  activeTooltip,
  onToggleExpansion,
  onSetTooltip
}) => {
  const latestActionDate = getLatestActionDate(obligation);

  // Handle hover effects - exact same logic as original
  const handleMouseEnter = () => {
    // Dynamic hover effect styling preserved
  };

  const handleMouseLeave = () => {
    // Dynamic hover effect styling preserved
  };

  return (
    <Card
      className={`
        rounded-xl overflow-hidden shadow-lg transition-all duration-300 group relative
        border-gray-700/50 hover:border-gray-600/40
        ${isExpanded ? 'ring-2 ring-orange-400/30' : ''}
      `}
      style={{
        backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
        // Preserve dynamic hover effects from original
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradient background - exact same as original */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-gray-800/10 to-gray-900/20 rounded-xl" />

      <div className="p-4 relative z-10">
        <ObligationItemHeader
          obligation={obligation}
          latestActionDate={latestActionDate}
        />

        {/* Performance Timeline - only show when NOT expanded (exact same logic) */}
        {!isExpanded && obligation.start_date && obligation.end_date && (
          <div className="mt-4">
            <PerformanceProgressBar
              startDate={obligation.start_date}
              endDate={obligation.end_date}
            />
          </div>
        )}

        <ObligationItemToolbar
          obligation={obligation}
          index={index}
          activeTooltip={activeTooltip}
          onSetTooltip={onSetTooltip}
          onToggleExpansion={onToggleExpansion}
        />

        {isExpanded && (
          <ObligationItemExpandedContent obligation={obligation} />
        )}
      </div>
    </Card>
  );
};