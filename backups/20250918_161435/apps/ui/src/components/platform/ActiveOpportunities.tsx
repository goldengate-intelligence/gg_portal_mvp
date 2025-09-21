import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Building,
  Filter,
  Download,
  Star,
  Award
} from 'lucide-react';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/input';
import { Badge, RiskBadge } from '../ui/badge';
import { OpportunityCard, MetricCard } from '../ui/card';
import { OpportunityTable } from '../ui/table';
import { Toggle } from '../ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { EmptyState, LoadingState } from '../ui/skeleton';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { mockOpportunities } from '../../data/mock-data';
import { exportOpportunities } from '../../utils/export';
import type { Opportunity, ViewMode } from '../../types';

export function ActiveOpportunities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [opportunityType, setOpportunityType] = useState<'all' | 'AWD' | 'IDV'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'deadline' | 'posted'>('deadline');
  const [filterAgency, setFilterAgency] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading] = useState(false);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    let results = [...mockOpportunities];

    // Type filter
    if (opportunityType !== 'all') {
      results = results.filter(o => o.type === opportunityType);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(o =>
        o.title.toLowerCase().includes(query) ||
        o.piid.toLowerCase().includes(query) ||
        o.agency.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query)
      );
    }

    // Agency filter
    if (filterAgency !== 'all') {
      results = results.filter(o => o.agency === filterAgency);
    }

    // Risk filter
    if (filterRisk !== 'all') {
      results = results.filter(o => o.riskLevel === filterRisk);
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue;
        case 'deadline':
          if (!a.responseDeadline) return 1;
          if (!b.responseDeadline) return -1;
          return new Date(a.responseDeadline).getTime() - new Date(b.responseDeadline).getTime();
        case 'posted':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        default:
          return 0;
      }
    });

    return results;
  }, [searchQuery, opportunityType, sortBy, filterAgency, filterRisk]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredOpportunities.length;
    const totalValue = filteredOpportunities.reduce((sum, o) => sum + o.totalValue, 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    
    const expiringCount = filteredOpportunities.filter(o => {
      if (!o.responseDeadline) return false;
      const daysUntil = Math.ceil((new Date(o.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil > 0;
    }).length;

    const highRiskCount = filteredOpportunities.filter(o => o.riskLevel === 'high' || o.riskLevel === 'critical').length;

    return {
      total,
      totalValue,
      avgValue,
      expiringCount,
      highRiskCount,
      awdCount: filteredOpportunities.filter(o => o.type === 'AWD').length,
      idvCount: filteredOpportunities.filter(o => o.type === 'IDV').length,
    };
  }, [filteredOpportunities]);

  // Get unique agencies for filter
  const agencies = useMemo(() => {
    const uniqueAgencies = [...new Set(mockOpportunities.map(o => o.agency))];
    return uniqueAgencies.sort();
  }, []);

  const handleExport = () => {
    exportOpportunities(filteredOpportunities, 'csv');
  };

  const toggleFavorite = (opportunityId: string) => {
    setFavorites(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const getUrgencyIndicator = (deadline?: Date) => {
    if (!deadline) return null;
    const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    if (daysUntil <= 3) return <Badge variant="destructive" className="text-xs">🔥 {daysUntil} days</Badge>;
    if (daysUntil <= 7) return <Badge variant="warning" className="text-xs">⚡ {daysUntil} days</Badge>;
    if (daysUntil <= 14) return <Badge variant="secondary" className="text-xs">{daysUntil} days</Badge>;
    return null;
  };

  return (
    <div className="bg-medium-gray rounded-lg border border-yellow-500/20 shadow-xl">
      {/* Header */}
      <div className="border-b border-yellow-500/10 bg-dark-gray rounded-t-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-yellow-500 font-aptos">Active Opportunities</h1>
              <p className="text-sm text-gray-400 font-aptos mt-1">
                Track and manage federal contract opportunities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-dark-gray text-gray-300 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <MetricCard
              title="Total Opportunities"
              value={metrics.total}
              description={`${metrics.awdCount} AWDs, ${metrics.idvCount} IDVs`}
            />
            <MetricCard
              title="Total Value"
              value={formatCurrency(metrics.totalValue)}
              description="Combined value"
            />
            <MetricCard
              title="Average Value"
              value={formatCurrency(metrics.avgValue)}
              description="Per opportunity"
            />
            <MetricCard
              title="Expiring Soon"
              value={metrics.expiringCount}
              description="Within 7 days"
              trend={metrics.expiringCount > 0 ? "up" : "stable"}
            />
            <MetricCard
              title="High Risk"
              value={metrics.highRiskCount}
              description="Needs attention"
              trend={metrics.highRiskCount > 0 ? "up" : "stable"}
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search opportunities by title, PIID, agency..."
                className="flex-1"
              />
              
              {/* View Mode Toggle */}
              <div className="flex border border-dark-gray rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-yellow-500 text-black' : 'text-gray-300'}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-yellow-500 text-black' : 'text-gray-300'}
                >
                  Cards
                </Button>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* AWD/IDV Toggle */}
              <div className="flex items-center gap-2 bg-dark-gold rounded-lg p-1">
                <Button
                  variant={opportunityType === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOpportunityType('all')}
                  className={opportunityType === 'all' ? 'bg-yellow-500 text-black' : 'text-gray-300'}
                >
                  All
                </Button>
                <Button
                  variant={opportunityType === 'AWD' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOpportunityType('AWD')}
                  className={opportunityType === 'AWD' ? 'bg-yellow-500 text-black' : 'text-gray-300'}
                >
                  <Award className="h-4 w-4 mr-1" />
                  AWDs
                </Button>
                <Button
                  variant={opportunityType === 'IDV' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOpportunityType('IDV')}
                  className={opportunityType === 'IDV' ? 'bg-yellow-500 text-black' : 'text-gray-300'}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  IDVs
                </Button>
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="posted">Posted Date</SelectItem>
                </SelectContent>
              </Select>

              {/* Agency Filter */}
              <Select value={filterAgency} onValueChange={setFilterAgency}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map(agency => (
                    <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Risk Filter */}
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {isLoading ? (
          <LoadingState message="Loading opportunities..." />
        ) : filteredOpportunities.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            description="Try adjusting your filters or search query"
            action={
              <Button onClick={() => {
                setSearchQuery('');
                setOpportunityType('all');
                setFilterAgency('all');
                setFilterRisk('all');
              }}>
                Clear Filters
              </Button>
            }
          />
        ) : viewMode === 'cards' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map(opportunity => (
              <div key={opportunity.id} className="relative">
                <button
                  onClick={() => toggleFavorite(opportunity.id)}
                  className="absolute top-2 right-2 z-10 p-1 rounded bg-dark-gold hover:bg-gold-800"
                >
                  <Star
                    className={`h-4 w-4 ${
                      favorites.includes(opportunity.id)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
                {opportunity.responseDeadline && getUrgencyIndicator(opportunity.responseDeadline) && (
                  <div className="absolute top-2 left-2 z-10">
                    {getUrgencyIndicator(opportunity.responseDeadline)}
                  </div>
                )}
                <OpportunityCard
                  opportunity={opportunity}
                  onClick={() => setSelectedOpportunity(opportunity)}
                />
              </div>
            ))}
          </div>
        ) : (
          <OpportunityTable
            opportunities={filteredOpportunities}
            onRowClick={(opportunity) => setSelectedOpportunity(opportunity)}
          />
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          isFavorited={favorites.includes(selectedOpportunity.id)}
          onToggleFavorite={() => toggleFavorite(selectedOpportunity.id)}
        />
      )}
    </div>
  );
}

// Content-only version for embedding in Identify page
export function ActiveOpportunitiesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [opportunityType, setOpportunityType] = useState<'all' | 'AWD' | 'IDV'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'deadline' | 'posted'>('deadline');
  const [filterAgency, setFilterAgency] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading] = useState(false);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    let results = [...mockOpportunities];

    // Type filter
    if (opportunityType !== 'all') {
      results = results.filter(o => o.type === opportunityType);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(o =>
        o.title.toLowerCase().includes(query) ||
        o.piid.toLowerCase().includes(query) ||
        o.agency.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query)
      );
    }

    // Agency filter
    if (filterAgency !== 'all') {
      results = results.filter(o => o.agency === filterAgency);
    }

    // Risk filter
    if (filterRisk !== 'all') {
      results = results.filter(o => o.riskLevel === filterRisk);
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue;
        case 'deadline':
          if (!a.responseDeadline) return 1;
          if (!b.responseDeadline) return -1;
          return new Date(a.responseDeadline).getTime() - new Date(b.responseDeadline).getTime();
        case 'posted':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        default:
          return 0;
      }
    });

    return results;
  }, [searchQuery, opportunityType, sortBy, filterAgency, filterRisk]);

  const toggleFavorite = (opportunityId: string) => {
    setFavorites(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const getUrgencyIndicator = (deadline?: Date) => {
    if (!deadline) return null;
    const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    if (daysUntil <= 3) return <Badge variant="destructive" className="text-xs">🔥 {daysUntil} days</Badge>;
    if (daysUntil <= 7) return <Badge variant="warning" className="text-xs">⚡ {daysUntil} days</Badge>;
    if (daysUntil <= 14) return <Badge variant="secondary" className="text-xs">{daysUntil} days</Badge>;
    return null;
  };

  return (
    <>
      {isLoading ? (
        <LoadingState message="Loading opportunities..." />
      ) : filteredOpportunities.length === 0 ? (
        <EmptyState
          title="No opportunities found"
          description="Try adjusting your filters or search query"
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map(opportunity => (
            <div key={opportunity.id} className="relative">
              <button
                onClick={() => toggleFavorite(opportunity.id)}
                className="absolute top-2 right-2 z-10 p-1 rounded bg-dark-gold hover:bg-gold-800"
              >
                <Star
                  className={`h-4 w-4 ${
                    favorites.includes(opportunity.id)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
              {opportunity.responseDeadline && getUrgencyIndicator(opportunity.responseDeadline) && (
                <div className="absolute top-2 left-2 z-10">
                  {getUrgencyIndicator(opportunity.responseDeadline)}
                </div>
              )}
              <OpportunityCard
                opportunity={opportunity}
                onClick={() => setSelectedOpportunity(opportunity)}
              />
            </div>
          ))}
        </div>
      ) : (
        <OpportunityTable
          opportunities={filteredOpportunities}
          onRowClick={(opportunity) => setSelectedOpportunity(opportunity)}
        />
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          isFavorited={favorites.includes(selectedOpportunity.id)}
          onToggleFavorite={() => toggleFavorite(selectedOpportunity.id)}
        />
      )}
    </>
  );
}