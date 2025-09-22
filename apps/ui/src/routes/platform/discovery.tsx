import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Database, Target, Activity, Filter, Globe, BarChart3, TrendingUp, Shield, X, Brain, Paperclip, Settings, History, MessageSquare, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';
import { useContractors, type ContractorFilters } from '../../hooks/useContractors';
import { apiClient, type FilterOptions, type ContractorStatistics, type ContractorData } from '../../lib/api-client';
import { ContractorDetailModal } from '../../components/platform/ContractorDetailModal';
import { QueryResultsTable } from '../../components/platform/QueryResultsTable';
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
  const [showQueryResults, setShowQueryResults] = useState(false);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [showEngineSettings, setShowEngineSettings] = useState(false);
  const [engineSettings, setEngineSettings] = useState({
    webSearchEnabled: true,
    databaseAccessEnabled: true,
    maxResults: 100,
    includeMetadata: true
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryStartTime, setQueryStartTime] = useState<Date | null>(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number>(0);
  const [showQueryHistoryModal, setShowQueryHistoryModal] = useState(false);
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [queryHistory, setQueryHistory] = useState<Array<{query: string, timestamp: string, executionTime: number}>>([]);
  const [showResultsNotification, setShowResultsNotification] = useState(false);
  const [showFullscreenResults, setShowFullscreenResults] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [terminalInitialized, setTerminalInitialized] = useState(false);
  const [initMessage, setInitMessage] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [processingDots, setProcessingDots] = useState('');
  const [hasInitialized, setHasInitialized] = useState(() => {
    // Check if we've already initialized this session
    return sessionStorage.getItem('discoveryTerminalInitialized') === 'true';
  });

  // Auto-scroll to bottom when conversation updates (disabled to prevent unwanted page jumps)
  // useEffect(() => {
  //   conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [conversation, isExecuting]);

  // Terminal initialization animation
  useEffect(() => {
    // Skip initialization if already done this session
    if (hasInitialized) {
      setTerminalInitialized(true);
      return;
    }

    const initLines = [
      'Initializing',
      'Connected.',
      'Goldengate Terminal is Active...',
      'Ready for queries and export requests.'
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let dotIndex = 0;
    let dotCycleCount = 0;

    const typeWriter = () => {
      if (lineIndex < initLines.length) {
        const currentLineText = initLines[lineIndex];

        // Special handling for "Initializing" line with animated dots
        if (lineIndex === 0 && charIndex >= currentLineText.length) {
          const dotPatterns = ['.', '..', '...', '..', '.', '..', '...', '..'];

          if (dotCycleCount < 2) { // Do 2 full cycles
            setInitMessage(prev => {
              const lines = prev.split('\n');
              lines[lineIndex] = currentLineText + dotPatterns[dotIndex];
              return lines.join('\n');
            });

            dotIndex++;
            if (dotIndex >= dotPatterns.length) {
              dotIndex = 0;
              dotCycleCount++;
            }

            setTimeout(typeWriter, 150); // Dot animation speed
          } else {
            // Finish with "Initializing..."
            setInitMessage(prev => {
              const lines = prev.split('\n');
              lines[lineIndex] = currentLineText + '...';
              return lines.join('\n');
            });

            // Move to next line
            setInitMessage(prev => prev + '\n');
            lineIndex++;
            charIndex = 0;
            dotIndex = 0;
            dotCycleCount = 0;
            setTimeout(typeWriter, 800); // Longer pause after initializing
          }
        } else if (charIndex < currentLineText.length) {
          // Normal typing for other lines (but we'll skip this for instant display)
          setInitMessage(prev => {
            const lines = prev.split('\n');
            lines[lineIndex] = currentLineText; // Show full line instantly
            return lines.join('\n');
          });
          charIndex = currentLineText.length; // Skip to end
          setTimeout(typeWriter, 10); // Continue immediately
        } else {
          // Line complete, add newline and move to next
          setInitMessage(prev => prev + '\n');
          lineIndex++;
          charIndex = 0;
          setTimeout(typeWriter, 500); // Pause between lines
        }
      } else {
        // Animation complete
        setTimeout(() => {
          setTerminalInitialized(true);
          setHasInitialized(true);
          // Mark as initialized for this session
          sessionStorage.setItem('discoveryTerminalInitialized', 'true');
        }, 1000);
      }
    };

    // Start animation after component mounts
    const timeout = setTimeout(() => {
      typeWriter();
    }, 500);

    return () => clearTimeout(timeout);
  }, [hasInitialized]);

  // Processing query dots animation
  useEffect(() => {
    if (isExecuting) {
      const dotPatterns = ['.', '..', '...', '..', '.', '..', '...', '..'];
      let dotIndex = 0;

      const animateDots = () => {
        setProcessingDots(dotPatterns[dotIndex]);
        dotIndex = (dotIndex + 1) % dotPatterns.length;
      };

      // Start immediately
      animateDots();
      const interval = setInterval(animateDots, 150);

      return () => clearInterval(interval);
    } else {
      setProcessingDots('');
    }
  }, [isExecuting]);
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

  // Query timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isExecuting && queryStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - queryStartTime.getTime()) / 1000);
        setQueryExecutionTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExecuting, queryStartTime]);

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

  // Generate descriptive AI response based on query
  const generateAIResponse = (query: string, results: any[], columns: string[]) => {
    const lowerQuery = query.toLowerCase();
    const resultCount = results.length;

    // Determine what the query was asking for
    let queryType = 'search';
    let description = '';

    if (lowerQuery.includes('export') || lowerQuery.includes('spreadsheet') || lowerQuery.includes('download')) {
      queryType = 'export';
      description = `I've generated a spreadsheet with ${resultCount} contractors matching your criteria. The export includes ${columns.length} columns: ${columns.slice(0, 3).join(', ')}${columns.length > 3 ? ` and ${columns.length - 3} more` : ''}.`;
    } else if (lowerQuery.includes('show') || lowerQuery.includes('find') || lowerQuery.includes('list')) {
      queryType = 'search';
      description = `I found ${resultCount} contractors matching your search criteria. The results are displayed in a table with key information including contractor names, UEI numbers, contract values, and agency relationships.`;
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('compare')) {
      queryType = 'analysis';
      description = `I've analyzed ${resultCount} contractors based on your query. The analysis includes performance metrics, contract patterns, and comparative data across the identified organizations.`;
    } else {
      queryType = 'general';
      description = `I've processed your query and returned ${resultCount} relevant contractor records. The data includes comprehensive information about each organization's contract history, performance metrics, and key identifiers.`;
    }

    // Add specific insights based on query content
    if (lowerQuery.includes('manufacturing')) {
      description += ` The results focus on manufacturing sector contractors with relevant NAICS codes and industry classifications.`;
    } else if (lowerQuery.includes('defense') || lowerQuery.includes('dod')) {
      description += ` The results are filtered for Defense Department contractors and related agencies.`;
    } else if (lowerQuery.includes('small business')) {
      description += ` The results include small business designations and set-aside contract information.`;
    }

    description += ` You can export this data, view individual contractor details, or refine your search with additional criteria.`;

    return description;
  };

  const handleAISearch = () => {
    if (isExecuting || !searchQuery.trim()) return;

    // Add user message to conversation
    const userMessage = {
      type: 'user' as const,
      content: searchQuery,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    setIsExecuting(true);
    const startTime = new Date();
    setQueryStartTime(startTime);
    setQueryExecutionTime(0);

    const parsed = parseAIQuery(searchQuery);
    setParsedQuery(parsed);

    // Simulate database query execution
    setIsLoadingResults(true);
    setShowResultsNotification(true);

    // Clear the input after submission
    const currentQuery = searchQuery;
    setSearchQuery('');

    // Mock delay for query execution
    setTimeout(() => {
      const endTime = new Date();
      const executionTimeSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Generate mock database results based on query
      const mockData = generateMockQueryResults(currentQuery);
      setQueryResults(mockData.data);
      setQueryColumns(mockData.columns);

      // Generate AI response describing the output
      const response = generateAIResponse(currentQuery, mockData.data, mockData.columns);

      // Add AI response to conversation
      const aiMessage = {
        type: 'ai' as const,
        content: response,
        timestamp: endTime
      };
      setConversation(prev => [...prev, aiMessage]);

      setIsLoadingResults(false);
      setIsExecuting(false);
      setQueryStartTime(null);
      setQueryExecutionTime(0);

      // Add to query history
      const historyEntry = {
        query: currentQuery,
        timestamp: endTime.toISOString(),
        executionTime: executionTimeSeconds
      };
      setQueryHistory(prev => [historyEntry, ...prev]);
    }, 2000);
  };

  const handleInterrupt = () => {
    if (isExecuting) {
      setIsExecuting(false);
      setIsLoadingResults(false);
      setQueryStartTime(null);
      setQueryExecutionTime(0);
      console.log('Query execution interrupted');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAISearch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleInterrupt();
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setShowQueryResults(false);
    setQueryResults([]);
    setQueryColumns([]);
  };

  // Generate mock database query results
  const generateMockQueryResults = (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Basic columns that would come from database
    let columns = ['CONTRACTOR_NAME', 'UEI', 'TOTAL_OBLIGATED', 'CONTRACT_COUNT', 'PRIMARY_AGENCY'];
    let data: any[] = [];

    // Add specific columns based on query content
    if (lowerQuery.includes('prime') || lowerQuery.includes('percentage')) {
      columns.push('PRIME_CONTRACT_PCT');
    }
    if (lowerQuery.includes('cost plus') || lowerQuery.includes('contract type')) {
      columns.push('CONTRACT_TYPE');
    }
    if (lowerQuery.includes('industry') || lowerQuery.includes('manufacturing') || lowerQuery.includes('aerospace')) {
      columns.push('INDUSTRY_SECTOR');
    }
    if (lowerQuery.includes('state') || lowerQuery.includes('location') || lowerQuery.includes('texas')) {
      columns.push('STATE', 'CITY');
    }

    // Generate sample rows
    const sampleRows = [
      {
        CONTRACTOR_NAME: 'Advanced Manufacturing Solutions LLC',
        UEI: 'ADV123456789',
        TOTAL_OBLIGATED: 45600000,
        CONTRACT_COUNT: 23,
        PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE',
        PRIME_CONTRACT_PCT: 12,
        CONTRACT_TYPE: 'Cost Plus Fixed Fee',
        INDUSTRY_SECTOR: 'Advanced Manufacturing',
        STATE: 'TX',
        CITY: 'Austin'
      },
      {
        CONTRACTOR_NAME: 'Aerospace Dynamics Corporation',
        UEI: 'AER987654321',
        TOTAL_OBLIGATED: 78200000,
        CONTRACT_COUNT: 45,
        PRIMARY_AGENCY: 'DEPARTMENT OF THE NAVY',
        PRIME_CONTRACT_PCT: 8,
        CONTRACT_TYPE: 'Cost Plus Award Fee',
        INDUSTRY_SECTOR: 'Aerospace',
        STATE: 'CA',
        CITY: 'Los Angeles'
      },
      {
        CONTRACTOR_NAME: 'Precision Systems Integration Inc',
        UEI: 'PSI555666777',
        TOTAL_OBLIGATED: 32100000,
        CONTRACT_COUNT: 67,
        PRIMARY_AGENCY: 'DEPARTMENT OF THE AIR FORCE',
        PRIME_CONTRACT_PCT: 15,
        CONTRACT_TYPE: 'Fixed Price',
        INDUSTRY_SECTOR: 'Professional Services',
        STATE: 'VA',
        CITY: 'Arlington'
      },
      {
        CONTRACTOR_NAME: 'Complex Systems Research LLC',
        UEI: 'CSR444555666',
        TOTAL_OBLIGATED: 91500000,
        CONTRACT_COUNT: 34,
        PRIMARY_AGENCY: 'DEPARTMENT OF DEFENSE',
        PRIME_CONTRACT_PCT: 6,
        CONTRACT_TYPE: 'Cost Plus Fixed Fee',
        INDUSTRY_SECTOR: 'Research and Development',
        STATE: 'MD',
        CITY: 'Baltimore'
      },
      {
        CONTRACTOR_NAME: 'Industrial Technologies Group',
        UEI: 'ITG222333444',
        TOTAL_OBLIGATED: 23800000,
        CONTRACT_COUNT: 89,
        PRIMARY_AGENCY: 'GENERAL SERVICES ADMINISTRATION',
        PRIME_CONTRACT_PCT: 18,
        CONTRACT_TYPE: 'Fixed Price',
        INDUSTRY_SECTOR: 'Manufacturing',
        STATE: 'OH',
        CITY: 'Cleveland'
      }
    ];

    return { columns, data: sampleRows };
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
    <div className="text-white relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 pt-20 pb-20" style={{ minHeight: '100vh' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, #F97316 1px, transparent 1px),
            linear-gradient(180deg, #F97316 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px'
        }} />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
      {/* Hero Discovery Header */}
      <div className="relative overflow-hidden mt-6">
        <div className="container mx-auto px-6 pt-0 pb-4 relative max-w-7xl">
          <div className="w-full">
            <div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6 border border-gray-700/50 hover:border-gray-600/40">
              {/* Gradient background matching financial metric cards */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-xl backdrop-blur-sm">
                        <Brain className="w-8 h-8 text-[#F97316]" />
                      </div>
                      <div>
                        <h1 className="text-4xl text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '250' }}>
                          Discovery Engine
                        </h1>
                        <p className="text-[#F97316] font-sans text-sm tracking-wide">
                          ASSET ORIGINATION • FORENSIC DUE DILIGENCE • BUSINESS DEVELOPMENT
                        </p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Research government contractors using intelligent search with integrated database access.
                    </p>
                  </div>

                  {/* System Status */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-[#F97316]/30 rounded-lg backdrop-blur-sm">
                      <Target className="w-4 h-4 text-[#F97316] animate-pulse" />
                      <span className="text-xs text-[#F97316] font-sans uppercase">SCANNING</span>
                    </div>
                    <Button asChild className="bg-[#6366F1] hover:bg-[#6366F1]/80 text-white font-bold w-40">
                      <Link to="/platform/portfolio">VIEW PORTFOLIO</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-6">

        {/* AI-Native Search Section */}
        <div className="mb-8 mt-6 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="border border-[#F97316]/30 rounded-xl hover:border-[#F97316]/50 transition-all duration-500">
              <InternalContentContainer>

              {/* Content Section */}
              <div className="flex-1">
                {/* Chart-Style Container */}
                <ChartStyleContainer>
                  <div className="relative h-full">
                    {/* Title */}
                    <div className="absolute top-0 left-0 z-10">
                      <h3 className="font-sans text-xs uppercase tracking-wider text-[#D2AC38]">
                        Goldengate Terminal
                      </h3>
                    </div>

                    {/* Results notification - top right */}
                    <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                      {showResultsNotification && (
                        <button
                          onClick={() => setShowFullscreenResults(true)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-green-600/20 border border-green-600/40 rounded-full hover:bg-green-600/30 transition-colors animate-pulse"
                          title="View results"
                        >
                          <BarChart3 className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">Results Ready</span>
                        </button>
                      )}
                    </div>



                    {/* Content */}
                    <div className="pt-8 space-y-6">
                      {/* Terminal */}
                      <div className="bg-black border border-gray-700 rounded-lg h-80 overflow-hidden font-mono text-sm tracking-tighter">
                        <div className="h-full overflow-y-auto p-4">
                          {/* Initialization Animation */}
                          {!terminalInitialized && conversation.length === 0 && (
                            <div className="text-gray-500 whitespace-pre-line">
                              {initMessage}
                            </div>
                          )}

                          {/* History */}
                          {terminalInitialized && conversation.length === 0 && (
                            <>
                              <div className="text-gray-500">Initializing...</div>
                              <div className="text-gray-500">Connected.</div>
                              <div className="text-gray-500">Goldengate Terminal is Active...</div>
                              <div className="text-gray-500 mb-2">Ready for queries and export requests.</div>
                            </>
                          )}

                          {conversation.map((message, index) => (
                            <div key={index}>
                              {message.type === 'user' ? (
                                <div className="text-green-400 mb-3">
                                  <span className="text-green-400">user@discovery:~$ </span>{message.content}
                                </div>
                              ) : (
                                <div className="text-white whitespace-pre-wrap leading-relaxed mb-3">
                                  {message.content}
                                </div>
                              )}
                            </div>
                          ))}

                          {isExecuting && (
                            <div className="text-gray-500">
                              Processing query{processingDots}
                            </div>
                          )}

                          {/* Current prompt */}
                          {!isExecuting && terminalInitialized && (
                            <div className="flex items-start">
                              <span className="text-green-400 flex-shrink-0">user@discovery:~$ </span>
                              <div className="flex-1 min-w-0">
                                <textarea
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  className="w-full bg-transparent text-green-400 outline-none border-none resize-none overflow-hidden"
                                  placeholder=""
                                  autoFocus
                                  rows={1}
                                  style={{
                                    lineHeight: '1.2',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                  onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div ref={conversationEndRef} />
                        </div>
                      </div>

                      {/* Keyboard Shortcuts Info */}
                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Enter</kbd> to execute</span>
                          <span>Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-gray-300">Esc</kbd> to interrupt</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowAttachments(true)}
                            className="p-1 text-gray-400 hover:text-[#F97316] transition-colors"
                            title="Attach contextual documents"
                          >
                            <Paperclip className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setShowEngineSettings(true)}
                            className="p-1 text-gray-400 hover:text-[#F97316] transition-colors"
                            title="Engine Settings"
                          >
                            <Settings className="w-3 h-3" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-[#F97316] transition-colors"
                            title="Save conversation to portfolio"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>



                    </div>
                  </div>
                </ChartStyleContainer>
              </div>
              </InternalContentContainer>
            </div>
          </div>
        </div>

        {/* Fullscreen Results Modal */}
        {showFullscreenResults && (
          <div className="fixed z-[70] bg-black/90 backdrop-blur-sm" style={{ top: '80px', left: '0', right: '0', bottom: '80px' }}>
            <div className="w-full h-full p-4">
              <div className="bg-gray-900 border border-[#F97316]/30 rounded-xl w-full h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h3 className="text-xl font-medium text-gray-200">Query Results</h3>
                  <div className="flex items-center gap-3">
                    <button
                      className="px-3 py-1.5 text-sm bg-[#F97316]/20 hover:bg-[#F97316]/30 text-[#F97316] border border-[#F97316]/40 hover:border-[#F97316]/60 transition-all duration-200 rounded flex items-center gap-1.5"
                      onClick={handleExport}
                      disabled={queryResults.length === 0}
                    >
                      <Download className="w-3 h-3" />
                      Export Results
                    </button>
                    <button
                      onClick={() => {
                        setShowFullscreenResults(false);
                        setShowResultsNotification(false);
                      }}
                      className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 rounded-md flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 h-[calc(100%-80px)] overflow-auto">
                  <QueryResultsTable
                    data={queryResults}
                    columns={queryColumns}
                    isLoading={isLoadingResults}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attachments Modal */}
        {showAttachments && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                e.stopPropagation();
                setShowAttachments(false);
              }
            }}
          >
            <div
              className="w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col rounded-xl border border-gray-700 bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-700/30 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px' }}>
                      ATTACH DOCUMENTS
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Goldengate Terminal (user@discovery:~$)</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowAttachments(false);
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded-md flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-black">
                {/* Drop Zone */}
                <div
                  className="border-2 border-dashed border-gray-600 hover:border-[#F97316]/50 hover:bg-[#F97316]/5 rounded-lg p-8 text-center transition-all duration-200 cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-200 mb-2">
                    Drop files or click to browse
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload documents, images, spreadsheets, and more to your knowledge base
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 50MB • Supported formats: PDF, DOC, XLS, IMG, TXT, etc.
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700/30 px-6 py-4 flex justify-between items-center bg-gray-800">
                <p className="text-xs text-gray-500">
                  Files will be used to provide additional context for terminal queries
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowAttachments(false);
                    }}
                    className="border border-gray-600 text-gray-300 hover:bg-gray-800 px-3 py-1.5 text-sm rounded transition-colors"
                  >
                    Close
                  </button>
                  <button
                    className="bg-[#F97316]/20 hover:bg-[#F97316]/30 text-[#F97316] border border-[#F97316]/40 px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Add More Files
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engine Settings Modal */}
        {showEngineSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-900 border border-[#F97316]/30 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-200">Discovery Engine Settings</h3>
                <button
                  onClick={() => setShowEngineSettings(false)}
                  className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 rounded-md flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Settings Form */}
              <div className="space-y-6">
                {/* Database Access */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Database Access
                  </label>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm text-white">Enable database queries</span>
                      <p className="text-xs text-gray-400">Allow terminal to access contractor database</p>
                    </div>
                    <button
                      onClick={() => setEngineSettings(prev => ({ ...prev, databaseAccessEnabled: !prev.databaseAccessEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        engineSettings.databaseAccessEnabled ? 'bg-[#F97316]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          engineSettings.databaseAccessEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Web Search Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Web Search Access
                  </label>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm text-white">Enable web search</span>
                      <p className="text-xs text-gray-400">Allow engine to search external sources</p>
                    </div>
                    <button
                      onClick={() => setEngineSettings(prev => ({ ...prev, webSearchEnabled: !prev.webSearchEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        engineSettings.webSearchEnabled ? 'bg-[#F97316]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          engineSettings.webSearchEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Max Results */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Maximum Results
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={engineSettings.maxResults}
                      onChange={(e) => setEngineSettings(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>10</span>
                      <span className="text-white">{engineSettings.maxResults}</span>
                      <span>500</span>
                    </div>
                  </div>
                </div>

                {/* Include Metadata */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Data Options
                  </label>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm text-white">Include metadata</span>
                      <p className="text-xs text-gray-400">Show detailed context and source information</p>
                    </div>
                    <button
                      onClick={() => setEngineSettings(prev => ({ ...prev, includeMetadata: !prev.includeMetadata }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        engineSettings.includeMetadata ? 'bg-[#F97316]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          engineSettings.includeMetadata ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEngineSettings(false)}
                  className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 px-4 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contractor Detail Modal */}
        <ContractorDetailModal
          contractor={selectedContractor}
          isOpen={showModal}
          onClose={handleCloseModal}
        />


        {/* Query History Modal */}
        {showQueryHistoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-[#F97316]/30 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-200">Query History</h3>
                  <p className="text-sm text-gray-400">Cache historical database query returns for 24 hours</p>
                </div>
                <button
                  onClick={() => setShowQueryHistoryModal(false)}
                  className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 rounded-md flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Query List */}
              <div className="space-y-3">
                {queryHistory.length > 0 ? (
                  queryHistory.map((entry, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-300">Query {queryHistory.length - index}</span>
                          <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{entry.executionTime}s</span>
                          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">EXECUTED</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 bg-black/30 p-3 rounded border">
                        {entry.query}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No queries executed yet</p>
                    <p className="text-sm text-gray-500">Query history will appear here after executing searches</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowQueryHistoryModal(false)}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Copyright */}
        <div className="mt-16 text-center" style={{ marginTop: '82px' }}>
          <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
      </div>
    </div>
  );
}

export default Discovery;