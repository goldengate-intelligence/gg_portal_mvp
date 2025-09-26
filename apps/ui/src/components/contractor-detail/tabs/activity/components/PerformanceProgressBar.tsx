/**
 * Performance Progress Bar
 *
 * Timeline visualization showing contract progress
 */

import React from 'react';
import type { PerformanceProgressBarProps } from './types/awardCardTypes';
import { calculateProgress, formatDate } from '../utils/awardCardUtils';

export const PerformanceProgressBar: React.FC<PerformanceProgressBarProps> = ({
  startDate,
  endDate
}) => {
  const progress = calculateProgress(startDate, endDate);

  // Determine if contract is active, upcoming, or completed
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  let status: 'upcoming' | 'active' | 'completed';
  let progressColor = '#10B981'; // Default green

  if (now < start) {
    status = 'upcoming';
    progressColor = '#6B7280'; // Gray
  } else if (now > end) {
    status = 'completed';
    progressColor = '#3B82F6'; // Blue
  } else {
    status = 'active';
    progressColor = '#10B981'; // Green
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 uppercase" style={{ fontFamily: "Genos, sans-serif" }}>
          Timeline
        </span>
        <span
          className="text-xs font-bold px-2 py-1 rounded"
          style={{
            color: progressColor,
            backgroundColor: `${progressColor}20`,
            fontFamily: "Genos, sans-serif"
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>

      <div className="relative">
        {/* Progress bar background */}
        <div
          className="w-full h-2 rounded-full"
          style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}
        >
          {/* Progress fill */}
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: progressColor,
              minWidth: progress > 0 ? '8px' : '0px'
            }}
          />
        </div>

        {/* Date labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {formatDate(startDate)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(endDate)}
          </span>
        </div>
      </div>

      {/* Progress percentage */}
      <div className="text-center">
        <span
          className="text-sm font-bold"
          style={{ color: progressColor }}
        >
          {progress}% Complete
        </span>
      </div>
    </div>
  );
};