import React from 'react';
import { RelationshipCard } from './RelationshipCard';
import type { Relationship } from '../types';

interface ActivityOutflowsProps {
  outflowRelationships: Relationship[];
  expandedCards: Set<string>;
  activeTooltips: Record<string, string | null>;
  onToggleExpansion: (relationshipName: string) => void;
  onSetActiveTooltip: (cardKey: string, tooltip: string | null) => void;
  onOpenEventsDetail: (relationship: Relationship, originContainer: 'inflow' | 'outflow', event: React.MouseEvent) => void;
}

export function ActivityOutflows({
  outflowRelationships,
  expandedCards,
  activeTooltips,
  onToggleExpansion,
  onSetActiveTooltip,
  onOpenEventsDetail
}: ActivityOutflowsProps) {
  return (
    <div className="flex-1 overflow-visible rounded-xl border border-gray-700" style={{ backgroundColor: '#223040' }}>
      <div className="p-4">
        <div className="mb-3">
          <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            OUTFLOWS • {outflowRelationships.length}
          </h5>
        </div>

        <div className="space-y-2">
          {outflowRelationships.map((relationship) => {
            const cardKey = `${relationship.name}-outflow`;
            return (
              <RelationshipCard
                key={`outflow-${relationship.name}`}
                relationship={relationship}
                type="outflow"
                isExpanded={expandedCards.has(relationship.name)}
                activeTooltip={activeTooltips[cardKey] || null}
                onToggleExpansion={onToggleExpansion}
                onSetActiveTooltip={(tooltip) => onSetActiveTooltip(cardKey, tooltip)}
                onOpenEventsDetail={(relationship, _, event) => onOpenEventsDetail(relationship, 'outflow', event)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}