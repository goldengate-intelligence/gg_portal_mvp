/**
 * Award Item Expanded Content
 *
 * Expanded metrics grid shown when award item is expanded
 */

import React from 'react';
import { formatMoney } from '../../../index';
import { getUtilizationColor } from '../utils/awardCardUtils';
import { PerformanceProgressBar } from './PerformanceProgressBar';
import type { Event } from './types/awardCardTypes';

interface AwardItemExpandedContentProps {
  award: Event;
}

export const AwardItemExpandedContent: React.FC<AwardItemExpandedContentProps> = ({
  award
}) => {
  const utilizationColor = getUtilizationColor(award.utilization);

  return (
    <div className="mt-4 p-4 rounded-lg border border-gray-700/50" style={{ backgroundColor: "#0F1419" }}>
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
          <span
            className="text-gray-400 text-xs uppercase block mb-2"
            style={{ fontFamily: "Genos, sans-serif" }}
          >
            Award Value
          </span>
          <span
            className="font-bold text-xl block"
            style={{ color: "#F97316" }}
          >
            {formatMoney(award.event_amount, { forceUnit: 'M' })}
          </span>
        </div>
        <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
          <span
            className="text-gray-400 text-xs uppercase block mb-2"
            style={{ fontFamily: "Genos, sans-serif" }}
          >
            Obligations
          </span>
          <span
            className="font-bold text-xl block"
            style={{ color: "#10B981" }}
          >
            {formatMoney(award.event_amount * 0.75, { forceUnit: 'M' })}
          </span>
        </div>
        <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50">
          <span
            className="text-gray-400 text-xs uppercase block mb-2"
            style={{ fontFamily: "Genos, sans-serif" }}
          >
            Utilization
          </span>
          <span
            className="font-bold text-xl block"
            style={{ color: utilizationColor }}
          >
            {award.utilization}%
          </span>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="mb-4">
        <PerformanceProgressBar
          startDate={award.start_date}
          endDate={award.end_date}
        />
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Award PIID:</span>
            <span className="text-white font-mono text-xs">{award.award_piid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Action Type:</span>
            <span className="text-white">{award.action_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fiscal Year:</span>
            <span className="text-white">{award.fiscal_year}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Contract Type:</span>
            <span className="text-white">{award.contract_pricing_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Competed:</span>
            <span className="text-white">{award.extent_competed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Performance State:</span>
            <span className="text-white">{award.pop_state}</span>
          </div>
        </div>
      </div>

      {/* AI Description */}
      {award.ai_description && (
        <div className="mt-4 p-3 rounded-lg bg-gray-800/20 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-400 uppercase" style={{ fontFamily: "Genos, sans-serif" }}>
              AI Summary
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {award.ai_description}
          </p>
        </div>
      )}
    </div>
  );
};