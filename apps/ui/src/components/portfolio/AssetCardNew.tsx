import React, { useState } from 'react';
import { Plane, Shield, Factory, Building, Truck, Zap, Pin } from 'lucide-react';
import { useAgentChatContext } from '../../contexts/agent-chat-context';
import { FileUploadModal } from './FileUploadModal';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { getContractorMetrics, getContractorMetricsByName, getDefaultMetrics } from './services/contractorMetrics';
import { getIndustryImage, getIndustryTag } from './logic/industryClassification';

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
  onToggleExpanded
}: AssetCardProps) {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
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

  const initials = getCompanyInitials(companyName);
  const theme = getCardTheme(companyName);
  const metrics = aggregatedMetrics || getContractorFinancialMetrics(uei, companyName);

  // Check if this is a defense contractor by getting contractor details
  const contractorMetrics = getContractorMetrics(uei) || getContractorMetricsByName(companyName);
  const isDefenseContractor = contractorMetrics?.primaryAgency?.toLowerCase().includes('defense') ||
                             contractorMetrics?.primaryAgency?.toLowerCase().includes('dod') ||
                             contractorMetrics?.primaryAgency === 'Department of Defense';

  // Dynamic card layout with collapsible content
  return (
    <div
      className={`border ${isExpanded ? 'rounded-xl' : 'rounded-xl'} cursor-pointer overflow-visible relative ${
        isDraggedOver
          ? 'bg-black/40 border-[#D2AC38] hover:border-[#D2AC38]/90'
          : isGrouped
            ? 'bg-black/40 border-[#8B8EFF]/50 hover:border-[#8B8EFF]/90'
            : 'bg-black/40 border-[#F97316]/40 hover:border-[#F97316]/90'
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
      }}
      onDragLeave={(e) => {
        // Remove any visual indicators when drag leaves
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
          const draggedAssetId = draggedData.uei;
          const targetAssetId = uei;

          if (draggedAssetId !== targetAssetId) {
            if (onGroupDrop) {
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
        <div className={`absolute inset-0.5 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/50 ${
          isExpanded ? 'rounded-t-xl' : 'rounded-xl'
        }`}></div>
        <div className="relative z-10 p-4 h-full">
        {/* Company Logo & Info */}
        <div className="flex items-start justify-between h-full">
          <div className="flex items-start gap-4">
            {/* Logo Square */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#D2AC38]/10 via-transparent to-[#D2AC38]/5 rounded-lg border-2 border-[#D2AC38]/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              {/* Company initials */}
              <span className="text-[#D2AC38] text-lg font-bold uppercase" style={{ fontFamily: 'Michroma, sans-serif' }}>
                {initials}
              </span>
            </div>

            {/* Company Info */}
            <div className="flex flex-col justify-start h-20">
              <div className="flex items-center gap-2 mb-0">
                <h3
                  className="text-white leading-tight hover:text-[#D2AC38] transition-colors cursor-pointer uppercase mb-0"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '250', fontSize: '24px' }}
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
                    className="flex items-center gap-1 px-2 py-1 bg-[#8B8EFF]/20 border border-[#8B8EFF]/40 rounded-full cursor-pointer hover:bg-[#8B8EFF]/30 transition-colors"
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
              <span className="text-gray-300 text-xs uppercase tracking-wide font-medium">
                {isGrouped ? `${groupMembers.length} Entities` : `${uei} • ${naicsDescription}`}
              </span>
            </div>
          </div>

          {/* Right Side - Action Icons and Image */}
          <div className="flex items-start gap-3">
            {/* Action Icons - mirror left side structure */}
            <div className="flex flex-col justify-start h-20">
              {/* Action Icons Row - unified bubble container */}
              <div className="flex items-center px-3 py-1 bg-gray-600/20 border border-gray-600/40 rounded-full gap-2">
                {/* Expand/Collapse Indicator */}
                <div
                  className={`p-0.5 hover:bg-[#D2AC38]/30 rounded transition-all cursor-pointer relative ${
                    isExpanded ? 'rotate-180' : 'rotate-0'
                  }`}
                  onMouseEnter={() => setActiveTooltip('expand')}
                  onMouseLeave={() => setActiveTooltip(null)}
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
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
                      {isExpanded ? 'Collapse details' : 'Expand details'}
                    </div>
                  )}
                </div>
                {/* Notes Icon - First */}
                <div
                  className="p-0.5 hover:bg-indigo-500/30 rounded transition-all cursor-pointer relative"
                  onMouseEnter={() => setActiveTooltip('notes')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openWithContext(uei, companyName, 'contractor');
                  }}
                >
                  <svg className="w-4 h-4 text-indigo-400 hover:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {activeTooltip === 'notes' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
                      Take quick notes on this entity
                    </div>
                  )}
                </div>

                {/* Document Attachment Icon */}
                <div
                  className="p-0.5 hover:bg-cyan-500/30 rounded transition-all cursor-pointer relative"
                  onMouseEnter={() => setActiveTooltip('attach')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsFileUploadOpen(true);
                  }}
                >
                  <svg className="w-4 h-4 text-cyan-400 hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {activeTooltip === 'attach' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
                      Attach documents for your knowledge base
                    </div>
                  )}
                </div>

                {/* Document Manager/Folder */}
                <div
                  className="p-0.5 hover:bg-teal-500/30 rounded transition-all cursor-pointer relative"
                  onMouseEnter={() => setActiveTooltip('folder')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsKnowledgeBaseOpen(true);
                  }}
                >
                  <svg className="w-4 h-4 text-teal-400 hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {activeTooltip === 'folder' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
                      View contents of your knowledge base
                    </div>
                  )}
                </div>

                {/* Pin to Top */}
                <div
                  className={`p-0.5 rounded hover:bg-orange-500/30 transition-all cursor-pointer relative ${
                    isPinned ? 'text-orange-300' : 'text-orange-400'
                  }`}
                  onMouseEnter={() => setActiveTooltip('pin')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onPin) onPin(uei);
                  }}
                >
                  <Pin className={`w-4 h-4 hover:text-orange-300 transition-colors ${
                    isPinned ? 'fill-orange-400/50' : ''
                  }`} />
                  {activeTooltip === 'pin' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
                      {isPinned ? 'Unpin this entity' : 'Pin this entity'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Industry Image */}
            <div className="w-20 h-20 bg-gray-700/50 rounded-lg border border-gray-600/30 overflow-hidden flex-shrink-0">
              <img
                src={industryImageSrc}
                alt="Industry"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Content Section - Collapsible */}
      {isExpanded && (
        <div className="relative z-10 p-4">
        {/* Financial Metrics Grid - NO ICONS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Lifetime Awards</span>
            <span className="font-bold text-xl block" style={{ color: '#F97316' }}>{metrics.lifetime}</span>
          </div>
          <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Active Awards</span>
            <span className="font-bold text-xl block" style={{ color: '#FFB84D' }}>{activeAwards.value}</span>
          </div>
          <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Revenue (TTM)</span>
            <span className="font-bold text-xl block" style={{ color: '#42D4F4' }}>{metrics.revenue}</span>
          </div>
          <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center">
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