import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Network, Building, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { LoadingState } from '../../components/ui/skeleton';
import { NetworkRelationshipVisualizer } from '../../components/platform/NetworkRelationshipVisualizer';
import { apiClient } from '../../lib/api-client';
import { formatCurrency } from '../../utils/contractor-profile-transform';

interface ContractorNetworkProps {
  id: string;
}

export function ContractorNetwork({ id }: ContractorNetworkProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [networkData, setNetworkData] = useState<any>(null);
  const [contractorProfile, setContractorProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchNetworkData();
      fetchContractorProfile();
    }
  }, [id]);

  const fetchNetworkData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await apiClient.getContractorNetwork(id, 100);
      setNetworkData(data);
    } catch (error) {
      console.error('Failed to fetch network data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContractorProfile = async () => {
    if (!id) return;
    
    try {
      const data = await apiClient.getContractorProfile(id);
      setContractorProfile(data);
    } catch (error) {
      console.error('Failed to fetch contractor profile:', error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!networkData) {
    return (
      <div className="p-6">
        <Card className="bg-medium-gray border-red-500/20">
          <CardContent className="p-6">
            <p className="text-red-400">Failed to load network data</p>
            <Button 
              onClick={() => window.history.back()}
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Network className="h-6 w-6 text-yellow-400" />
              Contractor Network Analysis
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {networkData.contractor.name}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Network Value</span>
              <DollarSign className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {formatCurrency(networkData.networkSummary.totalNetworkValue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Shared revenue across network</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Network Partners</span>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {networkData.networkSummary.totalPartners}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-green-400">
                {networkData.relationships.asSubcontractor.count} primes
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-blue-400">
                {networkData.relationships.asPrime.count} subs
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Relationship Strength</span>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {networkData.networkSummary.avgStrengthScore.toFixed(0)}/100
            </p>
            <p className="text-xs text-gray-500 mt-2">Network cohesion score</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Position</span>
              <Building className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              {networkData.relationships.asPrime.count > networkData.relationships.asSubcontractor.count 
                ? 'Prime-Heavy' 
                : networkData.relationships.asSubcontractor.count > networkData.relationships.asPrime.count
                ? 'Sub-Heavy'
                : 'Balanced'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Network role distribution</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Visualization */}
      <NetworkRelationshipVisualizer
        contractorId={networkData.contractor.uei}
        contractorName={networkData.contractor.name}
        networkData={networkData.relationships}
      />

      {/* Top Partners Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Prime Partners */}
        <Card className="bg-medium-gray border-green-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-green-400" />
              Top Prime Partners
            </CardTitle>
            <CardDescription className="text-gray-400">
              When acting as subcontractor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {networkData.relationships.asSubcontractor.partners.slice(0, 5).map((partner: any, idx: number) => (
                <div key={partner.primeUei} className="flex items-center justify-between p-3 bg-dark-gray rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{partner.primeName}</p>
                    <p className="text-xs text-gray-400 font-mono">{partner.primeUei}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">
                      {formatCurrency(partner.sharedRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Strength: {partner.strengthScore}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Sub Partners */}
        <Card className="bg-medium-gray border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-400" />
              Top Subcontractor Partners
            </CardTitle>
            <CardDescription className="text-gray-400">
              When acting as prime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {networkData.relationships.asPrime.partners.slice(0, 5).map((partner: any, idx: number) => (
                <div key={partner.subUei} className="flex items-center justify-between p-3 bg-dark-gray rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{partner.subName}</p>
                    <p className="text-xs text-gray-400 font-mono">{partner.subUei}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-400">
                      {formatCurrency(partner.sharedRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Strength: {partner.strengthScore}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}