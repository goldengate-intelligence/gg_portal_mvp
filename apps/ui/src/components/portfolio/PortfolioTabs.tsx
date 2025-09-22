import React from 'react';
import { cn } from '../../logic/utils';
import { Target, Eye, BarChart3, Presentation } from 'lucide-react';

interface PortfolioTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PortfolioTabs({ activeTab, onTabChange }: PortfolioTabsProps) {
  const tabs = [
    { id: 'assets', label: 'Assets', icon: Target },
    { id: 'risk', label: 'Monitoring', icon: Eye },
    { id: 'news', label: 'Integration', icon: Presentation }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 border-b border-gray-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 px-6 py-3 text-sm font-normal tracking-tight transition-all duration-300 border-b-2 border-transparent text-center",
              activeTab === tab.id
                ? "text-[#8B8EFF] border-[#8B8EFF]"
                : "text-gray-500 hover:text-gray-300 hover:border-gray-600"
            )}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            <tab.icon className="inline w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}