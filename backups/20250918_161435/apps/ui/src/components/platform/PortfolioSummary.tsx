import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, BarChart, PieChart } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Portfolio } from '../../types';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  metrics: {
    totalValue: number;
    avgPerformance: number;
    activeContracts: number;
    contractorCount: number;
    riskLevel: string;
  } | null;
}

export function PortfolioSummary({ portfolio, metrics }: PortfolioSummaryProps) {
  if (!metrics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate industry distribution
  const industryDistribution = portfolio.contractors.reduce((acc, item) => {
    const industry = item.contractor.industry;
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate momentum distribution
  const momentumDistribution = portfolio.contractors.reduce((acc, item) => {
    const momentum = item.contractor.businessMomentum;
    acc[momentum] = (acc[momentum] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top performers
  const topPerformers = [...portfolio.contractors]
    .sort((a, b) => (b.contractor.pastPerformanceScore || 0) - (a.contractor.pastPerformanceScore || 0))
    .slice(0, 3);

  // Get contractors needing attention (low performance or expiring)
  const needsAttention = portfolio.contractors.filter(item => 
    (item.contractor.pastPerformanceScore && item.contractor.pastPerformanceScore < 80) ||
    item.contractor.lifecycleStage === 'expiring'
  );

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-500 font-aptos mb-4">Portfolio Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Created</span>
            <span className="text-sm text-white">{formatDate(portfolio.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Last Updated</span>
            <span className="text-sm text-white">{formatDate(portfolio.updatedAt)}</span>
          </div>
          {portfolio.lastAnalyzed && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Last Analyzed</span>
              <span className="text-sm text-white">{formatDate(portfolio.lastAnalyzed)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-500 font-aptos mb-4">Risk Assessment</h3>
        <div className="bg-dark-gold rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Overall Risk</span>
            <Badge 
              variant={
                metrics.riskLevel === 'high' ? 'destructive' : 
                metrics.riskLevel === 'medium' ? 'warning' : 
                'success'
              }
            >
              {metrics.riskLevel.toUpperCase()}
            </Badge>
          </div>
          
          {needsAttention.length > 0 && (
            <div className="pt-2 border-t border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-500">Needs Attention ({needsAttention.length})</span>
              </div>
              <div className="space-y-1">
                {needsAttention.slice(0, 3).map(item => (
                  <div key={item.id} className="text-xs text-gray-400">
                    • {item.contractor.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Industry Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-500 font-aptos mb-4">Industry Distribution</h3>
        <div className="space-y-2">
          {Object.entries(industryDistribution).map(([industry, count]) => (
            <div key={industry} className="flex justify-between items-center">
              <span className="text-sm text-gray-400 capitalize">
                {industry.replace('-', ' ')}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gold-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${(count / metrics.contractorCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-500 font-aptos mb-4">Top Performers</h3>
        <div className="space-y-2">
          {topPerformers.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-dark-gold rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <span className="text-sm text-white">{item.contractor.name}</span>
              </div>
              <Badge variant="success" className="text-xs">
                {item.contractor.pastPerformanceScore}/100
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Business Momentum */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-500 font-aptos mb-4">Business Momentum</h3>
        <div className="space-y-2">
          {Object.entries(momentumDistribution).map(([momentum, count]) => (
            <div key={momentum} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {momentum.includes('growth') && <TrendingUp className="h-4 w-4 text-green-400" />}
                {momentum.includes('declining') && <TrendingDown className="h-4 w-4 text-red-400" />}
                <span className="text-sm text-gray-400 capitalize">
                  {momentum.replace('-', ' ')}
                </span>
              </div>
              <span className="text-sm text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <Button 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-aptos"
          size="sm"
        >
          <BarChart className="h-4 w-4 mr-2" />
          Run Portfolio Analysis
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-gray-600 text-gray-300 hover:text-white font-aptos"
          size="sm"
        >
          <PieChart className="h-4 w-4 mr-2" />
          View Detailed Analytics
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-gray-600 text-gray-300 hover:text-white font-aptos"
          size="sm"
        >
          <Clock className="h-4 w-4 mr-2" />
          Schedule Updates
        </Button>
      </div>
    </div>
  );
}