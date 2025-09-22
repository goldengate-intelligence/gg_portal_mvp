import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Snowflake, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle,
  Award,
  Building,
  Users
} from 'lucide-react';
import { formatCurrency } from './services/contractor-profile-transform';

export interface IcebergOpportunity {
  id: string;
  contractorUei: string;
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
  advantages?: any;
  risks?: any;
  industry?: string;
  agencies?: any;
  businessTypes?: any;
}

interface IcebergOpportunityCardProps {
  opportunity: IcebergOpportunity;
  onSelect?: (opportunity: IcebergOpportunity) => void;
}

export function IcebergOpportunityCard({ opportunity, onSelect }: IcebergOpportunityCardProps) {
  
  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'high': return 'border-green-500/50 bg-green-500/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'low': return 'border-gray-500/50 bg-gray-500/5';
      default: return 'border-gray-600/50';
    }
  };

  // Get iceberg score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-gray-400';
  };

  // Format ratio
  const formatRatio = (ratio: number) => {
    if (ratio >= 10) return `${ratio.toFixed(0)}:1`;
    if (ratio >= 1) return `${ratio.toFixed(1)}:1`;
    return `1:${(1/ratio).toFixed(1)}`;
  };

  // Calculate hidden revenue amount
  const hiddenRevenue = opportunity.revenue.subcontractor - opportunity.revenue.prime;

  return (
    <Card 
      className={`bg-medium-gray border ${getTierColor(opportunity.classification.tier)} hover:border-yellow-500/50 transition-all cursor-pointer`}
      onClick={() => onSelect?.(opportunity)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
              {opportunity.contractorName}
            </h3>
            <p className="text-xs text-gray-400 font-sans">{opportunity.contractorUei}</p>
          </div>
          <div className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-400" />
            <div className={`text-2xl font-bold ${getScoreColor(opportunity.scores.iceberg)}`}>
              {opportunity.scores.iceberg}
            </div>
          </div>
        </div>

        {/* Iceberg Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-dark-gray rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Sub:Prime Ratio</span>
              <TrendingUp className="h-3 w-3 text-gray-500" />
            </div>
            <p className="text-sm font-semibold text-yellow-400">
              {formatRatio(opportunity.scores.subToPrimeRatio)}
            </p>
          </div>
          <div className="bg-dark-gray rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Hidden %</span>
              <Target className="h-3 w-3 text-gray-500" />
            </div>
            <p className="text-sm font-semibold text-blue-400">
              {opportunity.scores.hiddenRevenuePercentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Prime Revenue</span>
            <span className="text-gray-300 font-sans">
              {formatCurrency(opportunity.revenue.prime)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Sub Revenue</span>
            <span className="text-green-400 font-sans font-semibold">
              {formatCurrency(opportunity.revenue.subcontractor)}
            </span>
          </div>
          {hiddenRevenue > 0 && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-700">
              <span className="text-yellow-400">Hidden Opportunity</span>
              <span className="text-yellow-400 font-sans font-semibold">
                +{formatCurrency(hiddenRevenue)}
              </span>
            </div>
          )}
        </div>

        {/* Potential Value */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-green-500/10 rounded p-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-300">Potential Prime Value</span>
            </div>
            <span className="text-sm font-bold text-yellow-500">
              {formatCurrency(opportunity.revenue.potential)}
            </span>
          </div>
        </div>

        {/* Classifications */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge className="bg-gray-700/50 text-gray-300 text-xs capitalize">
            {opportunity.classification.tier} tier
          </Badge>
          <Badge className="bg-gray-700/50 text-gray-300 text-xs capitalize">
            {opportunity.classification.scale}
          </Badge>
          {opportunity.classification.entityType && (
            <Badge className="bg-gray-700/50 text-gray-300 text-xs capitalize">
              {opportunity.classification.entityType}
            </Badge>
          )}
        </div>

        {/* Industry & Agencies */}
        {opportunity.industry && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Building className="h-3 w-3" />
            <span className="line-clamp-1">{opportunity.industry}</span>
          </div>
        )}
        
        {opportunity.agencies && Array.isArray(opportunity.agencies) && opportunity.agencies.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Users className="h-3 w-3" />
            <span className="line-clamp-1">
              {opportunity.agencies.slice(0, 2).join(', ')}
              {opportunity.agencies.length > 2 && ` +${opportunity.agencies.length - 2}`}
            </span>
          </div>
        )}

        {/* Advantages & Risks Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {opportunity.advantages && Object.keys(opportunity.advantages).length > 0 && (
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">
                  {Object.keys(opportunity.advantages).length} advantages
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {opportunity.risks && Object.keys(opportunity.risks).length > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-400" />
                <span className="text-xs text-orange-400">
                  {Object.keys(opportunity.risks).length} risks
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}