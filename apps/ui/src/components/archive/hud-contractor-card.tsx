import React from 'react';
import { cn } from '../../lib/utils';
import { HudCard, TacticalDisplay, TargetReticle } from './hud-card';
import { 
  Heart, 
  Building2, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Activity,
  Zap,
  Target,
  DollarSign,
  FileText,
  Users
} from 'lucide-react';

interface HudContractorCardProps {
  contractor: {
    id: string;
    name: string;
    industry: string;
    location: string;
    state?: string;
    totalContractValue?: number;
    pastPerformanceScore?: number;
    totalUeis?: number;
    totalAgencies?: number;
    activeContracts?: number;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (contractorId: string) => void;
  onClick?: () => void;
  className?: string;
}

export function HudContractorCard({
  contractor,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  className
}: HudContractorCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e15) return `$${(value / 1e15).toFixed(1)}Q`;
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Determine priority based on contract value
  const getPriority = () => {
    if (!contractor.totalContractValue) return 'low';
    if (contractor.totalContractValue >= 1e9) return 'critical';
    if (contractor.totalContractValue >= 1e8) return 'high';
    if (contractor.totalContractValue >= 1e7) return 'medium';
    return 'low';
  };

  // Determine variant based on performance score
  const getVariant = () => {
    if (!contractor.pastPerformanceScore) return 'default';
    if (contractor.pastPerformanceScore >= 90) return 'success';
    if (contractor.pastPerformanceScore >= 80) return 'warning';
    if (contractor.pastPerformanceScore >= 70) return 'info';
    return 'danger';
  };

  // Determine threat level
  const getThreatLevel = () => {
    if (!contractor.pastPerformanceScore) return 'UNKNOWN';
    if (contractor.pastPerformanceScore >= 90) return 'SECURE';
    if (contractor.pastPerformanceScore >= 80) return 'MODERATE';
    if (contractor.pastPerformanceScore >= 70) return 'ELEVATED';
    return 'CRITICAL';
  };

  return (
    <HudCard
      variant="default"
      priority="medium"
      targetLocked={isFavorite}
      dataStream={false}
      className={cn("cursor-pointer", className)}
    >
      <div onClick={onClick} className="p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Target Designation */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 relative opacity-50">
                <TargetReticle size={32} color="#FFD700" animated={false} />
              </div>
              <div>
                <p className="text-xs text-cyan-400 font-sans uppercase tracking-wider">
                  TARGET DESIGNATION
                </p>
                <h3 className="text-lg font-orbitron font-bold text-yellow-400 uppercase tracking-wide line-clamp-1">
                  {contractor.name}
                </h3>
              </div>
            </div>
            
            {/* Sector and Location */}
            <div className="flex items-center gap-4 text-xs font-sans">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-400">SECTOR:</span>
                <span className="text-cyan-400 uppercase">
                  {contractor.industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-400">LOC:</span>
                <span className="text-cyan-400">
                  {contractor.location === 'US' ? contractor.state || 'US' : contractor.location}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-start gap-2">
            {contractor.totalUeis && contractor.totalUeis > 1 && (
              <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-500 font-sans">
                    {contractor.totalUeis} ENTITIES
                  </span>
                </div>
              </div>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(contractor.id);
                }}
                className={cn(
                  "p-2 rounded transition-all duration-200",
                  "border backdrop-blur-sm",
                  isFavorite 
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30" 
                    : "bg-black/20 border-cyan-500/20 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                )}
                aria-label={isFavorite ? "Remove from tracking" : "Add to tracking"}
              >
                <Target className={cn("h-4 w-4", isFavorite && "animate-pulse")} />
              </button>
            )}
          </div>
        </div>

        {/* Tactical Data Grid */}
        <div className="space-y-2 mb-3">
          <TacticalDisplay
            label="CONTRACT VALUE"
            value={contractor.totalContractValue ? formatCurrency(contractor.totalContractValue) : 'CLASSIFIED'}
            trend={contractor.totalContractValue && contractor.totalContractValue > 1e8 ? 'up' : 'stable'}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <TacticalDisplay
              label="ACTIVE OPS"
              value={contractor.activeContracts?.toLocaleString() || 'N/A'}
              unit="contracts"
            />
            <TacticalDisplay
              label="AGENCIES"
              value={contractor.totalAgencies || 'N/A'}
              unit="units"
            />
          </div>

          <TacticalDisplay
            label="PERFORMANCE"
            value={contractor.pastPerformanceScore ? `${contractor.pastPerformanceScore}%` : 'UNKNOWN'}
            trend={
              contractor.pastPerformanceScore 
                ? contractor.pastPerformanceScore >= 90 ? 'up' 
                : contractor.pastPerformanceScore >= 80 ? 'stable' 
                : 'down'
                : undefined
            }
            alert={contractor.pastPerformanceScore ? contractor.pastPerformanceScore < 70 : undefined}
          />
        </div>

        {/* Status Bar */}
        <div className="pt-3 border-t border-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-400 font-sans">THREAT:</span>
                <span className={cn(
                  "text-xs font-sans font-bold",
                  contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 90 ? "text-green-400" :
                  contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 80 ? "text-yellow-400" : 
                  "text-red-400"
                )}>
                  {getThreatLevel()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-sans">MONITORING</span>
            </div>
          </div>
        </div>
      </div>
    </HudCard>
  );
}