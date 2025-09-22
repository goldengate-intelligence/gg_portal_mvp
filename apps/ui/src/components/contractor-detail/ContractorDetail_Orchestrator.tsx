import React, { useState, useEffect } from 'react';
import { ContractorDetailHeader } from './ContractorDetail_Header';
import { HeadlineMetrics } from './Headline_Metrics';
import { OverviewTab } from './tabs/overview';
import { PerformanceTab } from './tabs/performance';
import { NetworkTab } from './tabs/relationships';
import { ActivityTab } from './tabs/activity';
import { ContactsTab } from './tabs/contacts';
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../logic/utils';
import { getLocationCoordinates, coordinatesToMapPercentage, parsePlaceOfPerformance } from './services/geocoding';
import { Globe, BarChart3, Share2, Activity, Users } from 'lucide-react';
import type { Contractor } from '../../types';

interface ContractorDetailProps {
  contractorId: string;
  onActiveTabChange?: (tab: string) => void;
}

export function ContractorDetail({ contractorId, onActiveTabChange }: ContractorDetailProps) {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Notify parent of active tab changes
  useEffect(() => {
    onActiveTabChange?.(activeTab);
  }, [activeTab, onActiveTabChange]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
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

  // Helper function to get filtered revenue data based on time aggregation and period
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

    // Sort filtered data chronologically before aggregation
    filtered.sort((a: any, b: any) => {
      return new Date(a.monthYear + '-01').getTime() - new Date(b.monthYear + '-01').getTime();
    });

    // Aggregate by time aggregation (M/Q/Y)
    if (revenueTimeAggregation === 'M') {
      return filtered; // Already monthly and sorted
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
      return Object.values(quarters).sort((a: any, b: any) => {
        const [yearA, quarterA] = a.monthYear.split('-Q');
        const [yearB, quarterB] = b.monthYear.split('-Q');
        return (parseInt(yearA) * 4 + parseInt(quarterA)) - (parseInt(yearB) * 4 + parseInt(quarterB));
      });
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
      return Object.values(years).sort((a: any, b: any) => {
        return parseInt(a.monthYear) - parseInt(b.monthYear);
      });
    }

    return filtered;
  };

  // Reset to overview tab when contractor changes
  useEffect(() => {
    setActiveTab('overview');
  }, [contractorId]);

  // Mock data loading - replace with actual API calls
  useEffect(() => {
    // Simulate API call for contractor data
    const mockContractor: Contractor = {
      id: contractorId,
      name: 'Trio Fabrication LLC',
      uei: 'TFL123456789',
      industry: 'manufacturing',
      primaryAgency: 'Defense',
      state: 'DC',
      city: 'Washington',
      establishedDate: '2010-01-01',
      primaryNaicsDescription: 'Fabricated Plate Work Manufacturing',
      website: 'www.triofabrication.com',
      totalContractValue: 50000000
    };

    // Mock performance data
    const mockPerformanceData = {
      summary: {
        totalRevenue: 50000000,
        totalAwards: 92,
        activeContracts: 15,
        pipelineValue: 75000000
      },
      scores: {
        composite: 80,
        awards: 82,
        revenue: 85,
        pipeline: 75,
        duration: 78,
        growth: 79
      },
      metrics: [
        { monthYear: '2023-10', monthlyRevenue: '4100000' },
        { monthYear: '2023-11', monthlyRevenue: '4400000' },
        { monthYear: '2023-12', monthlyRevenue: '4300000' },
        { monthYear: '2024-01', monthlyRevenue: '4200000' },
        { monthYear: '2024-02', monthlyRevenue: '3800000' },
        { monthYear: '2024-03', monthlyRevenue: '5100000' },
        { monthYear: '2024-04', monthlyRevenue: '4600000' },
        { monthYear: '2024-05', monthlyRevenue: '4900000' },
        { monthYear: '2024-06', monthlyRevenue: '5300000' },
        { monthYear: '2024-07', monthlyRevenue: '4700000' },
        { monthYear: '2024-08', monthlyRevenue: '5200000' },
        { monthYear: '2024-09', monthlyRevenue: '4800000' },
        { monthYear: '2024-10', monthlyRevenue: '5100000' },
        { monthYear: '2024-11', monthlyRevenue: '5400000' }
      ]
    };

    // Mock network data
    const mockNetworkData = {
      relationships: {
        asSubcontractor: {
          totalValue: 380000000,
          partners: [
            { primeUei: 'MEGA001', primeName: 'MegaCorp Industries', sharedRevenue: 200000000, sharedContracts: 45, strengthScore: 85 },
            { primeUei: 'GLOBAL001', primeName: 'Global Defense Systems', sharedRevenue: 180000000, sharedContracts: 46, strengthScore: 78 }
          ]
        },
        asPrime: {
          totalValue: 29000000,
          partners: [
            { subUei: 'TEX001', subName: 'Texas Materials Inc', sharedRevenue: 15000000, sharedContracts: 12, strengthScore: 72 },
            { subUei: 'OK001', subName: 'Oklahoma Precision', sharedRevenue: 8000000, sharedContracts: 8, strengthScore: 68 },
            { subUei: 'MT001', subName: 'Montana Coatings LLC', sharedRevenue: 6000000, sharedContracts: 5, strengthScore: 65 }
          ]
        }
      }
    };

    setTimeout(() => {
      setContractor(mockContractor);
      setPerformanceData(mockPerformanceData);
      setNetworkData(mockNetworkData);
      setIsLoading(false);
    }, 1000);
  }, [contractorId]);

  const tabs = ['overview', 'performance', 'network', 'activity', 'contacts'];

  if (isLoading) {
    return (
      <div className={`min-h-screen text-white pb-20 pt-20 relative ${CONTRACTOR_DETAIL_COLORS.backgroundColor}`}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>
        <div className="flex items-center justify-center h-screen relative z-10">
          <div className="text-gray-400">Loading contractor details...</div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            contractor={contractor}
            revenueTimeAggregation={revenueTimeAggregation}
            revenueTimePeriod={revenueTimePeriod}
            onRevenueTimeAggregationChange={setRevenueTimeAggregation}
            onRevenueTimePeriodChange={setRevenueTimePeriod}
            getFilteredRevenueData={getFilteredRevenueData}
          />
        );
      case 'performance':
        return (
          <PerformanceTab
            performanceData={performanceData}
            benchmarkData={benchmarkData}
            yAxisMetric={yAxisMetric}
            xAxisMetric={xAxisMetric}
            onYAxisMetricChange={setYAxisMetric}
            onXAxisMetricChange={setXAxisMetric}
          />
        );
      case 'network':
        return (
          <NetworkTab
            contractor={contractor}
            networkData={networkData}
            getMapPosition={getMapPosition}
            parsePlaceOfPerformance={parsePlaceOfPerformance}
          />
        );
      case 'activity':
        return (
          <div className="space-y-6">
            <ActivityTab
              contractor={contractor}
              performanceData={performanceData}
            />
          </div>
        );
      case 'contacts':
        return (
          <div className="space-y-6">
            <ContactsTab
              companyName={contractor?.name || 'Trio Fabrication LLC'}
              companyDomain="triofab.com"
            />
          </div>
        );
      default:
        return (
          <OverviewTab
            contractor={contractor}
            revenueTimeAggregation={revenueTimeAggregation}
            revenueTimePeriod={revenueTimePeriod}
            onRevenueTimeAggregationChange={setRevenueTimeAggregation}
            onRevenueTimePeriodChange={setRevenueTimePeriod}
            getFilteredRevenueData={getFilteredRevenueData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - Hybrid Luxury/HUD Design */}
      <div className={`relative overflow-x-hidden ${CONTRACTOR_DETAIL_COLORS.backgroundColor}`}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>
        {/* Subtle scan line effect */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />

        <div className="container mx-auto px-6 py-8 max-w-7xl relative z-10">
          <ContractorDetailHeader contractor={contractor} />

          {/* Metrics Cards - Positioned with proper spacing after header section */}
          <div className="mt-6">
            <HeadlineMetrics />
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className={`relative min-h-screen ${CONTRACTOR_DETAIL_COLORS.backgroundColor}`}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>
        <div className="py-6 pb-16 min-h-full">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            {/* Tab Navigation - Minimal Style */}
            <div className="mb-8">
              <div className="flex items-center gap-1 border-b border-gray-800/50">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 px-6 py-3 text-sm font-normal tracking-tight transition-all duration-300 border-b-2 border-transparent text-center capitalize",
                      activeTab === tab
                        ? "text-[#D2AC38] border-[#D2AC38]"
                        : "text-gray-500 hover:text-gray-300 hover:border-gray-600"
                    )}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  >
                    {tab === 'overview' && <Globe className="inline w-4 h-4 mr-2" />}
                    {tab === 'performance' && <BarChart3 className="inline w-4 h-4 mr-2" />}
                    {tab === 'network' && <Share2 className="inline w-4 h-4 mr-2" />}
                    {tab === 'activity' && <Activity className="inline w-4 h-4 mr-2" />}
                    {tab === 'contacts' && <Users className="inline w-4 h-4 mr-2" />}
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {renderTabContent()}

            {/* Copyright Footer */}
            <div className="mt-16 mb-12 text-center">
              <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
                © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}