import React from 'react';
import {
  Globe,
  Activity,
  Share2,
  FileText,
  Users
} from 'lucide-react';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../../../logic/utils';

interface TabBannerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBanner({ activeTab, onTabChange }: TabBannerProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'relationships', label: 'Relationships', icon: Share2 },
    { id: 'activity', label: 'Activity', icon: FileText },
    { id: 'contacts', label: 'Contacts', icon: Users }
  ];

  return (
    <div className="py-6">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Tab Navigation - Luxury Minimal */}
        <div className="mb-8">
          <div className={cn(
            "flex items-center gap-2 p-2 border border-gray-700/30 rounded-xl backdrop-blur-md w-full",
            CONTRACTOR_DETAIL_COLORS.panelColor
          )}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex-1 px-8 py-4 text-xl font-normal tracking-widest transition-all duration-500 rounded-lg capitalize text-center",
                    activeTab === tab.id
                      ? "bg-gray-900/50 border border-gray-700/30 text-white shadow-2xl backdrop-blur-md"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 hover:backdrop-blur-sm"
                  )}
                  style={{ fontFamily: 'Michroma, sans-serif' }}
                >
                  <IconComponent className="inline w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}