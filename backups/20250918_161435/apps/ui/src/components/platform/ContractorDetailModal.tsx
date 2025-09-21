import React from 'react';
import { X, Download, Plus, ExternalLink, TrendingUp, TrendingDown, Minus, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge, IndustryBadge, PerformanceBadge, StatusBadge } from '../ui/badge';
import { MetricCard } from '../ui/card';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '../ui/modal';
import type { Contractor } from '../../types';

interface ContractorDetailModalProps {
  contractor: Contractor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (contractor: Contractor) => void;
}

export function ContractorDetailModal({ 
  contractor, 
  isOpen, 
  onClose, 
  onAddToPortfolio 
}: ContractorDetailModalProps) {
  const navigate = useNavigate();
  
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

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'high-growth':
      case 'steady-growth':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="xl" className="max-w-4xl">
        <ModalHeader className="border-b border-yellow-500/20 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <ModalTitle className="text-2xl mb-2">{contractor.name}</ModalTitle>
              {contractor.dbaName && (
                <p className="text-sm text-gray-400 font-aptos">DBA: {contractor.dbaName}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="font-mono text-xs">
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

        <ModalBody className="space-y-6">
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
              <div>
                <span className="text-gray-400 font-aptos">Ownership Type:</span>
                <span className="ml-2 text-white font-aptos capitalize">
                  {contractor.ownershipType.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 font-aptos">Business Momentum:</span>
                <span className="ml-2 text-white font-aptos capitalize flex items-center gap-1">
                  {getMomentumIcon(contractor.businessMomentum)}
                  {contractor.businessMomentum.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-500 font-aptos">Performance Analysis</h3>
            <div className="bg-lighter-gray rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 font-aptos">Contract Success Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gold-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${contractor.pastPerformanceScore || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-white font-aptos">
                    {contractor.pastPerformanceScore || 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 font-aptos">Industry Ranking</span>
                <Badge variant="outline" className="text-xs">
                  Top 10%
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 font-aptos">Risk Assessment</span>
                <Badge variant="success" className="text-xs">
                  Low Risk
                </Badge>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-500 font-aptos">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-lighter-gray rounded-lg">
                <span className="text-gray-300 font-aptos">Last Verified</span>
                <span className="text-white font-aptos">
                  {contractor.lastVerified ? formatDate(contractor.lastVerified) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-lighter-gray rounded-lg">
                <span className="text-gray-300 font-aptos">Profile Updated</span>
                <span className="text-white font-aptos">
                  {formatDate(contractor.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-lighter-gray rounded-lg">
                <span className="text-gray-300 font-aptos">Added to System</span>
                <span className="text-white font-aptos">
                  {formatDate(contractor.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-yellow-500/20">
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/20"
              onClick={() => {
                onClose();
                navigate(`/platform/contractor-network/${contractor.id}`);
              }}
            >
              <Network className="h-4 w-4 mr-2" />
              View Network
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/20"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on SAM.gov
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/20"
            >
              View Opportunities
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/20"
            >
              Run Analysis
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}