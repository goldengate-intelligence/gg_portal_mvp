import React, { useState } from 'react';
import { Plane, Shield, Factory, Building, Truck, Zap, Pin } from 'lucide-react';
import { useAgentChatContext } from '../../contexts/agent-chat-context';
import { FileUploadModal } from './FileUploadModal';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { getContractorMetrics, getContractorMetricsByName, getDefaultMetrics } from './services/contractorMetrics';
import { getIndustryImage, getIndustryTag } from './logic/industryClassification';
import { getContractorLogo } from '../contractor-detail/services/contractorLogoService';

interface AssetCardProps {
  companyName: string;
  companyImage?: string;
  naicsDescription: string;
  marketType: 'civilian' | 'defense';
  uei: string;
  activeAwards: {
    value: string;
  };
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
  onGroupDrop?: (draggedAssetId: string, targetAssetId: string) => void;
  isGrouped?: boolean;
  groupMembers?: string[];
  isGroupExpanded?: boolean;
  onGroupToggle?: () => void;
  isDraggedOver?: boolean;
  isPinned?: boolean;
  onPin?: (uei: string) => void;
  aggregatedMetrics?: {
    lifetime: string;
    revenue: string;
    pipeline: string;
  };
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onRemove?: (uei: string) => void;
  onInsertionHover?: (type: 'before' | 'after' | 'group') => void;
  onInsertionDrop?: (type: 'before' | 'after') => void;
}

// Industry classification now handled by centralized service

export function AssetCardNew({
  companyName,
  companyImage,
  naicsDescription,
  marketType,
  uei,
  activeAwards,
  onClick,
  onDragStart,
  onDragEnd,
  onDrop,
  onGroupDrop,
  isGrouped = false,
  groupMembers = [],
  isGroupExpanded = false,
  onGroupToggle,
  isDraggedOver = false,
  isPinned = false,
  onPin,
  aggregatedMetrics,
  isExpanded = false,
  onToggleExpanded,
  onRemove,
  onInsertionHover,
  onInsertionDrop
}: AssetCardProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const { openWithContext } = useAgentChatContext();
  const industryImageSrc = getIndustryImage(companyName, naicsDescription);
  const primaryIndustryTag = getIndustryTag(companyName, naicsDescription);

  // Generate dynamic company initials and colors
  const getCompanyInitials = (name: string) => {
    if (name.includes('Trio')) return 'TFL';
    if (name.includes('Raytheon')) return 'RTX';
    if (name.includes('BAE')) return 'BAE';
    if (name.includes('Applied')) return 'ACI';
    if (name.includes('MedStar')) return 'MSF';
    if (name.includes('InfoTech')) return 'ITC';
    if (name.includes('GreenPoint')) return 'GCE';
    if (name.includes('QuantumShield')) return 'QSL';
    if (name.includes('NextGen')) return 'NGE';
    // For groups, create abbreviation from group name
    if (isGrouped) {
      return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .slice(0, 3)
        .toUpperCase();
    }
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 3);
  };

  const getCardTheme = (name: string) => {
    // Special theme for grouped assets
    if (isGrouped) {
      return {
        accent: '#8B8EFF',
        progress: 'from-[#8B8EFF] to-purple-400',
        fill: '95%'
      };
    }

    if (name.includes('Trio')) return {
      accent: '#D2AC38',
      progress: 'from-[#D2AC38] to-green-400',
      fill: '75%'
    };
    if (name.includes('Raytheon')) return {
      accent: '#3B82F6',
      progress: 'from-blue-500 to-purple-500',
      fill: '90%'
    };
    if (name.includes('BAE')) return {
      accent: '#EF4444',
      progress: 'from-red-500 to-orange-500',
      fill: '85%'
    };
    if (name.includes('Applied')) return {
      accent: '#10B981',
      progress: 'from-emerald-500 to-teal-500',
      fill: '60%'
    };
    if (name.includes('MedStar')) return {
      accent: '#F59E0B',
      progress: 'from-amber-500 to-orange-500',
      fill: '80%'
    };
    if (name.includes('InfoTech')) return {
      accent: '#8B5CF6',
      progress: 'from-violet-500 to-purple-500',
      fill: '65%'
    };
    if (name.includes('GreenPoint')) return {
      accent: '#059669',
      progress: 'from-emerald-600 to-green-500',
      fill: '70%'
    };
    if (name.includes('QuantumShield')) return {
      accent: '#DC2626',
      progress: 'from-red-600 to-rose-500',
      fill: '55%'
    };
    if (name.includes('NextGen')) return {
      accent: '#0891B2',
      progress: 'from-cyan-600 to-blue-500',
      fill: '45%'
    };
    return {
      accent: '#6B7280',
      progress: 'from-gray-500 to-slate-500',
      fill: '50%'
    };
  };

  const getContractorFinancialMetrics = (uei: string, companyName: string) => {
    // First try to get metrics by UEI
    let contractorMetrics = getContractorMetrics(uei);

    // If not found by UEI, try by company name
    if (!contractorMetrics) {
      contractorMetrics = getContractorMetricsByName(companyName);
    }

    // If still not found, use default metrics
    if (!contractorMetrics) {
      contractorMetrics = getDefaultMetrics(uei, companyName);
    }

    return {
      revenue: contractorMetrics.revenue,
      lifetime: contractorMetrics.lifetimeAwards,
      pipeline: contractorMetrics.pipeline
    };
  };

  const contractorLogo = getContractorLogo(uei);

  const initials = getCompanyInitials(companyName);
  const theme = getCardTheme(companyName);
  const metrics = aggregatedMetrics || getContractorFinancialMetrics(uei, companyName);

  // Check if this is a defense contractor by getting contractor details
  const contractorMetrics = getContractorMetrics(uei) || getContractorMetricsByName(companyName);
  const isDefenseContractor = contractorMetrics?.primaryAgency?.toLowerCase().includes('defense') ||
                             contractorMetrics?.primaryAgency?.toLowerCase().includes('dod') ||
                             contractorMetrics?.primaryAgency === 'Department of Defense';

  // Dynamic card layout with collapsible content
  const isModalOpen = isFileUploadOpen || isKnowledgeBaseOpen;

  return (
    <div
      className={`border ${isExpanded ? 'rounded-xl' : 'rounded-xl'} cursor-pointer overflow-visible relative ${
        isModalOpen ? '' : 'transform hover:scale-[1.02] hover:shadow-xl transition-transform duration-300 ease-in-out'
      } ${
        isDraggedOver
          ? 'bg-black/40 border-[#D2AC38] hover:border-[#D2AC38]/90 shadow-lg shadow-[#D2AC38]/20'
          : isGrouped
            ? `bg-black/40 border-[#8B8EFF]/50 ${isModalOpen ? '' : 'hover:border-[#8B8EFF]/90 hover:shadow-lg hover:shadow-[#8B8EFF]/20'}`
            : `bg-black/40 border-[#F97316]/40 ${isModalOpen ? '' : 'hover:border-[#F97316]/90 hover:shadow-lg hover:shadow-[#F97316]/20'}`
      }`}
      style={{
        width: '100%',
        height: isExpanded ? '220px' : '112px'
      }}
      draggable={true}
      onClick={(e) => {
        // Only toggle if not clicking on action buttons or drag handles
        if (!e.defaultPrevented && onToggleExpanded) {
          e.preventDefault();
          e.stopPropagation();
          onToggleExpanded();
        }
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          companyName,
          uei,
          marketType,
          naicsDescription
        }));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
        if (onDragStart) onDragStart();
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
        if (onDragEnd) onDragEnd();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Get mouse position relative to card
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const cardHeight = rect.height;
        const topQuarter = cardHeight * 0.25;
        const bottomQuarter = cardHeight * 0.75;

        // Clear any existing insertion indicators
        if (onInsertionHover) {
          if (mouseY < topQuarter) {
            // Top quarter - show insertion line above this card
            onInsertionHover('before');
          } else if (mouseY > bottomQuarter) {
            // Bottom quarter - show insertion line below this card
            onInsertionHover('after');
          } else {
            // Middle half - show grouping highlight
            onInsertionHover('group');
            e.currentTarget.style.borderColor = '#D2AC38';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(210, 172, 56, 0.3)';
          }
        } else {
          // Fallback to grouping if no insertion handler
          e.currentTarget.style.borderColor = '#D2AC38';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(210, 172, 56, 0.3)';
        }
      }}
      onDragLeave={(e) => {
        // Remove any visual indicators when drag leaves
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
        if (onInsertionHover) {
          onInsertionHover('group'); // Clear insertion indicators
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        // Clean up visual indicators
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
        if (onInsertionHover) {
          onInsertionHover('group'); // Clear insertion indicators
        }

        try {
          const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
          const draggedAssetId = draggedData.uei;
          const targetAssetId = uei;

          if (draggedAssetId !== targetAssetId) {
            // Get mouse position to determine drop type
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            const cardHeight = rect.height;
            const topQuarter = cardHeight * 0.25;
            const bottomQuarter = cardHeight * 0.75;

            if (mouseY < topQuarter && onInsertionDrop) {
              // Drop above this card (reorder)
              onInsertionDrop('before');
            } else if (mouseY > bottomQuarter && onInsertionDrop) {
              // Drop below this card (reorder)
              onInsertionDrop('after');
            } else if (onGroupDrop) {
              // Drop in middle (group)
              onGroupDrop(draggedAssetId, targetAssetId);
            }
          } else {
            if (onDrop) onDrop();
          }
        } catch (error) {
          console.error('Error parsing drag data:', error);
          if (onDrop) onDrop();
        }
      }}
    >

      {/* Header Section */}
      <div className={`relative h-28 ${
        isExpanded ? 'rounded-t-xl' : 'rounded-xl'
      }`}>
        <div className={`absolute inset-0.5 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/50 transition-all duration-300 ${
          isExpanded ? 'rounded-t-xl' : 'rounded-xl'
        }`}></div>
        <div className="relative z-10 p-4 h-full">
        {/* Company Logo & Info */}
        <div className="flex items-start justify-between h-full">
          {/* Logo Square */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#D2AC38]/10 via-transparent to-[#D2AC38]/5 rounded-lg border-2 border-[#D2AC38]/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden mr-4 transition-all duration-300 hover:border-[#D2AC38]/60 hover:from-[#D2AC38]/15 hover:to-[#D2AC38]/8">
            {contractorLogo ? (
              <img
                src={contractorLogo}
                alt={`${companyName} logo`}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  // Fallback to initials if logo fails to load
                  e.currentTarget.style.display = 'none';
                  const initialsElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (initialsElement) {
                    initialsElement.style.display = 'block';
                  }
                }}
              />
            ) : null}
            {/* Company initials - shown by default or as fallback */}
            <span
              className="text-[#D2AC38] text-lg font-bold uppercase"
              style={{
                fontFamily: 'Michroma, sans-serif',
                display: contractorLogo ? 'none' : 'block'
              }}
            >
              {initials}
            </span>
          </div>

          {/* Company Info */}
          <div className="flex flex-col justify-start h-20 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0">
                <h3
                  className="text-white leading-tight hover:text-[#D2AC38] transition-colors duration-300 cursor-pointer uppercase mb-0"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '300', fontSize: '24px' }}
                  draggable={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onClick) onClick();
                  }}
                >
                  {companyName.split(' ').slice(0, 2).join(' ')}
                </h3>
                {isPinned && (
                  <Pin className="w-4 h-4 text-orange-400 fill-orange-400/20" />
                )}
                {isGrouped && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 bg-[#8B8EFF]/20 border border-[#8B8EFF]/40 rounded-full cursor-pointer hover:bg-[#8B8EFF]/30 transition-all duration-300 hover:scale-105 hover:border-[#8B8EFF]/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (onGroupToggle) onGroupToggle();
                    }}
                  >
                    <svg className="w-4 h-4 text-[#8B8EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-[#8B8EFF] text-xs font-medium">
                      {groupMembers.length}
                    </span>
                  </div>
                )}
              </div>

              {/* UEI and NAICS Text (no bubble) */}
              <div className="uppercase tracking-wide">
                {isGrouped ? (
                  <span className="font-medium text-gray-300 text-xs">{groupMembers.length} Entities</span>
                ) : (
                  <>
                    <div className="font-medium text-gray-300/80 text-sm tracking-wider">{uei}</div>
                    <div className="flex items-center justify-between">
                      <div className="font-normal text-[#F97316]/90 text-xs">
                        {(() => {
                          // Generate award count based on contractor metrics or default
                          const awards = contractorMetrics?.contractCount || Math.floor(Math.random() * 5) + 2; // 2-6 awards

                          // Generate work summary based on NAICS
                          const getWorkSummary = () => {
                            if (naicsDescription.toLowerCase().includes('aircraft') || naicsDescription.toLowerCase().includes('aerospace')) return 'Aerospace & Defense';
                            if (naicsDescription.toLowerCase().includes('manufacturing') || naicsDescription.toLowerCase().includes('fabricat')) return 'Manufacturing & Fabrication';
                            if (naicsDescription.toLowerCase().includes('engineering') || naicsDescription.toLowerCase().includes('professional')) return 'Professional Services';
                            if (naicsDescription.toLowerCase().includes('construction') || naicsDescription.toLowerCase().includes('building')) return 'Construction Services';
                            if (naicsDescription.toLowerCase().includes('technology') || naicsDescription.toLowerCase().includes('computer')) return 'Technology & Electronics';
                            if (naicsDescription.toLowerCase().includes('research') || naicsDescription.toLowerCase().includes('development')) return 'Research & Development';
                            return 'Multi-sector Operations';
                          };

                          return `${awards} Active Award${awards !== 1 ? 's' : ''} • ${getWorkSummary()}`;
                        })()}
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs transition-all duration-300 hover:scale-105 ${isDefenseContractor ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300' : 'text-teal-400 bg-teal-400/10 hover:bg-teal-400/20 hover:text-teal-300'}`}>
                        {isDefenseContractor ? 'DEFENSE' : 'CIVILIAN'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* Action Icons - Upper Right Corner */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          {/* Action Icons Row - unified bubble container */}
          <div className={`flex items-center px-3 py-1 bg-gray-600/20 border border-gray-600/40 rounded-full gap-2 transition-all duration-200 ${
            isModalOpen ? '' : 'hover:bg-gray-600/30 hover:border-gray-600/60'
          }`}>
                {/* Expand/Collapse Indicator */}
                <div
                  className="relative"
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip('expand');
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip(null);
                  }}
                >
                  <div
                    className={`p-0.5 rounded cursor-pointer ${
                      isModalOpen ? '' : 'hover:bg-[#D2AC38]/30 hover:scale-110 transition-all duration-300'
                    } ${
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveTooltip(null);
                      if (onToggleExpanded) onToggleExpanded();
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
                  </div>
                  {activeTooltip === 'expand' && !isModalOpen && (
                    <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, top: isExpanded ? 'calc(100% + 8px)' : 'auto', bottom: isExpanded ? 'auto' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}>
                      {isExpanded ? 'Collapse details' : 'Expand details'}
                    </div>
                  )}
                </div>
                {/* Smart Research/Lightbulb Icon */}
                <div
                  className={`p-0.5 rounded cursor-pointer relative ${
                    isModalOpen ? '' : 'hover:bg-purple-500/30 hover:scale-110 transition-all duration-300'
                  }`}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip('smart-research');
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveTooltip(null);
                    openWithContext(uei, companyName, 'contractor');
                  }}
                >
                  <svg className="w-4 h-4 text-purple-400 hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth={2}/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M8 11h6m-3-3v6"/>
                  </svg>
                  {activeTooltip === 'smart-research' && !isModalOpen && (
                    <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}>
                      AI engages context-driven research
                    </div>
                  )}
                </div>

                {/* Document Attachment Icon */}
                <div
                  className={`p-0.5 rounded cursor-pointer relative ${
                    isModalOpen ? '' : 'hover:bg-cyan-500/30 hover:scale-110 transition-all duration-300'
                  }`}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip('attach');
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveTooltip(null);
                    setIsFileUploadOpen(true);
                  }}
                >
                  <svg className="w-4 h-4 text-cyan-400 hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {activeTooltip === 'attach' && !isModalOpen && (
                    <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}>
                      Attach documents for your knowledge base
                    </div>
                  )}
                </div>

                {/* Document Manager/Folder */}
                <div
                  className={`p-0.5 rounded cursor-pointer relative ${
                    isModalOpen ? '' : 'hover:bg-teal-500/30 hover:scale-110 transition-all duration-300'
                  }`}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip('folder');
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveTooltip(null);
                    setIsKnowledgeBaseOpen(true);
                  }}
                >
                  <svg className="w-4 h-4 text-teal-400 hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {activeTooltip === 'folder' && !isModalOpen && (
                    <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', right: '0', transform: 'translateX(0)' }}>
                      View contents of your knowledge base
                    </div>
                  )}
                </div>

                {/* Pin to Top */}
                <div
                  className={`p-0.5 rounded cursor-pointer relative ${
                    isModalOpen ? '' : 'hover:bg-orange-500/30 hover:scale-110 transition-all duration-300'
                  } ${
                    isPinned ? 'text-orange-300' : 'text-orange-400'
                  }`}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip('pin');
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    if (!isModalOpen) setActiveTooltip(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveTooltip(null);
                    if (onPin) onPin(uei);
                  }}
                >
                  <Pin className={`w-4 h-4 hover:text-orange-300 transition-colors ${
                    isPinned ? 'fill-orange-400/50' : ''
                  }`} />
                  {activeTooltip === 'pin' && !isModalOpen && (
                    <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', right: '0', transform: 'translateX(0)' }}>
                      {isPinned ? 'Unpin this entity' : 'Pin this entity'}
                    </div>
                  )}
                </div>

          </div>

        </div>

         {/* Content Section - Collapsible */}
         {isExpanded && (
           <div className="relative z-10 p-4">
             {/* Financial Metrics Grid - NO ICONS */}
             <div className="grid grid-cols-4 gap-4">
               <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                 <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Lifetime Awards</span>
                 <span className="font-bold text-xl block" style={{ color: '#F97316' }}>{metrics.lifetime}</span>
               </div>
               <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                 <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Active Awards</span>
                 <span className="font-bold text-xl block" style={{ color: '#FFB84D' }}>{activeAwards.value}</span>
               </div>
               <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                 <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Revenue (TTM)</span>
                 <span className="font-bold text-xl block" style={{ color: '#42D4F4' }}>{metrics.revenue}</span>
               </div>
               <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
                 <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Pipeline</span>
                 <span className="font-bold text-xl block" style={{ color: '#8B8EFF' }}>{metrics.pipeline}</span>
               </div>
             </div>
           </div>
         )}

         {/* File Upload Modal */}
         <FileUploadModal
           isOpen={isFileUploadOpen}
           onClose={() => setIsFileUploadOpen(false)}
           entityId={uei}
           entityName={companyName}
           entityType="contractor"
         />

         {/* Knowledge Base Modal */}
         <KnowledgeBaseModal
           isOpen={isKnowledgeBaseOpen}
           onClose={() => setIsKnowledgeBaseOpen(false)}
           entityId={uei}
           entityName={companyName}
           entityType="contractor"
         />
     </div>
  );
}