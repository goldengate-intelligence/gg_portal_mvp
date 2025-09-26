/**
 * Obligation Card Utilities
 *
 * Utility functions specific to ObligationCardView - preserving exact business logic
 */

import type { TemperatureStatus } from '../components/types/awardCardTypes';

/**
 * Format date for display - exact same logic as original
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Get color based on utilization percentage - exact same logic
 */
export const getUtilizationColor = (utilization: number): string => {
  if (utilization < 25) return "#15803d"; // Forest green (0-<25%)
  if (utilization < 50) return "#84cc16"; // Chartreuse (25-<50%)
  if (utilization < 75) return "#eab308"; // Yellow (50-<75%)
  return "#dc2626"; // Red (75-100%)
};

/**
 * Determine temperature status based on action date - exact same logic as original
 */
export const getTemperatureStatus = (actionDate: string): TemperatureStatus => {
  const actionDateObj = new Date(actionDate);
  const now = new Date();
  const diffInMonths = (now.getTime() - actionDateObj.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (diffInMonths <= 3) return "hot";
  if (diffInMonths <= 12) return "warm";
  return "cold";
};

/**
 * Calculate progress percentage for performance period - exact same logic
 */
export const calculatePerformanceProgress = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  return Math.round((elapsed / totalDuration) * 100);
};

/**
 * Generate obligation-specific terminology - exact same logic as original
 */
export const generateObligationTerminology = (originContainer?: "inflow" | "outflow") => {
  return {
    container: "Unique Obligation Count",
    title: originContainer === "outflow" ? "Obligation Outflows" : "Obligation Inflows",
    items: "Obligations"
  };
};

/**
 * Calculate recorded outlays - exact same percentage as original (60%)
 */
export const calculateOutlays = (eventAmount: number): number => {
  return eventAmount * 0.6;
};

/**
 * Get recipient count - placeholder logic from original
 */
export const getRecipientCount = (): number => {
  return 1; // Static value as in original
};

/**
 * Get utilization percentage - placeholder logic from original
 */
export const getUtilizationPercentage = (): number => {
  return 50; // Static value as in original
};

/**
 * Generate event ID key - exact same logic as original
 */
export const generateEventKey = (event: any, index: number): string => {
  return event.EVENT_ID || `obligation-${index}`;
};

/**
 * Get latest action date - exact same logic
 */
export const getLatestActionDate = (event: any): string => {
  return event.event_date || new Date().toISOString();
};