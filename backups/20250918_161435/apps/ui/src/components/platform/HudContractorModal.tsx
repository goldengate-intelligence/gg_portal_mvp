import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Plus, 
  ExternalLink, 
  ChartBar, 
  Users, 
  Snowflake,
  Shield,
  Activity,
  Target,
  Database,
  Crosshair,
  Terminal,
  Lock,
  Unlock,
  Zap,
  Globe
} from 'lucide-react';
import { HudCard, HudCardHeader, HudCardContent, TacticalDisplay, TargetReticle } from '../ui/hud-card';
import { Badge, IndustryBadge, PerformanceBadge, StatusBadge } from '../ui/badge';
import { MetricCard } from '../ui/card';
import { Modal, ModalContent } from '../ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { LoadingState } from '../ui/skeleton';
import { GoldengateLineChart, GoldengateBarChart, GoldengateAreaChart, GoldengateBubbleChart, GoldengateRadarChart, GoldengateDoughnutChart } from '../../lib/charts';
import { CompetitiveBenchmarkPanel } from './CompetitiveBenchmarkPanel';
import { apiClient } from '../../lib/api-client';
import { cn } from '../../lib/utils';
import type { Contractor } from '../../types';

interface HudContractorModalProps {
  contractor: Contractor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (contractor: Contractor) => void;
}

export function HudContractorModal({ 
  contractor, 
  isOpen, 
  onClose, 
  onAddToPortfolio 
}: HudContractorModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contractor && isOpen) {
      fetchEnhancedData();
    }
  }, [contractor, isOpen]);

  const fetchEnhancedData = async () => {
    if (!contractor || !contractor.id) {
      console.warn('No contractor or contractor ID available');
      return;
    }
    
    setIsLoading(true);
    console.log('Fetching enhanced data for contractor:', contractor.id, contractor.name);
    
    try {
      // Try to fetch each data type individually, don't let one failure stop the others
      const promises = await Promise.allSettled([
        apiClient.getContractorPerformanceMetrics(contractor.id, 36).catch(err => {
          console.warn('Failed to fetch performance metrics for contractor', contractor.id, ':', err.message);
          return null;
        }),
        apiClient.getContractorPeerComparison(contractor.id).catch(err => {
          console.warn('Failed to fetch peer comparison for contractor', contractor.id, ':', err.message);
          return null;
        }),
        apiClient.getContractorNetwork(contractor.id, 10).catch(err => {
          console.warn('Failed to fetch network data for contractor', contractor.id, ':', err.message);
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
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const baseRevenue = (contractor.totalContractValue || 50000000) / 12;
          const variance = 0.3;
          const revenue = baseRevenue * (1 + (Math.random() - 0.5) * variance);
          const contracts = Math.max(1, Math.floor((contractor.activeContracts || 10) + (Math.random() - 0.5) * 5));
          
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
          contractor: { id: contractor.id, name: contractor.name },
          metrics: mockMetrics,
          summary: {
            totalRevenue: mockMetrics.reduce((sum, m) => sum + parseFloat(m.monthlyRevenue), 0),
            avgMonthlyRevenue: mockMetrics.reduce((sum, m) => sum + parseFloat(m.monthlyRevenue), 0) / mockMetrics.length,
            totalContracts: contractor.activeContracts || 50,
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
          { primeUei: 'MOCK101', primeName: 'MegaCorp Industries', strengthScore: 90, sharedRevenue: 25000000, sharedContracts: 15, frequency: 'high', exclusivityScore: 0.8, isActive: true },
          { primeUei: 'MOCK102', primeName: 'Global Defense Systems', strengthScore: 78, sharedRevenue: 18000000, sharedContracts: 10, frequency: 'medium', exclusivityScore: 0.6, isActive: true }
        ];
        
        setNetworkData({
          contractor: { id: contractor.id, name: contractor.name },
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!contractor) return null;

  const formatCurrency = (value: number) => {
    if (value >= 1e15) return `$${(value / 1e15).toFixed(1)}Q`;
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Use React Portal to render modal at document body level
  if (!isOpen) return null;
  
  // Remove the test return and use the actual modal
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="2xl" className="bg-black/95 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,217,255,0.3)]">
        <div className="relative">
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 tactical-grid" />
          </div>

          {/* Header - Military Command Style */}
          <div className="relative border-b border-cyan-500/30 bg-black/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-yellow-500/5" />
            
            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Target Reticle */}
                  <div className="relative">
                    <TargetReticle size={60} color="#FFD700" animated={true} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Target className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  
                  {/* Target Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-cyan-400 font-mono uppercase tracking-wider">
                        TARGET PROFILE
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-green-400 font-mono uppercase">ACTIVE</span>
                    </div>
                    <h2 className="text-2xl font-orbitron font-bold text-yellow-400 uppercase tracking-wide mb-2">
                      {contractor.name}
                    </h2>
                    {contractor.dbaName && (
                      <p className="text-sm text-cyan-400/70 font-mono">ALIAS: {contractor.dbaName}</p>
                    )}
                    
                    {/* Tactical badges */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded">
                        <span className="text-xs text-cyan-400 font-mono">UEI: {contractor.uei}</span>
                      </div>
                      <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded">
                        <span className="text-xs text-yellow-400 font-mono uppercase">
                          {contractor.industry.replace('-', ' ')}
                        </span>
                      </div>
                      {contractor.lifecycleStage && (
                        <div className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded">
                          <span className="text-xs text-green-400 font-mono uppercase">
                            {contractor.lifecycleStage}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-start gap-2">
                  {onAddToPortfolio && (
                    <button
                      onClick={() => onAddToPortfolio(contractor)}
                      className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 hover:bg-yellow-500/20 transition-all"
                      title="Add to Portfolio"
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`/platform/contractor-detail/${contractor.id}`, '_blank')}
                    className="p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 hover:bg-green-500/20 transition-all"
                    title="Full Intel Report"
                  >
                    <Database className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(`/platform/uei-profile/${contractor.uei}`, '_blank')}
                    className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/20 transition-all"
                    title="Legacy Profile"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 hover:bg-red-500/20 transition-all"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <TacticalDisplay
                  label="CONTRACT VALUE"
                  value={contractor.totalContractValue ? formatCurrency(contractor.totalContractValue) : 'CLASSIFIED'}
                  trend={contractor.totalContractValue && contractor.totalContractValue > 1e8 ? 'up' : 'stable'}
                />
                <TacticalDisplay
                  label="PERFORMANCE"
                  value={contractor.pastPerformanceScore ? `${contractor.pastPerformanceScore}%` : 'N/A'}
                  trend={contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 90 ? 'up' : 'stable'}
                />
                <TacticalDisplay
                  label="ACTIVE OPS"
                  value={contractor.activeContracts?.toLocaleString() || 'N/A'}
                />
                <TacticalDisplay
                  label="AGENCIES"
                  value={contractor.totalAgencies || 'N/A'}
                />
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="relative p-6 overflow-y-auto max-h-[60vh]">
            {/* Tab Navigation - Military Style */}
            <div className="mb-6">
              <div className="flex items-center gap-2 p-1 bg-black/50 border border-cyan-500/20 rounded-lg">
                {['overview', 'performance', 'network', 'intelligence'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all rounded",
                      activeTab === tab
                        ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                        : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                    )}
                  >
                    {tab === 'overview' && <Database className="inline w-3 h-3 mr-2" />}
                    {tab === 'performance' && <Activity className="inline w-3 h-3 mr-2" />}
                    {tab === 'network' && <Users className="inline w-3 h-3 mr-2" />}
                    {tab === 'intelligence' && <Shield className="inline w-3 h-3 mr-2" />}
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Performance Snapshot */}
                  <HudCard variant="default" priority="medium">
                    <div className="p-4">
                      <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                        CONTRACT PORTFOLIO SNAPSHOT
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <GoldengateDoughnutChart
                            title="Portfolio Mix"
                            liveIndicator={true}
                            liveText="LIVE"
                            height={180}
                            data={{
                              labels: ['Active', 'Pipeline', 'Historical'],
                              datasets: [{
                                data: [
                                  contractor.activeContracts || 15,
                                  Math.max(0, (contractor.activeContracts || 15) * 0.6),
                                  Math.max(0, (contractor.activeContracts || 15) * 2.8)
                                ],
                                backgroundColor: [
                                  'rgba(0, 255, 136, 0.3)',
                                  'rgba(0, 217, 255, 0.3)',
                                  'rgba(255, 215, 0, 0.3)'
                                ],
                                borderColor: ['#00FF88', '#00D9FF', '#FFD700'],
                                borderWidth: 2,
                              }]
                            }}
                            options={{
                              plugins: {
                                legend: {
                                  position: 'right',
                                  labels: {
                                    color: '#00D9FF',
                                    font: { family: 'monospace', size: 9 }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="ml-6 space-y-3">
                          <TacticalDisplay
                            label="TOTAL VALUE"
                            value={formatCurrency(contractor.totalContractValue || 50000000)}
                            size="sm"
                          />
                          <TacticalDisplay
                            label="PERFORMANCE"
                            value={`${contractor.pastPerformanceScore || 85}%`}
                            trend="up"
                            size="sm"
                          />
                          <TacticalDisplay
                            label="AGENCIES"
                            value={contractor.totalAgencies?.toString() || '1'}
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-cyan-500/10">
                        <div className="text-center">
                          <button
                            onClick={() => window.open(`/platform/contractor-detail/${contractor.id}`, '_blank')}
                            className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 hover:bg-green-500/20 transition-all text-xs font-mono uppercase tracking-wider"
                          >
                            <Database className="inline w-3 h-3 mr-2" />
                            View Full Intelligence Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </HudCard>

                  {/* Operational Parameters - Condensed */}
                  <HudCard variant="default" priority="medium">
                    <div className="p-4">
                      <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                        OPERATIONAL PARAMETERS
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">Location</span>
                            <span className="text-sm text-cyan-400 font-mono">
                              {contractor.city}, {contractor.state}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">Size Tier</span>
                            <span className="text-sm text-cyan-400 font-mono">
                              {contractor.sizeTier || 'UNKNOWN'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">Total UEIs</span>
                            <span className="text-sm text-cyan-400 font-mono">
                              {contractor.totalUeis || '1'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">Ownership</span>
                            <span className="text-sm text-cyan-400 font-mono">
                              {contractor.ownershipType || 'STANDARD'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">States</span>
                            <span className="text-sm text-cyan-400 font-mono">
                              {contractor.totalStates || '1'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 font-mono uppercase">Completeness</span>
                            <span className="text-sm text-yellow-400 font-mono">
                              {contractor.profileCompleteness || 85}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </HudCard>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {isLoading ? (
                    <LoadingState />
                  ) : performanceData && performanceData.metrics && Array.isArray(performanceData.metrics) && performanceData.metrics.length > 0 ? (
                    <>
                      <HudCard variant="default" priority="medium">
                        <div className="p-4">
                          <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                            PERFORMANCE TRAJECTORY
                          </h3>
                          <GoldengateLineChart
                            title="Revenue & Contract Trends"
                            liveIndicator={true}
                            liveText="TRACKING"
                            height={300}
                            data={{
                              labels: performanceData.metrics.map((d: any) => 
                                new Date(d.monthYear).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: '2-digit' 
                                })
                              ),
                              datasets: [
                                {
                                  label: 'Monthly Revenue',
                                  data: performanceData.metrics.map((d: any) => parseFloat(d.monthlyRevenue?.toString() || '0')),
                                  borderColor: '#FFD700',
                                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                  tension: 0.4,
                                  fill: true,
                                },
                                {
                                  label: 'Active Contracts',
                                  data: performanceData.metrics.map((d: any) => (d.activeContracts || 0) * 1000000), // Scale for visibility
                                  borderColor: '#00D9FF',
                                  backgroundColor: 'rgba(0, 217, 255, 0.1)',
                                  tension: 0.4,
                                  fill: true,
                                }
                              ]
                            }}
                            options={{
                              plugins: {
                                legend: {
                                  labels: {
                                    color: '#00D9FF',
                                    font: { family: 'monospace', size: 10 }
                                  }
                                }
                              },
                              scales: {
                                x: {
                                  ticks: { color: '#00D9FF', font: { family: 'monospace', size: 10 } },
                                  grid: { color: 'rgba(0, 217, 255, 0.1)' }
                                },
                                y: {
                                  ticks: { 
                                    color: '#00D9FF', 
                                    font: { family: 'monospace', size: 10 },
                                    callback: function(value: any) {
                                      return '$' + (value / 1000000).toFixed(1) + 'M';
                                    }
                                  },
                                  grid: { color: 'rgba(0, 217, 255, 0.1)' }
                                }
                              }
                            }}
                          />
                        </div>
                      </HudCard>
                      
                      <HudCard variant="default" priority="medium">
                        <div className="p-4">
                          <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                            GROWTH ANALYSIS
                          </h3>
                          <GoldengateBarChart
                            title="YoY Growth Rate"
                            liveIndicator={true}
                            liveText="ANALYZING"
                            height={250}
                            data={{
                              labels: performanceData.metrics.slice(-12).map((d: any) => 
                                new Date(d.monthYear).toLocaleDateString('en-US', { 
                                  month: 'short'
                                })
                              ),
                              datasets: [
                                {
                                  label: 'YoY Growth %',
                                  data: performanceData.metrics.slice(-12).map((d: any) => parseFloat(d.revenueGrowthYoy || '0')),
                                  backgroundColor: performanceData.metrics.slice(-12).map((d: any) => 
                                    (parseFloat(d.revenueGrowthYoy || '0')) > 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'
                                  ),
                                  borderColor: performanceData.metrics.slice(-12).map((d: any) => 
                                    (parseFloat(d.revenueGrowthYoy || '0')) > 0 ? '#00FF88' : '#FF4444'
                                  ),
                                  borderWidth: 2,
                                }
                              ]
                            }}
                            options={{
                              plugins: {
                                legend: {
                                  labels: {
                                    color: '#00D9FF',
                                    font: { family: 'monospace', size: 10 }
                                  }
                                }
                              },
                              scales: {
                                x: {
                                  ticks: { color: '#00D9FF', font: { family: 'monospace', size: 10 } },
                                  grid: { color: 'rgba(0, 217, 255, 0.1)' }
                                },
                                y: {
                                  ticks: { 
                                    color: '#00D9FF', 
                                    font: { family: 'monospace', size: 10 },
                                    callback: function(value: any) {
                                      return value + '%';
                                    }
                                  },
                                  grid: { color: 'rgba(0, 217, 255, 0.1)' }
                                }
                              }
                            }}
                          />
                        </div>
                      </HudCard>

                      {/* Performance Metrics */}
                      <HudCard variant="default" priority="medium">
                        <div className="p-4">
                          <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                            OPERATIONAL METRICS
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <TacticalDisplay
                              label="AVG MONTHLY"
                              value={formatCurrency(performanceData.summary?.avgMonthlyRevenue || 0)}
                              trend="up"
                            />
                            <TacticalDisplay
                              label="WIN RATE"
                              value={`${(performanceData.metrics.reduce((sum: number, d: any) => 
                                sum + parseFloat(d.avgWinRate || '0'), 0
                              ) / performanceData.metrics.length).toFixed(1)}%`}
                              trend="stable"
                            />
                            <TacticalDisplay
                              label="ACTIVITY STATUS"
                              value={performanceData.summary?.latestActivityStatus?.toUpperCase() || 'UNKNOWN'}
                              alert={performanceData.summary?.latestActivityStatus === 'dormant'}
                            />
                          </div>
                        </div>
                      </HudCard>
                    </>
                  ) : (
                    <div className="text-center py-8 relative">
                      {/* Tactical grid overlay */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg overflow-hidden">
                        <div className="absolute inset-0 tactical-grid" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto mb-6 border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
                          <Activity className="h-8 w-8 text-cyan-400" />
                        </div>
                        <p className="text-yellow-400 font-orbitron font-bold uppercase tracking-wider mb-2">
                          NO PERFORMANCE DATA
                        </p>
                        <p className="text-xs text-gray-400 font-mono uppercase">
                          INSUFFICIENT HISTORICAL DATA FOR ANALYSIS
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-6">
                  {isLoading ? (
                    <LoadingState />
                  ) : networkData && (networkData.relationships?.asPrime?.partners?.length > 0 || networkData.relationships?.asSubcontractor?.partners?.length > 0) ? (
                    <>
                      <HudCard variant="default" priority="medium">
                        <div className="p-4">
                          <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                            NETWORK ANALYSIS
                          </h3>
                          <GoldengateBubbleChart
                            title="Partnership Network"
                            liveIndicator={true}
                            liveText="MAPPING"
                            height={300}
                            data={{
                              datasets: [{
                                label: 'Prime Relationships',
                                data: (networkData.relationships?.asPrime?.partners || []).map((partner: any, idx: number) => ({
                                  x: partner.strengthScore || (idx * 10 + 10), // Strength score
                                  y: (partner.sharedRevenue || 0) / 1000000, // Shared value in millions
                                  r: Math.max(5, Math.min(20, (partner.strengthScore || 5) * 2)) // Bubble size
                                })),
                                backgroundColor: 'rgba(255, 215, 0, 0.3)',
                                borderColor: '#FFD700',
                                borderWidth: 2,
                              }, {
                                label: 'Subcontractor Relationships',
                                data: (networkData.relationships?.asSubcontractor?.partners || []).map((partner: any, idx: number) => ({
                                  x: partner.strengthScore || (idx * 10 + 10), // Strength score
                                  y: (partner.sharedRevenue || 0) / 1000000, // Shared value in millions
                                  r: Math.max(5, Math.min(20, (partner.strengthScore || 5) * 2)) // Bubble size
                                })),
                                backgroundColor: 'rgba(0, 217, 255, 0.3)',
                                borderColor: '#00D9FF',
                                borderWidth: 2,
                              }]
                            }}
                            options={{
                              plugins: {
                                legend: {
                                  labels: {
                                    color: '#00D9FF',
                                    font: { family: 'monospace', size: 10 }
                                  }
                                },
                                tooltip: {
                                  callbacks: {
                                    title: function(context: any) {
                                      const datasetIndex = context[0].datasetIndex;
                                      const pointIndex = context[0].dataIndex;
                                      if (datasetIndex === 0) {
                                        return networkData.relationships?.asPrime?.partners[pointIndex]?.subName || 'Unknown';
                                      } else {
                                        return networkData.relationships?.asSubcontractor?.partners[pointIndex]?.primeName || 'Unknown';
                                      }
                                    },
                                    label: function(context: any) {
                                      const datasetIndex = context.datasetIndex;
                                      const pointIndex = context.dataIndex;
                                      const partner = datasetIndex === 0 
                                        ? networkData.relationships?.asPrime?.partners[pointIndex]
                                        : networkData.relationships?.asSubcontractor?.partners[pointIndex];
                                      return [
                                        `Relationship: ${datasetIndex === 0 ? 'Prime to Sub' : 'Sub to Prime'}`,
                                        `Strength: ${partner?.strengthScore || 0}/100`,
                                        `Shared Value: ${formatCurrency(partner?.sharedRevenue || 0)}`
                                      ];
                                    }
                                  }
                                }
                              },
                              scales: {
                                x: {
                                  title: {
                                    display: true,
                                    text: 'Network Strength',
                                    color: '#00D9FF',
                                    font: { family: 'monospace', size: 10 }
                                  },
                                  ticks: { color: '#00D9FF', font: { family: 'monospace', size: 10 } },
                                  grid: { color: 'rgba(0, 217, 255, 0.1)' }
                                },
                                y: {
                                  title: {
                                    display: true,
                                    text: 'Shared Value ($M)',
                                    color: '#00D9FF',
                                    font: { family: 'monospace', size: 10 }
                                  },
                                  ticks: { color: '#00D9FF', font: { family: 'monospace', size: 10 } },
                                  grid: { color: 'rgba(0, 217, 255, 0.1)' }
                                }
                              }
                            }}
                          />
                        </div>
                      </HudCard>
                      
                      <HudCard variant="default" priority="medium">
                        <div className="p-4">
                          <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                            CONNECTION ROSTER
                          </h3>
                          <div className="space-y-2">
                            {/* Prime relationships */}
                            {(networkData.relationships?.asPrime?.partners || []).map((partner: any, idx: number) => (
                              <div key={`prime-${idx}`} className="p-3 bg-black/50 border border-yellow-500/10 rounded relative group hover:border-yellow-500/30 transition-all">
                                {/* HUD-style corner accents */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-yellow-400/40 group-hover:border-yellow-400/60" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-yellow-400/40 group-hover:border-yellow-400/60" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-yellow-400/40 group-hover:border-yellow-400/60" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-yellow-400/40 group-hover:border-yellow-400/60" />
                                
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-yellow-400 font-mono font-bold">{partner.subName} <span className="text-xs text-gray-400">(SUB)</span></p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span className="text-xs text-gray-400 font-mono uppercase">
                                        STRENGTH: <span className={cn(
                                          "font-bold",
                                          partner.strengthScore >= 80 ? "text-green-400" :
                                          partner.strengthScore >= 50 ? "text-yellow-400" : "text-red-400"
                                        )}>{partner.strengthScore}/100</span>
                                      </span>
                                      <span className="text-xs text-gray-400 font-mono uppercase">
                                        FREQ: <span className="text-cyan-400">{partner.frequency || 'Unknown'}</span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-yellow-400" />
                                    <span className="text-sm text-yellow-400 font-mono font-bold">
                                      {formatCurrency(partner.sharedRevenue || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Subcontractor relationships */}
                            {(networkData.relationships?.asSubcontractor?.partners || []).map((partner: any, idx: number) => (
                              <div key={`sub-${idx}`} className="p-3 bg-black/50 border border-cyan-500/10 rounded relative group hover:border-cyan-500/30 transition-all">
                                {/* HUD-style corner accents */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/40 group-hover:border-cyan-400/60" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/40 group-hover:border-cyan-400/60" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/40 group-hover:border-cyan-400/60" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/40 group-hover:border-cyan-400/60" />
                                
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-cyan-400 font-mono font-bold">{partner.primeName} <span className="text-xs text-gray-400">(PRIME)</span></p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span className="text-xs text-gray-400 font-mono uppercase">
                                        STRENGTH: <span className={cn(
                                          "font-bold",
                                          partner.strengthScore >= 80 ? "text-green-400" :
                                          partner.strengthScore >= 50 ? "text-yellow-400" : "text-red-400"
                                        )}>{partner.strengthScore}/100</span>
                                      </span>
                                      <span className="text-xs text-gray-400 font-mono uppercase">
                                        FREQ: <span className="text-cyan-400">{partner.frequency || 'Unknown'}</span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-cyan-400" />
                                    <span className="text-sm text-cyan-400 font-mono font-bold">
                                      {formatCurrency(partner.sharedRevenue || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </HudCard>
                      
                      {/* Network Summary */}
                      <HudCard variant="default" priority="medium">
                        <div className="p-4">
                          <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                            NETWORK INTELLIGENCE
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <TacticalDisplay
                              label="CONNECTIONS"
                              value={networkData.networkSummary?.totalPartners?.toString() || '0'}
                              unit="entities"
                            />
                            <TacticalDisplay
                              label="AVG STRENGTH"
                              value={`${networkData.networkSummary?.avgStrengthScore || 0}/100`}
                              trend="up"
                            />
                            <TacticalDisplay
                              label="TOTAL VALUE"
                              value={formatCurrency(networkData.networkSummary?.totalNetworkValue || 0)}
                              trend="stable"
                            />
                          </div>
                        </div>
                      </HudCard>
                    </>
                  ) : (
                    <div className="text-center py-8 relative">
                      {/* Tactical grid overlay */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg overflow-hidden">
                        <div className="absolute inset-0 tactical-grid" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto mb-6 border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-cyan-400" />
                        </div>
                        <p className="text-yellow-400 font-orbitron font-bold uppercase tracking-wider mb-2">
                          NO NETWORK DATA
                        </p>
                        <p className="text-xs text-gray-400 font-mono uppercase">
                          PARTNERSHIP CONNECTIONS NOT DETECTED
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'intelligence' && (
                <div className="space-y-6">
                  <HudCard variant="default" priority="medium">
                    <div className="p-4">
                      <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                        THREAT ASSESSMENT
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-black/50 border border-cyan-500/10 rounded relative">
                          {/* Tactical grid overlay */}
                          <div className="absolute inset-0 opacity-5 pointer-events-none rounded overflow-hidden">
                            <div className="absolute inset-0 tactical-grid" />
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-400 font-mono uppercase">RISK LEVEL</span>
                              <span className={cn(
                                "text-sm font-orbitron font-bold uppercase tracking-wider",
                                contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 90 
                                  ? "text-green-400" 
                                  : contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 70
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              )}>
                                {contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 90 ? 'MINIMAL' :
                                 contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 70 ? 'MODERATE' : 'ELEVATED'}
                              </span>
                            </div>
                            <div className="h-3 bg-black/50 rounded overflow-hidden border border-cyan-500/20">
                              <div 
                                className={cn(
                                  "h-full transition-all relative",
                                  contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 90 
                                    ? "bg-green-400" 
                                    : contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 70
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                )}
                                style={{ width: `${contractor.pastPerformanceScore || 50}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-1">
                              CONFIDENCE: {contractor.pastPerformanceScore || 50}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <TacticalDisplay
                            label="GROWTH POTENTIAL"
                            value={contractor.growthPotential || 'MODERATE'}
                            trend="up"
                          />
                          <TacticalDisplay
                            label="MARKET POSITION"
                            value={contractor.marketPosition || 'STABLE'}
                            trend="stable"
                          />
                        </div>
                      </div>
                    </div>
                  </HudCard>

                  {/* Intelligence Radar Chart */}
                  <HudCard variant="default" priority="medium">
                    <div className="p-4">
                      <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                        CAPABILITY PROFILE
                      </h3>
                      <GoldengateRadarChart
                        title="Multi-Dimensional Analysis"
                        liveIndicator={true}
                        liveText="ANALYZING"
                        height={300}
                        data={{
                          labels: [
                            'Performance',
                            'Financial Health',
                            'Technical Capability',
                            'Market Position',
                            'Growth Potential',
                            'Risk Profile'
                          ],
                          datasets: [{
                            label: 'Current Assessment',
                            data: [
                              contractor.pastPerformanceScore || 50,
                              contractor.totalContractValue ? Math.min(100, Math.max(20, (contractor.totalContractValue / 1e9) * 15 + 30)) : 50,
                              contractor.activeContracts ? Math.min(100, contractor.activeContracts * 5 + 30) : 60,
                              contractor.totalAgencies ? Math.min(100, contractor.totalAgencies * 10 + 40) : 55,
                              contractor.growthPotential ? Math.min(100, Math.max(0, contractor.growthPotential)) : 65,
                              contractor.pastPerformanceScore ? (100 - contractor.pastPerformanceScore) : 50
                            ],
                            backgroundColor: 'rgba(255, 215, 0, 0.2)',
                            borderColor: '#FFD700',
                            borderWidth: 2,
                            pointBackgroundColor: '#FFD700',
                            pointBorderColor: '#000',
                            pointRadius: 4,
                          }]
                        }}
                        options={{
                          plugins: {
                            legend: {
                              labels: {
                                color: '#00D9FF',
                                font: { family: 'monospace', size: 10 }
                              }
                            }
                          },
                          scales: {
                            r: {
                              angleLines: { color: 'rgba(0, 217, 255, 0.2)' },
                              grid: { color: 'rgba(0, 217, 255, 0.1)' },
                              pointLabels: {
                                color: '#00D9FF',
                                font: { family: 'monospace', size: 9 }
                              },
                              ticks: {
                                color: '#00D9FF',
                                font: { family: 'monospace', size: 8 }
                              },
                              min: 0,
                              max: 100
                            }
                          }
                        }}
                      />
                    </div>
                  </HudCard>

                  {/* Intelligence Summary */}
                  <HudCard variant="default" priority="medium">
                    <div className="p-4">
                      <h3 className="text-sm font-orbitron text-yellow-400 uppercase tracking-wider mb-4">
                        STRATEGIC INTELLIGENCE
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-black/50 border border-cyan-500/10 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-orbitron text-cyan-400 uppercase">SECURITY ASSESSMENT</span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono">
                            TARGET SHOWS {contractor.pastPerformanceScore || 50}% RELIABILITY INDEX WITH 
                            {contractor.totalAgencies ? ` ${contractor.totalAgencies} AGENCY CLEARANCES` : ' LIMITED AGENCY EXPOSURE'}.
                            OPERATIONAL RISK WITHIN ACCEPTABLE PARAMETERS.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-black/50 border border-yellow-500/10 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-orbitron text-yellow-400 uppercase">STRATEGIC VALUE</span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono">
                            CONTRACT PORTFOLIO VALUED AT {formatCurrency(contractor.totalContractValue || 0)} 
                            WITH {contractor.activeContracts || 0} ACTIVE ENGAGEMENTS. 
                            {contractor.sizeTier ? `CLASSIFIED AS ${contractor.sizeTier.toUpperCase()} ENTITY.` : 'SIZE CLASSIFICATION PENDING.'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-black/50 border border-green-500/10 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-orbitron text-green-400 uppercase">OPERATIONAL STATUS</span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono">
                            TARGET ESTABLISHED {contractor.establishedDate ? 
                              new Date(contractor.establishedDate).getFullYear() : 'DATE CLASSIFIED'} 
                            WITH PRIMARY OPERATIONS IN {contractor.city}, {contractor.state}. 
                            {contractor.lifecycleStage ? `CURRENT LIFECYCLE: ${contractor.lifecycleStage.toUpperCase()}.` : 'LIFECYCLE STATUS UNKNOWN.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </HudCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}