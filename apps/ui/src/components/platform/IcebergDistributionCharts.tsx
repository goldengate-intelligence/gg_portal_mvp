import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  GoldengateDoughnutChart,
  GoldengateBarChart,
  GoldengateScatterChart,
  GoldengateBubbleChart
} from '../../ui/charts/components';
import { formatCurrency } from './services/contractor-profile-transform';

interface IcebergOpportunity {
  id: string;
  contractorName: string;
  scores: {
    iceberg: number;
    subToPrimeRatio: number;
    hiddenRevenuePercentage: number;
  };
  revenue: {
    prime: number;
    subcontractor: number;
    total: number;
    potential: number;
  };
  classification: {
    tier: string;
    scale: string;
    entityType: string;
  };
}

interface IcebergDistributionChartsProps {
  opportunities: IcebergOpportunity[];
}

export function IcebergDistributionCharts({ opportunities }: IcebergDistributionChartsProps) {
  
  // Prepare tier distribution data for doughnut chart
  const tierCounts = {
    high: opportunities.filter(o => o.classification.tier === 'high').length,
    medium: opportunities.filter(o => o.classification.tier === 'medium').length,
    low: opportunities.filter(o => o.classification.tier === 'low').length
  };

  const tierDistributionData = {
    labels: ['High Tier', 'Medium Tier', 'Low Tier'],
    datasets: [{
      data: [tierCounts.high, tierCounts.medium, tierCounts.low],
      backgroundColor: [
        'rgba(0, 255, 136, 0.8)',
        'rgba(255, 215, 0, 0.8)',
        'rgba(255, 107, 53, 0.8)'
      ],
      borderColor: ['#00FF88', '#FFD700', '#FF6B35']
    }]
  };

  // Prepare revenue distribution for bar chart
  const topOpportunities = opportunities
    .sort((a, b) => b.revenue.potential - a.revenue.potential)
    .slice(0, 10);

  const revenueBarData = {
    labels: topOpportunities.map(o => 
      o.contractorName.length > 20 
        ? o.contractorName.substring(0, 20) + '...' 
        : o.contractorName
    ),
    datasets: [
      {
        label: 'Prime Revenue',
        data: topOpportunities.map(o => o.revenue.prime / 1000000),
        backgroundColor: 'rgba(255, 215, 0, 0.8)',
        borderColor: '#FFD700'
      },
      {
        label: 'Sub Revenue',
        data: topOpportunities.map(o => o.revenue.subcontractor / 1000000),
        backgroundColor: 'rgba(0, 217, 255, 0.8)',
        borderColor: '#00D9FF'
      }
    ]
  };

  // Prepare scatter plot data - Score vs Hidden Revenue %
  const scatterData = {
    datasets: [
      {
        label: 'High Tier',
        data: opportunities
          .filter(o => o.classification.tier === 'high')
          .map(o => ({
            x: o.scores.hiddenRevenuePercentage,
            y: o.scores.iceberg
          })),
        backgroundColor: 'rgba(0, 255, 136, 0.6)',
        borderColor: '#00FF88'
      },
      {
        label: 'Medium Tier',
        data: opportunities
          .filter(o => o.classification.tier === 'medium')
          .map(o => ({
            x: o.scores.hiddenRevenuePercentage,
            y: o.scores.iceberg
          })),
        backgroundColor: 'rgba(255, 215, 0, 0.6)',
        borderColor: '#FFD700'
      },
      {
        label: 'Low Tier',
        data: opportunities
          .filter(o => o.classification.tier === 'low')
          .map(o => ({
            x: o.scores.hiddenRevenuePercentage,
            y: o.scores.iceberg
          })),
        backgroundColor: 'rgba(255, 107, 53, 0.6)',
        borderColor: '#FF6B35'
      }
    ]
  };

  // Prepare bubble chart data - Revenue vs Ratio vs Score
  const bubbleData = {
    datasets: opportunities
      .filter(o => o.classification.tier === 'high')
      .slice(0, 20)
      .map((o, idx) => ({
        label: o.contractorName,
        data: [{
          x: o.revenue.total / 1000000, // Total revenue in millions
          y: o.scores.subToPrimeRatio,   // Sub to prime ratio
          r: Math.sqrt(o.scores.iceberg) * 3  // Bubble size based on score
        }],
        backgroundColor: `rgba(255, 215, 0, ${0.3 + (idx * 0.03)})`,
        borderColor: '#FFD700'
      }))
  };

  return (
    <div className="space-y-6">
      {/* Distribution Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <GoldengateDoughnutChart
          title="Opportunity Tier Distribution"
          data={tierDistributionData}
          height={300}
          liveIndicator={true}
          liveText="ANALYZING"
          options={{
            plugins: {
              legend: {
                position: 'bottom' as const
              }
            }
          }}
        />

        {/* Revenue Comparison */}
        <GoldengateBarChart
          title="Top 10 Hidden Revenue Opportunities"
          data={revenueBarData}
          height={300}
          liveIndicator={true}
          liveText="TOP 10"
          options={{
            scales: {
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: { size: 9 }
                }
              },
              y: {
                ticks: {
                  callback: (value: any) => `$${value}M`
                }
              }
            },
            plugins: {
              legend: {
                position: 'top' as const
              }
            }
          }}
        />
      </div>

      {/* Correlation Analysis */}
      <GoldengateScatterChart
        title="Iceberg Score vs Hidden Revenue Percentage"
        data={scatterData}
        height={400}
        liveIndicator={true}
        liveText="CORRELATION"
        options={{
          scales: {
            x: {
              title: {
                display: true,
                text: 'Hidden Revenue %',
                color: '#00D9FF'
              },
              ticks: {
                callback: (value: any) => `${value}%`
              }
            },
            y: {
              title: {
                display: true,
                text: 'Iceberg Score',
                color: '#00D9FF'
              }
            }
          }
        }}
      />

      {/* Opportunity Bubble Chart */}
      <GoldengateBubbleChart
        title="Revenue vs Sub-Prime Ratio Analysis"
        data={bubbleData}
        height={400}
        liveIndicator={true}
        liveText="OPPORTUNITIES"
        options={{
          scales: {
            x: {
              title: {
                display: true,
                text: 'Total Revenue ($M)',
                color: '#00D9FF'
              },
              ticks: {
                callback: (value: any) => `$${value}M`
              }
            },
            y: {
              title: {
                display: true,
                text: 'Sub-to-Prime Ratio',
                color: '#00D9FF'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const label = context.dataset.label || '';
                  const x = context.parsed.x;
                  const y = context.parsed.y;
                  return [
                    label,
                    `Revenue: $${x.toFixed(1)}M`,
                    `Ratio: ${y.toFixed(1)}:1`
                  ];
                }
              }
            }
          }
        }}
      />
    </div>
  );
}