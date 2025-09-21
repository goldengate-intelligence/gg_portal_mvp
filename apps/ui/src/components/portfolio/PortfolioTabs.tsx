import React from 'react';
import { cn } from '../../lib/utils';
import { Target, Shield, BarChart3, Newspaper } from 'lucide-react';

interface PortfolioTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PortfolioTabs({ activeTab, onTabChange }: PortfolioTabsProps) {
  const tabs = [
    { id: 'management', label: 'Management', icon: Target },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'reporting', label: 'Reporting', icon: BarChart3 },
    { id: 'news', label: 'News', icon: Newspaper }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 p-2 border border-[#8B8EFF]/30 rounded-xl backdrop-blur-md w-full bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-gray-900/90 hover:border-[#8B8EFF]/50 transition-all duration-500">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 px-8 py-4 text-base font-normal tracking-tight transition-all duration-500 rounded-lg capitalize text-center",
              activeTab === tab.id
                ? "text-[#D2AC38]"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 hover:backdrop-blur-sm"
            )}
            style={{ fontFamily: 'Michroma, sans-serif', fontSize: '16px' }}
          >
            <tab.icon className="inline w-5 h-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}