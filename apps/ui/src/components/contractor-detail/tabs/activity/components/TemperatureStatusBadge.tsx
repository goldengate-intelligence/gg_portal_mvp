/**
 * Temperature Status Badge
 *
 * Displays temperature status (hot/warm/cold) based on action date
 */

import React from 'react';
import type { TemperatureStatusBadgeProps } from './types/awardCardTypes';
import { getTemperatureStatus, getTemperatureDisplay } from '../utils/awardCardUtils';

export const TemperatureStatusBadge: React.FC<TemperatureStatusBadgeProps> = ({
  actionDate
}) => {
  const status = getTemperatureStatus(actionDate);
  const { color, label, bgColor } = getTemperatureDisplay(status);

  return (
    <span
      className="px-2 py-1 rounded text-xs font-bold"
      style={{
        color,
        backgroundColor: bgColor,
        fontFamily: "Genos, sans-serif",
        letterSpacing: "0.5px"
      }}
    >
      {label}
    </span>
  );
};