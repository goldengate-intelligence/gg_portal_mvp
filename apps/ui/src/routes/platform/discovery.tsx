import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Database, Target, Activity, Filter, Globe, BarChart3, TrendingUp, Shield, X, Brain } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';
import { useContractors, type ContractorFilters } from '../../hooks/useContractors';
import { apiClient, type FilterOptions, type ContractorStatistics, type ContractorData } from '../../lib/api-client';
import { ContractorDetailModal } from '../../components/platform/ContractorDetailModal';
import { Link } from '@tanstack/react-router';
import type { Contractor } from '../../types';

// Design Framework Components - Orange Theme
const ExternalPanelContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full border border-[#F97316]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#F97316]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
    {/* Animated background grid */}
    <div className="absolute inset-0 opacity-5 z-0">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(90deg, #F97316 1px, transparent 1px),
          linear-gradient(180deg, #F97316 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px'
      }} />
    </div>

    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
         style={{ background: 'linear-gradient(135deg, #F9731620, transparent)' }} />

    {children}
  </div>
);

const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040'
    }}
  >
    {children}
  </div>
);

const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-gray-200 font-normal uppercase tracking-wider"
    style={{
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em'
    }}
  >
    {children}
  </h3>
);

// Extended search filters interface
interface SearchFilters extends ContractorFilters {
  query: string;
}

// Adapter function to convert ContractorData to Contractor type for modal
const adaptContractorData = (data: ContractorData): Contractor => ({
  id: data.id,
  uei: data.contractorUei,
  name: data.contractorName,
  industry: (data.industryCluster as any) || 'other',
  location: data.country === 'US' ? 'domestic' : 'international',
  state: data.state || undefined,
  country: data.country || undefined,
  city: data.city || undefined,
  lifecycleStage: (data.lifecycleStage as any) || 'stable',
  businessMomentum: 'steady',
  ownershipType: 'private',
  totalContractValue: typeof data.totalObligated === 'string'
    ? parseFloat(data.totalObligated.replace(/[$,]/g, '')) || 0
    : data.totalObligated || 0,
  activeContracts: data.totalContracts,
  createdAt: new Date(data.cacheCreatedAt),
  updatedAt: new Date(data.cacheUpdatedAt),
  primaryAgency: data.primaryAgency,
  primaryNaicsCode: data.primaryNaicsCode,
  primaryNaicsDescription: data.primaryNaicsDescription,
});

// AI Query parsing interface
interface ParsedQuery {
  parameters: {
    primeContractPercentage?: { operator: 'less_than' | 'greater_than' | 'equals'; value: number };
    industries?: string[];
    contractTypes?: string[];
    minContracts?: number;
    maxContracts?: number;
    minValue?: number;
    maxValue?: number;
    agencies?: string[];
    states?: string[];
    lifecycleStages?: string[];
    performanceMetrics?: string[];
  };
  relevantColumns: string[];
  interpretation: string;
}

export function Discovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [statistics, setStatistics] = useState<ContractorStatistics | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<Set<string>>(new Set());
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('totalObligated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    states: [],
    industries: [],
    minObligated: undefined,
    maxObligated: undefined,
    lifecycleStages: [],
    agencies: [],
    sizeTiers: [],
  });

  // Disable real API for now, use mock data
  const {
    data: contractors,
    pagination,
    aggregations,
    isLoading,
    error,
    refetch
  } = useContractors({
    page,
    limit: 24,
    filters: {
      ...filters,
      search: searchQuery.trim() || undefined,
    },
    enabled: false
  });

  // Fallback mock data for development/testing
  const mockContractors = [
    {
      id: '1',
      contractorUei: 'TRIO12345',
      contractorName: 'Trio Fabrication LLC',
      city: 'Austin',
      state: 'TX',
      country: 'US',
      industryCluster: 'Manufacturing',
      primaryNaicsDescription: 'Manufacturing - Metal Fabrication',
      totalObligated: '$24.5M',
      totalContracts: 156,
      primaryAgency: 'Defense',
      lifecycleStage: 'Growth',
      isActive: true,
      cacheCreatedAt: new Date().toISOString(),
      cacheUpdatedAt: new Date().toISOString(),
      primarySubAgencyCode: null,
      zipCode: null,
      primaryNaicsCode: null,
      sizeTier: null,
      sizeQuartile: null,
      peerGroupRefined: null,
      agencyDiversity: 3,
      sourceLastUpdated: null,
      syncStatus: 'synced'
    },
    {
      id: '2',
      contractorUei: 'ADVA67890',
      contractorName: 'Advanced Systems Corp',
      city: 'Arlington',
      state: 'VA',
      country: 'US',
      industryCluster: 'Professional Services',
      primaryNaicsDescription: 'Professional Services - Consulting',
      totalObligated: '$15.2M',
      totalContracts: 89,
      primaryAgency: 'Navy',
      lifecycleStage: 'Stable',
      isActive: true,
      cacheCreatedAt: new Date().toISOString(),
      cacheUpdatedAt: new Date().toISOString(),
      primarySubAgencyCode: null,
      zipCode: null,
      primaryNaicsCode: null,
      sizeTier: null,
      sizeQuartile: null,
      peerGroupRefined: null,
      agencyDiversity: 2,
      sourceLastUpdated: null,
      syncStatus: 'synced'
    }
  ];

  // Use mock data if there's an error or no data
  const displayContractors = error || contractors.length === 0 ? mockContractors : contractors;
  const showMockData = error || contractors.length === 0;

  // Load filter options on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const options = await apiClient.getContractorFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    }

    async function loadStatistics() {
      try {
        const stats = await apiClient.getContractorStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    }

    loadFilterOptions();
    loadStatistics();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.states && filters.states.length > 0) count += filters.states.length;
    if (filters.industries && filters.industries.length > 0) count += filters.industries.length;
    if (filters.lifecycleStages && filters.lifecycleStages.length > 0) count += filters.lifecycleStages.length;
    if (filters.agencies && filters.agencies.length > 0) count += filters.agencies.length;
    if (filters.sizeTiers && filters.sizeTiers.length > 0) count += filters.sizeTiers.length;
    if (filters.minObligated !== undefined || filters.maxObligated !== undefined) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      states: [],
      industries: [],
      minObligated: undefined,
      maxObligated: undefined,
      lifecycleStages: [],
      agencies: [],
      sizeTiers: [],
    });
    setSearchQuery('');
    setPage(1);
  };

  const handleViewDetails = (contractor: ContractorData) => {
    setSelectedContractor(adaptContractorData(contractor));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContractor(null);
  };

  const handleExport = () => {
    // Convert contractor data to CSV format
    const headers = [
      'Name',
      'UEI',
      'Location',
      'Industry',
      'Primary Agency',
      'Total Obligated',
      'Total Contracts',
      'Lifecycle Stage',
      'Status'
    ];

    const csvData = displayContractors.map(contractor => [
      contractor.contractorName,
      contractor.contractorUei,
      `${contractor.city || ''}, ${contractor.state || ''}`.trim(),
      contractor.industryCluster || contractor.primaryNaicsDescription || 'N/A',
      contractor.primaryAgency || 'N/A',
      contractor.totalObligated,
      contractor.totalContracts,
      contractor.lifecycleStage || 'N/A',
      contractor.isActive ? 'Active' : 'Inactive'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell =>
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contractors-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const handleSelectContractor = (contractorId: string, checked: boolean) => {
    const newSelected = new Set(selectedContractors);
    if (checked) {
      newSelected.add(contractorId);
    } else {
      newSelected.delete(contractorId);
    }
    setSelectedContractors(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(displayContractors.map(c => c.id));
      setSelectedContractors(allIds);
    } else {
      setSelectedContractors(new Set());
    }
  };

  const handleSaveToPortfolio = () => {
    console.log('Saving to portfolio:', Array.from(selectedContractors));
    // TODO: Implement portfolio save functionality
    setSelectedContractors(new Set());
  };

  const handleSaveToGroup = () => {
    console.log('Saving to group:', Array.from(selectedContractors));
    // TODO: Implement group save functionality
    setSelectedContractors(new Set());
  };

  const handleSaveAsContractors = () => {
    console.log('Saving as contractors:', Array.from(selectedContractors));
    // TODO: Implement contractor save functionality
    setSelectedContractors(new Set());
  };

  // AI Query Parser - simulates parsing natural language to extract parameters
  const parseAIQuery = (query: string): ParsedQuery | null => {
    if (!query.trim()) return null;

    const lowerQuery = query.toLowerCase();
    const parsed: ParsedQuery = {
      parameters: {},
      relevantColumns: ['Company', 'Industry', 'Contract Type', 'Prime %'],
      interpretation: ''
    };

    // Parse prime contract percentage
    const primeMatch = lowerQuery.match(/(?:less than|<)\s*(\d+)%.*prime/);
    if (primeMatch) {
      parsed.parameters.primeContractPercentage = {
        operator: 'less_than',
        value: parseInt(primeMatch[1])
      };
      parsed.relevantColumns.push('Prime Contract %');
    }

    // Parse industries
    if (lowerQuery.includes('complex industries')) {
      parsed.parameters.industries = ['Aerospace', 'Defense Systems', 'Advanced Manufacturing'];
      parsed.relevantColumns.push('Industry Complexity');
    }
    if (lowerQuery.includes('aerospace')) {
      parsed.parameters.industries = ['Aerospace', 'Defense Aerospace'];
    }
    if (lowerQuery.includes('manufacturing')) {
      parsed.parameters.industries = ['Manufacturing', 'Advanced Manufacturing'];
    }

    // Parse contract types
    if (lowerQuery.includes('cost plus')) {
      parsed.parameters.contractTypes = ['Cost Plus', 'Cost Plus Fixed Fee'];
      parsed.relevantColumns.push('Contract Type', 'Cost Structure');
    }

    // Parse geographic filters
    if (lowerQuery.includes('texas')) {
      parsed.parameters.states = ['TX'];
      parsed.relevantColumns.push('Location');
    }

    // Parse value filters
    const valueMatch = lowerQuery.match(/over \$?(\d+)([mb]?)/);
    if (valueMatch) {
      const multiplier = valueMatch[2] === 'b' ? 1000000000 : valueMatch[2] === 'm' ? 1000000 : 1;
      parsed.parameters.minValue = parseInt(valueMatch[1]) * multiplier;
      parsed.relevantColumns.push('Contract Value');
    }

    // Parse agencies
    if (lowerQuery.includes('navy')) {
      parsed.parameters.agencies = ['Navy', 'Department of the Navy'];
      parsed.relevantColumns.push('Primary Agency');
    }
    if (lowerQuery.includes('defense')) {
      parsed.parameters.agencies = ['Defense', 'Department of Defense'];
    }

    // Parse lifecycle stages
    if (lowerQuery.includes('growth') || lowerQuery.includes('growing')) {
      parsed.parameters.lifecycleStages = ['Growth', 'Expansion'];
      parsed.relevantColumns.push('Growth Stage');
    }

    // Generate interpretation
    let interpretation = 'Found contractors matching: ';
    const criteria = [];

    if (parsed.parameters.primeContractPercentage) {
      criteria.push(`${parsed.parameters.primeContractPercentage.operator.replace('_', ' ')} ${parsed.parameters.primeContractPercentage.value}% prime contracts`);
    }
    if (parsed.parameters.industries) {
      criteria.push(`industries: ${parsed.parameters.industries.join(', ')}`);
    }
    if (parsed.parameters.contractTypes) {
      criteria.push(`contract types: ${parsed.parameters.contractTypes.join(', ')}`);
    }
    if (parsed.parameters.agencies) {
      criteria.push(`agencies: ${parsed.parameters.agencies.join(', ')}`);
    }
    if (parsed.parameters.states) {
      criteria.push(`states: ${parsed.parameters.states.join(', ')}`);
    }

    parsed.interpretation = interpretation + criteria.join(', ');

    return parsed;
  };

  const handleAISearch = () => {
    const parsed = parseAIQuery(searchQuery);
    setParsedQuery(parsed);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Sort contractors based on current sort settings
  const sortedContractors = useMemo(() => {
    if (!parsedQuery) return displayContractors;

    return [...displayContractors].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'primePercentage':
          aValue = Math.floor(Math.random() * 15) + 5;
          bValue = Math.floor(Math.random() * 15) + 5;
          break;
        case 'contractType':
          aValue = ['Cost Plus', 'Fixed Price', 'Cost Plus Fixed Fee'][Math.floor(Math.random() * 3)];
          bValue = ['Cost Plus', 'Fixed Price', 'Cost Plus Fixed Fee'][Math.floor(Math.random() * 3)];
          break;
        case 'totalObligated':
          aValue = parseFloat(a.totalObligated?.replace(/[$,M]/g, '') || '0');
          bValue = parseFloat(b.totalObligated?.replace(/[$,M]/g, '') || '0');
          break;
        case 'totalContracts':
          aValue = a.totalContracts || 0;
          bValue = b.totalContracts || 0;
          break;
        case 'contractorName':
          aValue = a.contractorName.toLowerCase();
          bValue = b.contractorName.toLowerCase();
          break;
        case 'primaryAgency':
          aValue = a.primaryAgency || '';
          bValue = b.primaryAgency || '';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [displayContractors, sortColumn, sortDirection, parsedQuery]);

  return (
    <div className="min-h-screen text-white pb-20" style={{ backgroundColor: '#010204' }}>
      {/* Hero Discovery Header */}
      <div className="relative overflow-hidden">
        {/* Ambient effects */}

        <div className="container mx-auto px-6 py-12 relative max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-xl backdrop-blur-sm">
                  <Brain className="w-8 h-8 text-[#F97316]" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-white uppercase tracking-wide" style={{ fontFamily: 'Michroma, sans-serif' }}>
                    Discovery Engine
                  </h1>
                  <p className="text-[#F97316] font-sans text-sm tracking-wide">
                    ASSET ORIGINATION • FORENSIC DUE DILIGENCE • BUSINESS DEVELOPMENT
                  </p>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-[#F97316]/30 rounded-lg backdrop-blur-sm">
                <Target className="w-4 h-4 text-[#F97316] animate-pulse" />
                <span className="text-xs text-[#F97316] font-sans uppercase">SCANNING</span>
              </div>
              <Button asChild className="bg-[#6366F1] hover:bg-[#6366F1]/80 text-white font-bold">
                <Link to="/platform/portfolio">VIEW PORTFOLIO</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">

        {/* AI-Native Search Section */}
        <div className="mb-8">
          <ExternalPanelContainer>
            <InternalContentContainer>
              {/* Header Section */}
              <div className="mb-4">
                <PanelTitle>DISCOVERY ENGINE</PanelTitle>
              </div>

              {/* Content Section */}
              <div className="flex-1">
                {/* Chart-Style Container */}
                <ChartStyleContainer>
                  <div className="relative h-full">
                    {/* Title */}
                    <div className="absolute top-0 left-0 z-10">
                      <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                        Neural Search Engine
                      </h3>
                    </div>

                    {/* Live Indicator */}
                    <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                      <span className="text-[10px] text-[#F97316] tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                        READY
                      </span>
                    </div>

                    {/* Content */}
                    <div className="pt-8 space-y-6">
                      {/* Large Query Input */}
                      <div>
                        <textarea
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Describe your ideal contractor profile...\n\nExamples:\n• Aerospace companies in Texas with Navy contracts\n• Manufacturing contractors with cost-plus agreements\n• Defense contractors with minimal prime exposure"
                          className="w-full h-32 px-4 py-3 bg-black/40 border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F97316]/50 transition-colors resize-none font-sans"
                        />
                      </div>

                      {/* Quick Suggestions */}
                      <div>
                        <div className="text-sm text-gray-400 mb-3">Quick searches:</div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#F97316]/30 text-gray-300 hover:text-white hover:border-[#F97316]/50 text-xs"
                            onClick={() => setSearchQuery('aerospace companies in Texas with Navy contracts')}
                          >
                            Texas Aerospace
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#F97316]/30 text-gray-300 hover:text-white hover:border-[#F97316]/50 text-xs"
                            onClick={() => setSearchQuery('manufacturing contractors with cost plus agreements')}
                          >
                            Cost-Plus Manufacturing
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#F97316]/30 text-gray-300 hover:text-white hover:border-[#F97316]/50 text-xs"
                            onClick={() => setSearchQuery('defense contractors with minimal prime exposure')}
                          >
                            Low Prime Defense
                          </Button>
                        </div>
                      </div>

                      {/* AI Response Area */}
                      {parsedQuery && (
                        <div className="p-4 bg-gradient-to-br from-[#F97316]/10 to-[#F97316]/10 border border-[#F97316]/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-4 h-4 text-[#F97316] animate-pulse" />
                            <span className="text-sm font-medium text-[#F97316]">AI Query Interpretation</span>
                          </div>
                          <div className="text-sm text-gray-300 leading-relaxed mb-3">
                            {parsedQuery.interpretation}
                          </div>
                          {parsedQuery.relevantColumns.length > 0 && (
                            <div className="text-xs text-gray-400">
                              Results will show: {parsedQuery.relevantColumns.join(' • ')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Button
                          className="bg-[#F97316] hover:bg-[#F97316]/80 text-white"
                          disabled={!searchQuery.trim()}
                          onClick={handleAISearch}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Search with AI
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#F97316]/30 text-gray-300 hover:text-white hover:border-[#F97316]/50"
                          onClick={() => {
                            setSearchQuery('');
                            setParsedQuery(null);
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#F97316]/30 text-gray-300 hover:text-white hover:border-[#F97316]/50"
                          onClick={handleExport}
                          disabled={displayContractors.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Results
                        </Button>
                      </div>
                    </div>
                  </div>
                </ChartStyleContainer>
              </div>
            </InternalContentContainer>
          </ExternalPanelContainer>
        </div>




        {/* Contractor Detail Modal */}
        <ContractorDetailModal
          contractor={selectedContractor}
          isOpen={showModal}
          onClose={handleCloseModal}
        />

        {/* Footer Copyright */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Discovery;