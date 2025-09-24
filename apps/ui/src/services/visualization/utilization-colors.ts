/**
 * Utilization Colors Service
 *
 * Handles color logic for utilization scoring visualization.
 * Uses different logic than performance - more skewed to highlight optimization opportunities.
 */

export interface UtilizationColorConfig {
  optimal: string;     // 80-100% - Optimal utilization
  efficient: string;   // 60-79% - Good utilization
  moderate: string;    // 40-59% - Moderate utilization
  inefficient: string; // 0-39% - Needs optimization
}

export interface UtilizationScore {
  value: number;
  level: 'optimal' | 'efficient' | 'moderate' | 'inefficient';
  recommendation: string;
}

const DEFAULT_UTILIZATION_COLORS: UtilizationColorConfig = {
  optimal: '#059669',     // Emerald - Peak efficiency
  efficient: '#0891b2',   // Cyan - Good efficiency
  moderate: '#d97706',    // Orange - Room for improvement
  inefficient: '#dc2626'  // Red - Needs attention
};

class UtilizationColorsService {
  private colors: UtilizationColorConfig = DEFAULT_UTILIZATION_COLORS;

  /**
   * Get color for utilization score (0-100)
   * Uses skewed thresholds to highlight optimization opportunities
   */
  getUtilizationColor(score: number): string {
    if (score >= 80) return this.colors.optimal;
    if (score >= 60) return this.colors.efficient;
    if (score >= 40) return this.colors.moderate;
    return this.colors.inefficient;
  }

  /**
   * Get utilization level and recommendation
   */
  getUtilizationScore(value: number): UtilizationScore {
    let level: 'optimal' | 'efficient' | 'moderate' | 'inefficient';
    let recommendation: string;

    if (value >= 80) {
      level = 'optimal';
      recommendation = 'Excellent utilization. Consider scaling capacity.';
    } else if (value >= 60) {
      level = 'efficient';
      recommendation = 'Good utilization. Minor optimizations available.';
    } else if (value >= 40) {
      level = 'moderate';
      recommendation = 'Moderate utilization. Significant improvement opportunities.';
    } else {
      level = 'inefficient';
      recommendation = 'Low utilization. Requires immediate attention.';
    }

    return { value, level, recommendation };
  }

  /**
   * Calculate utilization statistics for comparative analysis
   */
  calculateUtilizationStats(scores: number[]): {
    highPerformers: number; // >= 80%
    goodPerformers: number; // 60-79%
    needsImprovement: number; // 40-59%
    criticallyLow: number; // < 40%
    averageUtilization: number;
  } {
    const total = scores.length;
    const highPerformers = scores.filter(s => s >= 80).length;
    const goodPerformers = scores.filter(s => s >= 60 && s < 80).length;
    const needsImprovement = scores.filter(s => s >= 40 && s < 60).length;
    const criticallyLow = scores.filter(s => s < 40).length;
    const averageUtilization = scores.reduce((sum, val) => sum + val, 0) / total;

    return {
      highPerformers,
      goodPerformers,
      needsImprovement,
      criticallyLow,
      averageUtilization
    };
  }

  /**
   * Get color palette for utilization charts
   */
  getColorPalette(): UtilizationColorConfig {
    return { ...this.colors };
  }

  /**
   * Get color scale for continuous visualization
   */
  getColorScale(): string[] {
    return [
      this.colors.inefficient,
      this.colors.moderate,
      this.colors.efficient,
      this.colors.optimal
    ];
  }

  /**
   * Get utilization trend color (for showing improvement/decline)
   */
  getTrendColor(currentScore: number, previousScore: number): string {
    const improvement = currentScore - previousScore;

    if (improvement > 5) return '#10b981'; // Green - significant improvement
    if (improvement > 0) return '#84cc16'; // Light green - slight improvement
    if (improvement === 0) return '#6b7280'; // Gray - no change
    if (improvement > -5) return '#f59e0b'; // Orange - slight decline
    return '#ef4444'; // Red - significant decline
  }

  /**
   * Get utilization efficiency badge color
   */
  getEfficiencyBadgeColor(score: number): {
    background: string;
    text: string;
    border: string;
  } {
    const level = this.getUtilizationScore(score).level;

    switch (level) {
      case 'optimal':
        return {
          background: 'rgba(5, 150, 105, 0.1)',
          text: '#059669',
          border: 'rgba(5, 150, 105, 0.3)'
        };
      case 'efficient':
        return {
          background: 'rgba(8, 145, 178, 0.1)',
          text: '#0891b2',
          border: 'rgba(8, 145, 178, 0.3)'
        };
      case 'moderate':
        return {
          background: 'rgba(217, 119, 6, 0.1)',
          text: '#d97706',
          border: 'rgba(217, 119, 6, 0.3)'
        };
      case 'inefficient':
        return {
          background: 'rgba(220, 38, 38, 0.1)',
          text: '#dc2626',
          border: 'rgba(220, 38, 38, 0.3)'
        };
    }
  }

  /**
   * Get capacity utilization indicators
   */
  getCapacityIndicators(current: number, capacity: number): {
    utilizationPercent: number;
    capacityColor: string;
    status: string;
  } {
    const utilizationPercent = (current / capacity) * 100;
    const color = this.getUtilizationColor(utilizationPercent);

    let status: string;
    if (utilizationPercent >= 95) status = 'At Capacity';
    else if (utilizationPercent >= 80) status = 'Well Utilized';
    else if (utilizationPercent >= 60) status = 'Moderately Utilized';
    else if (utilizationPercent >= 40) status = 'Under Utilized';
    else status = 'Significantly Under Utilized';

    return {
      utilizationPercent,
      capacityColor: color,
      status
    };
  }

  /**
   * Get optimization priority score
   */
  getOptimizationPriority(utilizationScore: number, impactScore: number): {
    priority: 'high' | 'medium' | 'low';
    color: string;
    message: string;
  } {
    // Low utilization + high impact = high priority
    const optimizationScore = (100 - utilizationScore) * (impactScore / 100);

    if (optimizationScore >= 60) {
      return {
        priority: 'high',
        color: '#dc2626',
        message: 'High optimization potential - immediate action recommended'
      };
    } else if (optimizationScore >= 30) {
      return {
        priority: 'medium',
        color: '#d97706',
        message: 'Moderate optimization potential - review within quarter'
      };
    } else {
      return {
        priority: 'low',
        color: '#059669',
        message: 'Low optimization potential - monitor periodically'
      };
    }
  }

  /**
   * Get color with opacity for backgrounds
   */
  getColorWithOpacity(score: number, opacity: number = 0.1): string {
    const baseColor = this.getUtilizationColor(score);

    // Convert hex to rgba
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Update color configuration
   */
  updateColors(newColors: Partial<UtilizationColorConfig>): void {
    this.colors = { ...this.colors, ...newColors };
  }

  /**
   * Reset to default colors
   */
  resetColors(): void {
    this.colors = { ...DEFAULT_UTILIZATION_COLORS };
  }

  /**
   * Get utilization level label
   */
  getUtilizationLabel(score: number): string {
    const level = this.getUtilizationScore(score).level;

    switch (level) {
      case 'optimal': return 'Optimal';
      case 'efficient': return 'Efficient';
      case 'moderate': return 'Moderate';
      case 'inefficient': return 'Inefficient';
    }
  }
}

// Export singleton instance
export const utilizationColors = new UtilizationColorsService();

export { UtilizationColorsService };