/**
 * Performance Colors Service
 *
 * Handles color logic for performance scoring visualization.
 * Uses true quartiles for accurate benchmarking.
 */

export interface ColorConfig {
  excellent: string;   // Top quartile (75-100%)
  good: string;       // Third quartile (50-74%)
  fair: string;       // Second quartile (25-49%)
  poor: string;       // Bottom quartile (0-24%)
}

export interface PerformanceScore {
  value: number;
  percentile: number;
  quartile: 1 | 2 | 3 | 4;
}

const DEFAULT_PERFORMANCE_COLORS: ColorConfig = {
  excellent: '#15803d',  // Green - Top performers
  good: '#84cc16',       // Chartreuse - Above average
  fair: '#eab308',       // Yellow - Below average
  poor: '#ef4444'        // Red - Bottom performers
};

class PerformanceColorsService {
  private colors: ColorConfig = DEFAULT_PERFORMANCE_COLORS;

  /**
   * Get color for a performance score (0-100)
   */
  getScoreColor(score: number): string {
    if (score >= 75) return this.colors.excellent;
    if (score >= 50) return this.colors.good;
    if (score >= 25) return this.colors.fair;
    return this.colors.poor;
  }

  /**
   * Get color for a percentile rank (0-1)
   */
  getPercentileColor(percentile: number): string {
    return this.getScoreColor(percentile * 100);
  }

  /**
   * Get color for a quartile (1-4, where 4 is top quartile)
   */
  getQuartileColor(quartile: 1 | 2 | 3 | 4): string {
    switch (quartile) {
      case 4: return this.colors.excellent;
      case 3: return this.colors.good;
      case 2: return this.colors.fair;
      case 1: return this.colors.poor;
    }
  }

  /**
   * Calculate performance statistics for a dataset
   */
  calculatePerformanceStats(scores: number[]): {
    q1: number;
    q2: number;
    q3: number;
    mean: number;
    median: number;
  } {
    const sorted = [...scores].sort((a, b) => a - b);
    const len = sorted.length;

    const q1 = sorted[Math.floor(len * 0.25)];
    const q2 = sorted[Math.floor(len * 0.5)];
    const q3 = sorted[Math.floor(len * 0.75)];
    const mean = sorted.reduce((sum, val) => sum + val, 0) / len;
    const median = q2;

    return { q1, q2, q3, mean, median };
  }

  /**
   * Get performance score with quartile and percentile
   */
  getPerformanceScore(value: number, allValues: number[]): PerformanceScore {
    const sorted = [...allValues].sort((a, b) => a - b);
    const rank = sorted.findIndex(v => v >= value);
    const percentile = rank / sorted.length;

    let quartile: 1 | 2 | 3 | 4;
    if (percentile >= 0.75) quartile = 4;
    else if (percentile >= 0.5) quartile = 3;
    else if (percentile >= 0.25) quartile = 2;
    else quartile = 1;

    return {
      value,
      percentile,
      quartile
    };
  }

  /**
   * Get color palette for charts
   */
  getColorPalette(): ColorConfig {
    return { ...this.colors };
  }

  /**
   * Get color scale array for continuous visualization
   */
  getColorScale(): string[] {
    return [
      this.colors.poor,
      this.colors.fair,
      this.colors.good,
      this.colors.excellent
    ];
  }

  /**
   * Get color with opacity
   */
  getColorWithOpacity(score: number, opacity: number = 1): string {
    const baseColor = this.getScoreColor(score);

    // Convert hex to rgba
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Get background color (lighter version)
   */
  getBackgroundColor(score: number, opacity: number = 0.1): string {
    return this.getColorWithOpacity(score, opacity);
  }

  /**
   * Get border color (darker version)
   */
  getBorderColor(score: number, opacity: number = 0.8): string {
    return this.getColorWithOpacity(score, opacity);
  }

  /**
   * Get text color based on background
   */
  getTextColor(score: number): string {
    // For light backgrounds, use dark text
    // For dark backgrounds, use light text
    if (score >= 50) return '#ffffff'; // White text on good/excellent
    return '#1f2937'; // Dark text on poor/fair
  }

  /**
   * Update color configuration
   */
  updateColors(newColors: Partial<ColorConfig>): void {
    this.colors = { ...this.colors, ...newColors };
  }

  /**
   * Reset to default colors
   */
  resetColors(): void {
    this.colors = { ...DEFAULT_PERFORMANCE_COLORS };
  }

  /**
   * Get quartile label
   */
  getQuartileLabel(quartile: 1 | 2 | 3 | 4): string {
    switch (quartile) {
      case 4: return 'Top Quartile';
      case 3: return 'Above Average';
      case 2: return 'Below Average';
      case 1: return 'Bottom Quartile';
    }
  }

  /**
   * Get performance level description
   */
  getPerformanceLevel(score: number): string {
    if (score >= 90) return 'Exceptional';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 25) return 'Poor';
    return 'Critical';
  }
}

// Export singleton instance
export const performanceColors = new PerformanceColorsService();

export { PerformanceColorsService };