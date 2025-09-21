// 3-Part Panel System - Asset Management Framework
// This is the official framework used throughout the application
// Demonstrates the complete 3-part system: External → Internal → Content

import React from 'react';

// Part 1: External Panel Container
const ExternalPanelContainer = ({
  children,
  accentColor = '#8B8EFF'
}: {
  children: React.ReactNode;
  accentColor?: string;
}) => (
  <div
    className="h-full border rounded-xl overflow-hidden shadow-2xl hover:border-opacity-50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm"
    style={{
      borderColor: `${accentColor}4D`, // 30% opacity
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `${accentColor}80`; // 50% opacity
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = `${accentColor}4D`; // 30% opacity
    }}
  >
    {/* Animated background grid */}
    <div className="absolute inset-0 opacity-5 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, ${accentColor} 1px, transparent 1px),
            linear-gradient(180deg, ${accentColor} 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px'
        }}
      />
    </div>

    {/* Glow effect on hover */}
    <div
      className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
      style={{
        background: `linear-gradient(135deg, ${accentColor}20, transparent)`
      }}
    />

    {children}
  </div>
);

// Part 2: Internal Content Container
const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

// Part 3: Content Container (Chart-Style)
// IMPORTANT: OFFICIAL GUNMETAL COLOR = #223040
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040' // ← VERIFIED CORRECT COLOR FOR GRAY CONTAINERS
    }}
  >
    {children}
  </div>
);

// Panel Title Component (Genos Typography)
const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-gray-200 font-normal uppercase tracking-wider"
    style={{
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em'
    }}
  >
    {children}
  </h3>
);

// Complete 3-Part Panel Implementation
export function ThreePartPanel({
  title,
  children,
  accentColor = '#8B8EFF'
}: {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <ExternalPanelContainer accentColor={accentColor}>
      <InternalContentContainer>
        {/* Header Section */}
        <div className="mb-4">
          <PanelTitle>{title}</PanelTitle>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <ChartStyleContainer>
            {children}
          </ChartStyleContainer>
        </div>
      </InternalContentContainer>
    </ExternalPanelContainer>
  );
}

// Asset Management Panel - Complete Example
export function AssetManagementPanel() {
  const recentActivity = [
    { action: 'Entity Discovered', target: 'Lockheed Martin Corp', time: '2m ago', type: 'discovery' },
    { action: 'Analysis Complete', target: 'Boeing Defense Division', time: '5m ago', type: 'analysis' },
    { action: 'Portfolio Updated', target: '23 New Entities', time: '12m ago', type: 'portfolio' },
    { action: 'Risk Assessment', target: 'Raytheon Technologies', time: '18m ago', type: 'risk' }
  ];

  return (
    <ThreePartPanel title="ASSET MANAGEMENT" accentColor="#8B8EFF">
      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-black/40 border border-gray-700/30 rounded-lg hover:border-[#8B8EFF]/30 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-white font-medium">{activity.action}</span>
                <div className="w-1 h-1 bg-[#8B8EFF] rounded-full" />
                <span className="text-sm text-[#8B8EFF]">{activity.target}</span>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </ThreePartPanel>
  );
}

// Simplified Content Panel (without chart container)
export function SimpleContentPanel({
  title,
  children,
  accentColor = '#8B8EFF'
}: {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <ExternalPanelContainer accentColor={accentColor}>
      <InternalContentContainer>
        <div className="mb-4">
          <PanelTitle>{title}</PanelTitle>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </InternalContentContainer>
    </ExternalPanelContainer>
  );
}

// Grid Layout for Multiple Panels
export function PanelGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
      {children}
    </div>
  );
}

// Design Tokens for 3-Part Panel System
export const ThreePartPanelTokens = {
  colors: {
    accents: {
      portfolio: '#8B8EFF',      // Purple/Indigo for portfolio
      contractor: '#F97316',     // Orange for contractor detail
      risk: '#EF4444',          // Red for risk panels
      success: '#10B981',       // Green for success panels
    },
    backgrounds: {
      external: 'from-black/90 via-gray-900/50 to-black/90',
      internal: '#223040',      // Official Gunmetal
      content: 'bg-black/40',   // Content item backgrounds
    },
    borders: {
      base: '30%',             // Base opacity for accent borders
      hover: '50%',            // Hover opacity for accent borders
      content: 'border-gray-700/30', // Content item borders
    }
  },
  typography: {
    panelTitle: {
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em',
      fontWeight: 'font-normal',
      textTransform: 'uppercase',
      color: 'text-gray-200',
    },
    content: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      primary: 'text-white',
      secondary: 'text-gray-400',
      accent: 'text-[accent-color]',
    }
  },
  spacing: {
    external: {
      borderRadius: 'rounded-xl',  // 12px
      shadow: 'shadow-2xl',
    },
    internal: {
      padding: 'p-4',             // 16px
      headerMargin: 'mb-4',       // 16px
    },
    content: {
      padding: 'p-4',             // 16px
      borderRadius: 'rounded-lg', // 8px
      spacing: 'space-y-4',       // 16px between items
    },
    grid: {
      opacity: 'opacity-5',       // 5% for background grids
      size: '15px 15px',          // Grid cell size
    }
  },
  effects: {
    transitions: {
      external: 'transition-all duration-500',
      glow: 'transition-opacity duration-300',
      content: 'transition-colors',
    },
    zIndex: {
      background: 'z-0',
      content: 'z-10',
    },
    hover: {
      glow: 'group-hover:opacity-10',
      border: 'hover:border-opacity-50',
    }
  }
};

// Hook for managing panel accent colors
export function usePanelColor(defaultColor: string = '#8B8EFF') {
  const [accentColor, setAccentColor] = React.useState(defaultColor);

  const updateColor = React.useCallback((newColor: string) => {
    setAccentColor(newColor);
  }, []);

  return {
    accentColor,
    setAccentColor: updateColor,
    borderStyle: {
      borderColor: `${accentColor}4D`, // 30% opacity
    },
    hoverBorderStyle: {
      borderColor: `${accentColor}80`, // 50% opacity
    }
  };
}

// CSS custom properties version for dynamic theming
export const ThreePartPanelCSS = `
.three-part-panel {
  --accent-color: #8B8EFF;
  --border-opacity-base: 0.3;
  --border-opacity-hover: 0.5;
  --bg-external-start: rgb(0 0 0 / 0.9);
  --bg-external-middle: rgb(17 24 39 / 0.5);
  --bg-external-end: rgb(0 0 0 / 0.9);
  --bg-internal: #223040;
  --text-title: rgb(229 231 235);
  --grid-opacity: 0.05;
  --glow-opacity: 0.1;
}

.external-panel-container {
  height: 100%;
  border: 1px solid color-mix(in srgb, var(--accent-color) var(--border-opacity-base), transparent);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.5s;
  position: relative;
  background: linear-gradient(to bottom, var(--bg-external-start), var(--bg-external-middle), var(--bg-external-end));
  backdrop-filter: blur(4px);
}

.external-panel-container:hover {
  border-color: color-mix(in srgb, var(--accent-color) var(--border-opacity-hover), transparent);
}

.panel-background-grid {
  position: absolute;
  inset: 0;
  opacity: var(--grid-opacity);
  z-index: 0;
  background-image:
    linear-gradient(90deg, var(--accent-color) 1px, transparent 1px),
    linear-gradient(180deg, var(--accent-color) 1px, transparent 1px);
  background-size: 15px 15px;
}

.panel-glow-effect {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 0;
}

.external-panel-container:hover .panel-glow-effect {
  opacity: var(--glow-opacity);
}

.internal-content-container {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.chart-style-container {
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: var(--bg-internal);
}

.panel-title {
  font-family: 'Genos', sans-serif;
  font-size: 18px;
  letter-spacing: 0.0125em;
  font-weight: normal;
  text-transform: uppercase;
  color: var(--text-title);
  margin-bottom: 1rem;
}
`;