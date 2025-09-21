import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Building, 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Network,
  Target,
  Award,
  Globe,
  Briefcase,
  Activity,
  ChevronRight,
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Shield,
  Zap,
  BarChart3,
  Hash,
  Phone,
  Mail,
  Link,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LoadingState } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import {
  GoldengateLineChart,
  GoldengateBarChart,
  GoldengateDoughnutChart,
  GoldengateRadarChart,
  GoldengateAreaChart,
  GoldengatePolarChart,
  GoldengateScatterChart,
  GoldengateMixedChart,
  GoldengateBubbleChart,
  GoldengateHorizontalBarChart,
  GoldengateStackedBarChart,
  GoldengateWaterfallChart
} from '../../lib/charts';
import { formatCurrency } from '../../utils/contractor-profile-transform';
import { apiClient } from '../../lib/api-client';

interface UEIProfile {
  uei: string;
  contractorName: string;
  dbaName?: string;
  registrationDate?: string;
  expirationDate?: string;
  lastUpdatedDate?: string;
  activationDate?: string;
  
  // Entity Information
  entityType?: string;
  organizationType?: string;
  legalBusinessName?: string;
  cageCode?: string;
  dodaac?: string;
  
  // Contact Information
  physicalAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  mailingAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  
  // Business Classifications
  businessTypes?: string[];
  socioeconomicCategories?: string[];
  naicsCodes?: Array<{
    code: string;
    description: string;
    isPrimary: boolean;
    size?: string;
  }>;
  pscCodes?: Array<{
    code: string;
    description: string;
  }>;
  
  // Performance Metrics
  totalContracts: number;
  totalObligated: string;
  avgContractValue: string;
  activeContracts: number;
  completedContracts: number;
  cancelledContracts: number;
  
  // Agency Relationships
  primaryAgency?: string;
  totalAgencies: number;
  agencies?: Array<{
    agency: string;
    totalContracts: number;
    totalObligated: string;
    isPrimary: boolean;
  }>;
  
  // Financial Metrics
  annualRevenue?: string;
  yearEstablished?: number;
  numberOfEmployees?: number;
  
  // Performance Scores
  performanceScore?: number;
  riskScore?: number;
  complianceScore?: number;
  qualityScore?: number;
  deliveryScore?: number;
  
  // Contract Distribution
  contractsByType?: {
    fixed: number;
    cost: number;
    time: number;
    other: number;
  };
  
  // Set-aside Programs
  setAsideContracts?: {
    small: number;
    womenOwned: number;
    veteranOwned: number;
    disadvantaged: number;
    hubZone: number;
  };
  
  // Certifications
  certifications?: Array<{
    type: string;
    issuer: string;
    validUntil?: string;
  }>;
}

// Mock data generator for charts (replace with actual API data)
const generateMockTimeSeriesData = (months: number = 36) => {
  const data = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    data.push({
      date: date.toISOString().slice(0, 7),
      revenue: Math.random() * 5000000,
      contracts: Math.floor(Math.random() * 20),
      winRate: Math.random() * 100
    });
  }
  return data;
};

interface UEIProfileProps {
  uei: string;
}

export function UEIProfile({ uei }: UEIProfileProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UEIProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [timeSeriesData] = useState(generateMockTimeSeriesData());

  useEffect(() => {
    if (uei) {
      fetchUEIProfile();
      fetchPerformanceData();
    }
  }, [uei]);

  const fetchUEIProfile = async () => {
    if (!uei) return;
    
    setIsLoading(true);
    try {
      // Replace with actual API call when endpoint is available
      const mockProfile: UEIProfile = {
        uei: uei,
        contractorName: 'Advanced Technology Solutions Inc.',
        dbaName: 'ATS Inc.',
        registrationDate: '2015-03-15',
        expirationDate: '2025-03-15',
        lastUpdatedDate: '2024-12-01',
        activationDate: '2015-03-20',
        
        entityType: 'Corporation',
        organizationType: 'Contractor',
        legalBusinessName: 'Advanced Technology Solutions Incorporated',
        cageCode: '1ABC2',
        dodaac: 'W56XYZ',
        
        physicalAddress: {
          streetAddress: '123 Innovation Drive',
          city: 'Arlington',
          state: 'VA',
          zipCode: '22202',
          country: 'USA'
        },
        
        phone: '(703) 555-0100',
        email: 'contracts@atsinc.com',
        website: 'https://www.atsinc.com',
        
        businessTypes: ['Small Business', 'For-Profit Organization'],
        socioeconomicCategories: ['Small Business', 'Service-Disabled Veteran-Owned'],
        
        naicsCodes: [
          { code: '541511', description: 'Custom Computer Programming Services', isPrimary: true, size: 'Small' },
          { code: '541512', description: 'Computer Systems Design Services', isPrimary: false, size: 'Small' }
        ],
        
        totalContracts: 127,
        totalObligated: '45678900',
        avgContractValue: '359834',
        activeContracts: 12,
        completedContracts: 108,
        cancelledContracts: 7,
        
        primaryAgency: 'Department of Defense',
        totalAgencies: 8,
        
        annualRevenue: '25000000',
        yearEstablished: 2010,
        numberOfEmployees: 150,
        
        performanceScore: 88,
        riskScore: 22,
        complianceScore: 95,
        qualityScore: 91,
        deliveryScore: 87,
        
        contractsByType: {
          fixed: 45,
          cost: 30,
          time: 15,
          other: 10
        },
        
        setAsideContracts: {
          small: 65,
          womenOwned: 0,
          veteranOwned: 35,
          disadvantaged: 0,
          hubZone: 0
        },
        
        certifications: [
          { type: 'ISO 9001:2015', issuer: 'ISO', validUntil: '2025-12-31' },
          { type: 'CMMI Level 3', issuer: 'CMMI Institute', validUntil: '2024-06-30' }
        ]
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Failed to fetch UEI profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    // Mock performance data - replace with actual API
    setPerformanceData({
      monthlyTrends: timeSeriesData,
      yearOverYear: {
        revenue: 15.3,
        contracts: 8.7,
        winRate: -2.1
      }
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card className="bg-medium-gray border-red-500/20">
          <CardContent className="p-6">
            <p className="text-red-400">UEI profile not found</p>
            <Button onClick={() => window.history.back()} className="mt-4" variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const contractTypeData = {
    labels: ['Fixed Price', 'Cost Plus', 'Time & Materials', 'Other'],
    datasets: [{
      data: [
        profile.contractsByType?.fixed || 0,
        profile.contractsByType?.cost || 0,
        profile.contractsByType?.time || 0,
        profile.contractsByType?.other || 0
      ]
    }]
  };

  const setAsideData = {
    labels: ['Small Business', 'Women-Owned', 'Veteran-Owned', 'Disadvantaged', 'HUBZone'],
    datasets: [{
      label: 'Set-Aside Contracts',
      data: [
        profile.setAsideContracts?.small || 0,
        profile.setAsideContracts?.womenOwned || 0,
        profile.setAsideContracts?.veteranOwned || 0,
        profile.setAsideContracts?.disadvantaged || 0,
        profile.setAsideContracts?.hubZone || 0
      ]
    }]
  };

  const performanceRadarData = {
    labels: ['Performance', 'Compliance', 'Quality', 'Delivery', 'Risk (inverted)'],
    datasets: [{
      label: 'Scores',
      data: [
        profile.performanceScore || 0,
        profile.complianceScore || 0,
        profile.qualityScore || 0,
        profile.deliveryScore || 0,
        100 - (profile.riskScore || 0)
      ]
    }]
  };

  const monthlyTrendData = {
    labels: timeSeriesData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        type: 'line' as const,
        data: timeSeriesData.map(d => d.revenue / 1000000),
        borderColor: '#FFD700',
        yAxisID: 'y'
      },
      {
        label: 'Win Rate %',
        type: 'bar' as const,
        data: timeSeriesData.map(d => d.winRate),
        backgroundColor: 'rgba(0, 217, 255, 0.6)',
        yAxisID: 'y1'
      }
    ]
  };

  const contractStatusData = {
    labels: ['Active', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        profile.activeContracts,
        profile.completedContracts,
        profile.cancelledContracts
      ]
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-yellow-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-yellow-500/50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" variant="outline" className="border-yellow-500/50">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entity Information */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-white mb-2">{profile.contractorName}</h1>
            {profile.dbaName && (
              <p className="text-gray-400 mb-2">DBA: {profile.dbaName}</p>
            )}
            
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 font-mono">
                <Hash className="h-3 w-3 mr-1" />
                {profile.uei}
              </Badge>
              {profile.cageCode && (
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                  CAGE: {profile.cageCode}
                </Badge>
              )}
              {profile.entityType && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  {profile.entityType}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Registration Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Expires</p>
                <p className="text-white">
                  {profile.expirationDate ? new Date(profile.expirationDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Performance Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Performance Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={profile.performanceScore} className="w-20" />
                  <span className="text-sm font-bold text-green-400">{profile.performanceScore}/100</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Risk Level</span>
                <div className="flex items-center gap-2">
                  <Progress value={profile.riskScore} className="w-20" />
                  <span className="text-sm font-bold text-orange-400">{profile.riskScore}/100</span>
                </div>
              </div>
              <Separator className="bg-gray-700" />
              <div>
                <p className="text-sm text-gray-400">Total Contract Value</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(parseFloat(profile.totalObligated))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{profile.totalContracts}</p>
            <p className="text-xs text-gray-400">Total Contracts</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(parseFloat(profile.avgContractValue))}
            </p>
            <p className="text-xs text-gray-400">Avg Contract</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Building className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{profile.totalAgencies}</p>
            <p className="text-xs text-gray-400">Agencies</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{profile.numberOfEmployees || 'N/A'}</p>
            <p className="text-xs text-gray-400">Employees</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {profile.yearEstablished || 'N/A'}
            </p>
            <p className="text-xs text-gray-400">Established</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gray border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{profile.activeContracts}</p>
            <p className="text-xs text-gray-400">Active Now</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="details">Entity Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Type Distribution */}
            <GoldengateDoughnutChart
              title="Contract Type Distribution"
              data={contractTypeData}
              height={350}
              liveIndicator={true}
              liveText="CONTRACTS"
            />

            {/* Performance Radar */}
            <GoldengateRadarChart
              title="Performance Metrics"
              data={performanceRadarData}
              height={350}
              liveIndicator={true}
              liveText="SCORING"
              options={{
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>

          {/* Set-Aside Programs */}
          <GoldengateHorizontalBarChart
            title="Set-Aside Program Participation"
            data={setAsideData}
            height={300}
            liveIndicator={true}
            liveText="SET-ASIDES"
            options={{
              indexAxis: 'y' as const,
              scales: {
                x: {
                  ticks: {
                    callback: (value: any) => `${value}%`
                  }
                }
              }
            }}
          />

          {/* Contract Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GoldengatePolarChart
              title="Contract Status Distribution"
              data={contractStatusData}
              height={300}
              liveIndicator={true}
              liveText="STATUS"
            />

            {/* Business Classifications */}
            <Card className="bg-medium-gray border-yellow-500/20 md:col-span-2">
              <CardHeader>
                <CardTitle>Business Classifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Business Types</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.businessTypes?.map((type, idx) => (
                      <Badge key={idx} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Socioeconomic Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.socioeconomicCategories?.map((cat, idx) => (
                      <Badge key={idx} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">NAICS Codes</p>
                  <div className="space-y-2">
                    {profile.naicsCodes?.map((naics, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-dark-gray p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-white">{naics.code}</span>
                          {naics.isPrimary && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{naics.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Monthly Trends */}
          <GoldengateMixedChart
            title="Revenue & Win Rate Trends (36 Months)"
            data={monthlyTrendData}
            height={400}
            liveIndicator={true}
            liveText="TRENDING"
            options={{
              scales: {
                y: {
                  type: 'linear' as const,
                  display: true,
                  position: 'left' as const,
                  ticks: {
                    callback: (value: any) => `$${value}M`
                  }
                },
                y1: {
                  type: 'linear' as const,
                  display: true,
                  position: 'right' as const,
                  ticks: {
                    callback: (value: any) => `${value}%`
                  }
                }
              }
            }}
          />

          {/* YoY Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-medium-gray border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      +{performanceData?.yearOverYear?.revenue}%
                    </p>
                    <p className="text-sm text-gray-400">Year over Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-medium-gray border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Contract Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-cyan-400" />
                  <div>
                    <p className="text-3xl font-bold text-cyan-400">
                      +{performanceData?.yearOverYear?.contracts}%
                    </p>
                    <p className="text-sm text-gray-400">Year over Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-medium-gray border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Win Rate Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="h-8 w-8 text-orange-400" />
                  <div>
                    <p className="text-3xl font-bold text-orange-400">
                      {performanceData?.yearOverYear?.winRate}%
                    </p>
                    <p className="text-sm text-gray-400">Year over Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Score Breakdown */}
          <GoldengateStackedBarChart
            title="Performance Score Components"
            data={{
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [
                {
                  label: 'Quality',
                  data: [85, 88, 91, 91],
                  backgroundColor: '#FFD700'
                },
                {
                  label: 'Delivery',
                  data: [82, 85, 87, 87],
                  backgroundColor: '#00D9FF'
                },
                {
                  label: 'Compliance',
                  data: [90, 92, 94, 95],
                  backgroundColor: '#7B61FF'
                }
              ]
            }}
            height={350}
            liveIndicator={true}
            liveText="QUARTERLY"
          />
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          {/* Contract Timeline */}
          <GoldengateAreaChart
            title="Contract Activity Timeline"
            data={{
              labels: timeSeriesData.slice(-24).map(d => d.date),
              datasets: [{
                label: 'Active Contracts',
                data: timeSeriesData.slice(-24).map(d => d.contracts)
              }]
            }}
            height={350}
            liveIndicator={true}
            liveText="TIMELINE"
          />

          {/* Contract Value Distribution */}
          <GoldengateBubbleChart
            title="Contract Value vs Duration Analysis"
            data={{
              datasets: [{
                label: 'Contracts',
                data: Array.from({ length: 20 }, () => ({
                  x: Math.random() * 36, // Duration in months
                  y: Math.random() * 5, // Value in millions
                  r: Math.random() * 20 + 5 // Bubble size
                }))
              }]
            }}
            height={400}
            liveIndicator={true}
            liveText="ANALYSIS"
            options={{
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Duration (months)'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Value ($M)'
                  },
                  ticks: {
                    callback: (value: any) => `$${value}M`
                  }
                }
              }
            }}
          />

          {/* Contract Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-dark-gray border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Completion Rate</span>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {((profile.completedContracts / profile.totalContracts) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {profile.completedContracts} of {profile.totalContracts} contracts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-gray border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Cancellation Rate</span>
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-400">
                  {((profile.cancelledContracts / profile.totalContracts) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {profile.cancelledContracts} cancelled
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-gray border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Active Ratio</span>
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-cyan-400">
                  {((profile.activeContracts / profile.totalContracts) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {profile.activeContracts} active
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoldengateRadarChart
              title="Compliance Matrix"
              data={{
                labels: ['Registration', 'Certifications', 'Reporting', 'Audits', 'Training', 'Documentation'],
                datasets: [{
                  label: 'Compliance Score',
                  data: [95, 88, 92, 85, 90, 93]
                }]
              }}
              height={400}
              liveIndicator={true}
              liveText="COMPLIANCE"
              options={{
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />

            {/* Certifications */}
            <Card className="bg-medium-gray border-green-500/20">
              <CardHeader>
                <CardTitle>Active Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.certifications?.map((cert, idx) => (
                  <div key={idx} className="bg-dark-gray p-3 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-400" />
                          <p className="font-semibold text-white">{cert.type}</p>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Issued by {cert.issuer}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        Valid until {cert.validUntil}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Registration Timeline */}
          <Card className="bg-medium-gray border-cyan-500/20">
            <CardHeader>
              <CardTitle>Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Registration Date</span>
                  </div>
                  <span className="text-white font-semibold">
                    {profile.registrationDate ? new Date(profile.registrationDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Last Updated</span>
                  </div>
                  <span className="text-white font-semibold">
                    {profile.lastUpdatedDate ? new Date(profile.lastUpdatedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Expiration Date</span>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    {profile.expirationDate ? new Date(profile.expirationDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          {/* Revenue Waterfall */}
          <GoldengateWaterfallChart
            title="Revenue Breakdown Analysis"
            data={{
              labels: ['Base Revenue', 'New Contracts', 'Renewals', 'Modifications', 'Cancellations', 'Total'],
              datasets: [{
                label: 'Revenue Flow',
                data: [20, 5, 3, 2, -5, 25], // In millions
                backgroundColor: (context: any) => {
                  const value = context.parsed?.y || 0;
                  return value >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 0, 102, 0.8)';
                }
              }]
            }}
            height={400}
            liveIndicator={true}
            liveText="REVENUE"
            options={{
              scales: {
                y: {
                  ticks: {
                    callback: (value: any) => `$${value}M`
                  }
                }
              }
            }}
          />

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-medium-gray border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Annual Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-400">
                  {formatCurrency(parseFloat(profile.annualRevenue || '0'))}
                </p>
                <p className="text-sm text-gray-400 mt-2">Current fiscal year</p>
              </CardContent>
            </Card>

            <Card className="bg-medium-gray border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Revenue per Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(parseFloat(profile.annualRevenue || '0') / (profile.numberOfEmployees || 1))}
                </p>
                <p className="text-sm text-gray-400 mt-2">Productivity metric</p>
              </CardContent>
            </Card>

            <Card className="bg-medium-gray border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Contract Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-cyan-400">
                  {((profile.activeContracts / (profile.numberOfEmployees || 1)) * 10).toFixed(1)}
                </p>
                <p className="text-sm text-gray-400 mt-2">Contracts per 10 employees</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Entity Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="bg-medium-gray border-gray-700">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.physicalAddress && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Physical Address</span>
                    </div>
                    <p className="text-white">
                      {profile.physicalAddress.streetAddress}<br />
                      {profile.physicalAddress.city}, {profile.physicalAddress.state} {profile.physicalAddress.zipCode}
                    </p>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{profile.phone}</span>
                  </div>
                )}
                
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{profile.email}</span>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-gray-400" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-cyan-400 hover:text-cyan-300">
                      {profile.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Entity Identifiers */}
            <Card className="bg-medium-gray border-gray-700">
              <CardHeader>
                <CardTitle>Entity Identifiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">UEI</span>
                  <span className="font-mono text-white">{profile.uei}</span>
                </div>
                {profile.cageCode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">CAGE Code</span>
                    <span className="font-mono text-white">{profile.cageCode}</span>
                  </div>
                )}
                {profile.dodaac && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">DODAAC</span>
                    <span className="font-mono text-white">{profile.dodaac}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Entity Type</span>
                  <span className="text-white">{profile.entityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Organization Type</span>
                  <span className="text-white">{profile.organizationType}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agency Relationships */}
          <Card className="bg-medium-gray border-cyan-500/20">
            <CardHeader>
              <CardTitle>Agency Relationships</CardTitle>
              <CardDescription>Top government agency partners</CardDescription>
            </CardHeader>
            <CardContent>
              <GoldengateBarChart
                title=""
                data={{
                  labels: ['DoD', 'NASA', 'HHS', 'VA', 'DHS'],
                  datasets: [{
                    label: 'Contract Value',
                    data: [15, 8, 5, 4, 3] // In millions
                  }]
                }}
                height={250}
                liveIndicator={false}
                options={{
                  scales: {
                    y: {
                      ticks: {
                        callback: (value: any) => `$${value}M`
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}