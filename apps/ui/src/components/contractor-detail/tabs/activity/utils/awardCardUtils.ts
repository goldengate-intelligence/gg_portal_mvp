/**
 * Award Card Utilities
 *
 * Utility functions extracted from AwardCardView for better organization
 */

import type { TemperatureStatus } from '../components/types/awardCardTypes';

/**
 * Parse various string value formats to numbers
 */
export const parseValue = (valueStr: string): number => {
  if (!valueStr) return 0;
  const value = valueStr.replace(/[$,]/g, '');
  if (value.includes('B')) return parseFloat(value) * 1e9;
  if (value.includes('M')) return parseFloat(value) * 1e6;
  if (value.includes('K')) return parseFloat(value) * 1e3;
  return parseFloat(value) || 0;
};

/**
 * Format date strings for Event objects
 */
export const formatDateForEvent = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return dateStr;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Get color for event type
 */
export const getEventTypeColor = (type: string): string => {
  return type === "PRIME" ? "#5BC0EB" : "#FF4C4C";
};

/**
 * Get color based on utilization percentage
 */
export const getUtilizationColor = (utilization: number): string => {
  if (utilization < 25) return "#15803d"; // Forest green (0-<25%)
  if (utilization < 50) return "#84cc16"; // Chartreuse (25-<50%)
  if (utilization < 75) return "#eab308"; // Yellow (50-<75%)
  return "#dc2626"; // Red (75-100%)
};

/**
 * Determine temperature status based on action date
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
 * Get the most recent action date from an event
 */
export const getLatestActionDate = (event: any): string => {
  // Use event_date as the latest action date
  return event.event_date || event.EVENT_DATE || new Date().toISOString();
};

/**
 * Calculate progress percentage for timeline
 */
export const calculateProgress = (startDate: string, endDate: string): number => {
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
 * Get temperature colors and labels
 */
export const getTemperatureDisplay = (status: TemperatureStatus): {
  color: string;
  label: string;
  bgColor: string;
} => {
  switch (status) {
    case "hot":
      return {
        color: "#dc2626",
        label: "HOT",
        bgColor: "rgba(220, 38, 38, 0.1)"
      };
    case "warm":
      return {
        color: "#ea580c",
        label: "WARM",
        bgColor: "rgba(234, 88, 12, 0.1)"
      };
    case "cold":
      return {
        color: "#0891b2",
        label: "COLD",
        bgColor: "rgba(8, 145, 178, 0.1)"
      };
  }
};

/**
 * Generate terminology based on relationship type and flow
 */
export const generateTerminology = (relationship: any, type: "inflow" | "outflow") => {
  return {
    container: "Unique Prime Award ID Count",
    title: type === "outflow"
      ? "Vendor Orders"
      : relationship?.type === "agency"
        ? "Agency Awards"
        : relationship?.type === "prime"
          ? "Prime Awards"
          : "Awards",
    items: type === "outflow" ? "Orders" : "Awards",
  };
};