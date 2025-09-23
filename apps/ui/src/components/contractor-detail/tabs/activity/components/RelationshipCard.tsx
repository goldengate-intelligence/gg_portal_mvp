import React from 'react';
import type { RelationshipCardProps } from '../types';
import {
  calculateRelationshipMetrics,
  getTypeInfo,
  getRelationshipInitials,
  getEntityIdentifier,
  getWorkSummary
} from '../logic/contractCalculations';

export function RelationshipCard({
  relationship,
  type,
  isExpanded,
  activeTooltip,
  onToggleExpansion,
  onSetActiveTooltip,
  onOpenEventsDetail
}: RelationshipCardProps) {
  const cardKey = `${relationship.name}-${type}`;
  const accentColor = type === 'inflow' ? '#10B981' : '#FF4C4C';

  const { awardedAmount, obligationRate, obligatedAmount } = calculateRelationshipMetrics(relationship, type);
  const typeInfo = getTypeInfo(relationship.type);
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
      onClick={() => onToggleExpansion(relationship.name)}
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
                      // Get the UEI for navigation
                      const uei = getEntityIdentifier(relationship);
                      // Navigate to contractor profile
                      window.location.href = `/platform/contractor-detail/${uei}`;
                    }
                  }}
                >
                  {relationship.name}
                </h3>
              </div>

              {/* UEI/Agency Info and Type Badge */}
              <div className="uppercase tracking-wide">
                <div className="font-medium text-gray-300/80 text-sm tracking-wider">
                  {getEntityIdentifier(relationship)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-normal text-[#F97316]/90 text-xs">
                    {relationship.contracts.length} Contract{relationship.contracts.length !== 1 ? 's' : ''} • {getWorkSummary(relationship)}
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
            className="relative"
            onMouseEnter={(e) => {
              e.stopPropagation();
              onSetActiveTooltip('expand');
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onSetActiveTooltip(null);
            }}
          >
            <div
              className={`p-0.5 rounded cursor-pointer hover:bg-[#D2AC38]/30 hover:scale-110 transition-all duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSetActiveTooltip(null);
                onToggleExpansion(relationship.name);
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
            {activeTooltip === 'expand' && (
              <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, top: isExpanded ? 'calc(100% + 8px)' : 'auto', bottom: isExpanded ? 'auto' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}>
                {isExpanded ? 'Collapse details' : 'Expand details'}
              </div>
            )}
          </div>

          {/* Smart Research/Lightbulb Icon */}
          <div
            className="p-0.5 rounded cursor-pointer relative hover:bg-purple-500/30 hover:scale-110 transition-all duration-300"
            onMouseEnter={(e) => {
              e.stopPropagation();
              onSetActiveTooltip('smart-research');
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onSetActiveTooltip(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSetActiveTooltip(null);
              // openWithContext functionality would go here
            }}
          >
            <svg className="w-4 h-4 text-purple-400 hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth={2}/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M8 11h6m-3-3v6"/>
            </svg>
            {activeTooltip === 'smart-research' && (
              <div className="fixed px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}>
                AI engages context-driven research
              </div>
            )}
          </div>

          {/* Document Attachment Icon */}
          <div
            className="p-0.5 rounded cursor-pointer relative hover:bg-cyan-500/30 hover:scale-110 transition-all duration-300"
            onMouseEnter={(e) => {
              e.stopPropagation();
              onSetActiveTooltip('attach');
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onSetActiveTooltip(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSetActiveTooltip(null);
              // File upload functionality would go here
            }}
          >
            <svg className="w-4 h-4 text-cyan-400 hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {activeTooltip === 'attach' && (
              <div className="fixed px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}>
                Attach documents for your knowledge base
              </div>
            )}
          </div>

          {/* Document Manager/Folder */}
          <div
            className="p-0.5 rounded cursor-pointer relative hover:bg-teal-500/30 hover:scale-110 transition-all duration-300"
            onMouseEnter={(e) => {
              e.stopPropagation();
              onSetActiveTooltip('folder');
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onSetActiveTooltip(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSetActiveTooltip(null);
              // Knowledge base functionality would go here
            }}
          >
            <svg className="w-4 h-4 text-teal-400 hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {activeTooltip === 'folder' && (
              <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', right: '0', transform: 'translateX(0)' }}>
                View contents of your knowledge base
              </div>
            )}
          </div>

          {/* Award Grain - Go Deeper */}
          <div
            className="p-0.5 rounded cursor-pointer relative hover:bg-orange-500/30 hover:scale-110 transition-all duration-300"
            onMouseEnter={(e) => {
              e.stopPropagation();
              onSetActiveTooltip('award-grain');
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onSetActiveTooltip(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSetActiveTooltip(null);
              onOpenEventsDetail(relationship, type, e);
            }}
          >
            <svg
              className="w-4 h-4 text-orange-500 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))',
                animation: 'pulse 2s infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = 'none';
                e.currentTarget.style.filter = 'drop-shadow(0 0 16px rgba(249, 115, 22, 1))';
                e.currentTarget.style.color = '#fb923c'; // max bright orange
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = 'pulse 2s infinite';
                e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))';
                e.currentTarget.style.color = '#f97316'; // original orange
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activeTooltip === 'award-grain' && (
              <div className="absolute px-2 py-1 text-xs text-white bg-black/90 border border-gray-600 rounded pointer-events-none whitespace-nowrap" style={{ zIndex: 9999, bottom: 'calc(100% + 10px)', right: '0', transform: 'translateX(0)' }}>
                View award details
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <div className="relative z-10 p-4">
          {/* Financial Metrics Grid - Following asset card pattern */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
              <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Lifetime Awards</span>
              <span className="font-bold text-xl block" style={{ color: '#F97316' }}>${(relationship.totalValue / 1000000).toFixed(0)}M</span>
            </div>
            <div className="bg-gray-800/30 rounded p-3 border border-gray-700/30 text-center transition-all duration-300 hover:bg-gray-800/40 hover:border-gray-700/50 hover:scale-105">
              <span className="text-gray-400 text-xs uppercase block mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Active Awards</span>
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
}