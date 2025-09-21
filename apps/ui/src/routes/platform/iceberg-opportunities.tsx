import React, { useState, useEffect } from 'react';
import { Snowflake, Filter, TrendingUp, DollarSign, Search, Info, BarChart3, Target, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { SearchInput } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LoadingState, EmptyState } from '../../components/ui/skeleton';
import { IcebergOpportunityCard, type IcebergOpportunity } from '../../components/platform/IcebergOpportunityCard';
import { IcebergVisualizationModal } from '../../components/platform/IcebergVisualizationModal';
import { IcebergDistributionCharts } from '../../components/platform/IcebergDistributionCharts';
import { formatCurrency } from '../../utils/contractor-profile-transform';
import { apiClient } from '../../lib/api-client';
import { cn } from '../../lib/utils';

export function IcebergOpportunities() {
  const [opportunities, setOpportunities] = useState<IcebergOpportunity[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(50);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [onlyWithPrime, setOnlyWithPrime] = useState(true); // Default to showing contractors with prime revenue
  const [selectedOpportunity, setSelectedOpportunity] = useState<IcebergOpportunity | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  // Fetch iceberg opportunities
  useEffect(() => {
    fetchOpportunities();
  }, [minScore, tierFilter, onlyWithPrime]);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getIcebergOpportunities({
        limit: 100,
        minScore: minScore,
        onlyWithPrime: onlyWithPrime,
        ...(tierFilter !== 'all' && { tier: tierFilter })
      });
      
      setOpportunities(data.opportunities || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Failed to fetch iceberg opportunities:', error);
      setOpportunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter opportunities by search
  const filteredOpportunities = opportunities.filter(opp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      opp.contractorName.toLowerCase().includes(query) ||
      opp.contractorUei.toLowerCase().includes(query) ||
      opp.industry?.toLowerCase().includes(query)
    );
  });

  // Group opportunities by tier
  const groupedOpportunities = {
    high: filteredOpportunities.filter(o => o.classification.tier === 'high'),
    medium: filteredOpportunities.filter(o => o.classification.tier === 'medium'),
    low: filteredOpportunities.filter(o => o.classification.tier === 'low')
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg">
      {/* Command Header */}
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <Target className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-xl font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
                ICEBERG PROTOCOL
              </h1>
              <p className="text-xs text-cyan-400 font-sans mt-1">
                HIDDEN REVENUE DETECTION SYSTEM • {filteredOpportunities.length} OPPORTUNITIES IDENTIFIED
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-sans uppercase">SCANNING</span>
          </div>
        </div>
      </div>

      <div className="p-0">
        <div className="px-6 py-4 border-b border-cyan-500/20">
          {/* Controls Row */}
          <div className="flex items-center justify-between mb-4">
            {/* Analytics Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all",
                  showCharts && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                )}
              >
                <BarChart3 className="h-3 w-3" />
                <span className="text-xs font-sans uppercase">{showCharts ? 'Hide' : 'Show'} Intel</span>
              </button>
              
              <div className="h-6 w-px bg-cyan-500/20" />
              
              <button
                onClick={() => setOnlyWithPrime(!onlyWithPrime)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all",
                  onlyWithPrime && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                )}
              >
                <Activity className="h-3 w-3" />
                <span className="text-xs font-sans uppercase">Prime Activity</span>
              </button>
              
              <div className="flex gap-2">
                <Select
                  value={minScore.toString()}
                  onValueChange={(value) => setMinScore(parseInt(value))}
                  className="w-32 bg-black/50 border-cyan-500/30 text-cyan-400 font-sans text-sm"
                >
                  <option value="0">All Scores</option>
                  <option value="25">25+ Score</option>
                  <option value="50">50+ Score</option>
                  <option value="75">75+ Score</option>
                  <option value="90">90+ Score</option>
                </Select>
                <Select
                  value={tierFilter}
                  onValueChange={(value) => setTierFilter(value)}
                  className="w-32 bg-black/50 border-cyan-500/30 text-cyan-400 font-sans text-sm"
                >
                  <option value="all">All Tiers</option>
                  <option value="high">High Tier</option>
                  <option value="medium">Medium Tier</option>
                  <option value="low">Low Tier</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 pt-4 border-t border-cyan-500/10">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter contractor designation, UEI, or industry..."
                  className="w-full bg-black/50 border-cyan-500/30 text-cyan-400 placeholder-gray-500 font-sans text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-sans">
                  SCAN
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Tactical Display */}
      <div className="p-6">
        {/* Status Bar */}
        <div className="mb-4 px-4 py-2 bg-black/50 border border-cyan-500/20 rounded backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-sans uppercase">Status:</span>
                <span className="text-xs text-green-400 font-sans uppercase font-bold">
                  ACTIVE SCAN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-sans uppercase">Targets:</span>
                <span className="text-xs text-cyan-400 font-sans font-bold">
                  {filteredOpportunities.length}
                </span>
              </div>
              {summary && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-sans uppercase">Potential:</span>
                    <span className="text-xs text-yellow-400 font-sans font-bold">
                      {formatCurrency(summary.totalPotentialValue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-sans uppercase">Score:</span>
                    <span className="text-xs text-green-400 font-sans font-bold">
                      {summary.avgScore?.toFixed(0) || 0}/100
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      {/* Analytics Charts */}
      {showCharts && opportunities.length > 0 && (
        <IcebergDistributionCharts opportunities={opportunities} />
      )}

        {/* Opportunities Grid */}
        {filteredOpportunities.length === 0 ? (
          <EmptyState 
            title="No iceberg opportunities found" 
            description="Try adjusting your filters or lowering the minimum score"
          />
        ) : (
          <div className="space-y-6">
            {/* High Priority Targets */}
            {groupedOpportunities.high.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 font-sans text-xs uppercase">
                    PRIORITY ALPHA
                  </Badge>
                  <span className="text-sm text-gray-400 font-sans">
                    {groupedOpportunities.high.length} HIGH-VALUE TARGETS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedOpportunities.high.map(opportunity => (
                    <IcebergOpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onSelect={(opp) => {
                        setSelectedOpportunity(opp);
                        setShowVisualization(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority Targets */}
            {groupedOpportunities.medium.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 font-sans text-xs uppercase">
                    PRIORITY BETA
                  </Badge>
                  <span className="text-sm text-gray-400 font-sans">
                    {groupedOpportunities.medium.length} MEDIUM-VALUE TARGETS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedOpportunities.medium.map(opportunity => (
                    <IcebergOpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onSelect={(opp) => {
                        setSelectedOpportunity(opp);
                        setShowVisualization(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority Targets */}
            {groupedOpportunities.low.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 font-sans text-xs uppercase">
                    PRIORITY GAMMA
                  </Badge>
                  <span className="text-sm text-gray-400 font-sans">
                    {groupedOpportunities.low.length} LOW-PRIORITY TARGETS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedOpportunities.low.map(opportunity => (
                    <IcebergOpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onSelect={(opp) => {
                        setSelectedOpportunity(opp);
                        setShowVisualization(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Iceberg Visualization Modal */}
      <IcebergVisualizationModal
        opportunity={selectedOpportunity}
        isOpen={showVisualization}
        onClose={() => {
          setShowVisualization(false);
          setSelectedOpportunity(null);
        }}
      />
    </div>
  );
}