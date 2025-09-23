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
  'revenue_ttm': {
    label: 'Revenue TTM',
    description: 'Trailing twelve months revenue performance tracking',
    unit: '$M',
    defaultType: 'range',
    category: 'performance'
  },
  'performance_score': {
    label: 'Performance Score',
    description: 'Composite performance rating based on delivery, quality, and timeline metrics',
    unit: 'pts',
    defaultType: 'range',
    category: 'performance'
  },
  'portfolio_duration': {
    label: 'Portfolio Duration',
    description: 'Average duration of contracts in the entity\'s current portfolio',
    unit: 'yrs',
    defaultType: 'range',
    category: 'performance'
  },
  'risk_exposure': {
    label: 'Risk Exposure',
    description: 'Overall risk assessment combining financial, operational, and market factors',
    unit: 'risk',
    defaultType: 'central_band',
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