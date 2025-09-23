import type { FeatureOption } from '../types';

// Feature options configuration for risk monitoring
export const featureOptions: Record<string, FeatureOption> = {
  // Activity Monitoring Features (for threshold-based monitoring)
  'new_awards': {
    label: 'New Awards',
    description: 'Monitor new contract awards received by the entity',
    unit: 'awards',
    defaultType: 'threshold',
    category: 'activity'
  },
  'new_obligations': {
    label: 'New Obligations',
    description: 'Monitor new funding obligations on existing contracts',
    unit: 'obligations',
    defaultType: 'threshold',
    category: 'activity'
  },
  'new_subawards': {
    label: 'New Subawards',
    description: 'Monitor new subcontractor awards issued by the entity',
    unit: 'subawards',
    defaultType: 'threshold',
    category: 'activity'
  },
  'new_relationships': {
    label: 'New Relationships',
    description: 'Monitor new business relationships and partnerships formed',
    unit: 'relationships',
    defaultType: 'threshold',
    category: 'activity'
  },
  // Performance Monitoring Features (for range-based monitoring)
  'composite_score': {
    label: 'Composite Score',
    description: '80th percentile among 247 peers in Q4 with primary NAICS of 332312',
    unit: 'pts',
    defaultType: 'range',
    category: 'performance'
  },
  'awards_captured_ttm': {
    label: 'Awards Captured (TTM)',
    description: 'Total value of awards captured in trailing twelve months',
    unit: '$M',
    defaultType: 'range',
    category: 'performance'
  },
  'estimated_revenue_ttm': {
    label: 'Estimated Revenue (TTM)',
    description: 'Estimated revenue for trailing twelve months',
    unit: '$M',
    defaultType: 'range',
    category: 'performance'
  },
  'total_pipeline': {
    label: 'Total Pipeline',
    description: 'Total value of opportunities in sales pipeline',
    unit: '$M',
    defaultType: 'range',
    category: 'performance'
  },
  'portfolio_duration': {
    label: 'Portfolio Duration',
    description: 'Average duration of contracts in current portfolio',
    unit: 'yrs',
    defaultType: 'range',
    category: 'performance'
  },
  'blended_growth': {
    label: 'Blended Growth',
    description: 'Blended growth rate across all business segments',
    unit: '%',
    defaultType: 'range',
    category: 'performance'
  },
  // Utilization Monitoring Features (for utilization-based monitoring)
  'utilization': {
    label: 'Resource Utilization',
    description: 'Percentage of available resources currently deployed on active projects',
    unit: '%',
    defaultType: 'central_band',
    category: 'utilization'
  }
};