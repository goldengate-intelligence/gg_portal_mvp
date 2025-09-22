// Competitive Position Panel - Business Logic
// Calculations for competitive positioning, metrics transformations, ranking algorithms

export interface CompetitiveMetric {
  id: string;
  label: string;
  value: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CompetitivePosition {
  xAxis: CompetitiveMetric;
  yAxis: CompetitiveMetric;
  size: CompetitiveMetric;
  color: CompetitiveMetric;
}

// Calculate percentile ranking for a contractor vs competitors
export const calculatePercentileRank = (value: number, competitors: number[]): number => {
  const sorted = competitors.sort((a, b) => a - b);
  const rank = sorted.findIndex(v => v >= value);
  return rank === -1 ? 100 : (rank / sorted.length) * 100;
};

// Transform raw contractor data into competitive metrics
export const calculateCompetitiveMetrics = (
  contractorData: any,
  competitorData: any[],
  metric: string
): CompetitiveMetric => {
  const value = extractMetricValue(contractorData, metric);
  const competitorValues = competitorData.map(c => extractMetricValue(c, metric));
  const percentile = calculatePercentileRank(value, competitorValues);

  return {
    id: metric,
    label: getMetricLabel(metric),
    value,
    percentile,
    trend: calculateTrend(contractorData, metric)
  };
};

// Helper function to extract metric values
const extractMetricValue = (data: any, metric: string): number => {
  const metricMap: Record<string, string> = {
    'ttm_awards': 'ttmAwards',
    'ttm_revenue': 'ttmRevenue',
    'lifetime_awards': 'lifetimeAwards',
    'lifetime_revenue': 'lifetimeRevenue',
    'total_pipeline': 'totalPipeline',
    'portfolio_duration': 'portfolioDuration'
  };

  return data[metricMap[metric]] || 0;
};

// Get human-readable metric labels
const getMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    'ttm_awards': 'Awards Captured (TTM)',
    'ttm_revenue': 'Estimated Revenue (TTM)',
    'lifetime_awards': 'Lifetime Awards',
    'lifetime_revenue': 'Lifetime Revenue',
    'total_pipeline': 'Total Pipeline',
    'portfolio_duration': 'Portfolio Duration'
  };

  return labels[metric] || metric;
};

// Calculate trend direction
const calculateTrend = (data: any, metric: string): 'up' | 'down' | 'stable' => {
  // Implementation for trend calculation based on historical data
  return 'stable'; // Placeholder
};

// Generate competitive positioning data for bubble chart
export const generateCompetitivePositionData = (
  contractor: any,
  competitors: any[],
  xMetric: string,
  yMetric: string
) => {
  return {
    contractor: calculateCompetitiveMetrics(contractor, competitors, xMetric),
    competitors: competitors.map(comp => ({
      x: calculateCompetitiveMetrics(comp, competitors, xMetric),
      y: calculateCompetitiveMetrics(comp, competitors, yMetric)
    }))
  };
};