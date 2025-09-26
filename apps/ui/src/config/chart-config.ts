/**
 * Chart Configuration
 *
 * Centralized configuration for all chart components and styling
 */

export interface BubbleChartColors {
  peer: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
  subject: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
}

export interface BubbleDataPoint {
  x: number;
  y: number;
  r: number;
}

export interface BubbleChartDataset {
  label: string;
  data: BubbleDataPoint[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export const BUBBLE_CHART_CONFIG = {
  colors: {
    peer: {
      backgroundColor: "rgba(255, 68, 68, 0.6)",
      borderColor: "#FF4444",
      borderWidth: 1,
    },
    subject: {
      backgroundColor: "rgba(210, 172, 56, 0.8)",
      borderColor: "#D2AC38",
      borderWidth: 2,
    },
  } as BubbleChartColors,
  sizes: {
    peerRadius: 4,
    subjectRadius: 8,
  },
  labels: {
    peer: "Peer Entities",
    subject: "Subject Contractor",
  },
} as const;

export const NETWORK_CHART_COLORS = {
  contractor: "#D2AC38",
  agency: "#9B7EBD",
  prime: "#5BC0EB",
  sub: "#FF4C4C",
  performance: "#22c55e",
} as const;

export const DEFAULT_LOCATION_COORDINATES = {
  agencies: "20001", // Washington DC for government agencies
  primes: "94105", // San Francisco for prime contractors
  subs: "75201", // Dallas for sub contractors
} as const;

export const CHART_ANIMATION_CONFIG = {
  duration: 300,
  easing: 'ease-in-out',
} as const;