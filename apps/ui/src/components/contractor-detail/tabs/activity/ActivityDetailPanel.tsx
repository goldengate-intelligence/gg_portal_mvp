import React from 'react';
import { Card } from "../../../ui/card";
import { AwardGrainPopup } from './AwardGrainPopup';
import { EventsListPopup } from './EventsListPopup';
import { EventsDetailView } from './EventsDetailView';
import { ActivityInflows } from './components/ActivityInflows';
import { ActivityOutflows } from './components/ActivityOutflows';
import { useActivityState } from './hooks/useActivityState';
import { useContractData } from './hooks/useContractData';
import type { ActivityDetailPanelProps } from './types';

export function ActivityDetailPanel({ contractor, performanceData }: ActivityDetailPanelProps) {
  const {
    selectedRelationship,
    isAwardGrainOpen,
    isEventsPopupOpen,
    selectedContract,
    showEventsDetail,
    eventsDetailRelationship,
    expandedCards,
    activeTooltips,
    setActiveTooltips,
    toggleCardExpansion,
    openAwardGrain,
    closeAwardGrain,
    openEventsPopup,
    closeEventsPopup,
    openEventsDetail,
    closeEventsDetail
  } = useActivityState();

  const {
    sortedInflowRelationships,
    outflowRelationships
  } = useContractData();

  // Handle tooltip setting for specific card keys
  const handleSetActiveTooltip = (cardKey: string, tooltip: string | null) => {
    setActiveTooltips(prev => ({ ...prev, [cardKey]: tooltip }));
  };


  // If showing events detail, render that view instead
  if (showEventsDetail && eventsDetailRelationship) {
    return (
      <EventsDetailView
        relationship={eventsDetailRelationship}
        type={eventsDetailRelationship.originContainer || 'inflow'}
        onBack={closeEventsDetail}
      />
    );
  }

  return (
    <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
      <div className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold tracking-wide text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            Activity Rollups
          </h3>
        </div>

        {/* Stacked Inner Containers */}
        <div className="space-y-4">
          {/* Contract Inflows Container */}
          <ActivityInflows
            sortedInflowRelationships={sortedInflowRelationships}
            expandedCards={expandedCards}
            activeTooltips={activeTooltips}
            onToggleExpansion={toggleCardExpansion}
            onSetActiveTooltip={handleSetActiveTooltip}
            onOpenEventsDetail={openEventsDetail}
          />

          {/* Contract Outflows Container */}
          <ActivityOutflows
            outflowRelationships={outflowRelationships}
            expandedCards={expandedCards}
            activeTooltips={activeTooltips}
            onToggleExpansion={toggleCardExpansion}
            onSetActiveTooltip={handleSetActiveTooltip}
            onOpenEventsDetail={openEventsDetail}
          />
        </div>
      </div>

      {/* Award Grain Popup */}
      <AwardGrainPopup
        isOpen={isAwardGrainOpen}
        onClose={closeAwardGrain}
        relationship={selectedRelationship}
      />

      {/* Events List Popup */}
      <EventsListPopup
        isOpen={isEventsPopupOpen}
        onClose={closeEventsPopup}
        contractId={selectedContract?.id || ''}
        contractTitle={selectedContract?.desc || ''}
      />
    </Card>
  );
}