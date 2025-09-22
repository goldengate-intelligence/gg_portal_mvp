import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Target, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from './services/contractor-profile-transform';
import { GoldengateRadarChart, GoldengateBarChart } from '../../ui/charts/components';

interface PeerComparison {
  currentPercentiles: {
    revenue: number;
    growth: number;
    performance: number;
    overall: number;
  };
  peerGroup: {
    size: number;
    classification: string;
    marketPosition: string;
  };
}

interface CompetitiveBenchmarkPanelProps {
  contractorName: string;
  comparison: PeerComparison;
}

export function CompetitiveBenchmarkPanelV2({
  contractorName,
  comparison
}: CompetitiveBenchmarkPanelProps) {
  
  // Prepare radar chart data
  const radarData = {
    labels: [
      'Revenue',
      'Growth',
      'Performance', 
      'Market Share',
      'Contracts',
      'Stability'
    ],
    datasets: [
      {
        label: contractorName,
        data: [
          comparison.currentPercentiles.revenue,
          comparison.currentPercentiles.growth,
          comparison.currentPercentiles.performance,
          comparison.currentPercentiles.overall,
          85, // Mock data for contracts
          78  // Mock data for stability
        ],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.2)'
      },
      {
        label: 'Peer Average',
        data: [50, 50, 50, 50, 50, 50],
        borderColor: '#00D9FF',
        backgroundColor: 'rgba(0, 217, 255, 0.1)'
      }
    ]
  };

  // Prepare bar chart data for percentile rankings
  const barData = {
    labels: ['Revenue', 'Growth', 'Performance', 'Overall'],
    datasets: [{
      label: 'Percentile Rank',
      data: [
        comparison.currentPercentiles.revenue,
        comparison.currentPercentiles.growth,
        comparison.currentPercentiles.performance,
        comparison.currentPercentiles.overall
      ],
      backgroundColor: (context: any) => {
        const value = context.parsed?.y || 0;
        if (value >= 75) return 'rgba(0, 255, 136, 0.8)';
        if (value >= 50) return 'rgba(255, 215, 0, 0.8)';
        if (value >= 25) return 'rgba(255, 107, 53, 0.8)';
        return 'rgba(255, 0, 102, 0.8)';
      }
    }]
  };

  // Get performance badge color
  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 75) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (percentile >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (percentile >= 25) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  // Get market position icon
  const getMarketPositionIcon = () => {
    switch(comparison.peerGroup.marketPosition) {
      case 'Leader': return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'Challenger': return <Target className="h-5 w-5 text-cyan-400" />;
      case 'Follower': return <Users className="h-5 w-5 text-purple-400" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-medium-gray border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Competitive Benchmark</CardTitle>
            <CardDescription className="text-gray-400">
              Performance vs {comparison.peerGroup.size} peer contractors
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getMarketPositionIcon()}
            <Badge className={getPerformanceBadge(comparison.currentPercentiles.overall)}>
              {comparison.peerGroup.marketPosition}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-dark-gray p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Revenue Rank</span>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xl font-bold text-yellow-400">
              {comparison.currentPercentiles.revenue}
              <span className="text-xs text-gray-400 ml-1">th</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">percentile</p>
          </div>

          <div className="bg-dark-gray p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Growth Rank</span>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-green-400">
              {comparison.currentPercentiles.growth}
              <span className="text-xs text-gray-400 ml-1">th</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">percentile</p>
          </div>

          <div className="bg-dark-gray p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Performance</span>
              <Target className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold text-cyan-400">
              {comparison.currentPercentiles.performance}
              <span className="text-xs text-gray-400 ml-1">th</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">percentile</p>
          </div>

          <div className="bg-dark-gray p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Overall Score</span>
              <Trophy className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-purple-400">
              {comparison.currentPercentiles.overall}
              <span className="text-xs text-gray-400 ml-1">/100</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">composite</p>
          </div>
        </div>

        {/* Radar Chart */}
        <GoldengateRadarChart
          title="Competitive Position Map"
          data={radarData}
          height={350}
          liveIndicator={true}
          liveText="VS PEERS"
          options={{
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 25
                }
              }
            }
          }}
        />

        {/* Percentile Rankings Bar Chart */}
        <GoldengateBarChart
          title="Percentile Rankings"
          data={barData}
          height={200}
          liveIndicator={false}
          options={{
            indexAxis: 'y' as const,
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(0, 217, 255, 0.1)' },
                ticks: {
                  color: '#00D9FF',
                  callback: (value: any) => `${value}%`
                }
              },
              y: {
                grid: { display: false },
                ticks: { color: '#FFD700' }
              }
            },
            plugins: {
              legend: { display: false }
            }
          }}
        />

        {/* Peer Group Info */}
        <div className="bg-dark-gray/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Peer Group Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Group Size</p>
              <p className="text-lg font-bold text-white">{comparison.peerGroup.size} contractors</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Classification</p>
              <p className="text-lg font-bold text-cyan-400 capitalize">
                {comparison.peerGroup.classification}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Market Position</p>
              <p className="text-lg font-bold text-yellow-400">
                {comparison.peerGroup.marketPosition}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}