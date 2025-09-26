/**
 * Shared Performance Tier Calculation Logic
 *
 * Provides consistent performance tier classification across all components
 * based on composite percentile scores.
 */

export interface PerformanceTier {
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Calculate performance tier based on composite percentile score
 *
 * Tiers:
 * - Elite: 75-100 percentile
 * - Strong: 50-74 percentile
 * - Weak: 25-49 percentile
 * - Deficient: 0-24 percentile
 */
export function getPerformanceTier(compositeScore: number | null | undefined): PerformanceTier {
  // Default to Strong if no score available
  if (compositeScore === null || compositeScore === undefined) {
    return { label: "Strong", color: "#84cc16", bgColor: "#84cc1620" };
  }

  // Elite: 75-100 percentile
  if (compositeScore >= 75) {
    return { label: "Elite", color: "#22c55e", bgColor: "#22c55e20" };
  }

  // Strong: 50-74 percentile
  if (compositeScore >= 50) {
    return { label: "Strong", color: "#84cc16", bgColor: "#84cc1620" };
  }

  // Weak: 25-49 percentile
  if (compositeScore >= 25) {
    return { label: "Weak", color: "#f59e0b", bgColor: "#f59e0b20" };
  }

  // Deficient: 0-24 percentile
  return { label: "Deficient", color: "#ef4444", bgColor: "#ef444420" };
}

/**
 * Get performance tier text color (for display purposes)
 */
export function getPerformanceTierTextColor(compositeScore: number | null | undefined): string {
  const tier = getPerformanceTier(compositeScore);
  return tier.color;
}