import React, { useState } from 'react';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../../../logic/utils';
import { Activity, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, Hash, Building2, Users, Shield } from 'lucide-react';
import { AwardGrainPopup } from './AwardGrainPopup';
import { EventsListPopup } from './EventsListPopup';
import { EventsDetailView } from './EventsDetailView';

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
  const [showEventsDetail, setShowEventsDetail] = useState(false);
  const [eventsDetailRelationship, setEventsDetailRelationship] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState(new Set<string>());

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
      client: 'MegaCorp Industries Corporation',
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
      subTo: 'MegaCorp Industries Corporation'
    },
    {
      parentAward: 'GD-2023-SUB-0789',
      id: 'GD-SUB-0789',
      role: 'sub',
      client: 'Global Defense Systems LLC',
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
      subTo: 'Global Defense Systems LLC'
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
      client: 'Beta Technologies Incorporated',
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

  // Events detail view handlers
  const openEventsDetail = (relationship: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent toggle from firing
    setEventsDetailRelationship(relationship);
    setShowEventsDetail(true);
  };

  const closeEventsDetail = () => {
    setShowEventsDetail(false);
    setEventsDetailRelationship(null);
  };

  // Card expansion handlers
  const toggleCardExpansion = (relationshipName: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(relationshipName)) {
      newExpanded.delete(relationshipName);
    } else {
      newExpanded.add(relationshipName);
    }
    setExpandedCards(newExpanded);
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

  // New relationship card component following asset card pattern
  const renderRelationshipCard = (relationship: any, type: 'inflow' | 'outflow') => {
    const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
    const isExpanded = expandedCards.has(relationship.name);
    const accentColor = type === 'inflow' ? '#10B981' : '#FF4C4C';

    // Calculate metrics similar to asset cards
    const awardedAmount = relationship.totalValue * (type === 'inflow' ? 0.85 : 0.75);
    const obligationRate = relationship.contracts.reduce((sum: number, contract: any) => sum + contract.utilization, 0) / relationship.contracts.length;
    const obligatedAmount = awardedAmount * (obligationRate / 100);

    // Get type badge info
    const getTypeInfo = () => {
      if (relationship.type === 'agency') return { label: 'AGENCY', color: '#9B7EBD' };
      if (relationship.type === 'prime') return { label: 'PRIME', color: '#5BC0EB' };
      return { label: 'SUB', color: '#FF4C4C' };
    };

    const typeInfo = getTypeInfo();

    // Generate initials for the relationship
    const getRelationshipInitials = (name: string) => {
      return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 3).toUpperCase();
    };

    const initials = getRelationshipInitials(relationship.name);

    return (
      <div
        key={relationship.name}
        className={`border ${isExpanded ? 'rounded-xl' : 'rounded-xl'} cursor-pointer overflow-visible relative bg-black/40`}
        style={{
          height: isExpanded ? '220px' : '112px',
          borderColor: accentColor + '50',
          boxShadow: `0 0 0 1px ${accentColor}40`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${accentColor}90, 0 10px 15px -3px ${accentColor}20, 0 4px 6px -2px ${accentColor}10`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${accentColor}40`;
        }}
        onClick={() => toggleCardExpansion(relationship.name)}
      >
        {/* Header Section */}
        <div className={`relative h-28 ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}>
          <div className={`absolute inset-0.5 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/50 transition-all duration-300 ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}></div>
          <div className="relative z-10 p-4 h-full">
            {/* Company Info */}
            <div className="flex items-start justify-between h-full">
              {/* Logo Square */}
              <div
                className="w-20 h-20 bg-gradient-to-br from-[#D2AC38]/10 via-transparent to-[#D2AC38]/5 rounded-lg border-2 border-[#D2AC38]/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden mr-4 transition-all duration-300 hover:border-[#D2AC38]/60 hover:from-[#D2AC38]/15 hover:to-[#D2AC38]/8"
              >
                {/* Company initials */}
                <span
                  className="text-[#D2AC38] text-lg font-bold uppercase"
                  style={{
                    fontFamily: 'Michroma, sans-serif'
                  }}
                >
                  {initials}
                </span>
              </div>

              {/* Left side - Company name and basic info */}
              <div className="flex flex-col justify-start h-20 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0">
                  <h3
                    className={`text-white leading-tight uppercase mb-0 transition-colors duration-300 ${
                      relationship.type === 'agency'
                        ? 'cursor-default'
                        : 'hover:text-[#D2AC38] cursor-pointer'
                    }`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '300', fontSize: '24px' }}
                    onClick={(e) => {
                      if (relationship.type !== 'agency') {
                        e.stopPropagation();
                        // Navigate to contractor profile (would go here for non-agencies)
                      }
                    }}
                  >
                    {relationship.name}
                  </h3>
                </div>

                {/* UEI/Agency Info and Type Badge */}
                <div className="uppercase tracking-wide">
                  {(() => {
                    // Generate UEI or agency identifier
                    const getEntityIdentifier = () => {
                      if (relationship.type === 'agency') {
                        // For agencies, use agency code or department abbreviation
                        if (relationship.name.includes('Defense')) return 'DOD-AGENCY';
                        if (relationship.name.includes('Corps')) return 'USACE-AGENCY';
                        if (relationship.name.includes('Navy')) return 'NAVY-AGENCY';
                        if (relationship.name.includes('Air Force')) return 'USAF-AGENCY';
                        if (relationship.name.includes('Army')) return 'ARMY-AGENCY';
                        return 'GOV-AGENCY';
                      } else {
                        // For companies, generate a mock UEI
                        const nameHash = relationship.name.split('').reduce((a, b) => {
                          a = ((a << 5) - a) + b.charCodeAt(0);
                          return a & a;
                        }, 0);
                        const ueiSuffix = Math.abs(nameHash).toString().slice(0, 9).padStart(9, '0');
                        return `W${ueiSuffix}`;
                      }
                    };

                    const getWorkSummary = () => {
                      // Analyze contract types to determine work summary
                      const naicsCodes = relationship.contracts.map((c: any) => c.naics);
                      const primaryNaics = naicsCodes[0];

                      if (primaryNaics?.startsWith('332')) return 'Manufacturing & Fabrication';
                      if (primaryNaics?.startsWith('541')) return 'Professional Services';
                      if (primaryNaics?.startsWith('336')) return 'Aerospace & Defense';
                      if (primaryNaics?.startsWith('238')) return 'Construction Services';
                      if (primaryNaics?.startsWith('334')) return 'Technology & Electronics';
                      return 'Multi-sector Operations';
                    };

                    return (
                      <div className="font-medium text-gray-300/80 text-sm tracking-wider">
                        {getEntityIdentifier()}
                      </div>
                    );
                  })()}
                  <div className="flex items-center justify-between">
                    <div className="font-normal text-[#F97316]/90 text-xs">
                      {relationship.contracts.length} Contract{relationship.contracts.length !== 1 ? 's' : ''} • {(() => {
                        // Generate work summary
                        const naicsCodes = relationship.contracts.map((c: any) => c.naics);
                        const primaryNaics = naicsCodes[0];

                        if (primaryNaics?.startsWith('332')) return 'Manufacturing & Fabrication';
                        if (primaryNaics?.startsWith('541')) return 'Professional Services';
                        if (primaryNaics?.startsWith('336')) return 'Aerospace & Defense';
                        if (primaryNaics?.startsWith('238')) return 'Construction Services';
                        if (primaryNaics?.startsWith('334')) return 'Technology & Electronics';
                        return 'Multi-sector Operations';
                      })()}
                    </div>
                    <div
                      className="px-2 py-0.5 rounded-full text-xs transition-all duration-300 hover:scale-105"
                      style={{
                        color: typeInfo.color,
                        backgroundColor: `${typeInfo.color}10`,
                        border: `1px solid ${typeInfo.color}40`
                      }}
                    >
                      {typeInfo.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Icons - Upper Right Corner */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          {/* Action Icons Row - unified bubble container */}
          <div className="flex items-center px-3 py-1 bg-gray-600/20 border border-gray-600/40 rounded-full gap-2 transition-all duration-200 hover:bg-gray-600/30 hover:border-gray-600/60">
            {/* Expand/Collapse Indicator */}
            <div
              className={`p-0.5 rounded cursor-pointer relative hover:bg-[#D2AC38]/30 hover:scale-110 transition-all duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setActiveTooltip('expand');
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setActiveTooltip(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveTooltip(null);
                toggleCardExpansion(relationship.name);
              }}
            >
              <svg
                className="w-4 h-4 text-[#D2AC38] hover:text-[#D2AC38]/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {activeTooltip === 'expand' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap z-[200]">
                  {isExpanded ? 'Collapse details' : 'Expand details'}
                </div>
              )}
            </div>

            {/* Smart Research/Lightbulb Icon */}
            <div
              className="p-0.5 rounded cursor-pointer relative hover:bg-purple-500/30 hover:scale-110 transition-all duration-300"
              onMouseEnter={(e) => {
                e.stopPropagation();
                setActiveTooltip('smart-research');
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setActiveTooltip(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveTooltip(null);
                // openWithContext functionality would go here
              }}
            >
              <svg className="w-4 h-4 text-purple-400 hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth={2}/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M8 11h6m-3-3v6"/>
              </svg>
              {activeTooltip === 'smart-research' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap z-[200]">
                  AI engages context-driven research
                </div>
              )}
            </div>

            {/* Document Attachment Icon */}
            <div
              className="p-0.5 rounded cursor-pointer relative hover:bg-cyan-500/30 hover:scale-110 transition-all duration-300"
              onMouseEnter={(e) => {
                e.stopPropagation();
                setActiveTooltip('attach');
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setActiveTooltip(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveTooltip(null);
                // File upload functionality would go here
              }}
            >
              <svg className="w-4 h-4 text-cyan-400 hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {activeTooltip === 'attach' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap z-[200]">
                  Attach documents for your knowledge base
                </div>
              )}
            </div>

            {/* Document Manager/Folder */}
            <div
              className="p-0.5 rounded cursor-pointer relative hover:bg-teal-500/30 hover:scale-110 transition-all duration-300"
              onMouseEnter={(e) => {
                e.stopPropagation();
                setActiveTooltip('folder');
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setActiveTooltip(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveTooltip(null);
                // Knowledge base functionality would go here
              }}
            >
              <svg className="w-4 h-4 text-teal-400 hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {activeTooltip === 'folder' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap z-[200]">
                  View contents of your knowledge base
                </div>
              )}
            </div>

            {/* Award Grain - Go Deeper */}
            <div
              className="p-0.5 rounded cursor-pointer relative hover:bg-orange-500/30 hover:scale-110 transition-all duration-300"
              onMouseEnter={(e) => {
                e.stopPropagation();
                setActiveTooltip('award-grain');
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setActiveTooltip(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveTooltip(null);
                openEventsDetail(relationship, e);
              }}
            >
              <svg
                className="w-4 h-4 text-orange-500 hover:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  animation: 'dramaticGlow 3s ease-in-out infinite alternate'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {activeTooltip === 'award-grain' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap z-[200]">
                  View award details
                </div>
              )}
            </div>

            <style jsx>{`
              @keyframes dramaticGlow {
                0% {
                  filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.3));
                  transform: scale(1);
                }
                50% {
                  filter: drop-shadow(0 0 16px rgba(249, 115, 22, 1)) drop-shadow(0 0 24px rgba(249, 115, 22, 0.8));
                  transform: scale(1.05);
                }
                100% {
                  filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.3));
                  transform: scale(1);
                }
              }
            `}</style>

          </div>
        </div>

        {/* Expanded Content Section */}
        {isExpanded && (
          <div className="relative z-10 p-4">
            {/* Financial Metrics Grid - Following asset card pattern */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Lifetime</span>
                <span className="font-bold text-xl block" style={{ color: '#F97316' }}>${(relationship.totalValue / 1000000).toFixed(0)}M</span>
              </div>
              <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Active</span>
                <span className="font-bold text-xl block" style={{ color: '#FFB84D' }}>${(awardedAmount / 1000000).toFixed(0)}M</span>
              </div>
              <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Obligations</span>
                <span className="font-bold text-xl block" style={{ color: '#10B981' }}>${(obligatedAmount / 1000000).toFixed(0)}M</span>
              </div>
              <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Utilization</span>
                <span className="font-bold text-xl block" style={{
                  color: obligationRate <= 25 ? '#10B981' : obligationRate <= 50 ? '#84cc16' : obligationRate <= 75 ? '#eab308' : '#dc2626'
                }}>{Math.round(obligationRate)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
      return '#10B981'; // Emerald green
    };

    // Utilization color (inverted - 0% is green, 100% is red)
    const getUtilizationColor = () => {
      const util = Math.min(100, contract.utilization);
      if (util <= 25) return '#10B981'; // Emerald green
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
              <div className="text-[20px] font-bold" style={{ color: '#10B981' }}>
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

  // If showing events detail, render that view instead
  if (showEventsDetail && eventsDetailRelationship) {
    return (
      <EventsDetailView
        relationship={eventsDetailRelationship}
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
          {/* Contract Inflows Container - Enhanced */}
          <div className="flex-1 overflow-visible rounded-xl border border-gray-700" style={{ backgroundColor: '#223040' }}>
            <div className="p-4">

              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  INFLOWS • {inflowRelationships.length}
                </h5>
              </div>

              <div className="space-y-2">
                {/* Agencies Section */}
                {sortedInflowRelationships.agencies.map((relationship) =>
                  renderRelationshipCard(relationship, 'inflow')
                )}


                {/* Prime Contractors Section */}
                {sortedInflowRelationships.primes.map((relationship) =>
                  renderRelationshipCard(relationship, 'inflow')
                )}
              </div>
            </div>
          </div>

          {/* Contract Outflows Container - Enhanced */}
          <div className="flex-1 overflow-visible rounded-xl border border-gray-700" style={{ backgroundColor: '#223040' }}>
            <div className="p-4">

              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  OUTFLOWS • {outflowRelationships.length}
                </h5>
              </div>

              <div className="space-y-2">
                {outflowRelationships.map((relationship) =>
                  renderRelationshipCard(relationship, 'outflow')
                )}
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