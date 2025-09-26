/**
 * Shared Formatting Utilities
 *
 * Consolidated formatting functions to eliminate duplication across components.
 * Extracted from NetworkV1Layout, AwardCardView, ObligationCardView,
 * NetworkSummaryPanel, NetworkDistributionPanel, and networkDistributionService.
 */

export interface FormatMoneyOptions {
  /** Remove .0 from whole numbers (default: true) */
  removeTrailingZero?: boolean;
  /** Include $ symbol (default: true) */
  includeSymbol?: boolean;
  /** Force specific unit instead of auto-selecting */
  forceUnit?: 'B' | 'M' | 'K' | '';
  /** Number of decimal places for forced units */
  decimals?: number;
}

/**
 * Format monetary values for display with intelligent unit selection
 * Consolidates logic from formatNetworkAmount and various formatMoney implementations
 */
export function formatMoney(amount: number, options: FormatMoneyOptions = {}): string {
  const {
    removeTrailingZero = true,
    includeSymbol = true,
    forceUnit,
    decimals = 1
  } = options;

  const symbol = includeSymbol ? '$' : '';

  // Handle forced units
  if (forceUnit) {
    let value: number;
    switch (forceUnit) {
      case 'B':
        value = amount / 1_000_000_000;
        break;
      case 'M':
        value = amount / 1_000_000;
        break;
      case 'K':
        value = amount / 1_000;
        break;
      default:
        value = amount;
    }

    let formatted = value.toFixed(decimals);
    if (removeTrailingZero && formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }

    return `${symbol}${formatted}${forceUnit}`;
  }

  // Auto-select unit based on amount (from networkDistributionService.ts)
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    let formatted = billions.toFixed(1);
    if (removeTrailingZero && formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }
    return `${symbol}${formatted}B`;
  } else if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    let formatted = millions.toFixed(1);
    if (removeTrailingZero && formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }
    return `${symbol}${formatted}M`;
  } else if (amount >= 1_000) {
    const thousands = amount / 1_000;
    let formatted = thousands.toFixed(1);
    if (removeTrailingZero && formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }
    return `${symbol}${formatted}K`;
  } else {
    return `${symbol}${amount.toFixed(0)}`;
  }
}

/**
 * Legacy alias for backward compatibility with existing formatNetworkAmount usage
 */
export const formatNetworkAmount = formatMoney;

/**
 * Simple millions formatting (from AwardCardView/ObligationCardView pattern)
 * @deprecated Use formatMoney with forceUnit: 'M' instead
 */
export function formatMoneyMillions(value: number): string {
  return formatMoney(value, { forceUnit: 'M' });
}

/**
 * Simple formatting with decimal removal (from NetworkV1Layout pattern)
 * @deprecated Use formatMoney instead
 */
export function formatMoneySimple(value: number): string {
  const formatted = value.toFixed(1);
  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
}

/**
 * Format percentage values for display
 */
export function formatPercentage(percentage: number): string {
  if (percentage >= 10) {
    return `${percentage.toFixed(0)}%`;
  } else if (percentage >= 1) {
    return `${percentage.toFixed(1)}%`;
  } else {
    return `${percentage.toFixed(2)}%`;
  }
}

/**
 * Format date strings consistently
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format contract duration in human-readable format
 */
export function formatDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.round(diffDays / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
}