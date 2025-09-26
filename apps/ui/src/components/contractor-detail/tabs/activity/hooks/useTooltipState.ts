/**
 * Tooltip State Hook
 *
 * Manages tooltip visibility state
 */

import { useState } from 'react';

export const useTooltipState = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const showTooltip = (tooltipId: string) => {
    setActiveTooltip(tooltipId);
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const isTooltipActive = (tooltipId: string): boolean => {
    return activeTooltip === tooltipId;
  };

  return {
    activeTooltip,
    setActiveTooltip,
    showTooltip,
    hideTooltip,
    isTooltipActive
  };
};