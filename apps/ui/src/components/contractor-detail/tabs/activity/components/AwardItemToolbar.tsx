/**
 * Award Item Toolbar
 *
 * Toolbar with action icons and tooltips for award items
 */

import React from 'react';
import { Folder, Pin, Calendar, MapPin, DollarSign, Paperclip, Search } from 'lucide-react';
import type { AwardItemToolbarProps } from './types/awardCardTypes';

export const AwardItemToolbar: React.FC<AwardItemToolbarProps> = ({
  award,
  index,
  type,
  activeTooltip,
  onSetTooltip,
  onToggleExpansion,
  onOpenObligationCardView
}) => {
  const handleMouseEnter = (tooltipId: string) => {
    onSetTooltip(tooltipId);
  };

  const handleMouseLeave = () => {
    onSetTooltip(null);
  };

  const handleToggleExpansion = () => {
    onToggleExpansion(award.award_key);
  };

  const handleViewDetails = () => {
    onOpenObligationCardView(award.award_key, award.recipient_name, type);
  };

  const getTooltipPosition = (iconIndex: number, totalIcons: number) => {
    const position = iconIndex / (totalIcons - 1);
    if (position < 0.33) return "left-0";
    if (position > 0.66) return "right-0";
    return "left-1/2 transform -translate-x-1/2";
  };

  const icons = [
    {
      id: `folder-${index}`,
      icon: Folder,
      tooltip: "View Contract Folder",
      color: "#F59E0B",
      action: handleViewDetails
    },
    {
      id: `pin-${index}`,
      icon: Pin,
      tooltip: "Pin this Award",
      color: "#8B5CF6",
      action: () => console.log('Pin award:', award.award_key)
    },
    {
      id: `calendar-${index}`,
      icon: Calendar,
      tooltip: `Start: ${award.start_date} | End: ${award.end_date}`,
      color: "#10B981",
      action: () => console.log('View calendar:', award.award_key)
    },
    {
      id: `location-${index}`,
      icon: MapPin,
      tooltip: `Performance: ${award.pop_state}`,
      color: "#F97316",
      action: () => console.log('View location:', award.award_key)
    },
    {
      id: `money-${index}`,
      icon: DollarSign,
      tooltip: `Total Value: $${(award.contract_total_value / 1000000).toFixed(1)}M`,
      color: "#22C55E",
      action: handleToggleExpansion
    },
    {
      id: `docs-${index}`,
      icon: Paperclip,
      tooltip: "View Documents",
      color: "#6366F1",
      action: () => console.log('View documents:', award.award_key)
    },
    {
      id: `search-${index}`,
      icon: Search,
      tooltip: "Search Related Awards",
      color: "#EC4899",
      action: () => console.log('Search related:', award.award_key)
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