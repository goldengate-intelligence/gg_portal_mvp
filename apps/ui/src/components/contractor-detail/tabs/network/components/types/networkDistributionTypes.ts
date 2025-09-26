/**
 * Network Distribution Types
 *
 * Type definitions for the network distribution panel components
 */

import type { ActivityEvent } from '../../types';

export interface NetworkDistributionPanelProps {
  contractor: any;
  networkData?: any;
  activityEvents?: ActivityEvent[];
  isLoading?: boolean;
}

export interface NetworkContractingProps {
  distributionData: any;
  isLoading: boolean;
}

export interface NetworkLocationsProps {
  contractor: any;
  distributionData: any;
  activityEvents?: ActivityEvent[];
  hoveredDot: string | null;
  onDotHover: (dotId: string | null) => void;
}

export interface NetworkRelationshipListProps {
  relationships?: Array<{
    entityUei: string;
    entityName: string;
    totalAmount: number;
    percentage: number;
  }>;
  isLoading: boolean;
  type: 'agency' | 'prime' | 'vendor';
  colorTheme: {
    border: string;
    text: string;
  };
  emptyMessage: string;
}

export interface MapDotProps {
  dot: NetworkLocationDot;
  index: number;
  hoveredDot: string | null;
  onDotHover: (dotId: string | null) => void;
}

export interface NetworkLocationDot {
  city?: string;
  state?: string;
  zip?: string;
  type: 'contractor' | 'agency' | 'prime' | 'sub' | 'performance';
  color: string;
  name: string;
  location: string;
}

export interface NetworkStatsBarProps {
  distributionData: any;
  isLoading: boolean;
}

export interface MapLegendProps {
  // No props needed for static legend
}