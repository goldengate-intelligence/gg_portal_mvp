import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
  SubTitle,
  BubbleController
} from 'chart.js';
import type { ChartOptions, ChartTypeRegistry } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  Filler,
  Tooltip,
  Legend,
  Title,
  SubTitle
);

// Set global Chart.js defaults to ensure tooltips use sans-serif
ChartJS.defaults.font.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
ChartJS.defaults.plugins.tooltip.titleFont.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
ChartJS.defaults.plugins.tooltip.bodyFont.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
ChartJS.defaults.plugins.tooltip.footerFont.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Goldengate Theme Colors
export const GOLDENGATE_COLORS = {
  // Core Colors
  gold: '#FFD700',
  goldBright: '#FFED4E',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  electric: '#7B61FF',
  neonGreen: '#39FF14',
  hotPink: '#FF1493',
  danger: '#FF0066',
  success: '#00FF88',
  
  // Backgrounds
  bgBlack: '#000000',
  bgDark: '#0A0A0F',
  bgCard: 'rgba(10, 10, 15, 0.9)',
  
  // Chart specific
  gridColor: 'rgba(0, 217, 255, 0.1)',
  gridColorLight: 'rgba(0, 217, 255, 0.05)',
  textColor: '#00D9FF',
  textColorBright: '#FFD700',
};

// Color schemes for datasets
export const COLOR_SCHEMES = {
  primary: ['#FFD700', '#00D9FF', '#7B61FF', '#FF6B35', '#39FF14', '#FF1493'],
  gradient: [
    'rgba(255, 215, 0, 0.8)',
    'rgba(0, 217, 255, 0.8)',
    'rgba(123, 97, 255, 0.8)',
    'rgba(255, 107, 53, 0.8)',
    'rgba(57, 255, 20, 0.8)',
    'rgba(255, 20, 147, 0.8)'
  ],
  transparentGradient: [
    'rgba(255, 215, 0, 0.3)',
    'rgba(0, 217, 255, 0.3)',
    'rgba(123, 97, 255, 0.3)',
    'rgba(255, 107, 53, 0.3)',
    'rgba(57, 255, 20, 0.3)',
    'rgba(255, 20, 147, 0.3)'
  ]
};

// Default chart options
export const DEFAULT_CHART_OPTIONS: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#D2AC38',
        font: {
          family: "system-ui, -apple-system, sans-serif",
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      borderColor: GOLDENGATE_COLORS.gold,
      borderWidth: 1,
      titleFont: {
        family: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        size: 12
      },
      bodyFont: {
        family: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        size: 11
      },
      padding: 12,
      displayColors: false,
      callbacks: {
        labelTextColor: () => '#FFFFFF'
      }
    }
  }
};

// Axis configurations
export const AXIS_CONFIG = {
  grid: {
    color: GOLDENGATE_COLORS.gridColor,
    drawBorder: false
  },
  ticks: {
    color: GOLDENGATE_COLORS.textColor,
    font: {
      family: "'Exo 2', sans-serif",
      size: 11
    }
  }
};

// Chart-specific default configurations
export const CHART_CONFIGS = {
  bar: {
    ...DEFAULT_CHART_OPTIONS,
    scales: {
      y: {
        beginAtZero: true,
        grid: AXIS_CONFIG.grid,
        ticks: AXIS_CONFIG.ticks
      },
      x: {
        grid: { display: false },
        ticks: { ...AXIS_CONFIG.ticks, color: GOLDENGATE_COLORS.textColorBright }
      }
    }
  },
  
  line: {
    ...DEFAULT_CHART_OPTIONS,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: AXIS_CONFIG.grid,
        ticks: AXIS_CONFIG.ticks
      },
      x: {
        grid: { ...AXIS_CONFIG.grid, color: GOLDENGATE_COLORS.gridColorLight },
        ticks: AXIS_CONFIG.ticks
      }
    }
  },
  
  doughnut: {
    ...DEFAULT_CHART_OPTIONS,
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          color: GOLDENGATE_COLORS.textColorBright,
          font: { 
            family: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            size: 11 
          },
          padding: 10
        }
      }
    }
  },
  
  radar: {
    ...DEFAULT_CHART_OPTIONS,
    scales: {
      r: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 217, 255, 0.2)' },
        pointLabels: {
          color: GOLDENGATE_COLORS.textColor,
          font: { 
            family: "'Orbitron', monospace", 
            size: 10 
          }
        },
        ticks: {
          color: GOLDENGATE_COLORS.textColor,
          backdropColor: 'transparent',
          display: false
        }
      }
    }
  },
  
  scatter: {
    ...DEFAULT_CHART_OPTIONS,
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        grid: AXIS_CONFIG.grid,
        ticks: AXIS_CONFIG.ticks,
        title: {
          display: true,
          color: GOLDENGATE_COLORS.textColor
        }
      },
      y: {
        grid: AXIS_CONFIG.grid,
        ticks: AXIS_CONFIG.ticks,
        title: {
          display: true,
          color: GOLDENGATE_COLORS.textColor
        }
      }
    }
  }
};

// Animation configurations
export const ANIMATION_CONFIG = {
  default: {
    duration: 1000,
    easing: 'easeInOutQuart' as const
  },
  fast: {
    duration: 500,
    easing: 'easeOutQuart' as const
  },
  slow: {
    duration: 2000,
    easing: 'easeInOutSine' as const
  }
};

// Export ChartJS for direct access if needed
export { ChartJS };