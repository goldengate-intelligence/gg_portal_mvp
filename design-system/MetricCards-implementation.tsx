// Key Metric Cards - Complete Implementation Example
// This demonstrates the full design framework in code form

import React from 'react';

// External Metric Card Container Framework
const MetricCardContainer = ({
  accentColor,
  children
}: {
  accentColor: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/40 transition-all group relative overflow-hidden">
    {/* Gradient background for each card */}
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-lg"></div>

    {/* Subtle color accent bar - full height */}
    <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: accentColor }}></div>

    {children}
  </div>
);

// Internal Content Container Framework
const MetricContent = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10">
    <div className="pl-2">
      {children}
    </div>
  </div>
);

// Metric Title Component (Genos Typography)
const MetricTitle = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-gray-500 font-normal uppercase tracking-wide mb-3"
    style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}
  >
    {children}
  </div>
);

// Metric Value Component (Large Accent)
const MetricValue = ({
  value,
  accentColor
}: {
  value: string;
  accentColor: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-baseline gap-1">
      <span
        className="font-medium"
        style={{ color: accentColor, fontSize: '30px', lineHeight: '1' }}
      >
        {value}
      </span>
    </div>
  </div>
);

// Count/Label Row Component
const MetricCountLabel = ({
  count,
  countLabel,
  timeframe
}: {
  count: string;
  countLabel: string;
  timeframe: string;
}) => (
  <div className="flex items-center justify-between text-[11px]">
    <div className="flex items-baseline gap-1.5">
      <span className="text-white/70 font-medium">{count}</span>
      <span className="text-gray-500 uppercase tracking-wide">{countLabel}</span>
    </div>
    <span className="text-gray-600 uppercase tracking-wider">{timeframe}</span>
  </div>
);

// Description Component
const MetricDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
    {children}
  </div>
);

// Complete Metric Card Component
export function MetricCard({
  title,
  value,
  accentColor,
  count,
  countLabel,
  timeframe,
  description
}: {
  title: string;
  value: string;
  accentColor: string;
  count: string;
  countLabel: string;
  timeframe: string;
  description: string;
}) {
  return (
    <MetricCardContainer accentColor={accentColor}>
      <MetricContent>
        <MetricTitle>{title}</MetricTitle>
        <MetricValue value={value} accentColor={accentColor} />
        <MetricCountLabel
          count={count}
          countLabel={countLabel}
          timeframe={timeframe}
        />
        <MetricDescription>{description}</MetricDescription>
      </MetricContent>
    </MetricCardContainer>
  );
}

// Grid Container for Metric Cards
export function MetricCardsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-6">
      {children}
    </div>
  );
}

// Complete Headline Metrics Implementation
export function HeadlineMetricsFramework() {
  const metrics = [
    {
      title: 'LIFETIME AWARDS',
      value: '$1.2B',
      accentColor: '#F97316',
      count: '278',
      countLabel: 'contracts',
      timeframe: 'all time',
      description: 'Total historical value'
    },
    {
      title: 'ACTIVE AWARDS',
      value: '$480M',
      accentColor: '#FFB84D',
      count: '92',
      countLabel: 'contracts',
      timeframe: 'performing',
      description: 'Currently active'
    },
    {
      title: 'REVENUE TTM',
      value: '$112.5M',
      accentColor: '#42D4F4',
      count: 'Est',
      countLabel: 'recognized',
      timeframe: '12 months',
      description: 'STRAIGHT-LINE RECOGNITION (SLR)'
    },
    {
      title: 'PIPELINE',
      value: '$337.5M',
      accentColor: '#8B8EFF',
      count: 'Est',
      countLabel: 'potential',
      timeframe: 'forecast',
      description: 'LIFETIME AWDS MINUS SLR'
    }
  ];

  return (
    <MetricCardsGrid>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </MetricCardsGrid>
  );
}

// Simplified Single Metric Card
export function SimpleMetricCard({
  title,
  value,
  accentColor = '#F97316',
  subtitle
}: {
  title: string;
  value: string;
  accentColor?: string;
  subtitle?: string;
}) {
  return (
    <MetricCardContainer accentColor={accentColor}>
      <MetricContent>
        <MetricTitle>{title}</MetricTitle>
        <MetricValue value={value} accentColor={accentColor} />
        {subtitle && (
          <div className="text-gray-500 text-xs mt-2">{subtitle}</div>
        )}
      </MetricContent>
    </MetricCardContainer>
  );
}

// Design Tokens for Metric Cards
export const MetricCardTokens = {
  colors: {
    accents: {
      primary: '#F97316',     // Primary orange
      secondary: '#FFB84D',   // Light orange/amber
      tertiary: '#42D4F4',    // Cyan/blue
      quaternary: '#8B8EFF',  // Purple/lavender
    },
    backgrounds: {
      gradient: 'from-gray-900/50 via-gray-800/25 to-gray-900/50',
      border: {
        base: 'border-gray-700/50',
        hover: 'border-gray-600/40',
      }
    },
    text: {
      title: 'text-gray-500',
      count: 'text-white/70',
      label: 'text-gray-500',
      timeframe: 'text-gray-600',
      description: 'text-gray-600',
    }
  },
  typography: {
    title: {
      fontFamily: 'Genos, sans-serif',
      fontSize: '12px',
      fontWeight: 'font-normal',
      textTransform: 'uppercase',
      letterSpacing: 'tracking-wide',
    },
    value: {
      fontSize: '30px',
      lineHeight: '1',
      fontWeight: 'font-medium',
    },
    countLabel: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: 'tracking-wide',
    },
    description: {
      fontSize: '9px',
      textTransform: 'uppercase',
      letterSpacing: 'tracking-wider',
    }
  },
  spacing: {
    container: {
      padding: 'p-4',      // 16px
      borderRadius: 'rounded-lg', // 8px
    },
    content: {
      leftPadding: 'pl-2', // 8px (offset from accent bar)
      titleMargin: 'mb-3', // 12px
      descriptionMargin: 'mt-3', // 12px
    },
    grid: {
      columns: 'grid-cols-4',
      gap: 'gap-6',        // 24px
      topMargin: 'mt-2',   // 8px
    },
    accentBar: {
      width: '2px',
      position: 'absolute left-0 top-0 bottom-0',
    }
  },
  effects: {
    transitions: 'transition-all',
    zIndex: {
      content: 'z-10',
    },
    overflow: 'overflow-hidden',
  }
};

// Hook for managing metric data
export function useMetricData() {
  const [metrics, setMetrics] = React.useState([
    {
      title: 'LIFETIME AWARDS',
      value: '$1.2B',
      accentColor: '#F97316',
      count: '278',
      countLabel: 'contracts',
      timeframe: 'all time',
      description: 'Total historical value'
    }
  ]);

  const updateMetric = React.useCallback((index: number, updates: Partial<typeof metrics[0]>) => {
    setMetrics(prev => prev.map((metric, i) =>
      i === index ? { ...metric, ...updates } : metric
    ));
  }, []);

  return {
    metrics,
    setMetrics,
    updateMetric
  };
}

// CSS custom properties version for dynamic theming
export const MetricCardCSS = `
.metric-card {
  --accent-color: #F97316;
  --border-base: rgb(55 65 81 / 0.5);
  --border-hover: rgb(75 85 99 / 0.4);
  --bg-start: rgb(17 24 39 / 0.5);
  --bg-middle: rgb(31 41 55 / 0.25);
  --bg-end: rgb(17 24 39 / 0.5);
  --text-title: rgb(107 114 128);
  --text-value: var(--accent-color);
  --text-count: rgb(255 255 255 / 0.7);
  --text-label: rgb(107 114 128);
  --text-timeframe: rgb(75 85 99);
  --text-description: rgb(75 85 99);
}

.metric-card-container {
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border-base);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.metric-card-container:hover {
  border-color: var(--border-hover);
}

.metric-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--bg-start), var(--bg-middle), var(--bg-end));
  border-radius: 0.5rem;
}

.metric-card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--accent-color);
}

.metric-card-content {
  position: relative;
  z-index: 10;
  padding-left: 0.5rem;
}

.metric-title {
  font-family: 'Genos', sans-serif;
  font-size: 12px;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--text-title);
  margin-bottom: 0.75rem;
}

.metric-value {
  font-size: 30px;
  line-height: 1;
  font-weight: 500;
  color: var(--text-value);
}

.metric-count-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  gap: 0.375rem;
}

.metric-count {
  color: var(--text-count);
  font-weight: 500;
}

.metric-label {
  color: var(--text-label);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-timeframe {
  color: var(--text-timeframe);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-description {
  font-size: 9px;
  color: var(--text-description);
  margin-top: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
`;