/**
 * Consolidated Visualization Services
 *
 * Unified service module combining performance and utilization color logic.
 * Preserves all original complexity while providing a cleaner API.
 */

// Re-export individual services for backward compatibility
export { performanceColors } from './performance-colors';
export { utilizationColors } from './utilization-colors';

// Re-export all types
export type {
  ColorConfig,
  PerformanceScore,
} from './performance-colors';

export type {
  UtilizationColorConfig,
  UtilizationScore,
} from './utilization-colors';

// Unified visualization service
import { performanceColors, type PerformanceScore } from './performance-colors';
import { utilizationColors, type UtilizationScore } from './utilization-colors';

export interface VisualizationTheme {
  name: string;
  performance: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
  utilization: {
    optimal: string;
    efficient: string;
    moderate: string;
    inefficient: string;
  };
}

export interface ScoreVisualization {
  performance: PerformanceScore & { color: string };
  utilization: UtilizationScore & { color: string };
}

/**
 * Unified Visualization Service
 *
 * Combines performance and utilization color services with theme management
 */
export class UnifiedVisualizationService {
  private static themes: Map<string, VisualizationTheme> = new Map([
    ['default', {
      name: 'Default',
      performance: {
        excellent: '#15803d',
        good: '#84cc16',
        fair: '#eab308',
        poor: '#ef4444',
      },
      utilization: {
        optimal: '#059669',
        efficient: '#0891b2',
        moderate: '#d97706',
        inefficient: '#dc2626',
      },
    }],
    ['dark', {
      name: 'Dark Mode',
      performance: {
        excellent: '#22c55e',
        good: '#a3e635',
        fair: '#fbbf24',
        poor: '#f87171',
      },
      utilization: {
        optimal: '#10b981',
        efficient: '#06b6d4',
        moderate: '#f59e0b',
        inefficient: '#ef4444',
      },
    }],
    ['accessible', {
      name: 'High Contrast',
      performance: {
        excellent: '#166534',
        good: '#365314',
        fair: '#a16207',
        poor: '#991b1b',
      },
      utilization: {
        optimal: '#064e3b',
        efficient: '#164e63',
        moderate: '#92400e',
        inefficient: '#991b1b',
      },
    }],
  ]);

  /**
   * Get comprehensive score visualization with colors
   */
  static getScoreVisualization(
    performanceValue: number,
    performancePercentile: number,
    utilizationValue: number,
    theme: string = 'default'
  ): ScoreVisualization {
    const performanceScore = performanceColors.getPerformanceScore(performanceValue, performancePercentile);
    const utilizationScore = utilizationColors.getUtilizationScore(utilizationValue);

    const performanceColor = performanceColors.getScoreColor(performanceScore);
    const utilizationColor = utilizationColors.getUtilizationColor(utilizationScore);

    return {
      performance: { ...performanceScore, color: performanceColor },
      utilization: { ...utilizationScore, color: utilizationColor },
    };
  }

  /**
   * Apply theme to both color services
   */
  static applyTheme(themeName: string): boolean {
    const theme = this.themes.get(themeName);
    if (!theme) return false;

    performanceColors.updateColors(theme.performance);
    utilizationColors.updateColors(theme.utilization);

    return true;
  }

  /**
   * Register custom theme
   */
  static registerTheme(name: string, theme: Omit<VisualizationTheme, 'name'>): void {
    this.themes.set(name, { name, ...theme });
  }

  /**
   * Get available themes
   */
  static getAvailableThemes(): VisualizationTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get performance color for value and percentile
   */
  static getPerformanceColor(value: number, percentile: number): string {
    const score = performanceColors.getPerformanceScore(value, percentile);
    return performanceColors.getScoreColor(score);
  }

  /**
   * Get utilization color for value
   */
  static getUtilizationColor(value: number): string {
    const score = utilizationColors.getUtilizationScore(value);
    return utilizationColors.getUtilizationColor(score);
  }

  /**
   * Generate color palette for chart series based on data
   */
  static generateChartPalette(
    dataPoints: Array<{ performance?: number; utilization?: number; percentile?: number }>,
    type: 'performance' | 'utilization' = 'performance'
  ): string[] {
    return dataPoints.map(point => {
      if (type === 'performance' && point.performance !== undefined && point.percentile !== undefined) {
        return this.getPerformanceColor(point.performance, point.percentile);
      } else if (type === 'utilization' && point.utilization !== undefined) {
        return this.getUtilizationColor(point.utilization);
      }
      return '#64748b'; // Default neutral color
    });
  }

  /**
   * Get color legend for score ranges
   */
  static getColorLegend(type: 'performance' | 'utilization'): Array<{ label: string; color: string; range: string }> {
    if (type === 'performance') {
      return [
        { label: 'Excellent', color: performanceColors.getColorPalette().excellent, range: '75-100th percentile' },
        { label: 'Good', color: performanceColors.getColorPalette().good, range: '50-74th percentile' },
        { label: 'Fair', color: performanceColors.getColorPalette().fair, range: '25-49th percentile' },
        { label: 'Poor', color: performanceColors.getColorPalette().poor, range: '0-24th percentile' },
      ];
    } else {
      return [
        { label: 'Optimal', color: utilizationColors.getColorPalette().optimal, range: '80-100%' },
        { label: 'Efficient', color: utilizationColors.getColorPalette().efficient, range: '60-79%' },
        { label: 'Moderate', color: utilizationColors.getColorPalette().moderate, range: '40-59%' },
        { label: 'Inefficient', color: utilizationColors.getColorPalette().inefficient, range: '0-39%' },
      ];
    }
  }
}

// Export convenience singleton
export const unifiedVisualizationService = UnifiedVisualizationService;