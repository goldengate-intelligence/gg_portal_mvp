/**
 * Network Relationship List Component
 *
 * Displays a scrollable list of network relationships with amounts and percentages
 */

import React from 'react';
import { formatMoney } from '../../../index';
import { formatNetworkPercentage } from '../../../../../services/network-insights/networkDistributionService';
import type { NetworkRelationshipListProps } from './types/networkDistributionTypes';

export const NetworkRelationshipList: React.FC<NetworkRelationshipListProps> = ({
  relationships,
  isLoading,
  type,
  colorTheme,
  emptyMessage
}) => {
  return (
    <div className="space-y-2 overflow-y-auto max-h-[220px]">
      {isLoading ? (
        <div className={`bg-black/40 rounded-lg p-2 border border-${colorTheme.border}/20 animate-pulse`}>
          <div className="h-3 bg-gray-700 rounded mb-1"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      ) : relationships?.length ? (
        relationships.map((relationship, index) => (
          <div
            key={`${type}-${relationship.entityUei}-${index}`}
            className={`bg-black/40 rounded-lg p-2 border border-${colorTheme.border}/20 hover:border-${colorTheme.border}/40 transition-colors`}
          >
            <div className="text-xs text-gray-300 font-medium truncate" title={relationship.entityName}>
              {relationship.entityName}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className={`text-base ${colorTheme.text} font-semibold`}>
                {formatMoney(relationship.totalAmount)}
              </div>
              <div className={`text-[10px] text-${colorTheme.border}`}>
                {formatNetworkPercentage(relationship.percentage)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={`bg-black/40 rounded-lg p-2 border border-${colorTheme.border}/20 opacity-50`}>
          <div className="text-xs text-gray-500 text-center">{emptyMessage}</div>
        </div>
      )}
    </div>
  );
};