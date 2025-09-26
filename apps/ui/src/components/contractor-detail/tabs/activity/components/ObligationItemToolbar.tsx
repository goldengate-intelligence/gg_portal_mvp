/**
 * Obligation Item Toolbar
 *
 * 4-icon toolbar for obligation items (vs 5 icons in AwardCardView) - preserving exact functionality
 */

import React from 'react';
import { DollarSign, Search, Paperclip, Folder } from 'lucide-react';
import type { ObligationItemToolbarProps } from './types/obligationCardTypes';

export const ObligationItemToolbar: React.FC<ObligationItemToolbarProps> = ({
  obligation,
  index,
  activeTooltip,
  onSetTooltip,
  onToggleExpansion
}) => {
  const handleMouseEnter = (tooltipId: string) => {
    onSetTooltip(tooltipId);
  };

  const handleMouseLeave = () => {
    onSetTooltip(null);
  };

  const handleToggleExpansion = () => {
    onToggleExpansion(obligation.EVENT_ID);
  };

  const getTooltipPosition = (iconIndex: number, totalIcons: number) => {
    const position = iconIndex / (totalIcons - 1);
    if (position < 0.33) return "left-0";
    if (position > 0.66) return "right-0";
    return "left-1/2 transform -translate-x-1/2";
  };

  // 4 icons (missing calendar compared to AwardCardView) - exact same as original
  const icons = [
    {
      id: `expand-${index}`,
      icon: DollarSign,
      tooltip: "View Financial Details",
      color: "#22C55E",
      action: handleToggleExpansion
    },
    {
      id: `research-${index}`,
      icon: Search,
      tooltip: "Smart Research",
      color: "#6366F1",
      action: () => console.log('Smart research:', obligation.EVENT_ID)
    },
    {
      id: `attach-${index}`,
      icon: Paperclip,
      tooltip: "Document Attachment",
      color: "#F59E0B",
      action: () => console.log('Attach document:', obligation.EVENT_ID)
    },
    {
      id: `folder-${index}`,
      icon: Folder,
      tooltip: "Document Manager",
      color: "#8B5CF6",
      action: () => console.log('Document manager:', obligation.EVENT_ID)
    }
  ];

  return (
    <div className="flex justify-center mt-4">
      <div className="flex gap-3 p-2 rounded-lg bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
        {icons.map((iconConfig, iconIndex) => {
          const Icon = iconConfig.icon;
          const tooltipId = iconConfig.id;
          const isActive = activeTooltip === tooltipId;

          return (
            <div key={tooltipId} className="relative">
              <button
                className={`
                  p-2 rounded-lg transition-all duration-200
                  hover:scale-110 hover:shadow-lg
                  ${isActive ? 'bg-gray-700/50' : 'hover:bg-gray-800/50'}
                `}
                style={{
                  color: iconConfig.color,
                  backgroundColor: isActive ? `${iconConfig.color}20` : undefined
                }}
                onMouseEnter={() => handleMouseEnter(tooltipId)}
                onMouseLeave={handleMouseLeave}
                onClick={iconConfig.action}
              >
                <Icon className="w-4 h-4" />
              </button>

              {/* Tooltip */}
              {isActive && (
                <div
                  className={`
                    absolute z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded
                    shadow-lg border border-gray-700 whitespace-nowrap pointer-events-none
                    bottom-full mb-2 ${getTooltipPosition(iconIndex, icons.length)}
                  `}
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}
                >
                  {iconConfig.tooltip}

                  {/* Arrow */}
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid #111827"
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};