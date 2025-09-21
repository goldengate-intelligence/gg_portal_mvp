// Tab Navigation Banner - Complete Implementation Example
// This demonstrates the full design framework in code form

import React from 'react';
import { cn } from '../lib/utils';
import { Globe, BarChart3, Share2, Activity, Users } from 'lucide-react';

// External Navigation Container Framework
const NavigationContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 p-2 border border-[#F97316]/30 rounded-xl backdrop-blur-md w-full bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-gray-900/90 hover:border-[#F97316]/50 transition-all duration-500">
      {children}
    </div>
  </div>
);

// Tab Button Framework
const TabButton = ({
  isActive,
  onClick,
  icon: Icon,
  children
}: {
  isActive: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 px-8 py-4 text-base font-normal tracking-tight transition-all duration-500 rounded-lg capitalize text-center",
      isActive
        ? "text-[#D2AC38]"
        : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 hover:backdrop-blur-sm"
    )}
    style={{ fontFamily: 'Michroma, sans-serif', fontSize: '16px' }}
  >
    {Icon && <Icon className="inline w-5 h-5 mr-2" />}
    {children}
  </button>
);

// Complete Framework Usage Example
export function TabNavigationFramework({
  activeTab,
  onTabChange
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = [
    { id: 'overview', label: 'overview', icon: Globe },
    { id: 'performance', label: 'performance', icon: BarChart3 },
    { id: 'network', label: 'network', icon: Share2 },
    { id: 'activity', label: 'activity', icon: Activity },
    { id: 'contacts', label: 'contacts', icon: Users }
  ];

  return (
    <NavigationContainer>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          icon={tab.icon}
        >
          {tab.label}
        </TabButton>
      ))}
    </NavigationContainer>
  );
}

// Simplified version without icons
export function SimpleTabNavigation({
  tabs,
  activeTab,
  onTabChange
}: {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <NavigationContainer>
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          isActive={activeTab === tab}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </TabButton>
      ))}
    </NavigationContainer>
  );
}

// Design Tokens for Tab Navigation
export const TabNavigationTokens = {
  colors: {
    border: {
      base: '#F97316', // with /30 tailwind opacity
      hover: '#F97316', // with /50 tailwind opacity
    },
    background: {
      container: 'from-gray-900/90 via-gray-800/90 to-gray-900/90',
      buttonHover: 'bg-gray-900/40',
    },
    text: {
      active: '#D2AC38',
      inactive: 'text-gray-400',
      hover: 'text-gray-200',
    }
  },
  typography: {
    font: {
      fontFamily: 'Michroma, sans-serif',
      fontSize: '16px',
      fontWeight: 'normal',
      letterSpacing: 'tracking-tight',
      textTransform: 'capitalize',
    }
  },
  spacing: {
    container: {
      padding: 'p-2', // 8px
      margin: 'mb-8', // 32px
      gap: 'gap-2', // 8px between buttons
    },
    button: {
      paddingX: 'px-8', // 32px
      paddingY: 'py-4', // 16px
    },
    icon: {
      size: 'w-5 h-5', // 20px x 20px
      margin: 'mr-2', // 8px right margin
    }
  },
  effects: {
    borderRadius: {
      container: 'rounded-xl', // 12px
      button: 'rounded-lg', // 8px
    },
    backdrop: 'backdrop-blur-md',
    transitions: {
      container: 'transition-all duration-500',
      button: 'transition-all duration-500',
    }
  },
  layout: {
    container: 'flex items-center gap-2 w-full',
    button: 'flex-1 text-center',
    icon: 'inline',
  }
};

// Hook for managing tab state
export function useTabNavigation(initialTab: string) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  const handleTabChange = React.useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
}

// CSS custom properties version for dynamic theming
export const TabNavigationCSS = `
.tab-navigation-container {
  --border-color: #F97316;
  --border-opacity-base: 0.3;
  --border-opacity-hover: 0.5;
  --background-start: rgb(17 24 39 / 0.9);
  --background-middle: rgb(31 41 55 / 0.9);
  --background-end: rgb(17 24 39 / 0.9);
  --text-active: #D2AC38;
  --text-inactive: rgb(156 163 175);
  --text-hover: rgb(229 231 235);
  --button-hover-bg: rgb(17 24 39 / 0.4);
}

.tab-navigation-container {
  margin-bottom: 2rem;
}

.tab-navigation-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid color-mix(in srgb, var(--border-color) var(--border-opacity-base), transparent);
  border-radius: 0.75rem;
  backdrop-filter: blur(12px);
  width: 100%;
  background: linear-gradient(to bottom, var(--background-start), var(--background-middle), var(--background-end));
  transition: all 0.5s;
}

.tab-navigation-inner:hover {
  border-color: color-mix(in srgb, var(--border-color) var(--border-opacity-hover), transparent);
}

.tab-button {
  flex: 1;
  padding: 1rem 2rem;
  font-family: 'Michroma', sans-serif;
  font-size: 1rem;
  font-weight: normal;
  letter-spacing: -0.025em;
  text-transform: capitalize;
  text-align: center;
  border-radius: 0.5rem;
  transition: all 0.5s;
  border: none;
  background: transparent;
  cursor: pointer;
}

.tab-button.active {
  color: var(--text-active);
}

.tab-button.inactive {
  color: var(--text-inactive);
}

.tab-button.inactive:hover {
  color: var(--text-hover);
  background-color: var(--button-hover-bg);
  backdrop-filter: blur(4px);
}

.tab-button-icon {
  display: inline;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}
`;