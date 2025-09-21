import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  ArrowLeft,
  Target,
  ExternalLink,
  Download,
  Share2,
  Activity,
  Users,
  Shield,
  Database,
  Terminal,
  Globe,
  Crosshair,
  Lock,
  Unlock,
  Zap,
  FileText,
  FolderOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { HudCard, HudCardHeader, HudCardContent, TacticalDisplay, TargetReticle } from '../../components/ui/hud-card';
import { LoadingState } from '../../components/ui/skeleton';
import { GoldengateLineChart, GoldengateBarChart, GoldengateAreaChart, GoldengateBubbleChart, GoldengateRadarChart, GoldengateDoughnutChart, GoldengateNetworkGraph } from '../../lib/charts';
import USAMap from 'react-usa-map';
import { apiClient } from '../../lib/api-client';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';
import type { Contractor } from '../../types';
import { PlatformFooter } from '../../components/platform/PlatformFooter';
import { useAuth } from '../../contexts/auth-context';
import { Settings } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { getLocationCoordinates, coordinatesToMapPercentage, parsePlaceOfPerformance, type LocationData } from '../../lib/geocoding';
import { NetworkV1Layout } from '../../components/NetworkV1Layout';
import { NaicsMixPanel, PscMixPanel, PipelinePositionPanel } from '../../components/ContractsPanels';
import { PeopleSection } from '../../components/PeopleSection';

export default function ContractorDetail() {
  const { user, logout } = useAuth();
  const params = useParams({ from: '/platform/contractor-detail/$contractorId' });
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  
  // Debug the params
  console.log('ContractorDetail params:', params);
  console.log('ContractorDetail contractorId:', params.contractorId);
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [yAxisMetric, setYAxisMetric] = useState('ttm_revenue');
  const [xAxisMetric, setXAxisMetric] = useState('composite_score');
  const [revenueTimeAggregation, setRevenueTimeAggregation] = useState('M');
  const [revenueTimePeriod, setRevenueTimePeriod] = useState('5');

  // Helper function to get geocoded map positions
  const getMapPosition = (zipCode?: string, city?: string, state?: string) => {
    const location = getLocationCoordinates(zipCode, city, state);
    if (location) {
      return coordinatesToMapPercentage(location.coordinates);
    }
    return { left: '50%', top: '50%' }; // fallback to center
  };

  const getYAxisTitle = (metric: string) => {
    const titles: Record<string, string> = {
      'ttm_awards': 'Awards Captured (TTM)',
      'ttm_revenue': 'Estimated Revenue (TTM)',
      'lifetime_awards': 'Lifetime Awards',
      'lifetime_revenue': 'Lifetime Revenue',
      'total_pipeline': 'Total Pipeline',
      'portfolio_duration': 'Portfolio Duration',
      'blended_growth': 'Blended Growth'
    };
    return titles[metric] || 'Financial Performance';
  };

  const getFilteredRevenueData = () => {
    if (!performanceData?.metrics) return [];
    
    // Filter by time period (years back from current date)
    const yearsBack = parseInt(revenueTimePeriod);
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsBack);
    
    const filtered = performanceData.metrics.filter((d: any) => {
      const itemDate = new Date(d.monthYear + '-01');
      return itemDate >= cutoffDate;
    });

    // Aggregate by time aggregation (M/Q/Y)
    if (revenueTimeAggregation === 'M') {
      return filtered; // Already monthly
    } else if (revenueTimeAggregation === 'Q') {
      // Group by quarters
      const quarters: any = {};
      filtered.forEach((d: any) => {
        const date = new Date(d.monthYear + '-01');
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const key = `${year}-Q${quarter}`;
        
        if (!quarters[key]) {
          quarters[key] = { monthYear: key, monthlyRevenue: 0, count: 0 };
        }
        quarters[key].monthlyRevenue += parseFloat(d.monthlyRevenue || '0');
        quarters[key].count += 1;
      });
      return Object.values(quarters);
    } else if (revenueTimeAggregation === 'Y') {
      // Group by years
      const years: any = {};
      filtered.forEach((d: any) => {
        const date = new Date(d.monthYear + '-01');
        const year = date.getFullYear();
        const key = year.toString();
        
        if (!years[key]) {
          years[key] = { monthYear: key, monthlyRevenue: 0, count: 0 };
        }
        years[key].monthlyRevenue += parseFloat(d.monthlyRevenue || '0');
        years[key].count += 1;
      });
      return Object.values(years);
    }
    
    return filtered;
  };

  const getChartTitle = (yMetric: string, xMetric?: string) => {
    // Get the X-axis title without "(Percentile Score)"
    const xTitle = xMetric ? getXAxisTitle(xMetric).replace(' (Percentile Score)', '') : 'Composite Score';
    // Get the Y-axis title
    const yTitle = getYAxisTitle(yMetric);
    return `${xTitle} vs ${yTitle}`;
  };

  // Helper function to get X-axis value for bubble chart based on selected metric
  const getXAxisValue = (metric: string) => {
    // These values should match the Performance Scores subscores
    const xValues: Record<string, number> = {
      'composite_score': 80,
      'awards_captured': 82,
      'revenue': 76,
      'pipeline_value': 91,
      'portfolio_duration': 68,
      'blended_growth': 85
    };
    return xValues[metric] || 92;
  };

  // Helper function to generate peer data for X-axis
  const generatePeerDataForXAxis = (metric: string) => {
    const baseValue = getXAxisValue(metric);

    // Generate Y values based on the selected Y-axis metric
    const getYValue = () => {
      if (yAxisMetric === 'portfolio_duration') {
        return 1 + Math.random() * 8; // Range: 1-9 years
      } else if (yAxisMetric === 'blended_growth') {
        return -20 + Math.random() * 60; // Range: -20% to 40%
      } else {
        return 150 + Math.random() * 300; // Default for financial metrics: $150M-$450M
      }
    };

    // Generate peer data points around the selected metric value
    return Array.from({ length: 11 }, (_, i) => ({
      x: baseValue - 30 + Math.random() * 60, // Spread around the metric value
      y: getYValue(),
      r: 3
    }));
  };

  // Helper function to get X-axis title
  const getXAxisTitle = (metric: string) => {
    const titles: Record<string, string> = {
      'composite_score': 'Composite Score (Percentile Score)',
      'awards_captured': 'Awards Captured (TTM) (Percentile Score)',
      'revenue': 'Estimated Revenue (TTM) (Percentile Score)',
      'pipeline_value': 'Total Pipeline (Percentile Score)',
      'portfolio_duration': 'Portfolio Duration (Percentile Score)',
      'blended_growth': 'Blended Growth (Percentile Score)'
    };
    return titles[metric] || 'Composite Score (Percentile Score)';
  };

  useEffect(() => {
    if (params.contractorId) {
      fetchContractorData();
      fetchEnhancedData();
    }
  }, [params.contractorId]);

  const fetchContractorData = async () => {
    try {
      console.log('Fetching contractor profile for ID:', params.contractorId);
      
      // Get the contractor profile detail
      const profileDetail = await apiClient.getContractorProfile(params.contractorId);
      console.log('Received profile detail:', profileDetail);
      
      // Extract the profile from the detail response
      const profile = profileDetail.profile;
      
      // Industry mapping
      const industryMap: Record<string, string> = {
        'Defense': 'defense',
        'Information Technology': 'information-technology',
        'Professional Services': 'professional-services',
        'Construction': 'construction',
        'Manufacturing': 'manufacturing',
        'Research and Development': 'research-development',
        'Healthcare': 'healthcare',
        'Transportation': 'transportation',
        'Agriculture': 'agriculture',
        'Energy': 'energy',
        'Education Services': 'education',
        'Financial Services': 'financial-services',
        'Environmental Services': 'environmental-services',
        'Telecommunications': 'telecommunications',
        'Facilities Management': 'facilities-management',
        'Other': 'other',
      };
      
      // Transform to contractor format (similar to the modal)
      const contractorData = {
        id: profile.id,
        uei: (profile.totalUeis && profile.totalUeis > 0) ? `PROFILE-${profile.totalUeis}` : undefined,
        name: 'Trio Fabrication LLC',
        dbaName: 'Trio Fabrication LLC',
        industry: (industryMap[profile.primaryIndustryCluster || 'Other'] || 'other') as any,
        location: (profile.statesList?.length > 0 ? 'US' : 'International') as any,
        state: profile.headquartersState || undefined,
        country: profile.statesList?.length > 0 ? 'United States' : 'International',
        
        totalContractValue: parseFloat(profile.totalObligated) || 0,
        activeContracts: profile.totalContracts || 0,
        pastPerformanceScore: profile.performanceScore || 85,
        
        lifecycleStage: (profile.dominantLifecycleStage?.toLowerCase() || 'active') as any,
        businessMomentum: profile.performanceScore && profile.performanceScore > 80 ? 'high-growth' : 'steady-growth' as any,
        ownershipType: (profile.dominantSizeTier === 'LARGE' || profile.dominantSizeTier === 'MEGA' ? 'public' : 'private') as any,
        
        createdAt: new Date(profile.profileCreatedAt),
        updatedAt: new Date(profile.profileUpdatedAt),
        
        // Profile-specific fields
        totalUeis: profile.totalUeis,
        primaryAgency: profile.primaryAgency,
        totalAgencies: profile.totalAgencies,
        agencyDiversity: profile.agencyDiversity,
        totalStates: profile.totalStates,
        statesList: profile.statesList,
        primaryNaicsCode: profile.primaryNaicsCode,
        primaryNaicsDescription: profile.primaryNaicsDescription,
        industryClusters: profile.industryClusters,
        sizeTier: profile.dominantSizeTier,
        performanceScore: profile.performanceScore,
        profileCompleteness: profile.profileCompleteness,

        // Additional fields from detail
        city: profileDetail.ueis?.[0]?.state || profile.headquartersState || 'Unknown',
        phone: undefined,
        establishedDate: new Date(2000, 0, 1), // Not available in profile
        recentContracts: [] // Would need separate API call
      };
      
      console.log('Contractor data set successfully');
      console.log('Final contractor object:', contractorData);
      console.log('UEI being set:', contractorData.uei || 'undefined - will use UNKNOWN12345');

      setContractor(contractorData);
      
    } catch (error) {
      console.error('Failed to fetch contractor data:', error);
      // Create a fallback contractor object so the page still renders
      setContractor({
        id: params.contractorId,
        uei: undefined, // Will fallback to UNKNOWN12345
        name: 'Trio Fabrication LLC',
        dbaName: 'Trio Fabrication LLC',
        industry: 'other' as any,
        location: 'US' as any,
        state: 'Unknown',
        country: 'United States',
        
        totalContractValue: 0,
        activeContracts: 0,
        pastPerformanceScore: 50,
        
        lifecycleStage: 'active' as any,
        businessMomentum: 'steady-growth' as any,
        ownershipType: 'private' as any,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        
        totalUeis: 1,
        primaryAgency: 'Unknown',
        totalAgencies: 0,
        agencyDiversity: 0,
        totalStates: 1,
        statesList: ['Unknown'],
        primaryNaicsCode: null,
        primaryNaicsDescription: null,
        industryClusters: [],
        sizeTier: null,
        performanceScore: 50,
        profileCompleteness: 0,

        city: 'Unknown',
        phone: undefined,
        establishedDate: new Date(2000, 0, 1),
        recentContracts: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnhancedData = async () => {
    if (!params.contractorId) return;
    
    console.log('Fetching enhanced data for contractor:', params.contractorId);
    
    try {
      // Try to fetch each data type individually, don't let one failure stop the others
      const promises = await Promise.allSettled([
        apiClient.getContractorPerformanceMetrics(params.contractorId, 36).catch(err => {
          console.warn('Failed to fetch performance metrics for contractor', params.contractorId, ':', err.message);
          return null;
        }),
        apiClient.getContractorPeerComparison(params.contractorId).catch(err => {
          console.warn('Failed to fetch peer comparison for contractor', params.contractorId, ':', err.message);
          return null;
        }),
        apiClient.getContractorNetwork(params.contractorId, 10).catch(err => {
          console.warn('Failed to fetch network data for contractor', params.contractorId, ':', err.message);
          return null;
        })
      ]);

      const [perfResult, benchResult, netResult] = promises;
      
      if (perfResult.status === 'fulfilled' && perfResult.value && perfResult.value.metrics && perfResult.value.metrics.length > 0) {
        console.log('Performance data received:', perfResult.value);
        setPerformanceData(perfResult.value);
      } else {
        console.log('No performance data available, using mock data for demo');
        // Generate mock data for demonstration purposes
        const mockMetrics = [];
        const now = new Date();
        const baseRevenue = 50000000 / 12; // Mock base revenue
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const variance = 0.3;
          const revenue = baseRevenue * (1 + (Math.random() - 0.5) * variance);
          const contracts = Math.max(1, Math.floor(10 + (Math.random() - 0.5) * 5));
          
          mockMetrics.push({
            monthYear: date,
            monthlyRevenue: revenue.toString(),
            activeContracts: contracts,
            avgWinRate: (75 + (Math.random() - 0.5) * 20).toString(),
            revenueGrowthYoy: ((Math.random() - 0.4) * 30).toString(),
            activityStatus: Math.random() > 0.8 ? 'hot' : Math.random() > 0.6 ? 'warm' : 'stable'
          });
        }
        
        setPerformanceData({
          contractor: { id: params.contractorId, name: 'Loading...' },
          metrics: mockMetrics,
          summary: {
            totalRevenue: mockMetrics.reduce((sum, m) => sum + parseFloat(m.monthlyRevenue), 0),
            avgMonthlyRevenue: mockMetrics.reduce((sum, m) => sum + parseFloat(m.monthlyRevenue), 0) / mockMetrics.length,
            totalContracts: 50,
            latestActivityStatus: mockMetrics[mockMetrics.length - 1].activityStatus,
            growthTrend: parseFloat(mockMetrics[mockMetrics.length - 1].revenueGrowthYoy)
          }
        });
      }
      
      if (benchResult.status === 'fulfilled' && benchResult.value) {
        console.log('Benchmark data received:', benchResult.value);
        setBenchmarkData(benchResult.value);
      } else {
        console.log('No benchmark data available');
      }
      
      if (netResult.status === 'fulfilled' && netResult.value && netResult.value.networkSummary && netResult.value.networkSummary.totalPartners > 0) {
        console.log('Network data received:', netResult.value);
        setNetworkData(netResult.value);
      } else {
        console.log('No network data available, using mock data for demo');
        // Generate mock network data
        const mockPrimePartners = [
          { subUei: 'MOCK001', subName: 'Alpha Solutions Inc', strengthScore: 85, sharedRevenue: 15000000, sharedContracts: 12, frequency: 'high', exclusivityScore: 0.7, isActive: true },
          { subUei: 'MOCK002', subName: 'Beta Technologies LLC', strengthScore: 72, sharedRevenue: 8500000, sharedContracts: 8, frequency: 'medium', exclusivityScore: 0.5, isActive: true },
          { subUei: 'MOCK003', subName: 'Gamma Consulting Group', strengthScore: 68, sharedRevenue: 5200000, sharedContracts: 5, frequency: 'medium', exclusivityScore: 0.4, isActive: true }
        ];
        
        const mockSubPartners = [
          { primeUei: 'MOCK101', primeName: 'MegaCorp Industries', strengthScore: 90, sharedRevenue: 250000000, sharedContracts: 54, frequency: 'high', exclusivityScore: 0.8, isActive: true },
          { primeUei: 'MOCK102', primeName: 'Global Defense Systems', strengthScore: 78, sharedRevenue: 130000000, sharedContracts: 37, frequency: 'medium', exclusivityScore: 0.6, isActive: true }
        ];
        
        setNetworkData({
          contractor: { id: params.contractorId, name: 'Loading...' },
          relationships: {
            asPrime: {
              count: mockPrimePartners.length,
              totalValue: mockPrimePartners.reduce((sum, p) => sum + p.sharedRevenue, 0),
              partners: mockPrimePartners
            },
            asSubcontractor: {
              count: mockSubPartners.length,
              totalValue: mockSubPartners.reduce((sum, p) => sum + p.sharedRevenue, 0),
              partners: mockSubPartners
            }
          },
          networkSummary: {
            totalPartners: mockPrimePartners.length + mockSubPartners.length,
            avgStrengthScore: Math.round((mockPrimePartners.reduce((sum, p) => sum + p.strengthScore, 0) + mockSubPartners.reduce((sum, p) => sum + p.strengthScore, 0)) / (mockPrimePartners.length + mockSubPartners.length)),
            totalNetworkValue: mockPrimePartners.reduce((sum, p) => sum + p.sharedRevenue, 0) + mockSubPartners.reduce((sum, p) => sum + p.sharedRevenue, 0)
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch enhanced contractor data:', error);
    }
  };

  const formatCurrency = (value: number) => {
    const formatWithRounding = (num: number) => {
      const rounded = parseFloat(num.toFixed(1));
      return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    };

    if (value >= 1e15) return `${formatWithRounding(value / 1e15)}Q`;
    if (value >= 1e12) return `${formatWithRounding(value / 1e12)}T`;
    if (value >= 1e9) return `${formatWithRounding(value / 1e9)}B`;
    if (value >= 1e6) return `${formatWithRounding(value / 1e6)}M`;
    if (value >= 1e3) return `${formatWithRounding(value / 1e3)}K`;
    return `${value.toFixed(0)}`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2); // Get last 2 digits of year
    return `${month}-${year}`;
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  if (isLoading || !contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 tactical-grid" />
      </div>


      {/* Main scrollable content */}
      <div className="pb-16"> {/* Padding bottom for fixed footer */}
        {/* Header - Hybrid Luxury/HUD Design */}
        <div className="relative border-b border-gray-800/60 overflow-x-hidden" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
          {/* Subtle scan line effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
        
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="grid grid-cols-4 gap-6">
              {/* Left Section - Logo/Visual */}
              <div className="col-span-1">
                <div className="relative">
                  {/* Company Logo with HUD overlay */}
                  <div className="w-full h-48 bg-gray-900/40 border border-gray-700 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700/3 to-gray-900/2" />
                    <div className="flex items-center justify-center h-full p-6">
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        {/* TFL Logo */}
                        <div className="font-black tracking-wider text-gray-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '62px' }}>
                          TFL
                        </div>
                        <div className="text-xs font-semibold tracking-[0.3em] text-gray-400 mt-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          TRIO FABRICATION
                        </div>
                        <div className="text-xs font-normal tracking-[0.4em] text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          LLC
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Section - Company Details */}
              <div className="col-span-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-light text-white tracking-wide font-sans">
                      {contractor?.name || 'Trio Fabrication LLC'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: '/platform/identify' })}
                      className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-[#D2AC38] border border-gray-800 hover:border-gray-600/30"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Website and Bubbles */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[#D2AC38] font-sans font-normal" style={{ fontSize: '16px' }}>www.website.com</span>
                  <div className="relative group">
                    <span className="px-1.5 py-0.5 bg-gray-600/20 border border-gray-600/40 rounded-full uppercase tracking-wider text-gray-300 font-sans font-normal" style={{ fontSize: '10px' }}>{contractor?.uei || 'UNKNOWN12345'}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      <div className="text-center font-medium">UEI Number</div>
                    </div>
                  </div>
                  <div className="relative group">
                    <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full uppercase tracking-wider text-red-400 font-sans font-normal" style={{ fontSize: '10px' }}>Hot</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      <div className="text-center font-medium">Award Activity ≤30 Days</div>
                    </div>
                  </div>
                  <div className="relative group">
                    <span className="px-1.5 py-0.5 bg-[#84cc16]/20 border border-[#84cc16]/40 rounded-full uppercase tracking-wider text-[#84cc16] font-sans font-normal" style={{ fontSize: '10px' }}>Strong</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      <div className="text-center font-medium">Performance Tier</div>
                    </div>
                  </div>
                </div>

                <p className="text-white leading-relaxed max-w-3xl mb-6">
                  {contractor?.establishedDate && `Established in ${new Date(contractor.establishedDate).getFullYear()}, `}
                  {contractor?.name || 'Trio Fabrication LLC'} builds solutions for the {contractor?.industry?.replace('-', ' ') || 'manufacturing'} sector,
                  focusing on {contractor?.primaryAgency || 'Defense'} contracts
                  {contractor?.primaryNaicsDescription && ` with specialization in ${contractor.primaryNaicsDescription.toLowerCase()}`}.
                </p>

                {/* Location/Sector/Agency Grid - Flat with HUD accents */}
                <div className="grid grid-cols-6 gap-8 mb-8">
                  <div className="col-span-2">
                    <div className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>LOCATION</div>
                    <div className="text-lg text-white font-light">{contractor?.state || 'Texas'}, USA</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>SECTOR</div>
                    <div className="text-lg text-white font-light">{contractor?.industry?.replace('-', ' ') || 'Manufacturing'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>AGENCY FOCUS</div>
                    <div className="text-lg text-white font-light">{contractor?.primaryAgency || 'Defense'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Metrics Cards V2 - Full Width Under Logo Box */}
            <div className="grid grid-cols-4 gap-6 mt-2">
              <div className="rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all group relative overflow-hidden bg-gray-900/40">
                {/* Subtle color accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D2AC38]"></div>

                <div className="pl-2">
                  <div className="text-gray-500 font-normal uppercase tracking-wide mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>LIFETIME AWARDS</div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#D2AC38] font-medium" style={{ fontSize: '30px', lineHeight: '1' }}>$1.2B</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white/70 font-medium">278</span>
                        <span className="text-gray-500 uppercase tracking-wide">contracts</span>
                      </div>
                      <span className="text-gray-600 uppercase tracking-wider">all time</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
                    Total historical value
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all group relative overflow-hidden bg-gray-900/40">
                {/* Subtle color accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#4EC9B0]"></div>

                <div className="pl-2">
                  <div className="text-gray-500 font-normal uppercase tracking-wide mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>ACTIVE AWARDS</div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#4EC9B0] font-medium" style={{ fontSize: '30px', lineHeight: '1' }}>$480M</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white/70 font-medium">92</span>
                        <span className="text-gray-500 uppercase tracking-wide">contracts</span>
                      </div>
                      <span className="text-gray-600 uppercase tracking-wider">performing</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
                    Currently active
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all group relative overflow-hidden bg-gray-900/40">
                {/* Subtle color accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8744B]"></div>

                <div className="pl-2">
                  <div className="text-gray-500 font-normal uppercase tracking-wide mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>REVENUE TTM</div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#E8744B] font-medium" style={{ fontSize: '30px', lineHeight: '1' }}>$112.5M</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white/70 font-medium">Est</span>
                        <span className="text-gray-500 uppercase tracking-wide">recognized</span>
                      </div>
                      <span className="text-gray-600 uppercase tracking-wider">12 months</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
                    STRAIGHT-LINE RECOGNITION (SLR)
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all group relative overflow-hidden bg-gray-900/40">
                {/* Subtle color accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#9B7EBD]"></div>

                <div className="pl-2">
                  <div className="text-gray-500 font-normal uppercase tracking-wide mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>PIPELINE</div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#9B7EBD] font-medium" style={{ fontSize: '30px', lineHeight: '1' }}>$337.5M</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white/70 font-medium">Est</span>
                        <span className="text-gray-500 uppercase tracking-wide">potential</span>
                      </div>
                      <span className="text-gray-600 uppercase tracking-wider">forecast</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
                    LIFETIME AWDS MINUS SLR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative">
          <div className="py-6">
            <div className="container mx-auto px-6 max-w-7xl">
              {/* Tab Navigation - Luxury Minimal */}
              <div className="mb-8">
                <div className={cn("flex items-center gap-2 p-2 border border-gray-700/30 rounded-xl backdrop-blur-md w-full", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                  {['overview', 'performance', 'network', 'contracts', 'people'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 px-8 py-4 text-xl font-normal tracking-widest transition-all duration-500 rounded-lg capitalize text-center",
                        activeTab === tab
                          ? "bg-gray-900/50 border border-gray-700/30 text-white shadow-2xl backdrop-blur-md"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 hover:backdrop-blur-sm"
                      )}
                      style={{ fontFamily: 'Genos, sans-serif' }}
                    >
                      {tab === 'overview' && <Globe className="inline w-5 h-5 mr-2" />}
                      {tab === 'performance' && <Activity className="inline w-5 h-5 mr-2" />}
                      {tab === 'network' && <Share2 className="inline w-5 h-5 mr-2" />}
                      {tab === 'contracts' && <FileText className="inline w-5 h-5 mr-2" />}
                      {tab === 'people' && <Users className="inline w-5 h-5 mr-2" />}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Command Center Dashboard - Updated Grid Layout */}
                    <div className="grid grid-cols-4 gap-4">
                      
                      {/* UPPER LEFT: Executive Summary */}
                      <div className="col-span-2 h-full">
                      <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                        <div className="p-4 h-full flex flex-col">
                          <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                            EXECUTIVE SUMMARY
                          </h3>
                          <div className="flex-1">
                            <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm flex overflow-hidden h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                            {/* Left side - Image with gradient */}
                            <div className="relative" style={{ width: '40%' }}>
                              <img
                                src="/stealth-bomber-new.jpg"
                                alt="Defense Technology"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/80"></div>
                            </div>

                            {/* Right side - AI Generated Content */}
                            <div className="flex-1 px-6 py-4 flex flex-col justify-center">
                              {/* Active Contractor Status Button */}
                              <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full w-fit" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor, border: '1px solid #4a4a4a' }}>
                                <div className="relative flex items-center justify-center">
                                  <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                  <div className="relative w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                                <span className="text-xs text-gray-300 uppercase tracking-widest font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                                  Active Contractor
                                </span>
                              </div>

                              {/* Section 1: 3-5 word summary */}
                              <h4 className="mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px', color: '#d2ac38', lineHeight: '1.2' }}>
                                Specialized defense systems fabricator
                              </h4>

                              {/* Section 2: Subtext */}
                              <p className="text-gray-300 text-sm font-light leading-tight mb-3">
                                Manufacturing armor systems and structural components for military vehicles and equipment.
                              </p>

                              {/* Section 3: Three bullet points */}
                              <ul className="space-y-0.5" style={{ fontSize: '11px' }}>
                                <li className="flex items-start">
                                  <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
                                  <span className="text-gray-300 leading-tight">Military vehicle armor and protective systems</span>
                                </li>
                                <li className="flex items-start">
                                  <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
                                  <span className="text-gray-300 leading-tight">Structural assemblies and precision hardware fabrication</span>
                                </li>
                                <li className="flex items-start">
                                  <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
                                  <span className="text-gray-300 leading-tight">Defense contractor subassembly manufacturing</span>
                                </li>
                              </ul>
                            </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
                              ANALYSIS AS OF {new Date().toLocaleString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              }).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </HudCard>
                      </div>

                      {/* Portfolio Snapshot */}
                      <div className="col-span-1 h-full">
                      <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                        <div className="p-4 h-full flex flex-col">
                          <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                            PORTFOLIO SNAPSHOT
                          </h3>
                          <div className="space-y-2 flex-1">
                            <TacticalDisplay
                              label="TOP CLIENT"
                              value={networkData?.relationships?.asSubcontractor?.partners?.[0]?.primeName || "MegaCorp Industries"}
                              size="md"
                            />
                            <TacticalDisplay
                              label="TOP NAICS"
                              value={contractor.primaryNaicsCode || '332312'}
                              size="md"
                            />
                            <TacticalDisplay
                              label="TOP PSC"
                              value="5110"
                              size="md"
                            />
                            <TacticalDisplay
                              label="PORTFOLIO DURATION"
                              value="3.2 Years"
                              size="md"
                            />
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
                              DURATION IS DOLLAR-WEIGHTED AVG LIFESPAN
                            </p>
                          </div>
                        </div>
                      </HudCard>
                      </div>

                      {/* Performance Snapshot */}
                      <div className="col-span-1 h-full">
                      <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                        <div className="p-4 h-full flex flex-col">
                          <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                            PERFORMANCE SNAPSHOT
                          </h3>
                          <div className="space-y-2 flex-1">
                            <TacticalDisplay
                              label="PERFORMANCE TIER"
                              value="Strong"
                              growth={false}
                              size="md"
                            />
                            <TacticalDisplay
                              label="AWARDS GROWTH"
                              value="18.2%"
                              growth={true}
                              growthValue={18.2}
                              size="md"
                            />
                            <TacticalDisplay
                              label="REVENUE GROWTH"
                              value="12.7%"
                              growth={true}
                              growthValue={12.7}
                              size="md"
                            />
                            <TacticalDisplay
                              label="PIPELINE GROWTH"
                              value="24.5%"
                              growth={true}
                              growthValue={24.5}
                              size="md"
                            />
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
                              ROLLING YEAR-OVER-YEAR PERFORMANCE
                            </p>
                          </div>
                        </div>
                      </HudCard>
                      </div>
                    </div>

                    {/* Bottom Row - Time-Series Performance and Agency Relationships */}
                    <div className="grid grid-cols-2 gap-4">

                          {/* Panel: Time-Series Performance (Left) */}
                          <div className="col-span-1">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                    AWARDS & REVENUE HISTORY ({revenueTimePeriod}Y)
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <select
                                      className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                      value={revenueTimeAggregation}
                                      onChange={(e) => setRevenueTimeAggregation(e.target.value)}
                                    >
                                      <option value="M">Month</option>
                                      <option value="Q">Quarter</option>
                                      <option value="Y">Year</option>
                                    </select>
                                    <select
                                      className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                      value={revenueTimePeriod}
                                      onChange={(e) => setRevenueTimePeriod(e.target.value)}
                                    >
                                      <option value="1">1 Year</option>
                                      <option value="2">2 Years</option>
                                      <option value="3">3 Years</option>
                                      <option value="5">5 Years</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <GoldengateBarChart
                                    title="Lifetime Activity"
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={280}
                                    data={{
                                      labels: getFilteredRevenueData().map((d: any) => formatDate(d.monthYear)),
                                      datasets: [
                                        {
                                          type: 'bar' as const,
                                          label: 'Award Value  ',
                                          data: getFilteredRevenueData().map((d: any) => parseFloat(d.monthlyRevenue) / 1000000),
                                          backgroundColor: 'rgba(78, 201, 176, 0.7)',
                                          borderColor: '#4EC9B0',
                                          borderWidth: 2,
                                          yAxisID: 'y',
                                        },
                                        {
                                          type: 'line' as const,
                                          label: 'Smoothed Revenue',
                                          data: getFilteredRevenueData().map((d: any, index: number) => {
                                            const baseValue = parseFloat(d.monthlyRevenue) / 1000000;
                                            return baseValue * (1 + (index * 0.02)); // Simple growth projection
                                          }),
                                          backgroundColor: 'rgba(210, 172, 56, 0.4)',
                                          borderColor: '#D2AC38',
                                          borderWidth: 2,
                                          fill: false,
                                          tension: 0.4,
                                          pointBackgroundColor: '#D2AC38',
                                          pointBorderColor: '#D2AC38',
                                          pointRadius: 4,
                                          yAxisID: 'y',
                                        }
                                      ]
                                    }}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      elements: {
                                        line: {
                                          borderWidth: 0
                                        }
                                      },
                                      layout: {
                                        padding: {
                                          left: 5,
                                          right: 5,
                                          top: -10,
                                          bottom: -10
                                        }
                                      },
                                      interaction: {
                                        mode: 'index' as const,
                                        intersect: false,
                                      },
                                      plugins: {
                                        legend: {
                                          display: true,
                                          position: 'bottom' as const,
                                          labels: {
                                            color: '#D2AC38',
                                            font: { size: 12 },
                                            padding: 2,
                                            boxWidth: 4,
                                            boxHeight: 4,
                                            usePointStyle: true
                                          }
                                        },
                                        tooltip: {
                                          enabled: false, // Disable default tooltip since we're using external
                                          // Use external tooltip for full HTML control
                                          external: function(context: any) {
                                            // Get or create tooltip element
                                            let tooltipEl = document.getElementById('chartjs-tooltip');

                                            if (!tooltipEl) {
                                              tooltipEl = document.createElement('div');
                                              tooltipEl.id = 'chartjs-tooltip';
                                              tooltipEl.style.cssText = `
                                                background: rgba(0, 0, 0, 0.95);
                                                border: 1px solid #374151;
                                                border-radius: 6px;
                                                color: white;
                                                opacity: 1;
                                                pointer-events: none;
                                                position: absolute;
                                                transform: translate(-50%, 0);
                                                transition: all .1s ease;
                                                font-family: system-ui, -apple-system, sans-serif;
                                                font-size: 12px;
                                                padding: 10px;
                                                min-width: 200px;
                                                z-index: 9999;
                                              `;
                                              document.body.appendChild(tooltipEl);
                                            }

                                            // Hide if no tooltip
                                            const tooltipModel = context.tooltip;
                                            if (tooltipModel.opacity === 0) {
                                              tooltipEl.style.opacity = '0';
                                              return;
                                            }

                                            // Get data
                                            if (tooltipModel.body) {
                                              const dataPoints = tooltipModel.dataPoints;
                                              const awards = dataPoints[0]?.parsed.y || 0;
                                              const revenue = dataPoints[1]?.parsed.y || 0;
                                              const date = dataPoints[0]?.label || '';

                                              // Build HTML
                                              let innerHtml = `
                                                <div style="margin-bottom: 8px; color: #9CA3AF; font-size: 11px; border-bottom: 1px solid #374151; padding-bottom: 6px;">
                                                  ${date}
                                                </div>
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                  <span style="color: #4EC9B0;">Awards Captured</span>
                                                  <span style="color: #4EC9B0; font-weight: 500;">$${awards.toFixed(1)}M</span>
                                                </div>
                                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                                  <span style="color: #D2AC38;">Revenue Recognized</span>
                                                  <span style="color: #D2AC38; font-weight: 500;">$${revenue.toFixed(1)}M</span>
                                                </div>
                                              `;

                                              tooltipEl.innerHTML = innerHtml;
                                            }

                                            // Display and position
                                            const position = context.chart.canvas.getBoundingClientRect();
                                            tooltipEl.style.opacity = '1';
                                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                          }
                                        }
                                      },
                                      scales: {
                                        x: {
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 9 },
                                            maxRotation: 0,
                                            minRotation: 0,
                                            autoSkip: false,
                                            callback: function(value: any, index: number) {
                                              // Show label every 6 months when there are many data points
                                              const dataLength = this.chart.data.labels.length;
                                              if (dataLength > 24) {
                                                // If more than 2 years of data, show every 6th label
                                                return index % 6 === 0 ? this.getLabelForValue(value) : null;
                                              } else if (dataLength > 12) {
                                                // If more than 1 year, show every 3rd label
                                                return index % 3 === 0 ? this.getLabelForValue(value) : null;
                                              }
                                              // Otherwise show all labels
                                              return this.getLabelForValue(value);
                                            }
                                          },
                                          grid: {
                                            color: 'rgba(192, 192, 192, 0.3)',
                                            drawBorder: false
                                          }
                                        },
                                        y: {
                                          type: 'linear' as const,
                                          display: true,
                                          position: 'left' as const,
                                          border: {
                                            display: false
                                          },
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 10 },
                                            callback: function(value: any) { return '$' + value + 'M'; }
                                          },
                                          grid: {
                                            color: 'rgba(192, 192, 192, 0.3)',
                                            drawBorder: false,
                                            borderColor: 'transparent',
                                            borderWidth: 0
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </HudCard>
                          </div>

                          {/* Agency Distribution (Right) */}
                          <div className="col-span-1">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                    TOP RELATIONSHIPS
                                  </h3>
                                  {/* Legend */}
                                  <div className="flex items-center gap-4 text-[10px] text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#9B7EBD' }}></div>
                                      <span>AGENCIES</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#5BC0EB' }}></div>
                                      <span>PRIMES</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF4C4C' }}></div>
                                      <span>SUBS</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 flex gap-2">
                                  {/* Inflows Chart - Left */}
                                  <div className="w-1/2">
                                    <GoldengateBarChart
                                      title="Award Inflows"
                                      liveIndicator={false}
                                      height={280}
                                      data={{
                                        labels: [
                                          'MegaCorp',   // Top prime (money in) - from network data
                                          'DOD',        // Agency prime (money in)
                                          'Global Def', // Second prime (money in) - from network data
                                        ],
                                        datasets: [{
                                          label: 'Value ($M)',
                                          data: [
                                            280,   // MegaCorp Industries (lifetime is higher than network's 250M)
                                            165,   // DOD as agency prime (lifetime activity)
                                            145,   // Global Defense Systems (lifetime is higher than network's 130M)
                                          ],
                                          backgroundColor: (context: any) => {
                                            const label = context.chart.data.labels[context.dataIndex];
                                            // Agencies get lavender, companies get sky blue
                                            if (label === 'DOD' || label === 'GSA' || label === 'VA' || label === 'NASA' || label === 'DHS') {
                                              return 'rgba(155, 126, 189, 0.7)'; // Lavender for agencies
                                            } else {
                                              return 'rgba(91, 192, 235, 0.7)'; // Sky blue for companies
                                            }
                                          },
                                          borderColor: (context: any) => {
                                            const label = context.chart.data.labels[context.dataIndex];
                                            if (label === 'DOD' || label === 'GSA' || label === 'VA' || label === 'NASA' || label === 'DHS') {
                                              return '#9B7EBD'; // Lavender for agencies
                                            } else {
                                              return '#5BC0EB'; // Sky blue for companies
                                            }
                                          },
                                          borderWidth: 2,
                                        }]
                                      }}
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        layout: {
                                          padding: {
                                            left: 5,
                                            right: 5,
                                            top: -10,
                                            bottom: 0
                                          }
                                        },
                                        plugins: {
                                          legend: { display: false },
                                          tooltip: {
                                            enabled: false,
                                            external: function(context: any) {
                                              // Get or create tooltip element
                                              let tooltipEl = document.getElementById('inflows-tooltip');

                                              if (!tooltipEl) {
                                                tooltipEl = document.createElement('div');
                                                tooltipEl.id = 'inflows-tooltip';
                                                tooltipEl.style.cssText = `
                                                  background: rgba(0, 0, 0, 0.95);
                                                  border-radius: 6px;
                                                  color: white;
                                                  opacity: 1;
                                                  pointer-events: none;
                                                  position: absolute;
                                                  transform: translate(-50%, 0);
                                                  transition: all .1s ease;
                                                  font-family: system-ui, -apple-system, sans-serif;
                                                  font-size: 12px;
                                                  padding: 10px;
                                                  min-width: 200px;
                                                  z-index: 99999;
                                                `;
                                                document.body.appendChild(tooltipEl);
                                              }

                                              const tooltipModel = context.tooltip;

                                              if (tooltipModel.opacity === 0) {
                                                tooltipEl.style.opacity = '0';
                                                return;
                                              }

                                              if (tooltipModel.body) {
                                                const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                                                const label = context.chart.data.labels[dataIndex];
                                                const value = tooltipModel.dataPoints[0].parsed.y;

                                                // Full company names
                                                let fullName = label;
                                                if (label === 'MegaCorp') fullName = 'MegaCorp Industries';
                                                if (label === 'DOD') fullName = 'Department of Defense';
                                                if (label === 'Global Def') fullName = 'Global Defense Systems';

                                                // Determine border color
                                                let borderColor = '#5BC0EB'; // Default sky blue
                                                if (label === 'DOD') {
                                                  borderColor = '#9B7EBD'; // Lavender for agencies
                                                }

                                                // Random start dates for demo
                                                const startDates = {
                                                  'MegaCorp': '2019',
                                                  'DOD': '2018',
                                                  'Global Def': '2020'
                                                };

                                                tooltipEl.style.border = `1px solid ${borderColor}`;
                                                tooltipEl.innerHTML = `
                                                  <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
                                                  <div style="color: #9CA3AF; font-size: 11px;">
                                                    $${Math.round(value)}M | Since ${startDates[label] || '2019'}
                                                  </div>
                                                `;
                                              }

                                              const position = context.chart.canvas.getBoundingClientRect();

                                              tooltipEl.style.opacity = '1';
                                              tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                              tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                            }
                                          }
                                        },
                                        scales: {
                                          x: {
                                            ticks: {
                                              color: '#D2AC38',
                                              font: { size: 8 },
                                              maxRotation: 0,
                                              minRotation: 0,
                                              autoSkip: false
                                            },
                                            grid: { color: 'rgba(192, 192, 192, 0.3)' },
                                            border: { display: false }
                                          },
                                          y: {
                                            ticks: {
                                              color: '#D2AC38',
                                              font: { size: 10 },
                                              callback: function(value: any) {
                                                return '$' + Math.round(value) + 'M';
                                              }
                                            },
                                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                            border: { display: false }
                                          }
                                        }
                                      }}
                                    />
                                  </div>

                                  {/* Outflows Chart - Right */}
                                  <div className="w-1/2">
                                    <GoldengateBarChart
                                      title="Award Outflows"
                                      liveIndicator={false}
                                      height={280}
                                      data={{
                                        labels: [
                                          'Alpha Sol',    // Top sub (money out) - from network data
                                          'Beta Tech',    // Second sub (money out) - from network data
                                          'Gamma'         // Third sub (money out) - from network data
                                        ],
                                        datasets: [{
                                          label: 'Value ($M)',
                                          data: [
                                            18,   // Alpha Solutions (positive for display)
                                            10,   // Beta Technologies (positive for display)
                                            6     // Gamma Consulting (positive for display)
                                          ],
                                          backgroundColor: 'rgba(255, 76, 76, 0.7)', // Red for subs
                                          borderColor: '#FF4C4C',
                                          borderWidth: 2,
                                        }]
                                      }}
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        layout: {
                                          padding: {
                                            left: 5,
                                            right: 5,
                                            top: -10,
                                            bottom: 0
                                          }
                                        },
                                        plugins: {
                                          legend: { display: false },
                                          tooltip: {
                                            enabled: false,
                                            external: function(context: any) {
                                              // Get or create tooltip element
                                              let tooltipEl = document.getElementById('outflows-tooltip');

                                              if (!tooltipEl) {
                                                tooltipEl = document.createElement('div');
                                                tooltipEl.id = 'outflows-tooltip';
                                                tooltipEl.style.cssText = `
                                                  background: rgba(0, 0, 0, 0.95);
                                                  border: 1px solid #FF4C4C;
                                                  border-radius: 6px;
                                                  color: white;
                                                  opacity: 1;
                                                  pointer-events: none;
                                                  position: absolute;
                                                  transform: translate(-50%, 0);
                                                  transition: all .1s ease;
                                                  font-family: system-ui, -apple-system, sans-serif;
                                                  font-size: 12px;
                                                  padding: 10px;
                                                  min-width: 200px;
                                                  z-index: 99999;
                                                `;
                                                document.body.appendChild(tooltipEl);
                                              }

                                              const tooltipModel = context.tooltip;

                                              if (tooltipModel.opacity === 0) {
                                                tooltipEl.style.opacity = '0';
                                                return;
                                              }

                                              if (tooltipModel.body) {
                                                const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                                                const label = context.chart.data.labels[dataIndex];
                                                const value = tooltipModel.dataPoints[0].parsed.y;

                                                // Full company names
                                                let fullName = label;
                                                if (label === 'Alpha Sol') fullName = 'Alpha Solutions Inc';
                                                if (label === 'Beta Tech') fullName = 'Beta Technologies LLC';
                                                if (label === 'Gamma') fullName = 'Gamma Consulting Group';

                                                // Random start dates for demo
                                                const startDates = {
                                                  'Alpha Sol': '2021',
                                                  'Beta Tech': '2020',
                                                  'Gamma': '2022'
                                                };

                                                tooltipEl.innerHTML = `
                                                  <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
                                                  <div style="color: #9CA3AF; font-size: 11px;">
                                                    $${Math.round(value)}M | Since ${startDates[label] || '2021'}
                                                  </div>
                                                `;
                                              }

                                              const position = context.chart.canvas.getBoundingClientRect();

                                              tooltipEl.style.opacity = '1';
                                              tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                              tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                            }
                                          }
                                        },
                                        scales: {
                                          x: {
                                            ticks: {
                                              color: '#D2AC38',
                                              font: { size: 8 },
                                              maxRotation: 0,
                                              minRotation: 0,
                                              autoSkip: false
                                            },
                                            grid: { color: 'rgba(192, 192, 192, 0.3)' },
                                            border: { display: false }
                                          },
                                          y: {
                                            ticks: {
                                              color: '#D2AC38',
                                              font: { size: 10 },
                                              callback: function(value: any) {
                                                return '$' + Math.round(value) + 'M';
                                              }
                                            },
                                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                            border: { display: false }
                                          }
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </HudCard>
                          </div>
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    {performanceData && performanceData.metrics && Array.isArray(performanceData.metrics) && performanceData.metrics.length > 0 ? (
                      <>
                        {/* Performance Summary - Full Width Panel */}
                        <div className="w-full mb-6">
                          <HudCard variant="default" priority="high" isPanel={true} className="border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4">
                              <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                PERFORMANCE SUMMARY
                              </h3>

                              {/* Two Container Layout */}
                              <div className="grid grid-cols-2 gap-8 mb-3 relative">

                                {/* Left Container - Performance Scores */}
                                <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 relative" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                                      PERFORMANCE SCORES
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
                                      <span className="text-[10px] tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif', color: '#22c55e' }}>
                                        TRACKING
                                      </span>
                                    </div>
                                  </div>
                                    <div className="flex items-start gap-6">
                                      {/* Composite Score - Larger radial */}
                                      <div className="relative flex flex-col items-center">
                                        <div className="relative w-40 h-40">
                                          <svg className="w-40 h-40 transform -rotate-90">
                                            <circle
                                              cx="80"
                                              cy="80"
                                              r="72"
                                              stroke="#374151"
                                              strokeWidth="8"
                                              fill="none"
                                            />
                                            <circle
                                              cx="80"
                                              cy="80"
                                              r="72"
                                              stroke="#84cc16"
                                              strokeWidth="8"
                                              fill="none"
                                              strokeDasharray={`${2 * Math.PI * 72 * 0.80} ${2 * Math.PI * 72}`}
                                              strokeLinecap="round"
                                            />
                                            <circle
                                              cx="80"
                                              cy="80"
                                              r="64"
                                              fill="#030508"
                                              stroke="#D2AC38"
                                              strokeWidth="1"
                                            />
                                          </svg>
                                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-5xl font-light" style={{ color: '#84cc16' }}>80</div>
                                            <div className="text-xs uppercase tracking-wider -mb-1" style={{ fontFamily: 'Genos, sans-serif', color: '#D2AC38' }}>COMPOSITE</div>
                                            <div className="text-xs uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', color: '#D2AC38' }}>SCORE</div>
                                          </div>
                                        </div>
                                        {/* Subtitle below radial */}
                                        <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                                          <p className="text-xs text-gray-500 font-sans leading-tight">
                                            <span style={{ color: '#D2AC38' }}>80th</span> percentile among <span style={{ color: '#D2AC38' }}>247</span> peers in Q4<br/>with primary NAICS of <span style={{ color: '#D2AC38' }}>332312</span>
                                          </p>
                                        </div>
                                      </div>
                                      {/* Subscores - Compact containers */}
                                      <div className="flex-1 space-y-2 max-w-sm">
                                        <div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>AWARDS CAPTURED (TTM)</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">$12.4M</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light w-6 text-right" style={{ color: '#84cc16' }}>82</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#84cc16]" style={{ width: '82%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Awards Captured (TTM)</div>
                                              <div>How much additional business was captured</div>
                                              <div>in the last twelve months.</div>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                                          </div>
                                        </div>

                                        <div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>ESTIMATED REVENUE (TTM)</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">$8.7M</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light w-6 text-right" style={{ color: '#84cc16' }}>76</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#84cc16]" style={{ width: '76%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Estimated Revenue (TTM)</div>
                                              <div>Straight-line revenue recognized from active</div>
                                              <div>awards in the last twelve months.</div>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                                          </div>
                                        </div>

                                        <div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>TOTAL PIPELINE</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">$45.2M</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light w-6 text-right" style={{ color: '#15803d' }}>91</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#15803d]" style={{ width: '91%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Total Pipeline</div>
                                              <div>Lifetime awards minus lifetime revenue as</div>
                                              <div>recognized on a straight-line basis.</div>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                                          </div>
                                        </div>

                                        <div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>PORTFOLIO DURATION</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">3.2 yrs</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light w-6 text-right" style={{ color: '#eab308' }}>68</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#eab308]" style={{ width: '68%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Portfolio Duration</div>
                                              <div>Dollar-weighted average lifespan</div>
                                              <div>of active awards.</div>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                                          </div>
                                        </div>

                                        <div className="bg-black/40 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>BLENDED GROWTH</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">+24%</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light w-6 text-right" style={{ color: '#84cc16' }}>85</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#84cc16]" style={{ width: '85%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Blended Growth</div>
                                              <div>50% YOY revenue growth, 30% 2yr average, 20% 3yr average.</div>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                </div>

                                {/* Vertical Dividing Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700/50 -translate-x-1/2"></div>

                                {/* Right Container - Peer Group Details */}
                                <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 relative" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                                      PEER GROUP DETAILS
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
                                      <span className="text-[10px] tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif', color: '#22c55e' }}>
                                        TRACKING
                                      </span>
                                    </div>
                                  </div>
                                    <div className="grid grid-cols-2 gap-4 h-64">
                                      <div className="bg-black/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif', color: '#D2AC38' }}>PERFORMANCE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-[#84cc16]">Strong</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Tier</div>
                                      </div>
                                      <div className="bg-black/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif', color: '#D2AC38' }}>NAICS CODE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-white">332312</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Fabricated Structural Metal Manufacturing</div>
                                      </div>
                                      <div className="bg-black/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif', color: '#D2AC38' }}>SIZE QUARTILE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-white">Q4</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Lifetime Awards</div>
                                      </div>
                                      <div className="bg-black/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif', color: '#D2AC38' }}>GROUP SIZE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-white text-center">247</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Peer Count</div>
                                      </div>
                                    </div>
                                </div>
                              </div>

                              {/* Performance Analysis Section - Compact with Insights */}
                              <div className="pt-6 mt-6 border-t border-gray-700/50">
                                <div className="border-2 border-gray-600/30 rounded-xl backdrop-blur-sm p-3" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>

                                  {/* Header */}
                                  <h4 className="font-sans text-xs uppercase tracking-wider text-gray-400 font-medium text-center mb-3">
                                    Performance Insights
                                  </h4>

                                  {/* Main Metrics Display - Centered Layout */}
                                  <div className="grid grid-cols-2 gap-6 mb-3">

                                    {/* Strength Metric - Centered */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-4 border-gray-600/50 bg-gradient-to-br from-[#15803d]/30 to-[#15803d]/10 flex items-center justify-center">
                                          <div className="text-[#15803d] text-2xl font-medium">91</div>
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#15803d] rounded-full flex items-center justify-center border-2 border-gray-900">
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5 16L4 6L8 10L10 5L12 10L14 5L16 10L20 6L19 16H5Z"/>
                                          </svg>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-white text-lg font-medium">Business Development</div>
                                        <div className="text-[#15803d] text-sm uppercase tracking-wide">Elite Performance</div>
                                      </div>
                                    </div>

                                    {/* Opportunity Metric - Centered */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-4 border-gray-600/50 bg-gradient-to-br from-[#eab308]/30 to-[#eab308]/10 flex items-center justify-center">
                                          <div className="text-[#eab308] text-2xl font-medium">68</div>
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#eab308] rounded-full flex items-center justify-center border-2 border-gray-900">
                                          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-white text-lg font-medium">Contract Retention</div>
                                        <div className="text-[#eab308] text-sm uppercase tracking-wide">Growth Opportunity</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Compact Insight Text */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#15803d]/10 to-transparent border-l-2 border-[#15803d]">
                                      <div className="text-white">Exceptional pipeline value places contractor in elite tier for business development capabilities</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#eab308]/10 to-transparent border-l-2 border-[#eab308]">
                                      <div className="text-white">Portfolio duration suggests opportunities to extend contract lifecycles and improve retention</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </HudCard>
                        </div>

                        {/* Performance Dashboard - Full Width */}
                        <div className="min-h-[55vh]">
                          {/* Cross-Sectional Performance - Full Width */}
                          <div className="w-full">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                    COMPETITIVE POSITION
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-gray-400">Y-Axis:</span>
                                      <select
                                        className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                        value={yAxisMetric}
                                        onChange={(e) => setYAxisMetric(e.target.value)}
                                      >
                                        <option value="ttm_awards">Awards Captured (TTM)</option>
                                        <option value="ttm_revenue">Estimated Revenue (TTM)</option>
                                        <option value="lifetime_awards">Lifetime Awards</option>
                                        <option value="lifetime_revenue">Lifetime Revenue</option>
                                        <option value="total_pipeline">Total Pipeline</option>
                                        <option value="portfolio_duration">Portfolio Duration</option>
                                        <option value="blended_growth">Blended Growth Rate</option>
                                      </select>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-gray-400">X-Axis:</span>
                                      <select
                                        className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                        value={xAxisMetric}
                                        onChange={(e) => setXAxisMetric(e.target.value)}
                                      >
                                        <option value="composite_score">Composite Score</option>
                                        <option value="awards_captured">Awards Captured (TTM)</option>
                                        <option value="revenue">Estimated Revenue (TTM)</option>
                                        <option value="pipeline_value">Total Pipeline</option>
                                        <option value="portfolio_duration">Portfolio Duration</option>
                                        <option value="blended_growth">Blended Growth</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <GoldengateBubbleChart
                                    title={getChartTitle(yAxisMetric, xAxisMetric)}
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={350}
                                    data={{
                                      datasets: [{
                                        label: 'Peer Entities',
                                        data: generatePeerDataForXAxis(xAxisMetric),
                                        backgroundColor: 'rgba(255, 68, 68, 0.6)',
                                        borderColor: '#FF4444',
                                        borderWidth: 1,
                                      }, {
                                        label: contractor?.name === 'Loading...' ? 'Trio Fabrication LLC' : (contractor?.name || 'Trio Fabrication LLC'),
                                        data: [{
                                          x: getXAxisValue(xAxisMetric),
                                          y: (() => {
                                            if (yAxisMetric === 'portfolio_duration') {
                                              return 3.2; // Average portfolio duration in years
                                            } else if (yAxisMetric === 'blended_growth') {
                                              return 24; // 24% growth
                                            } else {
                                              return performanceData?.summary?.totalRevenue ?
                                                (performanceData.summary.totalRevenue / 1000000) : 300;
                                            }
                                          })(),
                                          r: 4
                                        }],
                                        backgroundColor: 'rgba(210, 172, 56, 0.8)',
                                        borderColor: '#D2AC38',
                                        borderWidth: 2,
                                      }]
                                    }}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: {
                                        legend: {
                                          display: true,
                                          position: 'bottom' as const,
                                          labels: {
                                            color: '#D2AC38',
                                            font: { family: 'sans-serif', size: 12 },
                                            usePointStyle: true,
                                            padding: 10,
                                            pointStyle: 'circle',
                                            boxWidth: 6,
                                            boxHeight: 6
                                          }
                                        },
                                        tooltip: {
                                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                          titleColor: '#D2AC38',
                                          titleFont: {
                                            weight: 'bold'
                                          },
                                          bodyColor: '#FFFFFF',
                                          borderColor: '#374151',
                                          borderWidth: 1,
                                          callbacks: {
                                            title: function(tooltipItems: any) {
                                              const context = tooltipItems[0];
                                              const datasetLabel = context.dataset.label;
                                              const isPeerEntity = datasetLabel === 'Peer Entities';
                                              const entityName = isPeerEntity ? 'Peer Entity' : datasetLabel;
                                              const uei = isPeerEntity ? 'PEER' + Math.floor(Math.random() * 100000) : (contractor?.uei || 'UNKNOWN12345');
                                              return `${entityName} | ${uei}`;
                                            },
                                            label: function(context: any) {
                                              const xAxisLabel = getXAxisTitle(xAxisMetric).replace(' (Percentile Score)', '');
                                              const yAxisLabel = getYAxisTitle(yAxisMetric);
                                              const xValue = Math.round(context.parsed.x);

                                              // Format Y-value based on metric type
                                              let yValue;
                                              if (yAxisMetric === 'portfolio_duration') {
                                                yValue = context.parsed.y.toFixed(1) + ' yrs';
                                              } else if (yAxisMetric === 'blended_growth') {
                                                yValue = context.parsed.y.toFixed(1) + '%';
                                              } else {
                                                yValue = '$' + context.parsed.y.toFixed(1) + 'M';
                                              }

                                              return [
                                                `${xAxisLabel}: ${xValue}`,
                                                `${yAxisLabel}: ${yValue}`
                                              ];
                                            },
                                            afterLabel: function(context: any) {
                                              return null; // Remove any additional labels like radius
                                            }
                                          }
                                        }
                                      },
                                      scales: {
                                        x: {
                                          type: 'linear',
                                          position: 'bottom',
                                          min: 0,
                                          max: 100,
                                          title: {
                                            display: true,
                                            text: 'Percentile',
                                            color: 'rgba(192, 192, 192, 0.7)',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 }
                                          },
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 }
                                          },
                                          grid: {
                                            color: 'rgba(192, 192, 192, 0.3)'
                                          }
                                        },
                                        y: {
                                          type: 'linear',
                                          min: (() => {
                                            if (yAxisMetric === 'portfolio_duration') {
                                              return 0;
                                            } else if (yAxisMetric === 'blended_growth') {
                                              return -30;
                                            } else {
                                              return 0;
                                            }
                                          })(),
                                          max: (() => {
                                            if (yAxisMetric === 'portfolio_duration') {
                                              return 10;
                                            } else if (yAxisMetric === 'blended_growth') {
                                              return 50;
                                            } else {
                                              return undefined; // Auto-scale for financial metrics
                                            }
                                          })(),
                                          title: {
                                            display: true,
                                            text: 'Value',
                                            color: 'rgba(192, 192, 192, 0.7)',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 }
                                          },
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 },
                                            callback: function(value: any) {
                                              // Format based on the selected Y-axis metric
                                              if (yAxisMetric === 'portfolio_duration') {
                                                return `${value} yrs`;
                                              } else if (yAxisMetric === 'blended_growth') {
                                                return `${value}%`;
                                              } else {
                                                return `$${value}M`;
                                              }
                                            }
                                          },
                                          grid: {
                                            color: 'rgba(192, 192, 192, 0.3)'
                                          }
                                        }
                                      },
                                      interaction: {
                                        intersect: false
                                      }
                                    }}
                                  />
                                  </div>
                                </div>
                              </HudCard>
                          </div>
                        </div>

                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 font-light">Performance data loading...</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'network' && (
                  <div className="space-y-6">
                    {networkData ? (
                      <>
                        {/* Network Dashboard - network_v1 */}
                        <NetworkV1Layout 
                          contractor={contractor}
                          networkData={networkData}
                          getMapPosition={getMapPosition}
                          parsePlaceOfPerformance={parsePlaceOfPerformance}
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-light">Loading network data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'networkanalysis' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-1">
                        <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                          <div className="p-4 h-full flex flex-col">
                            <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                              NETWORK SUMMARY
                            </h3>
                            <div className="flex-1 overflow-y-auto">
                                    <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                                      {/* AI-generated summary */}
                                      <p>
                                        <span className="text-[#D2AC38] font-medium">{contractor.name || 'This contractor'}</span> operates as a 
                                        <span className="text-[#D2AC38] font-medium"> HYBRID</span> entity, functioning both as a prime contractor and subcontractor across 
                                        {' '}{((networkData.relationships?.asPrime?.count || 0) + (networkData.relationships?.asSubcontractor?.count || 0))} active relationships.
                                      </p>
                                      
                                      <p>
                                        As a <span className="text-[#5BC0EB]">subcontractor</span>, the company receives 
                                        <span className="font-medium" style={{ color: '#4EC9B0' }}> ${((networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000).toFixed(1)}M</span> in award inflows from 
                                        {' '}{networkData.relationships?.asSubcontractor?.count || 0} prime contractors, with top partners including
                                        {' '}{networkData.relationships?.asSubcontractor?.partners?.slice(0, 2).map((p: any) => p.primeName.split(' ')[0]).join(' and ') || 'various primes'}.
                                      </p>
                                      
                                      <p>
                                        Simultaneously, as a <span className="text-[#FF4C4C]">prime contractor</span>, it distributes 
                                        <span className="text-red-400 font-medium"> ${((networkData.relationships?.asPrime?.totalValue || 0) / 1000000).toFixed(1)}M</span> in award outflows to 
                                        {' '}{networkData.relationships?.asPrime?.count || 0} subcontractors, demonstrating a 
                                        {' '}{(networkData.relationships?.asSubcontractor?.totalValue || 0) > (networkData.relationships?.asPrime?.totalValue || 0) ? 'sub-dominant' : 'prime-dominant'} operational model.
                                      </p>
                                      
                                      <p>
                                        The network spans multiple geographic regions with primary operations centered in
                                        {' '}<span className="text-[#9B7EBD]">{contractor.state || 'multiple states'}</span>, 
                                        while maintaining strategic partnerships across the United States. 
                                        The company's balanced approach between prime and sub roles positions it as a 
                                        versatile player in the federal contracting ecosystem.
                                      </p>
                                      
                                      <div className="mt-4 pt-3 border-t border-gray-700/50">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>Network Strength Score: <span className="text-[#D2AC38]">{Math.round(50 + Math.random() * 30)}/100</span></span>
                                          <span className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                            Performance Analysis Active
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                              </div>
                            </div>
                          </HudCard>
                        </div>

                      {/* Middle: Active Relationships - Double Height */}
                      <div className="col-span-1 row-span-2">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                  OPERATIONAL STRUCTURE
                                </h3>
                                <div className="flex-1 relative overflow-hidden rounded-lg border border-gray-800 hover:border-gray-400/20 hover:shadow-[0_0_15px_rgba(156,163,175,0.08)] transition-all duration-300" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  {/* Scanning line effect */}
                                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/8 to-transparent animate-scan" />
                                  
                                  {/* Corner decorations */}
                                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-500/10" />
                                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-500/10" />
                                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-500/10" />
                                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-500/10" />
                                  
                                  <GoldengateNetworkGraph
                                    title="Contractor Network"
                                    height={240}
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    className="w-full h-full"
                                    nodes={[
                                      // Central node (current contractor)
                                      {
                                        id: contractor.uei,
                                        label: contractor.name === 'Loading...' ? 'Trio' : contractor.name.split(' ')[0],
                                        type: 'hybrid' as const,
                                        value: contractor.totalContractValue || 0
                                      },
                                      // Prime partners (where this contractor is sub)
                                      ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                                        id: p.primeUei,
                                        label: p.primeName.split(' ')[0],
                                        type: 'prime' as const,
                                        value: p.sharedRevenue || 0
                                      })) || []),
                                      // Sub partners (where this contractor is prime)
                                      ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                                        id: p.subUei,
                                        label: p.subName.split(' ')[0],
                                        type: 'sub' as const,
                                        value: p.sharedRevenue || 0
                                      })) || [])
                                    ]}
                                    edges={[
                                      // Edges from primes to this contractor
                                      ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                                        source: p.primeUei,
                                        target: contractor.uei,
                                        weight: p.strengthScore || 50,
                                        revenue: p.sharedRevenue || 0,
                                        contracts: p.sharedContracts || 0
                                      })) || []),
                                      // Edges from this contractor to subs
                                      ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                                        source: contractor.uei,
                                        target: p.subUei,
                                        weight: p.strengthScore || 50,
                                        revenue: p.sharedRevenue || 0,
                                        contracts: p.sharedContracts || 0
                                      })) || [])
                                    ]}
                                  />
                                </div>
                              </div>
                            </HudCard>
                          </div>
                          
                          {/* Second Row: Active Relationships (left) and Geographic/Historical (right) */}
                          <div className="grid grid-cols-2 gap-6">
                            
                            {/* Left: Active Relationships */}
                            <div>
                            <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                    ACTIVE RELATIONSHIPS
                                  </h3>
                                  <div className="text-xs text-gray-400 font-light">
                                    NETWORK: {networkData.relationships ? (
                                      (networkData.relationships.asPrime?.partners?.length || 0) + 
                                      (networkData.relationships.asSubcontractor?.partners?.length || 0)
                                    ) : 0}
                                  </div>
                                </div>
                                
                                <div className="flex-1 overflow-hidden">
                                  {/* Statistics Bar */}
                                  <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gradient-to-br from-[#5BC0EB]/10 to-[#5BC0EB]/5 border border-[#5BC0EB]/20 rounded-lg p-3">
                                      <div className="text-sm font-normal text-[#5BC0EB] uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>Award Inflows</div>
                                      <div className="font-medium text-green-400">
                                        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '24px' }}>$</span>
                                        <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '36px' }}>{((networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000).toFixed(0)}M</span>
                                      </div>
                                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Genos, sans-serif' }}>{networkData.relationships?.asSubcontractor?.count || 0} active</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#FF4C4C]/10 to-[#FF4C4C]/5 border border-[#FF4C4C]/20 rounded-lg p-3">
                                      <div className="text-sm font-normal text-[#FF4C4C] uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>Award Outflows</div>
                                      <div className="font-medium text-red-400">
                                        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '24px' }}>$</span>
                                        <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '36px' }}>{((networkData.relationships?.asPrime?.totalValue || 0) / 1000000).toFixed(0)}M</span>
                                      </div>
                                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Genos, sans-serif' }}>{networkData.relationships?.asPrime?.count || 0} active</div>
                                    </div>
                                  </div>

                                  {/* Partner List */}
                                  <div className="flex-1 overflow-y-auto space-y-2">
                                    {/* Prime Partners (Parent Companies) */}
                                    {networkData.relationships?.asSubcontractor?.partners?.slice(0, 2).map((partner: any, index: number) => (
                                      <div key={`prime-${index}`} className="group relative">
                                        <div className="border-l-2 border-[#5BC0EB] hover:border-[#5BC0EB]/80 transition-all duration-300" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                          <div className="p-3 relative overflow-hidden">
                                            {/* Animated background on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            
                                            <div className="relative flex items-start justify-between">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-60"></div>
                                                  <span className="text-white font-light tracking-wide">{partner.primeName}</span>
                                                </div>
                                                <div className="flex items-center text-xs tracking-wider">
                                                  <span className="text-gray-400 mr-4">PRIME</span>
                                                  <span className="text-white">SCORE {partner.strengthScore}</span>
                                                </div>
                                              </div>
                                              
                                              <div className="text-right">
                                                <div className="font-medium text-green-400">
                                                  <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px' }}>$</span>
                                                  <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '20px' }}>{(partner.sharedRevenue / 1000000).toFixed(0)}M</span>
                                                </div>
                                                <div className="text-[8px] text-gray-400 uppercase">Awards</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Divider */}
                                    <div className="flex items-center gap-2 my-3">
                                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                                      <div className="text-[8px] text-gray-500 font-light">SUBSIDIARIES</div>
                                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                                    </div>

                                    {/* Sub Partners */}
                                    {networkData.relationships?.asPrime?.partners?.slice(0, 3).map((partner: any, index: number) => (
                                      <div key={`sub-${index}`} className="group relative">
                                        <div className="border-l-2 border-[#FF4C4C] hover:border-[#FF4C4C]/80 transition-all duration-300" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                          <div className="p-3 relative overflow-hidden">
                                            {/* Animated background on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-700/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            
                                            <div className="relative flex items-start justify-between">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-60"></div>
                                                  <span className="text-white font-light tracking-wide">{partner.subName}</span>
                                                </div>
                                                <div className="flex items-center text-xs tracking-wider">
                                                  <span className="text-gray-400 mr-4">SUB</span>
                                                  <span className="text-white">SCORE {partner.strengthScore}</span>
                                                </div>
                                              </div>
                                              
                                              <div className="text-right">
                                                <div className="font-medium text-red-400">
                                                  <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px' }}>$</span>
                                                  <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '20px' }}>{(partner.sharedRevenue / 1000000).toFixed(1)}M</span>
                                                </div>
                                                <div className="text-[8px] text-gray-400 uppercase">Awards</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </HudCard>
                          </div>

                          {/* Geographic Distribution */}
                          <div className="col-span-1">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                  GEOGRAPHIC DISTRIBUTION
                                </h3>
                                <div className="flex-1 relative overflow-hidden rounded-lg border border-gray-800 hover:border-gray-400/20 hover:shadow-[0_0_15px_rgba(156,163,175,0.08)] transition-all duration-300" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  {/* Scanning line effect */}
                                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/8 to-transparent animate-scan" />
                                  
                                  {/* Corner decorations */}
                                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-500/10" />
                                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-500/10" />
                                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-500/10" />
                                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-500/10" />
                                  
                                  <GoldengateNetworkGraph
                                    title="Contractor Network"
                                    height={240}
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    className="w-full h-full"
                                    nodes={[
                                      // Central node (current contractor)
                                      {
                                        id: contractor.uei,
                                        label: contractor.name === 'Loading...' ? 'Trio' : contractor.name.split(' ')[0],
                                        type: 'hybrid' as const,
                                        value: contractor.totalContractValue || 0
                                      },
                                      // Prime partners (where this contractor is sub)
                                      ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                                        id: p.primeUei,
                                        label: p.primeName.split(' ')[0],
                                        type: 'prime' as const,
                                        value: p.sharedRevenue || 0
                                      })) || []),
                                      // Sub partners (where this contractor is prime)
                                      ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                                        id: p.subUei,
                                        label: p.subName.split(' ')[0],
                                        type: 'sub' as const,
                                        value: p.sharedRevenue || 0
                                      })) || [])
                                    ]}
                                    edges={[
                                      // Edges from primes to this contractor
                                      ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                                        source: p.primeUei,
                                        target: contractor.uei,
                                        weight: p.strengthScore || 50,
                                        revenue: p.sharedRevenue || 0,
                                        contracts: p.sharedContracts || 0
                                      })) || []),
                                      // Edges from this contractor to subs
                                      ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                                        source: contractor.uei,
                                        target: p.subUei,
                                        weight: p.strengthScore || 50,
                                        revenue: p.sharedRevenue || 0,
                                        contracts: p.sharedContracts || 0
                                      })) || [])
                                    ]}
                                  />
                                </div>
                              </div>
                            </HudCard>
                          </div>

                            {/* Right Column: Geographic Distribution + Historical Activity Mix */}
                            <div className="space-y-6">
                              
                              {/* Geographic Distribution */}
                              <div>
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 relative">
                                <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                  GEOGRAPHIC DISTRIBUTION
                                </h3>
                                <div className="relative rounded-lg border border-gray-800 hover:border-gray-400/20 hover:shadow-[0_0_15px_rgba(156,163,175,0.08)] transition-all duration-300 overflow-hidden" style={{ height: '240px', backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  {/* Scanning line effect */}
                                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/8 to-transparent animate-scan" />
                                  
                                  {/* Corner decorations */}
                                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-500/10" />
                                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-500/10" />
                                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-500/10" />
                                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-500/10" />
                                  
                                  {/* Tracking Indicator */}
                                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                    <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                                      TRACKING
                                    </span>
                                  </div>
                                  {/* US Map */}
                                  <div className="w-full h-full p-3 flex items-center justify-center">
                                    <div className="flex items-center justify-center w-full max-w-2xl" style={{ height: '120px' }}>
                                      <div style={{ transform: 'scale(0.32)', transformOrigin: 'center center' }}>
                                        <div style={{ position: 'relative' }}>
                                          <style>{`
                                            .react-usa-map svg text,
                                            .react-usa-map svg g circle,
                                            .react-usa-map svg g ellipse,
                                            .react-usa-map svg g marker {
                                              display: none !important;
                                            }
                                            .react-usa-map svg {
                                              overflow: visible !important;
                                            }
                                            .usa-state-map svg path {
                                              stroke: #D2AC38 !important;
                                              stroke-width: 1px !important;
                                              stroke-opacity: 1 !important;
                                            }
                                            .usa-state-map .react-usa-map path {
                                              stroke: #D2AC38 !important;
                                              stroke-width: 1px !important;
                                              stroke-opacity: 1 !important;
                                            }
                                          `}</style>
                                          <div className="usa-state-map">
                                          <USAMap
                                            customize={{
                                              "AL": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "AK": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "AZ": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "AR": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "CA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "CO": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "CT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "DE": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "FL": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "GA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "HI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "ID": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "IL": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "IN": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "IA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "KS": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "KY": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "LA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "ME": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MD": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "MA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MN": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MS": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MO": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "MT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NE": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NV": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NH": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NJ": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "NM": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NY": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NC": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "ND": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "OH": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "OK": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "OR": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "PA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "RI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "SC": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "SD": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "TN": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "TX": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "UT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "VT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                                              "VA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WV": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WY": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "DC": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}
                                            }}
                                            onClick={(event) => console.log('State clicked:', event.target.dataset.name)}
                                          />
                                          </div>
                                          
                                          {/* Overlay dots for network relationships */}
                                          <div className="absolute inset-0 pointer-events-none">
                                            {/* Contractor dot - Use geocoded location */}
                                            <div 
                                              className="relative"
                                              style={{ 
                                                ...getMapPosition(contractor?.zipCode, contractor?.city, contractor?.state),
                                                transform: 'translate(-50%, -50%)',
                                                position: 'absolute'
                                              }}
                                            >
                                              <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#D2AC38] opacity-10 animate-ping" style={{animationDuration: '3s'}}></div>
                                              <div className="w-10 h-10 rounded-full bg-[#D2AC38] border-2 border-black shadow-[0_0_8px_rgba(210,172,56,0.6)] relative z-10"></div>
                                            </div>
                                            
                                            {/* Parent company dots - Use geocoded locations */}
                                            {networkData.relationships?.asPrime?.partners?.slice(0, 2).map((partner: any, index: number) => {
                                              // Extract state from partner name or use default states
                                              const partnerStates = ['CA', 'NY']; // fallback for demo
                                              const partnerState = partner.state || partnerStates[index] || 'CA';
                                              return (
                                                <div 
                                                  key={`parent-${index}`}
                                                  className="relative"
                                                  style={{ 
                                                    position: 'absolute',
                                                    ...getMapPosition(partner.zipCode, partner.city, partnerState),
                                                    transform: 'translate(-50%, -50%)'
                                                  }}
                                                  title={partner.subName}
                                                >
                                                  <div className="absolute inset-0 w-9 h-9 rounded-full bg-[#5BC0EB] opacity-30 animate-ping"></div>
                                                  <div className="absolute inset-0 w-9 h-9 rounded-full bg-[#5BC0EB] opacity-20 animate-ping" style={{animationDelay: '0.3s'}}></div>
                                                  <div className="w-9 h-9 rounded-full bg-[#5BC0EB] border border-cyan-200 shadow-[0_0_6px_rgba(91,192,235,0.5)] relative z-10"></div>
                                                </div>
                                              );
                                            })}
                                            
                                            {/* Sub contractor dots - Use geocoded locations */}
                                            {Array.from({ length: 5 }, (_, index) => {
                                              const partner = networkData.relationships?.asSubcontractor?.partners?.[index];
                                              const subStates = ['TX', 'VA', 'WA', 'FL', 'AZ']; // fallback for demo
                                              const subState = partner?.state || subStates[index] || 'TX';
                                              return (
                                                <div 
                                                  key={`sub-${index}`}
                                                  className="relative"
                                                  style={{ 
                                                    position: 'absolute',
                                                    ...getMapPosition(partner?.zipCode, partner?.city, subState),
                                                    transform: 'translate(-50%, -50%)'
                                                  }}
                                                  title={partner?.primeName || `Child Contractor ${index + 1}`}
                                                >
                                                  <div className="absolute inset-0 w-9 h-9 rounded-full bg-[#FF4C4C] opacity-30 animate-ping"></div>
                                                  <div className="absolute inset-0 w-9 h-9 rounded-full bg-[#FF4C4C] opacity-20 animate-ping" style={{animationDelay: '0.7s'}}></div>
                                                  <div className="w-9 h-9 rounded-full bg-[#FF4C4C] border border-pink-200 shadow-[0_0_6px_rgba(255,76,76,0.5)] relative z-10"></div>
                                                </div>
                                              );
                                            })}
                                            
                                            {/* Place of Performance dots - Use real performance data */}
                                            {['Dallas, TX', 'Denver, CO'].map((location, index) => {
                                              const { city, state } = parsePlaceOfPerformance(location);
                                              return (
                                                <div 
                                                  key={`performance-${index}`}
                                                  className="relative"
                                                  style={{ 
                                                    position: 'absolute',
                                                    ...getMapPosition(undefined, city, state),
                                                    transform: 'translate(-50%, -50%)'
                                                  }}
                                                  title={`Performance Location: ${location}`}
                                                >
                                                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-[#9B7EBD] opacity-30 animate-ping"></div>
                                                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-[#9B7EBD] opacity-20 animate-ping" style={{animationDelay: `${0.2 + index * 0.2}s`}}></div>
                                                  <div className="w-8 h-8 rounded-full bg-[#9B7EBD] border border-[#9B7EBD]/30 shadow-[0_0_4px_rgba(155,126,189,0.5)] relative z-10"></div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Legend */}
                                  <div className="absolute bottom-1 left-0 w-full">
                                    <div className="flex justify-center gap-2 font-light" style={{ fontSize: '12px' }}>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D2AC38]"></div>
                                        <span className="text-[#D2AC38]">Contractor</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB]"></div>
                                        <span className="text-[#5BC0EB]">Parent</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C]"></div>
                                        <span className="text-[#FF4C4C]">Child</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#9B7EBD]"></div>
                                        <span className="text-[#9B7EBD]">Place of Performance</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </HudCard>
                          </div>

                              {/* Historical Activity Mix */}
                              <div>
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                  HISTORICAL ACTIVITY MIX
                                </h3>
                                <div className="flex-1 relative">
                                  {/* HYBRID tag in upper left */}
                                  <div className="absolute top-2 z-10" style={{ left: '15px' }}>
                                    <div className="bg-[#d2ac38]/30 border border-[#d2ac38] rounded-full px-3 py-1.5 backdrop-blur-sm">
                                      <span className="text-xs text-white tracking-wider font-medium" style={{ fontFamily: 'Genos, sans-serif' }}>
                                        HYBRID
                                      </span>
                                    </div>
                                  </div>
                                  <GoldengateDoughnutChart
                                    title=""
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={240}
                                    data={{
                                      labels: ['Prime Contracts', 'Subcontracts'],
                                      datasets: [{
                                        data: [
                                          networkData.relationships?.asPrime?.totalValue || 0,
                                          networkData.relationships?.asSubcontractor?.totalValue || 0
                                        ],
                                        backgroundColor: ['rgba(91, 192, 235, 0.3)', 'rgba(255, 76, 76, 0.3)'],
                                        borderColor: ['#5BC0EB', '#FF4C4C'],
                                        borderWidth: 2,
                                      }]
                                    }}
                                    options={{
                                      plugins: {
                                        legend: {
                                          position: 'right',
                                          labels: {
                                            color: '#FFFFFF',
                                            font: { 
                                              family: 'system-ui, -apple-system, sans-serif',
                                              size: 12 
                                            },
                                            padding: 20,
                                            usePointStyle: true,
                                            pointStyle: 'rect'
                                          }
                                        },
                                        tooltip: {
                                          callbacks: {
                                            label: (context: any) => {
                                              const value = context.raw;
                                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                              const percentage = ((value / total) * 100).toFixed(1);
                                              return `${context.label}: ${(value / 1e6).toFixed(1)}M (${percentage}%)`;
                                            }
                                          }
                                        }
                                      },
                                      maintainAspectRatio: false,
                                      layout: {
                                        padding: {
                                          top: 10,
                                          bottom: 10,
                                          left: 10,
                                          right: 10
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </HudCard>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'contracts' && (
                  <div className="space-y-4">
                    {/* Top: Contract Analytics - Row of 3 */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Pipeline Position */}
                      <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/40">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>
                          PIPELINE POSITION
                        </div>
                        <div style={{height: '140px'}}>
                          <GoldengateDoughnutChart
                            title=""
                            liveIndicator={false}
                            height={140}
                            data={{
                              labels: ['Executed', 'Subcontracted', 'Remaining'],
                              datasets: [{
                                data: [30, 25, 45],
                                backgroundColor: [
                                  '#4EC9B0',
                                  '#5BC0EB',
                                  '#D2AC38'
                                ],
                                borderColor: [
                                  '#4EC9B0',
                                  '#5BC0EB',
                                  '#D2AC38'
                                ],
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                },
                                tooltip: {
                                  enabled: true,
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: '#fff',
                                  bodyColor: '#fff',
                                  borderColor: '#374151',
                                  borderWidth: 1,
                                  padding: 8,
                                  displayColors: true,
                                  callbacks: {
                                    label: function(context: any) {
                                      return context.label + ': ' + context.parsed + '%';
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Combined Categories Panel */}
                      <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/40">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'Genos, sans-serif' }}>
                          CONTRACT CATEGORIES
                        </div>

                        {/* NAICS Section */}
                        <div className="mb-4">
                          <div className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">NAICS</div>
                          <div className="space-y-1.5">
                            {[
                              { code: '332312', label: 'Fabricated Metal', pct: 65, color: '#D2AC38' },
                              { code: '332313', label: 'Plate Work', pct: 20, color: '#4EC9B0' },
                              { code: '332618', label: 'Wire Products', pct: 10, color: '#FF6B35' },
                              { code: '336411', label: 'Aerospace', pct: 5, color: '#9B7EBD' }
                            ].map((naics) => (
                              <div key={naics.code} className="flex items-center gap-2">
                                <div className="text-[8px] font-mono text-gray-500 w-10">{naics.code}</div>
                                <div className="flex-1">
                                  <div className="h-2 bg-gray-800/30 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${naics.pct}%`,
                                        backgroundColor: naics.color
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="text-[8px] text-gray-400 w-6 text-right">{naics.pct}%</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* PSC Section */}
                        <div>
                          <div className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">PSC</div>
                          <div className="space-y-1.5">
                          {[
                            { code: '2350', label: 'Combat Vehicles', pct: 40, color: '#FF4C4C' },
                            { code: '5680', label: 'Miscellaneous', pct: 25, color: '#FFD166' },
                            { code: '1560', label: 'Aircraft Parts', pct: 20, color: '#06D6A0' },
                            { code: '5340', label: 'Hardware', pct: 15, color: '#118AB2' }
                          ].map((psc) => (
                              <div key={psc.code} className="flex items-center gap-2">
                                <div className="text-[8px] font-mono text-gray-500 w-10">{psc.code}</div>
                                <div className="flex-1">
                                  <div className="h-2 bg-gray-800/30 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${psc.pct}%`,
                                        backgroundColor: psc.color
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="text-[8px] text-gray-400 w-6 text-right">{psc.pct}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Contract Velocity */}
                      <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/40">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>
                          CONTRACT VELOCITY
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-[9px] text-gray-400">Total Active</span>
                              <span className="text-2xl font-light text-white">92</span>
                            </div>
                          </div>
                          <div className="border-t border-gray-700/50 pt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] text-gray-400">Avg Duration</span>
                              <span className="text-sm text-white">18 mo</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] text-gray-400">Avg Value</span>
                              <span className="text-sm text-white">$2.3M</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-gray-400">Win Rate</span>
                              <span className="text-sm text-green-400">68%</span>
                            </div>
                          </div>
                          <div className="border-t border-gray-700/50 pt-2">
                            <div className="text-[9px] text-gray-400 mb-2">Monthly New Awards</div>
                            <div className="flex items-end gap-1 h-12">
                              {[3, 5, 2, 7, 4, 6, 8, 5, 9, 4, 6, 7].map((val, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-[#4EC9B0]/40 to-[#4EC9B0]/10 border border-[#4EC9B0]/30"
                                  style={{ height: `${(val/9)*100}%` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Contracts Table */}
                    <div className="flex-1">
                      <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500">
                        <div className="p-4 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                              ACTIVE CONTRACTS
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider">92 TOTAL</span>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#4EC9B0', boxShadow: '0 0 10px rgba(78,201,176,0.5)' }} />
                              <span className="text-[10px] tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif', color: '#4EC9B0' }}>
                                LIVE
                              </span>
                            </div>
                          </div>

                          {/* Table Container */}
                          <div className="flex-1" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                            <div className="h-full overflow-auto">
                              <table className="w-full text-xs">
                              <thead className="sticky top-0 border-b border-gray-700/30" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                <tr>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Award ID</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Role</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Client</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Description</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Value</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Start</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">End</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">NAICS</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">PSC</th>
                                  <th className="text-left px-2 py-1.5 text-gray-500 font-normal uppercase tracking-wide text-[9px]">Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Sample contract rows */}
                                {[
                                  { id: 'W912HZ24F0123', role: 'prime', client: 'DOD', desc: 'Vehicle Armor System Manufacturing', value: '$12.5M', start: '01/2024', end: '12/2029', naics: '332312', psc: '5110', type: 'FIRM-FIXED' },
                                  { id: 'MC-2024-0456', role: 'sub', client: 'MegaCorp Industries', desc: 'Structural Components for M-ATV', value: '$8.3M', start: '09/2023', end: '08/2026', naics: '332312', psc: '2510', type: 'Subcontract' },
                                  { id: 'SPE4A024M1789', role: 'prime', client: 'DLA', desc: 'Precision Hardware Manufacturing', value: '$3.2M', start: '03/2024', end: '03/2025', naics: '332312', psc: '5340', type: 'FIRM-FIXED' },
                                  { id: 'N00024-24-C-5432', role: 'prime', client: 'NAVY', desc: 'Naval Vessel Protective Plating', value: '$15.7M', start: '02/2024', end: '02/2028', naics: '332312', psc: '2090', type: 'COST-PLUS' },
                                  { id: 'GDS-SUB-0012', role: 'sub', client: 'Global Defense Systems', desc: 'Aircraft Structural Assemblies', value: '$9.8M', start: '04/2024', end: '03/2027', naics: '332312', psc: '1560', type: 'Subcontract' },
                                  { id: 'W911QX24P0234', role: 'prime', client: 'ARMY', desc: 'Combat Vehicle Armor Upgrades', value: '$22.1M', start: '01/2024', end: '12/2029', naics: '332312', psc: '2350', type: 'FIRM-FIXED' },
                                  { id: 'HDTRA124C0098', role: 'prime', client: 'DTRA', desc: 'Hardened Facility Components', value: '$5.6M', start: '06/2024', end: '06/2026', naics: '332312', psc: '5680', type: 'COST-PLUS' },
                                  { id: 'MC-2024-1789', role: 'sub', client: 'MegaCorp Industries', desc: 'Strategic Material Reserve Parts', value: '$4.3M', start: '05/2024', end: '05/2025', naics: '332312', psc: '5110', type: 'Subcontract' },
                                  { id: 'W58RGZ-23-C-0156', role: 'prime', client: 'DOD', desc: 'MRAP Underbody Protection Systems', value: '$18.9M', start: '11/2023', end: '10/2027', naics: '332312', psc: '2355', type: 'IDIQ' },
                                  { id: 'N68335-24-C-0234', role: 'prime', client: 'NAVY', desc: 'Submarine Hull Reinforcement Plates', value: '$7.2M', start: '03/2024', end: '03/2026', naics: '332312', psc: '2030', type: 'FIRM-FIXED' },
                                  { id: 'GDS-SUB-0078', role: 'sub', client: 'Global Defense Systems', desc: 'Aerospace Grade Fabrication', value: '$11.4M', start: '01/2024', end: '12/2028', naics: '332312', psc: '1510', type: 'Subcontract' },
                                  { id: 'W31P4Q-24-C-0089', role: 'prime', client: 'AMC', desc: 'Ammunition Storage Containers', value: '$6.8M', start: '07/2024', end: '07/2026', naics: '332312', psc: '8140', type: 'FIRM-FIXED' },
                                  { id: 'HDTRA223C0067', role: 'prime', client: 'DTRA', desc: 'Blast Resistant Enclosures', value: '$13.2M', start: '10/2023', end: '09/2026', naics: '332312', psc: '5680', type: 'IDIQ' },
                                  { id: 'MC-2024-0123', role: 'sub', client: 'MegaCorp Industries', desc: 'Military Specification Fasteners', value: '$2.9M', start: '08/2024', end: '08/2025', naics: '332312', psc: '5320', type: 'Subcontract' },
                                  { id: 'W52P1J-24-C-0045', role: 'prime', client: 'ARMY', desc: 'Tank Track Components Manufacturing', value: '$16.5M', start: '04/2024', end: '03/2028', naics: '332312', psc: '2350', type: 'IDIQ' },
                                ].map((contract, index) => (
                                  <tr key={index} className="hover:bg-gray-800/10 transition-colors border-b border-gray-700/10">
                                    <td className="px-2 py-1 text-gray-500 font-mono text-[9px]">{contract.id}</td>
                                    <td className="px-2 py-1">
                                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium uppercase ${
                                        contract.role === 'prime'
                                          ? 'bg-[#5BC0EB]/20 text-[#5BC0EB] border border-[#5BC0EB]/30'
                                          : 'bg-[#FF4C4C]/20 text-[#FF4C4C] border border-[#FF4C4C]/30'
                                      }`}>
                                        {contract.role}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1">
                                      <span className="font-medium text-[10px] text-white">
                                        {contract.client}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1 text-gray-300 text-[10px] max-w-[200px] truncate">{contract.desc}</td>
                                    <td className="px-2 py-1 text-white font-medium text-[10px]">{contract.value}</td>
                                    <td className="px-2 py-1 text-gray-500 text-[9px]">{contract.start}</td>
                                    <td className="px-2 py-1 text-gray-500 text-[9px]">{contract.end}</td>
                                    <td className="px-2 py-1 text-gray-500 font-mono text-[9px]">{contract.naics}</td>
                                    <td className="px-2 py-1 text-gray-500 font-mono text-[9px]">{contract.psc}</td>
                                    <td className="px-2 py-1 text-gray-400 text-[9px]">{contract.type}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            </div>
                          </div>

                          {/* Table Footer Stats */}
                          <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
                            <div>Showing 15 of 117 active contracts</div>
                            <div className="flex gap-4">
                              <span>Total Value: <span className="font-medium" style={{ color: '#4EC9B0' }}>$480M</span></span>
                              <span>Avg Duration: <span className="text-gray-400">3.8 years</span></span>
                              <span>Prime: <span className="text-[#5BC0EB]">67</span> | Sub: <span className="text-[#FF4C4C]">50</span></span>
                            </div>
                          </div>
                        </div>
                      </HudCard>
                    </div>

                    {/* Right: Charts Panel - 20% width (1 of 5 units) */}
                    <div className="flex-1 min-w-0">
                      <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500">
                        <div className="p-4 h-full flex flex-col">
                          <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                            CONTRACT ANALYTICS
                          </h3>

                          {/* Charts Container - Scrollable if needed */}
                          <div className="flex-1 overflow-y-auto space-y-3">
                            {/* Pipeline Position */}
                            <div className="space-y-1">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>
                                PIPELINE POSITION
                              </div>
                              <div style={{height: '150px'}}>
                                <GoldengateDoughnutChart
                                  title=""
                                  liveIndicator={false}
                                  height={150}
                                  data={{
                                    labels: ['Executed', 'Subcontracted', 'Remaining'],
                                    datasets: [{
                                      data: [30, 25, 45],
                                      backgroundColor: [
                                        'rgba(91, 192, 235, 0.25)',
                                        'rgba(255, 76, 76, 0.25)',
                                        'rgba(210, 172, 56, 0.25)'
                                      ],
                                      hoverBackgroundColor: ['#5BC0EB', '#FF4C4C', '#D2AC38'],
                                      hoverBorderColor: ['#5BC0EB', '#FF4C4C', '#D2AC38'],
                                      borderColor: ['#5BC0EB', '#FF4C4C', '#D2AC38'],
                                      borderWidth: 2,
                                      hoverBorderWidth: 2,
                                      cutout: '60%'
                                    }]
                                  }}
                                  options={{
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 1)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#4EC9B0',
                                        borderWidth: 1,
                                        padding: 8,
                                        displayColors: true,
                                        callbacks: {
                                          label: function(context: any) {
                                            return context.label + ': ' + context.parsed + '%';
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-col items-center gap-1 mt-2 text-[9px]">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#5BC0EB'}}></div>
                                  <span className="text-gray-400">Executed 30%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#FF4C4C'}}></div>
                                  <span className="text-gray-400">Subcontracted 25%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#D2AC38'}}></div>
                                  <span className="text-gray-400">Remaining 45%</span>
                                </div>
                              </div>
                            </div>

                            {/* NAICS Mix */}
                            <div className="space-y-1">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>
                                NAICS MIX
                              </div>
                              <div style={{height: '150px'}}>
                                <GoldengateDoughnutChart
                                  title=""
                                  liveIndicator={false}
                                  height={150}
                                  data={{
                                    labels: ['332312', '336411', '541512', 'Other'],
                                    datasets: [{
                                      data: [65, 20, 10, 5],
                                      backgroundColor: [
                                        'rgba(210, 172, 56, 0.25)',
                                        'rgba(78, 201, 176, 0.25)',
                                        'rgba(255, 107, 53, 0.25)',
                                        'rgba(155, 126, 189, 0.25)'
                                      ],
                                      hoverBackgroundColor: ['#D2AC38', '#4EC9B0', '#FF6B35', '#9B7EBD'],
                                      hoverBorderColor: ['#D2AC38', '#4EC9B0', '#FF6B35', '#9B7EBD'],
                                      borderColor: ['#D2AC38', '#4EC9B0', '#FF6B35', '#9B7EBD'],
                                      borderWidth: 2,
                                      hoverBorderWidth: 2,
                                      cutout: '0%'
                                    }]
                                  }}
                                  options={{
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 1)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#4EC9B0',
                                        borderWidth: 1,
                                        padding: 8,
                                        displayColors: true,
                                        callbacks: {
                                          label: function(context: any) {
                                            return context.label + ': ' + context.parsed + '%';
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-col items-center gap-1 mt-2 text-[9px]">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#D2AC38'}}></div>
                                  <span className="text-gray-400">332312: 65%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#4EC9B0'}}></div>
                                  <span className="text-gray-400">336411: 20%</span>
                                </div>
                              </div>
                            </div>

                            {/* PSC Mix */}
                            <div className="space-y-1">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>
                                PSC MIX
                              </div>
                              <div style={{height: '150px'}}>
                                <GoldengateDoughnutChart
                                  title=""
                                  liveIndicator={false}
                                  height={150}
                                  data={{
                                    labels: ['5110', '2350', '1560', 'Other'],
                                    datasets: [{
                                      data: [40, 30, 20, 10],
                                      backgroundColor: [
                                        'rgba(210, 172, 56, 0.25)',
                                        'rgba(227, 66, 52, 0.25)',
                                        'rgba(163, 230, 53, 0.25)',
                                        'rgba(236, 72, 153, 0.25)'
                                      ],
                                      hoverBackgroundColor: ['#D2AC38', '#E34234', '#A3E635', '#EC4899'],
                                      hoverBorderColor: ['#D2AC38', '#E34234', '#A3E635', '#EC4899'],
                                      borderColor: ['#D2AC38', '#E34234', '#A3E635', '#EC4899'],
                                      borderWidth: 2,
                                      hoverBorderWidth: 2,
                                      cutout: '0%'
                                    }]
                                  }}
                                  options={{
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 1)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#4EC9B0',
                                        borderWidth: 1,
                                        padding: 8,
                                        displayColors: true,
                                        callbacks: {
                                          label: function(context: any) {
                                            return context.label + ': ' + context.parsed + '%';
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-col items-center gap-1 mt-2 text-[9px]">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#D2AC38'}}></div>
                                  <span className="text-gray-400">5110: 40%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#E34234'}}></div>
                                  <span className="text-gray-400">2350: 30%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
                              REAL-TIME CONTRACT COMPOSITION
                            </p>
                          </div>
                        </div>
                      </HudCard>
                    </div>
                  </div>
                )}

                {activeTab === 'people' && (
                  <div className="space-y-6">
                    <PeopleSection
                      companyName={contractor?.name || 'Trio Fabrication LLC'}
                      companyDomain={contractor?.website}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Footer - Fixed Position */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <PlatformFooter mode={activeTab} contextInfo={`UEI: ${contractor?.uei?.slice(-8) || 'N/A'}`} />
      </div>
    </div>
  );
}