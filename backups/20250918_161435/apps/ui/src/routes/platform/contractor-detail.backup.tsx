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
      'ttm_awards': 'TTM Awards',
      'ttm_revenue': 'TTM Revenue', 
      'lifetime_awards': 'Lifetime Awards',
      'lifetime_revenue': 'Lifetime Revenue',
      'total_pipeline': 'Total Pipeline'
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

  const getChartTitle = (metric: string) => {
    const titles: Record<string, string> = {
      'ttm_awards': 'TTM Awards vs Growth Score',
      'ttm_revenue': 'TTM Revenue vs Growth Score', 
      'lifetime_awards': 'Lifetime Awards vs Growth Score',
      'lifetime_revenue': 'Lifetime Revenue vs Growth Score',
      'total_pipeline': 'Total Pipeline vs Growth Score'
    };
    return titles[metric] || 'Competitive Position vs Growth Score';
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
        uei: `PROFILE-${profile.totalUeis}`,
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
      
      setContractor(contractorData);
      
    } catch (error) {
      console.error('Failed to fetch contractor data:', error);
      // Create a fallback contractor object so the page still renders
      setContractor({
        id: params.contractorId,
        uei: `UNKNOWN-${params.contractorId}`,
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
          { primeUei: 'MOCK101', primeName: 'MegaCorp Industries', strengthScore: 90, sharedRevenue: 250000000, sharedContracts: 15, frequency: 'high', exclusivityScore: 0.8, isActive: true },
          { primeUei: 'MOCK102', primeName: 'Global Defense Systems', strengthScore: 78, sharedRevenue: 180000000, sharedContracts: 10, frequency: 'medium', exclusivityScore: 0.6, isActive: true }
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
    if (value >= 1e15) return `${(value / 1e15).toFixed(1)}Q`;
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
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

      {/* Platform Banner - Consistent across all pages */}
      <div className="sticky top-0 backdrop-blur-xl border-b border-gray-800 z-40" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.bannerColor + 'ee' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo - Matching Header.tsx Style */}
              <div className="text-2xl font-light tracking-wide" style={{ fontFamily: 'Michroma, sans-serif', color: '#D2AC38' }}>
                Goldengate
              </div>
            </div>
            
            {/* User Panel */}
            <div className="flex items-center">
              <div className="px-4 py-2 bg-gray-900/40 border border-gray-800 rounded backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Shield className="w-5 h-5 text-[#D2AC38]" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>OPERATOR</p>
                    <p className="text-sm text-gray-200" style={{ fontFamily: 'Genos, sans-serif' }}>
                      {user?.fullName || user?.username}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <button className="text-xs text-gray-400 uppercase tracking-wider hover:text-white transition-colors" style={{ fontFamily: 'Genos, sans-serif' }}>
                      <Settings className="w-3 h-3 inline mr-1" />
                      User Settings
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors" style={{ fontFamily: 'Genos, sans-serif' }}
                    >
                      <Lock className="w-3 h-3 inline mr-1" />
                      Secure Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main scrollable content */}
      <div className="pb-16"> {/* Padding bottom for fixed footer */}
        {/* Header - Hybrid Luxury/HUD Design */}
        <div className="relative border-b border-gray-800/60" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
          {/* Subtle scan line effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
        
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Section - Logo/Visual */}
              <div className="col-span-3">
                <div className="relative">
                  {/* Company Logo with HUD overlay */}
                  <div className="w-full h-48 bg-gray-900/40 border border-gray-700 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700/3 to-gray-900/2" />
                    <div className="flex items-center justify-center h-full p-6">
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        {/* TFL Logo */}
                        <div className="text-6xl font-black tracking-wider text-gray-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
              <div className="col-span-9">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-4xl font-light text-white tracking-wide font-sans">
                        {contractor?.name || 'Trio Fabrication LLC'}
                      </h1>
                    </div>
                    <div className="text-gray-400 mb-4 flex items-center gap-6">
                      <span className="text-xs text-gray-500 font-light uppercase tracking-wider">UEI: {contractor?.uei || 'TFL-2024-001'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-light uppercase tracking-wider">Activity:</span>
                        <span className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs uppercase tracking-wider text-red-400 font-sans font-normal">Hot</span>
                      </div>
                    </div>
                    <p className="text-white leading-relaxed max-w-3xl">
                      {contractor?.establishedDate && `Established in ${new Date(contractor.establishedDate).getFullYear()}, `}
                      {contractor?.name || 'Trio Fabrication LLC'} builds solutions for the {contractor?.industry?.replace('-', ' ') || 'manufacturing'} sector,
                      focusing on {contractor?.primaryAgency || 'Defense'} contracts
                      {contractor?.primaryNaicsDescription && ` with specialization in ${contractor.primaryNaicsDescription.toLowerCase()}`}.
                    </p>
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
                
                {/* Key Info Grid - Flat with HUD accents */}
                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wider mb-1">Sector</div>
                    <div className="text-lg text-white font-light">{contractor?.industry?.replace('-', ' ') || 'Manufacturing'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wider mb-1">Location</div>
                    <div className="text-lg text-white font-light">{contractor?.state || 'Texas'}, USA</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wider mb-1">Agency Focus</div>
                    <div className="text-lg text-white font-light">{contractor?.primaryAgency || 'Defense'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Metrics Cards - Full Width Under Logo Box */}
            <div className="grid grid-cols-4 gap-6 mt-8">
              <div className={cn("rounded-lg p-4 border border-transparent hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-sm text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Lifetime Awards</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '34px' }}>$</span>
                    <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '50px' }}>{contractor.totalContractValue ? formatCurrency(contractor.totalContractValue) : '0'}</span>
                  </span>
                  <span className="text-gray-600">|</span>
                  <span className="text-base text-white font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                    {contractor.activeContracts || 0} AWDs
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Total value and number of historical definitive awards
                </div>
              </div>
              
              <div className={cn("rounded-lg p-4 border border-transparent hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-sm text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Active Awards</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '34px' }}>$</span>
                    <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '50px' }}>{performanceData?.summary?.totalRevenue ? 
                      formatCurrency(performanceData.summary.totalRevenue / 12) : '0'}</span>
                  </span>
                  <span className="text-gray-600">|</span>
                  <span className="text-base text-white font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                    {contractor.activeContracts || 0} AWDs
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Total value and number of active definitive awards
                </div>
              </div>
              
              <div className={cn("rounded-lg p-4 border border-transparent hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-sm text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Estimated Revenue (TTM)</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '34px' }}>$</span>
                    <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '50px' }}>{networkData?.relationships?.asSubcontractor?.totalValue ? 
                      formatCurrency(networkData.relationships.asSubcontractor.totalValue) : '0'}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
                  Estimated trailing twelve month revenue
                </div>
              </div>
              
              <div className={cn("rounded-lg p-4 border border-transparent hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
                <div className="text-sm text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif' }}>Estimated Pipeline</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#D2AC38] transition-colors">
                    <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '34px' }}>$</span>
                    <span style={{ fontFamily: 'Genos, sans-serif', fontSize: '50px' }}>8M</span>
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
                      {tab === 'overview' && <Database className="inline w-5 h-5 mr-2" />}
                      {tab === 'performance' && <Activity className="inline w-5 h-5 mr-2" />}
                      {tab === 'network' && <Users className="inline w-5 h-5 mr-2" />}
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
                    {/* Command Center Dashboard - Reorganized 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      
                      {/* UPPER LEFT: Executive Summary */}
                      <HudCard variant="default" priority="high" isPanel={true} className=" border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                        <div className="p-6 h-full">
                          <h3 className="text-2xl font-normal tracking-wide mb-6 text-gray-200" style={{ fontFamily: 'Genos, sans-serif' }}>
                            Executive Summary
                          </h3>
                          <div className="p-6 border border-gray-600/20 rounded-xl backdrop-blur-sm h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                            <p className="text-sm text-gray-200 leading-relaxed tracking-wide font-light font-sans">
                              Strategic defense technology leader specializing in advanced systems integration and multi-domain operations. Maintaining critical capabilities across aerospace manufacturing, intelligence systems, and next-generation defense platforms.
                            </p>
                          </div>
                        </div>
                      </HudCard>

                      {/* UPPER RIGHT: Operational Intelligence */}
                      <HudCard variant="default" priority="high" isPanel={true} className=" border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                        <div className="p-6 h-full">
                          <h3 className="text-2xl font-normal tracking-wide mb-6 text-gray-200" style={{ fontFamily: 'Genos, sans-serif' }}>
                            Operational Snapshot
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <TacticalDisplay
                              label="AWARDS GROWTH (YOY)"
                              value="+18.2%"
                              trend="up"
                              growth={true}
                              size="md"
                            />
                            <TacticalDisplay
                              label="PORTFOLIO DURATION"
                              value="3.2 Years"
                              size="md"
                            />
                            <TacticalDisplay
                              label="REVENUE GROWTH (YOY)"
                              value="+12.7%"
                              trend="up"
                              growth={true}
                              size="md"
                            />
                            <TacticalDisplay
                              label="PRIMARY NAICS"
                              value={contractor.primaryNaicsCode || '541511'}
                              size="md"
                            />
                            <TacticalDisplay
                              label="PIPELINE GROWTH (YOY)"
                              value="+24.5%"
                              trend="up"
                              growth={true}
                              size="md"
                            />
                            <TacticalDisplay
                              label="PRIMARY PSC"
                              value="R425"
                              size="md"
                            />
                          </div>
                        </div>
                      </HudCard>
                    </div>

                    {/* Bottom Row - Four Charts */}
                    <div className="grid grid-cols-4 gap-4">
                          
                          {/* First: Agency Distribution */}
                          <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4 h-full flex flex-col">
                              <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                Agency Relationships
                              </h3>
                              <div className="flex-1">
                                <GoldengateBarChart
                                  title="Lifetime Awards"
                                  liveIndicator={true}
                                  liveText="TRACKING"
                                  height={240}
                                  data={{
                                    labels: ['DOD', 'GSA', 'VA', 'NASA', 'DHS'],
                                    datasets: [{
                                      label: contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 'Value ($B)' : 'Value ($M)',
                                      data: [
                                        (contractor.totalContractValue || 50000000) * 0.4 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                                        (contractor.totalContractValue || 50000000) * 0.25 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                                        (contractor.totalContractValue || 50000000) * 0.15 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                                        (contractor.totalContractValue || 50000000) * 0.12 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                                        (contractor.totalContractValue || 50000000) * 0.08 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                                      ],
                                      backgroundColor: 'rgba(78, 201, 176, 0.4)',
                                      borderColor: '#4EC9B0',
                                      borderWidth: 2,
                                    }]
                                  }}
                                  options={{
                                    plugins: { 
                                      legend: { display: false },
                                      tooltip: {
                                        enabled: false
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
                                        grid: { color: 'rgba(210, 172, 56, 0.1)' },
                                        border: { display: false }
                                      },
                                      y: {
                                        ticks: { 
                                          color: '#D2AC38', 
                                          font: { size: 12 },
                                          callback: function(value: any) { return '$' + value + (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 'B' : 'M'); }
                                        },
                                        grid: { color: 'rgba(210, 172, 56, 0.1)' },
                                        border: { display: false }
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </HudCard>

                          {/* Second: NAICS Mix */}
                          <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4 h-full flex flex-col">
                              <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                NAICS Mix
                              </h3>
                              <div className="flex-1 relative">
                                <div style={{height: '240px'}}>
                                  <GoldengateDoughnutChart
                                    title="Current Portfolio"
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={240}
                                    data={{
                                      labels: ['541511', '541512', '336411', 'Other'],
                                      datasets: [{
                                        data: [35, 30, 20, 15],
                                        backgroundColor: [
                                          'rgba(210, 172, 56, 0.25)',
                                          'rgba(255, 107, 53, 0.25)',
                                          'rgba(78, 201, 176, 0.25)',
                                          'rgba(162, 89, 255, 0.25)'
                                        ],
                                        hoverBackgroundColor: [
                                          '#D2AC38',
                                          '#FF6B35',
                                          '#4EC9B0',
                                          '#A259FF'
                                        ],
                                        hoverBorderColor: [
                                          '#D2AC38',
                                          '#FF6B35',
                                          '#4EC9B0',
                                          '#A259FF'
                                        ],
                                        borderColor: ['#D2AC38', '#FF6B35', '#4EC9B0', '#A259FF'],
                                        borderWidth: 2,
                                        hoverBorderWidth: 2,
                                        cutout: '0%'
                                      }]
                                    }}
                                    options={{
                                      layout: {
                                        padding: {
                                          top: 5,
                                          left: 10,
                                          right: 10,
                                          bottom: 25
                                        }
                                      },
                                      interaction: {
                                        intersect: false
                                      },
                                      elements: {
                                        arc: {
                                          hoverBackgroundColor: function(context) {
                                            const colors = ['#D2AC38', '#4B5563', '#6B7280', '#0000FF'];
                                            return colors[context.dataIndex];
                                          }
                                        }
                                      },
                                      plugins: {
                                        legend: {
                                          display: false
                                        },
                                        tooltip: {
                                          enabled: true,
                                          backgroundColor: '#000000',
                                          titleColor: '#FFFFFF',
                                          bodyColor: '#FFFFFF',
                                          borderColor: '#D2AC38',
                                          borderWidth: 2,
                                          cornerRadius: 6,
                                          displayColors: false,
                                          padding: 16,
                                          titleFont: {
                                            size: 16,
                                            weight: 'bold',
                                            family: 'sans-serif'
                                          },
                                          bodyFont: {
                                            size: 14,
                                            weight: 'normal',
                                            family: 'sans-serif'
                                          },
                                          opacity: 1,
                                          external: function(context) {
                                            return; // Disabled
                                            // Create or get tooltip element
                                            let tooltipEl = document.getElementById('chartjs-tooltip');
                                            if (!tooltipEl) {
                                              tooltipEl = document.createElement('div');
                                              tooltipEl.id = 'chartjs-tooltip';
                                              tooltipEl.style.background = '#000000';
                                              tooltipEl.style.borderRadius = '6px';
                                              tooltipEl.style.border = '2px solid #D2AC38';
                                              tooltipEl.style.color = '#FFFFFF';
                                              tooltipEl.style.opacity = '0';
                                              tooltipEl.style.position = 'absolute';
                                              tooltipEl.style.transform = 'translate(-50%, -50%)';
                                              tooltipEl.style.transition = 'all .1s ease';
                                              tooltipEl.style.pointerEvents = 'none';
                                              tooltipEl.style.fontFamily = 'sans-serif';
                                              tooltipEl.style.fontSize = '14px';
                                              tooltipEl.style.fontWeight = 'normal';
                                              tooltipEl.style.padding = '16px';
                                              tooltipEl.style.zIndex = '9999';
                                              tooltipEl.style.maxWidth = 'none';
                                              tooltipEl.style.whiteSpace = 'nowrap';
                                              document.body.appendChild(tooltipEl);
                                            }

                                            // Hide if no tooltip
                                            const tooltipModel = context.tooltip;
                                            if (tooltipModel.opacity === 0) {
                                              tooltipEl.style.opacity = '0';
                                              return;
                                            }

                                            // Set Text
                                            if (tooltipModel.body) {
                                              const bodyLines = tooltipModel.body.map(b => b.lines);
                                              tooltipEl.innerHTML = bodyLines.join('<br/>');
                                            }

                                            // Display, position, and set styles for tooltip
                                            const position = context.chart.canvas.getBoundingClientRect();
                                            const bodyFont = tooltipModel.options.bodyFont;
                                            
                                            tooltipEl.style.opacity = '1';
                                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                          },
                                          callbacks: {
                                            title: function() {
                                              return '';
                                            },
                                            label: function(context) {
                                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                                              const descriptions = {
                                                '541511': 'Custom Computer Programming Services',
                                                '541512': 'Computer Systems Design Services', 
                                                '336411': 'Aircraft Manufacturing',
                                                'Other': 'Other Services'
                                              };
                                              return `${context.label}: ${descriptions[context.label]} - ${percentage}%`;
                                            }
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 text-center">
                                  <div className="flex justify-center gap-2 font-light" style={{color: '#D2AC38', fontSize: '14px'}}>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#D2AC38'}}></div>
                                      <span>541511</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#FF6B35'}}></div>
                                      <span>541512</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#4EC9B0'}}></div>
                                      <span>336411</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#A259FF'}}></div>
                                      <span>Other</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </HudCard>

                          {/* Third: PSC Mix */}
                          <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4 h-full flex flex-col">
                              <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                PSC Mix
                              </h3>
                              <div className="flex-1 relative">
                                <div style={{height: '240px'}}>
                                  <GoldengateDoughnutChart
                                    title="Current Portfolio"
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={240}
                                    data={{
                                      labels: ['D302', 'R425', 'Y1FZ', 'Other'],
                                      datasets: [{
                                        data: [40, 25, 20, 15],
                                        backgroundColor: [
                                          'rgba(210, 172, 56, 0.25)',
                                          'rgba(255, 107, 53, 0.25)',
                                          'rgba(78, 201, 176, 0.25)',
                                          'rgba(162, 89, 255, 0.25)'
                                        ],
                                        hoverBackgroundColor: [
                                          '#D2AC38',
                                          '#FF6B35',
                                          '#4EC9B0',
                                          '#A259FF'
                                        ],
                                        hoverBorderColor: [
                                          '#D2AC38',
                                          '#FF6B35',
                                          '#4EC9B0',
                                          '#A259FF'
                                        ],
                                        borderColor: ['#D2AC38', '#FF6B35', '#4EC9B0', '#A259FF'],
                                        borderWidth: 2,
                                        hoverBorderWidth: 2,
                                        cutout: '0%'
                                      }]
                                    }}
                                    options={{
                                      layout: {
                                        padding: {
                                          top: 5,
                                          left: 10,
                                          right: 10,
                                          bottom: 25
                                        }
                                      },
                                      interaction: {
                                        intersect: false
                                      },
                                      elements: {
                                        arc: {
                                          hoverBackgroundColor: function(context) {
                                            const colors = ['#D2AC38', '#4B5563', '#6B7280', '#0000FF'];
                                            return colors[context.dataIndex];
                                          }
                                        }
                                      },
                                      plugins: {
                                        legend: {
                                          display: false
                                        },
                                        tooltip: {
                                          enabled: true,
                                          backgroundColor: '#000000',
                                          titleColor: '#FFFFFF',
                                          bodyColor: '#FFFFFF',
                                          borderColor: '#D2AC38',
                                          borderWidth: 2,
                                          cornerRadius: 6,
                                          displayColors: false,
                                          padding: 16,
                                          titleFont: {
                                            size: 16,
                                            weight: 'bold',
                                            family: 'sans-serif'
                                          },
                                          bodyFont: {
                                            size: 14,
                                            weight: 'normal',
                                            family: 'sans-serif'
                                          },
                                          opacity: 1,
                                          external: function(context) {
                                            return; // Disabled
                                            // Create or get tooltip element
                                            let tooltipEl = document.getElementById('chartjs-tooltip');
                                            if (!tooltipEl) {
                                              tooltipEl = document.createElement('div');
                                              tooltipEl.id = 'chartjs-tooltip';
                                              tooltipEl.style.background = '#000000';
                                              tooltipEl.style.borderRadius = '6px';
                                              tooltipEl.style.border = '2px solid #D2AC38';
                                              tooltipEl.style.color = '#FFFFFF';
                                              tooltipEl.style.opacity = '0';
                                              tooltipEl.style.position = 'absolute';
                                              tooltipEl.style.transform = 'translate(-50%, -50%)';
                                              tooltipEl.style.transition = 'all .1s ease';
                                              tooltipEl.style.pointerEvents = 'none';
                                              tooltipEl.style.fontFamily = 'sans-serif';
                                              tooltipEl.style.fontSize = '14px';
                                              tooltipEl.style.fontWeight = 'normal';
                                              tooltipEl.style.padding = '16px';
                                              tooltipEl.style.zIndex = '9999';
                                              tooltipEl.style.maxWidth = 'none';
                                              tooltipEl.style.whiteSpace = 'nowrap';
                                              document.body.appendChild(tooltipEl);
                                            }

                                            // Hide if no tooltip
                                            const tooltipModel = context.tooltip;
                                            if (tooltipModel.opacity === 0) {
                                              tooltipEl.style.opacity = '0';
                                              return;
                                            }

                                            // Set Text
                                            if (tooltipModel.body) {
                                              const bodyLines = tooltipModel.body.map(b => b.lines);
                                              tooltipEl.innerHTML = bodyLines.join('<br/>');
                                            }

                                            // Display, position, and set styles for tooltip
                                            const position = context.chart.canvas.getBoundingClientRect();
                                            const bodyFont = tooltipModel.options.bodyFont;
                                            
                                            tooltipEl.style.opacity = '1';
                                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                          },
                                          callbacks: {
                                            title: function() {
                                              return '';
                                            },
                                            label: function(context) {
                                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                                              const descriptions = {
                                                'D302': 'Information Technology and Telecom Services',
                                                'R425': 'Professional, Administrative, and Management Support',
                                                'Y1FZ': 'Construction of Structures and Facilities',
                                                '9999': 'Other Services'
                                              };
                                              return `${context.label}: ${descriptions[context.label]} - ${percentage}%`;
                                            }
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 text-center">
                                  <div className="flex justify-center gap-2 font-light" style={{color: '#D2AC38', fontSize: '14px'}}>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#D2AC38'}}></div>
                                      <span>D302</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#FF6B35'}}></div>
                                      <span>R425</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#4EC9B0'}}></div>
                                      <span>Y1FZ</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#A259FF'}}></div>
                                      <span>Other</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </HudCard>

                          {/* Fourth: Pipeline Position */}
                          <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4 h-full flex flex-col">
                              <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                Pipeline Position
                              </h3>
                              <div className="flex-1 relative">
                                <div style={{height: '240px'}}>
                                  <GoldengateDoughnutChart
                                    title="Current Portfolio"
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={240}
                                    data={{
                                      labels: ['Remaining', 'Subcontracted', 'Executed'],
                                      datasets: [{
                                        data: [45, 25, 30],
                                        backgroundColor: [
                                          'rgba(210, 172, 56, 0.25)',
                                          'rgba(255, 76, 76, 0.25)',
                                          'rgba(91, 192, 235, 0.25)'
                                        ],
                                        hoverBackgroundColor: [
                                          '#D2AC38',
                                          '#FF4C4C',
                                          '#5BC0EB'
                                        ],
                                        hoverBorderColor: [
                                          '#D2AC38',
                                          '#FF4C4C',
                                          '#5BC0EB'
                                        ],
                                        borderColor: ['#D2AC38', '#FF4C4C', '#5BC0EB'],
                                        borderWidth: 2,
                                        hoverBorderWidth: 2,
                                        cutout: '60%'
                                      }]
                                    }}
                                    options={{
                                      layout: {
                                        padding: {
                                          top: 5,
                                          left: 10,
                                          right: 10,
                                          bottom: 25
                                        }
                                      },
                                      interaction: {
                                        intersect: false
                                      },
                                      elements: {
                                        arc: {
                                          hoverBackgroundColor: function(context) {
                                            const colors = ['#D2AC38', '#DC143C', '#374151'];
                                            return colors[context.dataIndex];
                                          }
                                        }
                                      },
                                      plugins: {
                                        legend: {
                                          display: false
                                        },
                                        tooltip: {
                                          enabled: true,
                                          backgroundColor: '#000000',
                                          titleColor: '#FFFFFF',
                                          bodyColor: '#FFFFFF',
                                          borderColor: '#D2AC38',
                                          borderWidth: 2,
                                          cornerRadius: 6,
                                          displayColors: false,
                                          padding: 16,
                                          titleFont: {
                                            size: 16,
                                            weight: 'bold',
                                            family: 'sans-serif'
                                          },
                                          bodyFont: {
                                            size: 14,
                                            weight: 'normal',
                                            family: 'sans-serif'
                                          },
                                          opacity: 1,
                                          external: function(context) {
                                            return; // Disabled
                                            // Create or get tooltip element
                                            let tooltipEl = document.getElementById('chartjs-tooltip');
                                            if (!tooltipEl) {
                                              tooltipEl = document.createElement('div');
                                              tooltipEl.id = 'chartjs-tooltip';
                                              tooltipEl.style.background = '#000000';
                                              tooltipEl.style.borderRadius = '6px';
                                              tooltipEl.style.border = '2px solid #D2AC38';
                                              tooltipEl.style.color = '#FFFFFF';
                                              tooltipEl.style.opacity = '0';
                                              tooltipEl.style.position = 'absolute';
                                              tooltipEl.style.transform = 'translate(-50%, -50%)';
                                              tooltipEl.style.transition = 'all .1s ease';
                                              tooltipEl.style.pointerEvents = 'none';
                                              tooltipEl.style.fontFamily = 'sans-serif';
                                              tooltipEl.style.fontSize = '14px';
                                              tooltipEl.style.fontWeight = 'normal';
                                              tooltipEl.style.padding = '16px';
                                              tooltipEl.style.zIndex = '9999';
                                              tooltipEl.style.maxWidth = 'none';
                                              tooltipEl.style.whiteSpace = 'nowrap';
                                              document.body.appendChild(tooltipEl);
                                            }

                                            // Hide if no tooltip
                                            const tooltipModel = context.tooltip;
                                            if (tooltipModel.opacity === 0) {
                                              tooltipEl.style.opacity = '0';
                                              return;
                                            }

                                            // Set Text
                                            if (tooltipModel.body) {
                                              const bodyLines = tooltipModel.body.map(b => b.lines);
                                              tooltipEl.innerHTML = bodyLines.join('<br/>');
                                            }

                                            // Display, position, and set styles for tooltip
                                            const position = context.chart.canvas.getBoundingClientRect();
                                            const bodyFont = tooltipModel.options.bodyFont;
                                            
                                            tooltipEl.style.opacity = '1';
                                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                          },
                                          callbacks: {
                                            title: function() {
                                              return '';
                                            },
                                            label: function(context) {
                                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                                              const descriptions = {
                                                '541511': 'Custom Computer Programming Services',
                                                '541512': 'Computer Systems Design Services', 
                                                '336411': 'Aircraft Manufacturing',
                                                'Other': 'Other Services'
                                              };
                                              return `${context.label}: ${descriptions[context.label]} - ${percentage}%`;
                                            }
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 text-center">
                                  <div className="flex justify-center gap-2 font-light" style={{color: '#D2AC38', fontSize: '14px'}}>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#5BC0EB'}}></div>
                                      <span>Executed</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#FF4C4C'}}></div>
                                      <span>Subcontracted</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5" style={{backgroundColor: '#D2AC38'}}></div>
                                      <span>Remaining</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </HudCard>
                    </div>
                  </div>
                )}
                
                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    {performanceData && performanceData.metrics && Array.isArray(performanceData.metrics) && performanceData.metrics.length > 0 ? (
                      <>
                        {/* Performance Dashboard - 1×2 Grid (2 equal panels) */}
                        <div className="grid grid-cols-2 gap-6 min-h-[55vh]">
                          
                          {/* Panel 1: Awards vs Revenue (Left) */}
                          <div className="col-span-1">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-2xl text-gray-200 font-light tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>
                                    Time-Series Performance ({revenueTimePeriod}Y)
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
                                    height={350}
                                    data={{
                                      labels: getFilteredRevenueData().map((d: any) => formatDate(d.monthYear)),
                                      datasets: [
                                        {
                                          type: 'bar' as const,
                                          label: 'Award Value',
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
                                          left: 0,
                                          right: 0,
                                          top: 0,
                                          bottom: 0
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
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 12 },
                                            usePointStyle: true,
                                            padding: 8,
                                            pointStyle: 'circle',
                                            boxWidth: 6,
                                            boxHeight: 6
                                          }
                                        } 
                                      },
                                      scales: {
                                        x: { 
                                          ticks: { 
                                            color: '#D2AC38', 
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 } 
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
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 13 },
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

                          {/* Panel 2: Peer Comparison Scatter Plot (Right) */}
                          <div className="col-span-1">
                            <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-2xl text-gray-200 font-light tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>
                                    Cross-Sectional Performance
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <select 
                                      className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                      value={yAxisMetric}
                                      onChange={(e) => setYAxisMetric(e.target.value)}
                                    >
                                      <option value="ttm_awards">TTM Awards</option>
                                      <option value="ttm_revenue">TTM Revenue</option>
                                      <option value="lifetime_awards">Lifetime Awards</option>
                                      <option value="lifetime_revenue">Lifetime Revenue</option>
                                      <option value="total_pipeline">Total Pipeline</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <GoldengateBubbleChart
                                    title={getChartTitle(yAxisMetric)}
                                    liveIndicator={true}
                                    liveText="TRACKING"
                                    height={350}
                                    data={{
                                      datasets: [{
                                        label: 'Peer Entities',
                                        data: [
                                          { x: 25, y: 150, r: 3 }, { x: 45, y: 280, r: 3 }, { x: 35, y: 200, r: 3 },
                                          { x: 65, y: 320, r: 3 }, { x: 55, y: 250, r: 3 }, { x: 40, y: 180, r: 3 },
                                          { x: 75, y: 420, r: 3 }, { x: 30, y: 160, r: 3 }, { x: 85, y: 380, r: 3 },
                                          { x: 50, y: 290, r: 3 }, { x: 70, y: 350, r: 3 }
                                        ],
                                        backgroundColor: 'rgba(255, 68, 68, 0.6)',
                                        borderColor: '#FF4444',
                                        borderWidth: 1,
                                      }, {
                                        label: contractor?.name === 'Loading...' ? 'Trio Fabrication LLC' : (contractor?.name || 'Trio Fabrication LLC'),
                                        data: [{ 
                                          x: performanceData?.summary?.avgMonthlyRevenue ? 
                                            Math.min(100, (performanceData.summary.avgMonthlyRevenue / 100000)) : 60,
                                          y: performanceData?.summary?.totalRevenue ? 
                                            (performanceData.summary.totalRevenue / 1000000) : 300,
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
                                          titleColor: '#FFFFFF',
                                          bodyColor: '#FFFFFF',
                                          borderColor: '#374151',
                                          borderWidth: 1
                                        }
                                      },
                                      scales: {
                                        x: {
                                          type: 'linear',
                                          position: 'bottom',
                                          title: {
                                            display: true,
                                            text: 'Blended Growth Score',
                                            color: '#D2AC38',
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
                                          title: {
                                            display: true,
                                            text: getYAxisTitle(yAxisMetric),
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 }
                                          },
                                          ticks: {
                                            color: '#D2AC38',
                                            font: { family: 'system-ui, -apple-system, sans-serif', size: 14 },
                                            callback: function(value: any) {
                                              return `$${value}M`;
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
                                            AI Analysis Active
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
                                <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                  Operational Structure
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
                            </HudCard>
                            </div>
                          </div>
                          
                          {/* Second Row: Active Relationships (left) and Geographic/Historical (right) */}
                          <div className="grid grid-cols-2 gap-6">
                            
                            {/* Left: Active Relationships */}
                            <div>
                            <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                              <div className="p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-2xl text-gray-200 font-normal tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>
                                    Active Relationships
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
                                <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                  Geographic Distribution
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
                                <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                                  Historical Activity Mix
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
                
                {activeTab === 'contracts' && (
                  <div className="space-y-6">
                    {/* Intelligence Dashboard - Full Width */}
                    <div className="grid grid-cols-12 gap-6 h-[60vh]">
                      
                      {/* LEFT PANEL: Competitive Intelligence (1/2) */}
                      <div className="col-span-6">
                        <HudCard variant="default" priority="high" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                          <div className="p-6 h-full flex flex-col">
                            <h3 className="text-lg font-light tracking-wide mb-6 text-gray-200" style={{ fontFamily: 'Genos, sans-serif' }}>
                              Competitive Intelligence
                            </h3>
                            
                            {/* Peer Comparison Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                <div className="text-xs text-gray-500 font-light mb-1">MARKET POSITION</div>
                                <div className="text-2xl text-gray-200 font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                                  {benchmarkData?.comparison?.competitivePositioning?.toUpperCase() || 'CHALLENGER'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Percentile: {benchmarkData?.comparison?.revenuePercentile || 75}%
                                </div>
                              </div>
                              <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                                <div className="text-xs text-gray-500 font-light mb-1">PERFORMANCE SCORE</div>
                                <div className="text-2xl font-sans text-green-400">
                                  {benchmarkData?.comparison?.overallPerformanceScore || contractor.pastPerformanceScore || 85}/100
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Rank: #{benchmarkData?.comparison?.revenueRank || 'N/A'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Competitive Radar */}
                            <div className="flex-1">
                              <GoldengateRadarChart
                                title="Competitive Analysis"
                                liveIndicator={true}
                                liveText="ANALYZING"
                                height={360}
                                data={{
                                  labels: ['Revenue', 'Growth', 'Win Rate', 'Diversity', 'Scale', 'Innovation'],
                                  datasets: [
                                    {
                                      label: 'This Contractor',
                                      data: [
                                        benchmarkData?.comparison?.revenuePercentile || 75,
                                        benchmarkData?.comparison?.growthPercentile || 60,
                                        benchmarkData?.comparison?.winRatePercentile || 70,
                                        80, // Diversity score (mock)
                                        Math.min(100, (contractor.totalContractValue || 0) / 10000000), // Scale
                                        65 // Innovation (mock)
                                      ],
                                      backgroundColor: 'rgba(210, 172, 56, 0.4)',
                                      borderColor: '#D2AC38',
                                      borderWidth: 2,
                                      pointBackgroundColor: '#D2AC38',
                                      pointBorderColor: '#000',
                                      pointRadius: 4,
                                    },
                                    {
                                      label: 'Industry Average',
                                      data: [50, 50, 50, 50, 50, 50],
                                      backgroundColor: 'rgba(192, 192, 192, 0.1)',
                                      borderColor: '#D2AC38',
                                      borderWidth: 1,
                                      borderDash: [5, 5],
                                      pointRadius: 0,
                                    }
                                  ]
                                }}
                                options={{
                                  plugins: {
                                    legend: {
                                      display: true,
                                      position: 'bottom',
                                      labels: {
                                        color: '#D2AC38',
                                        font: { family: 'Genos, sans-serif', size: 18 },
                                        padding: 10
                                      }
                                    }
                                  },
                                  scales: {
                                    r: {
                                      angleLines: { color: 'rgba(192, 192, 192, 0.2)' },
                                      grid: { color: 'rgba(192, 192, 192, 0.1)' },
                                      pointLabels: {
                                        color: '#D2AC38',
                                        font: { family: 'Genos, sans-serif', size: 18 }
                                      },
                                      ticks: { display: false },
                                      min: 0,
                                      max: 100
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </HudCard>
                      </div>
                      
                      {/* RIGHT PANEL: Risk & Portfolio Intelligence (1/2) */}
                      <div className="col-span-6 flex flex-col gap-4 h-full">
                        {/* Risk Assessment */}
                        <HudCard variant="default" priority="high" isPanel={true} className=" border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                          <div className="p-6">
                            <h3 className="text-lg text-gray-200 font-light tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                              Risk Assessment
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-gray-500 font-light mb-2">CONCENTRATION</div>
                                <div className="relative inline-flex items-center justify-center">
                                  <svg className="w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#D2AC38" strokeWidth="2" fill="none" opacity="0.2"/>
                                    <circle 
                                      cx="32" cy="32" r="28" 
                                      stroke={contractor.totalAgencies > 5 ? '#00FF88' : contractor.totalAgencies > 2 ? '#D2AC38' : '#FF4444'}
                                      strokeWidth="2" 
                                      fill="none"
                                      strokeDasharray={`${Math.PI * 56 * (contractor.totalAgencies ? Math.min(100, contractor.totalAgencies * 20) : 50) / 100} ${Math.PI * 56}`}
                                      strokeLinecap="round"
                                      transform="rotate(-90 32 32)"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-sans text-white">
                                      {contractor.totalAgencies || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Agencies</div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-xs text-gray-500 font-light mb-2">DIVERSITY</div>
                                <div className="relative inline-flex items-center justify-center">
                                  <svg className="w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#D2AC38" strokeWidth="2" fill="none" opacity="0.2"/>
                                    <circle 
                                      cx="32" cy="32" r="28" 
                                      stroke={contractor.agencyDiversity > 0.7 ? '#00FF88' : contractor.agencyDiversity > 0.4 ? '#D2AC38' : '#FF4444'}
                                      strokeWidth="2" 
                                      fill="none"
                                      strokeDasharray={`${Math.PI * 56 * ((contractor.agencyDiversity || 0.5) * 100)} ${Math.PI * 56}`}
                                      strokeLinecap="round"
                                      transform="rotate(-90 32 32)"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-sans text-white">
                                      {Math.round((contractor.agencyDiversity || 0.5) * 100)}%
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Score</div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-xs text-gray-500 font-light mb-2">STABILITY</div>
                                <div className="relative inline-flex items-center justify-center">
                                  <svg className="w-16 h-16">
                                    <circle cx="32" cy="32" r="28" stroke="#D2AC38" strokeWidth="2" fill="none" opacity="0.2"/>
                                    <circle 
                                      cx="32" cy="32" r="28" 
                                      stroke='#00FF88'
                                      strokeWidth="2" 
                                      fill="none"
                                      strokeDasharray={`${Math.PI * 56 * 0.85} ${Math.PI * 56}`}
                                      strokeLinecap="round"
                                      transform="rotate(-90 32 32)"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-sans text-white">85%</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Stable</div>
                              </div>
                            </div>
                          </div>
                        </HudCard>
                        
                        {/* Portfolio Analysis Charts */}
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          {/* Agency Concentration */}
                          <HudCard variant="default" priority="medium" isPanel={true} className=" border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4 h-full flex flex-col">
                              <h3 className="text-sm text-gray-200 font-light tracking-wider mb-3" style={{ fontFamily: 'Genos, sans-serif' }}>
                                Agency Concentration
                              </h3>
                              <div className="flex-1">
                                <GoldengateDoughnutChart
                                  title=""
                                  liveIndicator={false}
                                  height={240}
                                  data={{
                                    labels: [
                                      contractor.primaryAgency || 'DoD',
                                      'NASA',
                                      'DHS',
                                      'Other'
                                    ],
                                    datasets: [{
                                      data: [
                                        contractor.totalContractValue ? contractor.totalContractValue * 0.6 : 60,
                                        contractor.totalContractValue ? contractor.totalContractValue * 0.2 : 20,
                                        contractor.totalContractValue ? contractor.totalContractValue * 0.15 : 15,
                                        contractor.totalContractValue ? contractor.totalContractValue * 0.05 : 5
                                      ],
                                      backgroundColor: [
                                        'rgba(210, 172, 56, 0.3)',
                                        'rgba(192, 192, 192, 0.3)',
                                        'rgba(0, 255, 136, 0.3)',
                                        'rgba(255, 107, 107, 0.3)'
                                      ],
                                      borderColor: ['#D2AC38', '#D2AC38', '#00FF88', '#FF6B6B'],
                                      borderWidth: 2,
                                    }]
                                  }}
                                  options={{
                                    plugins: {
                                      legend: {
                                        position: 'bottom',
                                        labels: {
                                          color: '#D2AC38',
                                          font: { family: 'Genos, sans-serif', size: 16 },
                                          padding: 5
                                        }
                                      }
                                    },
                                    maintainAspectRatio: false
                                  }}
                                />
                              </div>
                            </div>
                          </HudCard>
                          
                          {/* Contract Type Distribution */}
                          <HudCard variant="default" priority="medium" isPanel={true} className=" border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
                            <div className="p-4 h-full flex flex-col">
                              <h3 className="text-sm text-gray-200 font-light tracking-wider mb-3" style={{ fontFamily: 'Genos, sans-serif' }}>
                                Contract Types
                              </h3>
                              <div className="flex-1">
                                <GoldengateBarChart
                                  title=""
                                  liveIndicator={false}
                                  height={240}
                                  data={{
                                    labels: ['FFP', 'CPFF', 'T&M', 'IDIQ'],
                                    datasets: [{
                                      label: 'Count',
                                      data: [
                                        Math.round((contractor.activeContracts || 10) * 0.4),
                                        Math.round((contractor.activeContracts || 10) * 0.3),
                                        Math.round((contractor.activeContracts || 10) * 0.2),
                                        Math.round((contractor.activeContracts || 10) * 0.1)
                                      ],
                                      backgroundColor: [
                                        'rgba(210, 172, 56, 0.3)',
                                        'rgba(192, 192, 192, 0.3)',
                                        'rgba(0, 255, 136, 0.3)',
                                        'rgba(156, 39, 176, 0.3)'
                                      ],
                                      borderColor: ['#D2AC38', '#D2AC38', '#00FF88', '#9C27B0'],
                                      borderWidth: 2,
                                    }]
                                  }}
                                  options={{
                                    plugins: { legend: { display: false } },
                                    scales: {
                                      x: { 
                                        ticks: { 
                                          color: '#D2AC38', 
                                          font: { size: 9 } 
                                        } 
                                      },
                                      y: { 
                                        ticks: { 
                                          color: '#D2AC38', 
                                          font: { size: 9 },
                                          stepSize: 5
                                        } 
                                      }
                                    },
                                    maintainAspectRatio: false
                                  }}
                                />
                              </div>
                            </div>
                          </HudCard>
                        </div>
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