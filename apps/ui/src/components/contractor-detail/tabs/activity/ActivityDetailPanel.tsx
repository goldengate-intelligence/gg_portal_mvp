import React, { useState } from 'react';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../../../lib/utils';
import { Activity, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, Hash } from 'lucide-react';
import { AwardGrainPopup } from './AwardGrainPopup';
import { EventsListPopup } from './EventsListPopup';

interface ActivityDetailPanelProps {
  contractor: any;
  performanceData: any;
}

export function ActivityDetailPanel({ contractor, performanceData }: ActivityDetailPanelProps) {
  const [expandedRelationships, setExpandedRelationships] = useState(new Set<string>());
  const [expandedContractAwards, setExpandedContractAwards] = useState(new Set<string>());
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null);
  const [isAwardGrainOpen, setIsAwardGrainOpen] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Mock contract data - in production this would come from props
  const contracts = [
    // PRIME CONTRACTS (Direct from agencies)
    {
      parentAward: 'W912HZ-22-C-0001',
      id: 'W912HZ24F0123',
      role: 'prime',
      client: 'Department of Defense',
      clientType: 'agency',
      desc: 'Vehicle Armor System Manufacturing',
      totalValue: '$165M',
      currentValue: '$165M',
      mods: 4,
      start: '01/15/2025',
      end: '12/31/2029',
      naics: '332312',
      psc: '5110',
      type: 'FIRM-FIXED',
      utilization: 28,
      subTo: null
    },
    // SUBCONTRACTS (From prime contractors)
    {
      parentAward: 'MC-2023-BASE-001',
      id: 'MC-2024-0456',
      role: 'sub',
      client: 'MegaCorp Industries',
      clientType: 'prime',
      desc: 'Advanced Defense Systems Integration',
      totalValue: '$280M',
      currentValue: '$280M',
      mods: 7,
      start: '01/01/2025',
      end: '06/30/2027',
      naics: '332312',
      psc: '1560',
      type: 'SUBCONTRACT',
      utilization: 85,
      subTo: 'MegaCorp Industries'
    },
    {
      parentAward: 'GD-2023-SUB-0789',
      id: 'GD-SUB-0789',
      role: 'sub',
      client: 'Global Defense Systems',
      clientType: 'prime',
      desc: 'Strategic Defense Platform Components',
      totalValue: '$145M',
      currentValue: '$145M',
      mods: 3,
      start: '06/01/2023',
      end: '05/31/2026',
      naics: '332312',
      psc: '1560',
      type: 'SUBCONTRACT',
      utilization: 35,
      subTo: 'Global Defense Systems'
    },
    // SUBCONTRACTORS (Our subs - outflows)
    {
      parentAward: 'W912HZ-22-C-0001',
      id: 'SUB-2024-001',
      role: 'prime',
      client: 'Alpha Systems Corporation',
      clientType: 'sub',
      desc: 'Specialized Manufacturing Services',
      totalValue: '$75M',
      currentValue: '$75M',
      mods: 1,
      start: '03/01/2025',
      end: '08/31/2027',
      naics: '332312',
      psc: '5110',
      type: 'SUBCONTRACT',
      utilization: 32,
      subTo: null
    },
    {
      parentAward: 'W912HZ-22-C-0001',
      id: 'SUB-2024-002',
      role: 'prime',
      client: 'Beta Technologies Inc',
      clientType: 'sub',
      desc: 'Technical Support Services',
      totalValue: '$50M',
      currentValue: '$50M',
      mods: 0,
      start: '01/01/2025',
      end: '03/31/2026',
      naics: '332312',
      psc: '5110',
      type: 'SUBCONTRACT',
      utilization: 28,
      subTo: null
    },
    {
      parentAward: 'W912HZ-22-C-0001',
      id: 'SUB-2024-003',
      role: 'prime',
      client: 'Gamma Industries LLC',
      clientType: 'sub',
      desc: 'Quality Assurance & Testing',
      totalValue: '$35M',
      currentValue: '$35M',
      mods: 2,
      start: '07/01/2024',
      end: '12/31/2025',
      naics: '541380',
      psc: '7530',
      type: 'SUBCONTRACT',
      utilization: 35,
      subTo: null
    }
  ];

  // Separate and group contracts by inflow/outflow
  const inflowContracts = contracts.filter(c =>
    c.role === 'sub' || (c.role === 'prime' && c.clientType === 'agency')
  );
  const outflowContracts = contracts.filter(c =>
    c.role === 'prime' && c.clientType === 'sub'
  );

  // Group contracts by relationship
  const groupByRelationship = (contractList: any[]) => {
    const grouped = contractList.reduce((acc, contract) => {
      const key = contract.client;
      if (!acc[key]) {
        acc[key] = {
          name: key,
          type: contract.clientType,
          role: contract.role,
          contracts: [],
          totalValue: 0,
          earliestStart: null,
          latestEnd: null
        };
      }
      acc[key].contracts.push(contract);
      const value = parseFloat(contract.currentValue.replace(/[$M]/g, '')) * 1000000;
      acc[key].totalValue += value;

      // Calculate earliest start and latest end dates for active awards
      const startDate = new Date(contract.start);
      const endDate = new Date(contract.end);
      const today = new Date('2025-09-19'); // Current date: September 19, 2025

      // Only consider active contracts (not completed)
      if (endDate > today) {
        if (!acc[key].earliestStart || startDate < acc[key].earliestStart) {
          acc[key].earliestStart = startDate;
        }
        if (!acc[key].latestEnd || endDate > acc[key].latestEnd) {
          acc[key].latestEnd = endDate;
        }
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => b.totalValue - a.totalValue);
  };

  const inflowRelationships = groupByRelationship(inflowContracts);
  const outflowRelationships = groupByRelationship(outflowContracts);

  // Sort inflow relationships: agencies first (descending), then prime contractors (descending)
  const sortedInflowRelationships = (() => {
    const agencies = inflowRelationships.filter(r => r.type === 'agency').sort((a: any, b: any) => b.totalValue - a.totalValue);
    const primes = inflowRelationships.filter(r => r.type === 'prime').sort((a: any, b: any) => b.totalValue - a.totalValue);
    return { agencies, primes };
  })();

  // Toggle functions
  const toggleRelationship = (name: string) => {
    const newExpanded = new Set(expandedRelationships);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedRelationships(newExpanded);
  };

  // Award Grain popup handler
  const openAwardGrain = (relationship: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent toggle from firing
    setSelectedRelationship(relationship);
    setIsAwardGrainOpen(true);
  };

  const closeAwardGrain = () => {
    setIsAwardGrainOpen(false);
    setSelectedRelationship(null);
  };

  // Events popup handler
  const openEventsPopup = (relationship: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent toggle from firing
    // Create a mock contract for the events popup
    const mockContract = {
      id: relationship.contracts[0]?.id || `${relationship.name}-001`,
      desc: `${relationship.name} Contract Activities`
    };
    setSelectedContract(mockContract);
    setIsEventsPopupOpen(true);
  };

  const closeEventsPopup = () => {
    setIsEventsPopupOpen(false);
    setSelectedContract(null);
  };

  const toggleAward = (awardId: string) => {
    const newExpanded = new Set(expandedContractAwards);
    if (newExpanded.has(awardId)) {
      newExpanded.delete(awardId);
    } else {
      newExpanded.add(awardId);
    }
    setExpandedContractAwards(newExpanded);
  };

  // Render function for contract details
  const renderContractDetails = (contract: any) => {
    // Calculate time metrics
    const startDate = new Date(contract.start);
    const endDate = new Date(contract.end);
    const today = new Date();
    const totalTime = endDate.getTime() - startDate.getTime();
    const elapsedTime = today.getTime() - startDate.getTime();
    const remainingTime = endDate.getTime() - today.getTime();
    const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    const remainingMonths = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30)));

    // Timeline color based on time remaining
    const getTimelineColor = () => {
      if (remainingMonths <= 3) return '#dc2626'; // Red
      if (remainingMonths <= 6) return '#eab308'; // Yellow
      if (remainingMonths <= 12) return '#84cc16'; // Chartreuse
      return '#15803d'; // Forest green
    };

    // Utilization color (inverted - 0% is green, 100% is red)
    const getUtilizationColor = () => {
      const util = Math.min(100, contract.utilization);
      if (util <= 25) return '#15803d'; // Forest green
      if (util <= 50) return '#84cc16'; // Chartreuse
      if (util <= 75) return '#eab308'; // Yellow
      return '#dc2626'; // Red
    };

    return (
      <div key={contract.id} className="ml-6 mb-2 relative border border-gray-700/30 rounded-lg overflow-hidden bg-gray-900/40">
        {/* Contract Status Banner */}
        <div className={`h-6 flex items-center px-3 ${
          contract.role === 'prime'
            ? 'bg-gradient-to-r from-[#5BC0EB] to-[#118AB2]'
            : 'bg-gradient-to-r from-[#FF4C4C] to-[#dc2626]'
        }`}>
          <span className="text-white font-bold text-[10px] uppercase tracking-wider">
            {contract.role === 'prime' ? 'PRIME CONTRACT' : 'SUBCONTRACT'}
          </span>
        </div>

        <div className="p-3">
          {/* Row 1: Client and Value */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {/* Client Display with Type Badge */}
              <div className="mb-1">
                <span className="text-[14px] font-bold text-white">
                  {contract.client}
                </span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                  contract.clientType === 'agency'
                    ? 'bg-[#9B7EBD]/20 text-[#9B7EBD] border border-[#9B7EBD]/30'
                    : 'bg-[#5BC0EB]/20 text-[#5BC0EB] border border-[#5BC0EB]/30'
                }`}>
                  {contract.clientType === 'agency' ? 'Agency' : 'Prime'}
                </span>
              </div>
              {/* Description */}
              <div className="font-medium text-gray-300 text-[12px] mb-1">{contract.desc}</div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="font-sans text-[#D2AC38]">{contract.parentAward}</span>
                <span className="font-sans text-gray-500">{contract.type}</span>
              </div>
            </div>

            {/* Value */}
            <div className="text-right">
              <div className="text-[20px] font-bold" style={{ color: '#15803d' }}>
                {contract.currentValue}
              </div>
              {contract.totalValue !== contract.currentValue && (
                <div className="text-[9px] text-gray-500">
                  of {contract.totalValue}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Timeline and Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-700/30">
            {/* Timeline Progress */}
            <div>
              <div className="text-[9px] text-gray-500 uppercase mb-1">Timeline</div>
              <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: getTimelineColor()
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                <span>{contract.start}</span>
                <span className="font-bold" style={{ color: getTimelineColor() }}>
                  {remainingMonths}mo left
                </span>
              </div>
            </div>

            {/* Utilization */}
            <div>
              <div className="text-[9px] text-gray-500 uppercase mb-1">Utilization</div>
              <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${contract.utilization}%`,
                    backgroundColor: getUtilizationColor()
                  }}
                />
              </div>
              <div className="text-[8px] text-center mt-1">
                <span className="font-bold" style={{ color: getUtilizationColor() }}>
                  {contract.utilization}%
                </span>
              </div>
            </div>

            {/* Mods */}
            <div>
              <div className="text-[9px] text-gray-500 uppercase mb-1">Modifications</div>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-white">{contract.mods}</span>
                <span className="text-[9px] text-gray-500">mods</span>
              </div>
            </div>
          </div>

          {/* Row 3: NAICS/PSC */}
          <div className="flex items-center gap-4 mt-2 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">NAICS:</span>
              <span className="font-sans text-gray-400">{contract.naics}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">PSC:</span>
              <span className="font-sans text-gray-400">{contract.psc}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          {/* Contract Inflows Container - Enhanced */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-700" style={{ backgroundColor: '#223040' }}>
            <div className="p-4">

              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  INFLOWS • {inflowRelationships.length}
                </h5>
              </div>

              <div className="space-y-2">
                {/* Agencies Section */}
                {sortedInflowRelationships.agencies.map((relationship) => (
                  <div key={relationship.name}
                       style={{ backgroundColor: '#03070F' }} className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group relative">
                    {/* Color accent bar like metric cards */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                         style={{ backgroundColor: '#22c55e' }} />

                    <div
                      className="p-2.5 transition-all"
                    >

                      {/* Redesigned Layout - Better Space Utilization */}
                      <div className="relative">
                        {/* Main content area */}
                        <div className="space-y-3">
                          {/* Layout with proper alignment */}
                          <div className="flex justify-between">
                            <div className="flex items-center flex-1">
                              {/* Name and Type */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="text-base text-white font-medium">
                                    {relationship.name}
                                  </div>
                                  <div className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wide ${
                                    relationship.type === 'agency'
                                      ? 'bg-[#9B7EBD]/20 border-[#9B7EBD]/40 text-[#9B7EBD]'
                                      : 'bg-[#5BC0EB]/20 border-[#5BC0EB]/40 text-[#5BC0EB]'
                                  }`}>
                                    {relationship.type === 'agency' ? 'Agency' : 'Prime'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Clean Financial Flow */}
                            <div className="flex items-center mr-15">
                              {(() => {
                                const awardedAmount = relationship.totalValue * 0.85;
                                const obligationRate = relationship.contracts.reduce((sum: number, contract: any) => sum + contract.utilization, 0) / relationship.contracts.length;
                                const obligatedAmount = awardedAmount * (obligationRate / 100);

                                // Color based on obligation level
                                const getObligationColor = () => {
                                  if (obligationRate <= 25) return '#15803d'; // Forest green
                                  if (obligationRate <= 50) return '#84cc16'; // Chartreuse
                                  if (obligationRate <= 75) return '#eab308'; // Yellow
                                  return '#dc2626'; // Red
                                };

                                return (
                                  <>
                                    {/* Lifetime */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-sm font-medium text-gray-500 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        ${(relationship.totalValue / 1000000).toFixed(0)}M
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Lifetime
                                      </div>
                                    </div>

                                    {/* Subtle Separator */}
                                    <div className="w-px h-6 bg-gray-700/40 mx-2"></div>

                                    {/* Awarded */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-base font-bold text-white leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        ${(awardedAmount / 1000000).toFixed(0)}M
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Active
                                      </div>
                                    </div>

                                    {/* Subtle Separator */}
                                    <div className="w-px h-6 bg-gray-700/40 mx-2"></div>


                                    {/* Utilization Percentage */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-sm font-bold leading-none" style={{ color: getObligationColor(), fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {Math.round(obligationRate)}%
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Utilization
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Bottom Row: Timeline - Constrained to values box width */}
                          {relationship.earliestStart && relationship.latestEnd && (() => {
                            const today = new Date('2025-09-19');
                            const totalDuration = relationship.latestEnd.getTime() - relationship.earliestStart.getTime();
                            const elapsed = today.getTime() - relationship.earliestStart.getTime();
                            const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

                            return (
                              <div className="mr-15 space-y-2">
                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.max(progressPercent, 3)}%`,
                                      backgroundColor: progressPercent <= 25 ? '#15803d' : progressPercent <= 50 ? '#84cc16' : progressPercent <= 75 ? '#eab308' : '#dc2626'
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    <span className="text-gray-500">Performance Period:</span>
                                    <span className="ml-2">
                                      {relationship.earliestStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </span>
                                    <span className="mx-2">-</span>
                                    <span>
                                      {relationship.latestEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {Math.round(progressPercent)}% Elapsed
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Right Arrow - Opens Award Grain Popup */}
                        <div
                          className="absolute right-[10px] top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={(e) => openAwardGrain(relationship, e)}
                        >
                          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center hover:bg-gray-600/60 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {expandedRelationships.has(relationship.name) && (
                      <div className="border-t border-gray-700/30">
                        {relationship.contracts.map((contract: any) => renderContractDetails(contract))}
                      </div>
                    )}
                  </div>
                ))}


                {/* Prime Contractors Section */}
                {sortedInflowRelationships.primes.map((relationship) => (
                  <div key={relationship.name}
                       style={{ backgroundColor: '#03070F' }} className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group relative">
                    {/* Color accent bar like metric cards */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                         style={{ backgroundColor: '#22c55e' }} />

                    <div
                      className="p-2.5 transition-all"
                    >

                      {/* Redesigned Layout - Better Space Utilization */}
                      <div className="relative">
                        {/* Main content area */}
                        <div className="space-y-3">
                          {/* Layout with proper alignment */}
                          <div className="flex justify-between">
                            <div className="flex items-center flex-1">
                              {/* Name and Type */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="text-base text-white font-medium">
                                    {relationship.name}
                                  </div>
                                  <div className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wide ${
                                    relationship.type === 'agency'
                                      ? 'bg-[#9B7EBD]/20 border-[#9B7EBD]/40 text-[#9B7EBD]'
                                      : 'bg-[#5BC0EB]/20 border-[#5BC0EB]/40 text-[#5BC0EB]'
                                  }`}>
                                    {relationship.type === 'agency' ? 'Agency' : 'Prime'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Clean Financial Flow */}
                            <div className="flex items-center mr-15">
                              {(() => {
                                const awardedAmount = relationship.totalValue * 0.85;
                                const obligationRate = relationship.contracts.reduce((sum: number, contract: any) => sum + contract.utilization, 0) / relationship.contracts.length;
                                const obligatedAmount = awardedAmount * (obligationRate / 100);

                                // Color based on obligation level
                                const getObligationColor = () => {
                                  if (obligationRate <= 25) return '#15803d'; // Forest green
                                  if (obligationRate <= 50) return '#84cc16'; // Chartreuse
                                  if (obligationRate <= 75) return '#eab308'; // Yellow
                                  return '#dc2626'; // Red
                                };

                                return (
                                  <>
                                    {/* Lifetime */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-sm font-medium text-gray-500 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        ${(relationship.totalValue / 1000000).toFixed(0)}M
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Lifetime
                                      </div>
                                    </div>

                                    {/* Subtle Separator */}
                                    <div className="w-px h-6 bg-gray-700/40 mx-2"></div>

                                    {/* Awarded */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-base font-bold text-white leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        ${(awardedAmount / 1000000).toFixed(0)}M
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Active
                                      </div>
                                    </div>

                                    {/* Subtle Separator */}
                                    <div className="w-px h-6 bg-gray-700/40 mx-2"></div>


                                    {/* Utilization Percentage */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-sm font-bold leading-none" style={{ color: getObligationColor(), fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {Math.round(obligationRate)}%
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Utilization
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Bottom Row: Timeline - Constrained to values box width */}
                          {relationship.earliestStart && relationship.latestEnd && (() => {
                            const today = new Date('2025-09-19');
                            const totalDuration = relationship.latestEnd.getTime() - relationship.earliestStart.getTime();
                            const elapsed = today.getTime() - relationship.earliestStart.getTime();
                            const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

                            return (
                              <div className="mr-15 space-y-2">
                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.max(progressPercent, 3)}%`,
                                      backgroundColor: progressPercent <= 25 ? '#15803d' : progressPercent <= 50 ? '#84cc16' : progressPercent <= 75 ? '#eab308' : '#dc2626'
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    <span className="text-gray-500">Performance Period:</span>
                                    <span className="ml-2">
                                      {relationship.earliestStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </span>
                                    <span className="mx-2">-</span>
                                    <span>
                                      {relationship.latestEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {Math.round(progressPercent)}% Elapsed
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Right Arrow - Opens Award Grain Popup */}
                        <div
                          className="absolute right-[10px] top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={(e) => openAwardGrain(relationship, e)}
                        >
                          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center hover:bg-gray-600/60 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {expandedRelationships.has(relationship.name) && (
                      <div className="border-t border-gray-700/30">
                        {relationship.contracts.map((contract: any) => renderContractDetails(contract))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contract Outflows Container - Enhanced */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-700" style={{ backgroundColor: '#223040' }}>
            <div className="p-4">

              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  OUTFLOWS • {outflowRelationships.length}
                </h5>
              </div>

              <div className="space-y-2">
                {outflowRelationships.map((relationship) => (
                  <div key={relationship.name}
                       style={{ backgroundColor: '#03070F' }} className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group relative">
                    {/* Color accent bar like metric cards */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: '#FF4C4C' }} />

                    <div
                      className="p-2.5 transition-all"
                    >

                      {/* Redesigned Layout - Better Space Utilization */}
                      <div className="relative">
                        {/* Main content area */}
                        <div className="space-y-3">
                          {/* Layout with proper alignment */}
                          <div className="flex justify-between">
                            <div className="flex items-center flex-1">
                              {/* Name and Type */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="text-base text-white font-medium">
                                    {relationship.name}
                                  </div>
                                  <div className="px-1.5 py-0.5 rounded-full border bg-[#FF4C4C]/20 border-[#FF4C4C]/40 text-[#FF4C4C] text-[10px] font-medium uppercase tracking-wide">
                                    Sub
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Clean Financial Flow */}
                            <div className="flex items-center mr-15">
                              {(() => {
                                const awardedAmount = relationship.totalValue * 0.75;
                                const obligationRate = relationship.contracts.reduce((sum: number, contract: any) => sum + contract.utilization, 0) / relationship.contracts.length;
                                const obligatedAmount = awardedAmount * (obligationRate / 100);

                                // Color based on obligation level
                                const getObligationColor = () => {
                                  if (obligationRate <= 25) return '#15803d'; // Forest green
                                  if (obligationRate <= 50) return '#84cc16'; // Chartreuse
                                  if (obligationRate <= 75) return '#eab308'; // Yellow
                                  return '#dc2626'; // Red
                                };

                                return (
                                  <>
                                    {/* Lifetime */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-sm font-medium text-gray-500 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        ${(relationship.totalValue / 1000000).toFixed(0)}M
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Lifetime
                                      </div>
                                    </div>

                                    {/* Subtle Separator */}
                                    <div className="w-px h-6 bg-gray-700/40 mx-2"></div>

                                    {/* Awarded */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-base font-bold text-white leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        ${(awardedAmount / 1000000).toFixed(0)}M
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Active
                                      </div>
                                    </div>

                                    {/* Subtle Separator */}
                                    <div className="w-px h-6 bg-gray-700/40 mx-2"></div>


                                    {/* Utilization Percentage */}
                                    <div className="text-center" style={{ width: '65px' }}>
                                      <div className="text-sm font-bold leading-none" style={{ color: getObligationColor(), fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {Math.round(obligationRate)}%
                                      </div>
                                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                        Utilization
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Bottom Row: Timeline - Constrained to values box width */}
                          {relationship.earliestStart && relationship.latestEnd && (() => {
                            const today = new Date('2025-09-19');
                            const totalDuration = relationship.latestEnd.getTime() - relationship.earliestStart.getTime();
                            const elapsed = today.getTime() - relationship.earliestStart.getTime();
                            const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

                            return (
                              <div className="mr-15 space-y-2">
                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.max(progressPercent, 3)}%`,
                                      backgroundColor: progressPercent <= 25 ? '#15803d' : progressPercent <= 50 ? '#84cc16' : progressPercent <= 75 ? '#eab308' : '#dc2626'
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    <span className="text-gray-500">Performance Period:</span>
                                    <span className="ml-2">
                                      {relationship.earliestStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </span>
                                    <span className="mx-2">-</span>
                                    <span>
                                      {relationship.latestEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {Math.round(progressPercent)}% Elapsed
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Right Arrow - Opens Award Grain Popup */}
                        <div
                          className="absolute right-[10px] top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={(e) => openAwardGrain(relationship, e)}
                        >
                          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center hover:bg-gray-600/60 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {expandedRelationships.has(relationship.name) && (
                      <div className="border-t border-gray-700/30">
                        {relationship.contracts.map((contract: any) => renderContractDetails(contract))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
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