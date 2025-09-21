import React, { useState } from 'react';
import { 
  ArrowLeft,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Building,
  Calendar,
  Shield,
  Brain,
  Search,
  ChevronRight,
  ExternalLink,
  FileText,
  Mail
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge, RiskBadge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import type { AnalysisResult, Contractor } from '../../types';

interface DeploymentResultsProps {
  analysis: AnalysisResult;
  contractor?: Contractor;
  onBack: () => void;
  onExport: () => void;
  onShare: () => void;
}

export function DeploymentResults({
  analysis,
  contractor,
  onBack,
  onExport,
  onShare
}: DeploymentResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getAnalysisIcon = () => {
    switch (analysis.type) {
      case 'revenue-analytics':
        return TrendingUp;
      case 'forensic-due-diligence':
        return Shield;
      case 'agency-exposure':
        return Building;
      case 'market-perception':
        return Brain;
      default:
        return BarChart3;
    }
  };

  const getAnalysisTitle = () => {
    switch (analysis.type) {
      case 'revenue-analytics':
        return 'Revenue Analytics';
      case 'forensic-due-diligence':
        return 'Forensic Due Diligence';
      case 'agency-exposure':
        return 'Agency Exposure';
      case 'market-perception':
        return 'Market Perception';
      default:
        return 'Analysis Results';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const Icon = getAnalysisIcon();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500">
              <Icon className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white font-aptos">
                {getAnalysisTitle()} Results
              </h2>
              <p className="text-sm text-gray-400">
                {contractor?.name} • {formatDate(analysis.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="border-gray-600"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            size="sm"
            onClick={onExport}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Overall Score</p>
                <p className="text-2xl font-bold text-white">{analysis.metrics?.score || 0}/100</p>
              </div>
              <div className={`p-2 rounded-lg ${
                (analysis.metrics?.score || 0) >= 80 ? 'bg-green-500/10' : 
                (analysis.metrics?.score || 0) >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10'
              }`}>
                <Activity className={`h-5 w-5 ${
                  (analysis.metrics?.score || 0) >= 80 ? 'text-green-500' : 
                  (analysis.metrics?.score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Confidence</p>
                <p className="text-2xl font-bold text-white">{analysis.confidence}%</p>
              </div>
              <Badge variant="success" className="text-xs">
                High
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Risk Level</p>
                <p className="text-lg font-semibold text-white capitalize">{analysis.riskAssessment}</p>
              </div>
              <RiskBadge level={analysis.riskAssessment} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Percentile</p>
                <p className="text-2xl font-bold text-white">{analysis.metrics?.percentile || 0}th</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <PieChart className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Key Findings</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle size="md">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 leading-relaxed">
                {analysis.summary}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {Math.round(analysis.executionTime / 1000)}s execution
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Analysis ID: {analysis.id}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle size="md">Performance Trend</CardTitle>
              <CardDescription>Based on historical data analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-dark-gold rounded-lg">
                <div className="flex items-center gap-3">
                  {analysis.metrics?.trend === 'positive' ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : analysis.metrics?.trend === 'negative' ? (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  ) : (
                    <Activity className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-lg font-semibold text-white capitalize">
                      {analysis.metrics?.trend || 'Stable'} Trajectory
                    </p>
                    <p className="text-sm text-gray-400">
                      Performance is {analysis.metrics?.trend === 'positive' ? 'improving' : 
                      analysis.metrics?.trend === 'negative' ? 'declining' : 'stable'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4 mt-6">
          {analysis.keyFindings.map((finding, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10 mt-1">
                    <CheckCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{finding}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Impact: High
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Confidence: {analysis.confidence}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6 mt-6">
          {/* Revenue Metrics (for revenue-analytics) */}
          {analysis.type === 'revenue-analytics' && (
            <Card>
              <CardHeader>
                <CardTitle size="md">Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-300">Total Revenue (TTM)</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {formatCurrency(contractor?.totalContractValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">YoY Growth</span>
                    </div>
                    <span className="text-lg font-semibold text-white">+23.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-300">Market Share</span>
                    </div>
                    <span className="text-lg font-semibold text-white">4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Metrics (for forensic-due-diligence) */}
          {analysis.type === 'forensic-due-diligence' && (
            <Card>
              <CardHeader>
                <CardTitle size="md">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-300">Compliance Score</span>
                    </div>
                    <Badge variant="success">95/100</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-300">Risk Factors</span>
                    </div>
                    <Badge variant="warning">3 Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Past Performance</span>
                    </div>
                    <Badge variant="success">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agency Metrics (for agency-exposure) */}
          {analysis.type === 'agency-exposure' && (
            <Card>
              <CardHeader>
                <CardTitle size="md">Agency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Primary Agency</span>
                    </div>
                    <span className="text-sm font-semibold text-white">DoD (45%)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-300">Agency Count</span>
                    </div>
                    <span className="text-sm font-semibold text-white">12 Agencies</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-gold rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-300">Concentration Risk</span>
                    </div>
                    <RiskBadge level="medium" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle size="md">Strategic Recommendations</CardTitle>
              <CardDescription>Based on comprehensive analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-400">Opportunity</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Strong growth trajectory indicates potential for increased contract awards. 
                      Consider expanding engagement with this contractor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Caution</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Monitor agency concentration risk. Diversification of agency relationships 
                      would strengthen overall position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Insight</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Market positioning analysis shows competitive advantages in specialized 
                      technical services. Leverage this for strategic partnerships.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle size="md">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between border-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Generate Full Report</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Schedule Follow-up Analysis</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-gray-600">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>View Related Opportunities</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}