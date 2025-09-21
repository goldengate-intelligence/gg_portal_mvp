import React, { useState, useEffect } from 'react';
import { X, Download, Plus, ExternalLink, ChartBar, Users, Snowflake } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge, IndustryBadge, PerformanceBadge, StatusBadge } from '../ui/badge';
import { MetricCard } from '../ui/card';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '../ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { LoadingState } from '../ui/skeleton';
import { PerformanceTrendChart } from '../charts/PerformanceTrendChart';
import { CompetitiveBenchmarkPanel } from './CompetitiveBenchmarkPanel';
import { apiClient } from '../../lib/api-client';
import type { Contractor } from '../../types';

interface EnhancedContractorModalProps {
  contractor: Contractor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (contractor: Contractor) => void;
}

export function EnhancedContractorModal({ 
  contractor, 
  isOpen, 
  onClose, 
  onAddToPortfolio 
}: EnhancedContractorModalProps) {
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
    if (!contractor) return;
    
    setIsLoading(true);
    try {
      // Fetch all enhanced data in parallel using API client methods
      const [perfData, benchData, netData] = await Promise.all([
        apiClient.getContractorPerformanceMetrics(contractor.id, 36),
        apiClient.getContractorPeerComparison(contractor.id),
        apiClient.getContractorNetwork(contractor.id, 10)
      ]);

      setPerformanceData(perfData);
      setBenchmarkData(benchData);
      setNetworkData(netData);
    } catch (error) {
      console.error('Failed to fetch enhanced contractor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!contractor) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="2xl" className="max-w-6xl max-h-[90vh] overflow-hidden">
        <ModalHeader className="border-b border-yellow-500/20 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <ModalTitle className="text-2xl mb-2">{contractor.name}</ModalTitle>
              {contractor.dbaName && (
                <p className="text-sm text-gray-400 font-aptos">DBA: {contractor.dbaName}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="font-sans text-xs">
                  UEI: {contractor.uei}
                </Badge>
                <IndustryBadge industry={contractor.industry} />
                <StatusBadge status={contractor.lifecycleStage as any} />
              </div>
            </div>
            <div className="flex gap-2">
              {onAddToPortfolio && (
                <Button
                  onClick={() => onAddToPortfolio(contractor)}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Portfolio
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-0 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b border-gray-700 rounded-none bg-dark-gray px-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Performance Trends
              </TabsTrigger>
              <TabsTrigger value="benchmark" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Competitive Analysis
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Snowflake className="h-4 w-4" />
                Network
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                {/* Original overview content */}
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                      className="bg-lighter-gray border-yellow-500/10"
                      title="Total Contract Value"
                      value={contractor.totalContractValue ? formatCurrency(contractor.totalContractValue) : 'N/A'}
                      description="Lifetime federal contracts"
                    />
                    <MetricCard
                      className="bg-lighter-gray border-yellow-500/10"
                      title="Active Contracts"
                      value={contractor.activeContracts || 0}
                      description="Currently active"
                    />
                    <MetricCard
                      className="bg-lighter-gray border-yellow-500/10"
                      title="Performance Score"
                      value={contractor.pastPerformanceScore?.toString() || 'N/A'}
                      description="Past performance rating"
                    />
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-500 font-aptos">Company Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 font-aptos">Location:</span>
                        <span className="ml-2 text-white font-aptos">
                          {contractor.location === 'US' 
                            ? `${contractor.state || 'United States'}` 
                            : contractor.country || 'International'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-aptos">Founded:</span>
                        <span className="ml-2 text-white font-aptos">
                          {contractor.foundedYear || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-aptos">Annual Revenue:</span>
                        <span className="ml-2 text-white font-aptos">
                          {contractor.annualRevenue ? formatCurrency(contractor.annualRevenue) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-aptos">Employees:</span>
                        <span className="ml-2 text-white font-aptos">
                          {contractor.employeeCount?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance">
                {isLoading ? (
                  <LoadingState />
                ) : performanceData ? (
                  <PerformanceTrendChart
                    data={performanceData.metrics || []}
                    summary={performanceData.summary}
                    title="36-Month Performance History"
                    description={`Tracking ${contractor.name}'s federal contracting performance`}
                    height={500}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No performance data available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="benchmark">
                {isLoading ? (
                  <LoadingState />
                ) : benchmarkData ? (
                  <CompetitiveBenchmarkPanel
                    data={benchmarkData}
                    contractorName={contractor.name}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No benchmark data available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="network">
                {isLoading ? (
                  <LoadingState />
                ) : networkData ? (
                  <div className="space-y-6">
                    {/* Network Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <MetricCard
                        className="bg-lighter-gray border-yellow-500/10"
                        title="Total Partners"
                        value={networkData.networkSummary.totalPartners}
                        description="Prime & sub relationships"
                      />
                      <MetricCard
                        className="bg-lighter-gray border-yellow-500/10"
                        title="Network Value"
                        value={formatCurrency(networkData.networkSummary.totalNetworkValue)}
                        description="Total shared revenue"
                      />
                      <MetricCard
                        className="bg-lighter-gray border-yellow-500/10"
                        title="Avg Strength"
                        value={networkData.networkSummary.avgStrengthScore.toFixed(0)}
                        description="Relationship score (0-100)"
                      />
                    </div>

                    {/* As Prime Contractor */}
                    {networkData.relationships.asPrime.count > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-yellow-500 mb-3">
                          As Prime Contractor ({networkData.relationships.asPrime.count} subs)
                        </h4>
                        <div className="space-y-2">
                          {networkData.relationships.asPrime.partners.slice(0, 5).map((partner: any, idx: number) => (
                            <div key={idx} className="bg-dark-gray rounded p-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">{partner.subName}</p>
                                <p className="text-xs text-gray-400">{partner.subUei}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge className="bg-green-500/20 text-green-400">
                                  Score: {partner.strengthScore}
                                </Badge>
                                <span className="text-sm text-gray-300">
                                  {formatCurrency(partner.sharedRevenue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* As Subcontractor */}
                    {networkData.relationships.asSubcontractor.count > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-yellow-500 mb-3">
                          As Subcontractor ({networkData.relationships.asSubcontractor.count} primes)
                        </h4>
                        <div className="space-y-2">
                          {networkData.relationships.asSubcontractor.partners.slice(0, 5).map((partner: any, idx: number) => (
                            <div key={idx} className="bg-dark-gray rounded p-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">{partner.primeName}</p>
                                <p className="text-xs text-gray-400">{partner.primeUei}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge className="bg-blue-500/20 text-blue-400">
                                  Score: {partner.strengthScore}
                                </Badge>
                                <span className="text-sm text-gray-300">
                                  {formatCurrency(partner.sharedRevenue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No network data available
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}