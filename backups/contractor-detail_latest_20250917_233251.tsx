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
    const year = d.getFullYear();
    // Get last day of the month
    const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
    const day = String(lastDay).padStart(2, '0');
    return `${month}-${day}-${year}`;
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
    <div className="min-h-screen text-white relative" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 tactical-grid" />
      </div>


      {/* Main scrollable content */}
      <div className="pb-16"> {/* Padding bottom for fixed footer */}
        {/* Header - Hybrid Luxury/HUD Design */}
        <div className="relative border-b border-gray-800/60" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
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
                  <span className="text-blue-400 font-sans font-normal" style={{ fontSize: '16px' }}>www.website.com</span>
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
                    <span className="px-1.5 py-0.5 bg-[#4EC9B0]/20 border border-[#4EC9B0]/40 rounded-full uppercase tracking-wider text-[#4EC9B0] font-sans font-normal" style={{ fontSize: '10px' }}>Strong</span>
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
            
            {/* Metrics Cards - Full Width Under Logo Box */}
            <div className="grid grid-cols-4 gap-6 mt-2">
              <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Lifetime Awards</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>1.2B</span>
                  </span>
                  <span className="text-gray-600">|</span>
                  <span className="text-white font-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px' }}>
                    278 Awards
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Total value and number of historical definitive awards
                </div>
              </div>
              
              <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Active Awards</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>480M</span>
                  </span>
                  <span className="text-gray-600">|</span>
                  <span className="text-white font-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px' }}>
                    92 Awards
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Total value and number of active definitive awards
                </div>
              </div>
              
              <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Estimated Revenue (TTM)</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>112.5M</span>
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Straight-line recognition of active awards
                </div>
              </div>
              
              <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Estimated Pipeline</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>337.5M</span>
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Estimated value of remaining and upcoming awards
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
                  {['overview', 'performance', 'network', 'contracts'].map((tab) => (
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
                                    TIME-SERIES PERFORMANCE ({revenueTimePeriod}Y)
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <select
                                      className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                      value={revenueTimeAggregation}
                                      onChange={(e) => setRevenueTimeAggregation(e.target.value)}
                                    >
                                      <option value="M">Month</option>
                                      <option value="Q">Quarter</option>
                                      <option value="Y">Year</option>
                                    </select>
                                    <select
                                      className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
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
                                    title="Awards & Revenue History"
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
                                          borderWidth: 1,
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
                                          enabled: true,
                                          backgroundColor: 'rgba(0, 0, 0, 1)', // Fully opaque black
                                          titleColor: '#fff',
                                          bodyColor: '#fff',
                                          borderColor: '#4EC9B0',
                                          borderWidth: 1,
                                          padding: 10,
                                          displayColors: false,
                                          callbacks: {
                                            title: function() {
                                              return ''; // Hide the default title (date)
                                            },
                                            afterBody: function(context: any) {
                                              const awards = context[0]?.parsed.y || 0;
                                              const revenue = context[1]?.parsed.y || 0;

                                              // Format values with padding for alignment
                                              const awardsStr = `$${awards.toFixed(1)}M`;
                                              const revenueStr = `$${revenue.toFixed(1)}M`;

                                              // Use spaces to create alignment (adjust padding as needed)
                                              const labelWidth = 20; // Adjust for desired width
                                              const awardsLabel = 'Awards Captured:'.padEnd(labelWidth, ' ');
                                              const revenueLabel = 'Revenue Recognized:'.padEnd(labelWidth, ' ');

                                              return [
                                                `${awardsLabel}${awardsStr}`,
                                                `${revenueLabel}${revenueStr}`
                                              ];
                                            },
                                            footer: function(context: any) {
                                              const date = context[0]?.label || '';
                                              return date;
                                            },
                                            label: function() {
                                              return null; // Hide default labels
                                            },
                                            labelColor: function() {
                                              return null; // Hide color boxes
                                            }
                                          },
                                          bodyFont: {
                                            size: 12,
                                            family: 'monospace' // Use monospace for better alignment
                                          },
                                          footerFont: {
                                            size: 11
                                          },
                                          footerColor: 'rgba(255, 255, 255, 0.5)' // Dimmed gray text for date
                                        }
                                      },
                                      scales: {
                                        x: {
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 7 },
                                            maxRotation: 45,
                                            minRotation: 45,
                                            autoSkip: false
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
                                <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                  AGENCY RELATIONSHIPS
                                </h3>
                                <div className="flex-1">
                                  <GoldengateBarChart
                                    title="Lifetime Awards"
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={280}
                                    data={{
                                      labels: ['DOD', 'GSA', 'VA', 'NASA', 'DHS'],
                                      datasets: [{
                                        label: 'Value ($M)',
                                        data: [
                                          185, // DOD: Primary agency (lifetime)
                                          42,  // GSA: Some historical work
                                          28,  // VA: Some historical work
                                          15,  // NASA: Minor historical work
                                          8,   // DHS: Minor historical work
                                        ],
                                        backgroundColor: 'rgba(78, 201, 176, 0.4)',
                                        borderColor: '#4EC9B0',
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
                                          enabled: true,
                                          backgroundColor: 'rgba(0, 0, 0, 1)', // Fully opaque black
                                          titleColor: '#fff',
                                          bodyColor: '#fff',
                                          borderColor: '#4EC9B0',
                                          borderWidth: 1,
                                          padding: 10,
                                          displayColors: false,
                                          callbacks: {
                                            label: function(context: any) {
                                              const value = context.parsed.y;
                                              // Format with one decimal place if not .0, otherwise whole number
                                              const formatted = value % 1 === 0 || Math.round(value * 10) / 10 === Math.round(value)
                                                ? '$' + Math.round(value) + 'M'
                                                : '$' + (Math.round(value * 10) / 10).toFixed(1) + 'M';
                                              return formatted;
                                            }
                                          }
                                        }
                                      },
                                      scales: {
                                        x: {
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { size: 12 },
                                            maxRotation: 0,
                                            minRotation: 0,
                                            maxTicksLimit: 5,
                                            autoSkip: false
                                          },
                                          grid: { color: 'rgba(192, 192, 192, 0.3)' },
                                          border: { display: false }
                                        },
                                        y: {
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { size: 12 },
                                            callback: function(value: any) {
                                              return value % 1 === 0 || Math.round(value * 10) / 10 === Math.round(value)
                                                ? '$' + Math.round(value) + 'M'
                                                : '$' + (Math.round(value * 10) / 10).toFixed(1) + 'M';
                                            }
                                          },
                                          grid: { color: 'rgba(192, 192, 192, 0.3)' },
                                          border: { display: false }
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
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    {performanceData && performanceData.metrics && Array.isArray(performanceData.metrics) && performanceData.metrics.length > 0 ? (
                      <>
                        {/* Performance Summary - Full Width Panel */}
                        <div className="w-full mb-6">
                          <HudCard variant="default" priority="high" isPanel={true} className="border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-6">
                              <h3 className="text-gray-200 font-normal tracking-wider mb-6 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                                PERFORMANCE SUMMARY
                              </h3>

                              {/* Two Container Layout */}
                              <div className="grid grid-cols-2 gap-8 mb-6 relative">

                                {/* Left Container - Performance Scores */}
                                <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 relative" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                                      PERFORMANCE SCORES
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                      <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
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
                                              stroke="#4EC9B0"
                                              strokeWidth="8"
                                              fill="none"
                                              strokeDasharray={`${2 * Math.PI * 72 * 0.80} ${2 * Math.PI * 72}`}
                                              strokeLinecap="round"
                                            />
                                            <circle
                                              cx="80"
                                              cy="80"
                                              r="64"
                                              fill="#000000"
                                            />
                                          </svg>
                                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-5xl font-light" style={{ color: '#4EC9B0' }}>80</div>
                                            <div className="text-xs uppercase tracking-wider text-gray-400 -mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>COMPOSITE</div>
                                            <div className="text-xs uppercase tracking-wider text-gray-400" style={{ fontFamily: 'Genos, sans-serif' }}>SCORE</div>
                                          </div>
                                        </div>
                                        {/* Subtitle below radial */}
                                        <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                                          <p className="text-xs text-gray-500 font-sans leading-tight">
                                            80th percentile among 247 peers in Q4<br/>with primary NAICS of 332312
                                          </p>
                                        </div>
                                      </div>
                                      {/* Subscores - Compact containers */}
                                      <div className="flex-1 space-y-2 max-w-sm">
                                        <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>AWARDS CAPTURED (TTM)</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">$12.4M</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light text-white w-6 text-right">82</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#4EC9B0]" style={{ width: '82%' }}></div>
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

                                        <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>ESTIMATED REVENUE (TTM)</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">$8.7M</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light text-white w-6 text-right">76</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#4EC9B0]" style={{ width: '76%' }}></div>
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

                                        <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>TOTAL PIPELINE</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">$45.2M</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light text-white w-6 text-right">91</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#38E54D]" style={{ width: '91%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Total Pipeline</div>
                                              <div>Lifetime awards minus lifetime revenue as</div>
                                              <div>recognized on a straight-line basis over</div>
                                              <div>the respective performance periods.</div>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                                          </div>
                                        </div>

                                        <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>PORTFOLIO DURATION</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">3.2 yrs</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light text-white w-6 text-right">68</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#FFD166]" style={{ width: '68%' }}></div>
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

                                        <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>BLENDED GROWTH</span>
                                            <div className="flex items-center">
                                              <span className="text-xs text-gray-500 w-12 text-right">+24%</span>
                                              <span className="text-xs text-gray-500 mx-2">|</span>
                                              <span className="text-sm font-light text-white w-6 text-right">85</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#4EC9B0]" style={{ width: '85%' }}></div>
                                          </div>
                                          {/* Custom Tooltip */}
                                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                            <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                                              <div className="font-bold text-[#D2AC38] mb-1">Blended Growth</div>
                                              <div>Multi-year revenue growth:</div>
                                              <div>50% year-over-year, 30% 2yr AVG,</div>
                                              <div>20% 3yr AVG.</div>
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
                                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                      <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                                        TRACKING
                                      </span>
                                    </div>
                                  </div>
                                    <div className="grid grid-cols-2 gap-4 h-64">
                                      <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>PERFORMANCE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-[#4EC9B0]">Strong</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Tier</div>
                                      </div>
                                      <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>NAICS CODE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-white">332312</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Fabricated Structural Metal Manufacturing</div>
                                      </div>
                                      <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>SIZE QUARTILE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-white">Q4</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Lifetime Awards</div>
                                      </div>
                                      <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>GROUP SIZE</div>
                                        <div className="flex-1 flex items-center justify-center">
                                          <div className="text-2xl font-light text-white text-center">247</div>
                                        </div>
                                        <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Peer Count</div>
                                      </div>
                                    </div>
                                </div>
                              </div>

                              {/* Performance Analysis Section */}
                              <div className="pt-6 mt-6 border-t border-gray-700/50">
                                <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                                  <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500 mb-2">
                                    PERFORMANCE ANALYSIS
                                  </h4>
                                  <p className="text-gray-300 text-sm leading-relaxed">
                                    This contractor demonstrates <span className="text-[#4EC9B0] font-medium">strong performance</span> with a composite score of <span className="text-[#4EC9B0] font-medium">80/100</span>,
                                    placing them in the <span className="text-[#4EC9B0] font-medium">high performance</span> tier of their peer group.
                                    The <span className="text-[#38E54D]">91st percentile pipeline value</span> coupled with <span className="text-[#FFD166]">68th percentile portfolio duration</span> indicates
                                    strong new business acquisition but potential contract retention challenges. Their <span className="text-[#4EC9B0]">82nd percentile award capture rate</span>
                                    suggests effective bid strategies, though <span className="text-[#4EC9B0]">revenue conversion</span> at 76th percentile shows room for maximizing contract value.
                                  </p>
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
                                      <span className="text-xs text-gray-400">Y-Axis:</span>
                                      <select
                                        className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
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
                                      <span className="text-xs text-gray-400">X-Axis:</span>
                                      <select
                                        className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
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
                                        <span className="text-green-400 font-medium"> ${((networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000).toFixed(1)}M</span> in award inflows from 
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
                                        {' '}<span className="text-[#7B61FF]">{contractor.state || 'multiple states'}</span>, 
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
                                                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-[#7B61FF] opacity-30 animate-ping"></div>
                                                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-[#7B61FF] opacity-20 animate-ping" style={{animationDelay: `${0.2 + index * 0.2}s`}}></div>
                                                  <div className="w-8 h-8 rounded-full bg-[#7B61FF] border border-purple-200 shadow-[0_0_4px_rgba(123,97,255,0.5)] relative z-10"></div>
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
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#7B61FF]"></div>
                                        <span className="text-[#7B61FF]">Place of Performance</span>
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
                  <div className="space-y-6">
                    {/* Contract Analysis Panels - NAICS Mix, PSC Mix, Pipeline Position */}
                    <div className="grid grid-cols-3 gap-4">

                      {/* NAICS Mix Panel */}
                      <div className="col-span-1">
                        <NaicsMixPanel />
                      </div>

                      {/* PSC Mix Panel */}
                      <div className="col-span-1">
                        <PscMixPanel />
                      </div>

                      {/* Pipeline Position Panel */}
                      <div className="col-span-1">
                        <PipelinePositionPanel />
                      </div>
                    </div>
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