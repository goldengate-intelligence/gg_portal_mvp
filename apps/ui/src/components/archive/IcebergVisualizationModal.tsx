import React from 'react';
import { X, Target, Activity, Shield, TrendingUp } from 'lucide-react';
import { Modal, ModalContent } from '../ui/modal';
import { Button } from '../ui/button';
import { IcebergVisualization } from './IcebergVisualization';
import { cn } from '../../lib/utils';
import type { IcebergOpportunity } from './IcebergOpportunityCard';

interface IcebergVisualizationModalProps {
  opportunity: IcebergOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IcebergVisualizationModal({
  opportunity,
  isOpen,
  onClose
}: IcebergVisualizationModalProps) {
  if (!opportunity) return null;

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent 
        size="2xl" 
        className="max-w-[1200px] max-h-[95vh] overflow-hidden bg-black/90 backdrop-blur-xl border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,217,255,0.15)] p-0"
      >
        {/* Tactical Header */}
        <div className="relative p-4 border-b border-cyan-500/20 bg-black/50">
          {/* HUD Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400/60" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400/60" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-400/60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-400/60" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-lg font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
                  TARGET ANALYSIS: {opportunity.contractorName}
                </h1>
                <p className="text-xs text-cyan-400 font-sans mt-1">
                  ICEBERG PROTOCOL • CLASSIFICATION: {opportunity.classification.tier.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-sans uppercase">ACTIVE SCAN</span>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 border border-cyan-500/20 hover:border-yellow-500/30"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="overflow-y-auto max-h-[95vh]">
          <IcebergVisualization
            contractorName={opportunity.contractorName}
            primeRevenue={opportunity.revenue.prime}
            subRevenue={opportunity.revenue.subcontractor}
            totalRevenue={opportunity.revenue.total}
            icebergScore={opportunity.scores.iceberg}
            hiddenPercentage={opportunity.scores.hiddenRevenuePercentage}
            subToPrimeRatio={opportunity.scores.subToPrimeRatio}
          />
          
          {/* Tactical Analysis Grid */}
          <div className="p-6 bg-black/50 border-t border-cyan-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Classification */}
              <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-orbitron font-bold text-cyan-400 uppercase tracking-wider">
                    TARGET PROFILE
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 font-sans uppercase">PRIORITY:</span>
                    <span className={cn(
                      "text-xs font-sans font-bold uppercase",
                      opportunity.classification.tier === 'high' ? 'text-red-400' :
                      opportunity.classification.tier === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                    )}>
                      {opportunity.classification.tier === 'high' ? 'ALPHA' :
                       opportunity.classification.tier === 'medium' ? 'BETA' : 'GAMMA'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 font-sans uppercase">SCALE:</span>
                    <span className="text-xs text-cyan-400 font-sans">
                      {opportunity.classification.scale}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400 font-sans uppercase">TYPE:</span>
                    <span className="text-xs text-cyan-400 font-sans">
                      {opportunity.classification.entityType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advantages */}
              {opportunity.advantages && Array.isArray(opportunity.advantages) && (
                <div className="bg-black/30 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <h4 className="text-sm font-orbitron font-bold text-green-400 uppercase tracking-wider">
                      TACTICAL ADVANTAGES
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {opportunity.advantages.map((adv: string, idx: number) => (
                      <li key={idx} className="text-xs text-green-400 flex items-start font-sans">
                        <span className="mr-2 text-green-500">▶</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {opportunity.risks && Array.isArray(opportunity.risks) && (
                <div className="bg-black/30 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <h4 className="text-sm font-orbitron font-bold text-orange-400 uppercase tracking-wider">
                      THREAT ASSESSMENT
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {opportunity.risks.map((risk: string, idx: number) => (
                      <li key={idx} className="text-xs text-orange-400 flex items-start font-sans">
                        <span className="mr-2 text-orange-500">⚠</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Intelligence Brief */}
            <div className="mt-6 p-4 bg-black/30 border border-cyan-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-orbitron font-bold text-cyan-400 uppercase tracking-wider">
                  INTELLIGENCE BRIEF
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-sans uppercase block">UEI CODE</span>
                  <span className="text-sm text-yellow-400 font-sans">
                    {opportunity.contractorUei}
                  </span>
                </div>
                {opportunity.industry && (
                  <div>
                    <span className="text-xs text-gray-400 font-sans uppercase block">SECTOR</span>
                    <span className="text-sm text-cyan-400 font-sans">{opportunity.industry}</span>
                  </div>
                )}
                {opportunity.agencies && Array.isArray(opportunity.agencies) && opportunity.agencies.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 font-sans uppercase block">AGENCIES</span>
                    <span className="text-sm text-cyan-400 font-sans">
                      {opportunity.agencies.slice(0, 2).join(', ')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-400 font-sans uppercase block">POTENTIAL</span>
                  <span className="text-sm text-yellow-400 font-sans font-bold">
                    ${(opportunity.revenue.potential / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>

            {/* Mission Brief */}
            <div className="mt-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg relative">
              {/* Tactical grid overlay */}
              <div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg overflow-hidden">
                <div className="absolute inset-0 tactical-grid" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  <h4 className="text-sm font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
                    MISSION BRIEF
                  </h4>
                </div>
                <p className="text-sm text-cyan-400 font-sans mb-3">
                  TARGET SHOWS {opportunity.scores.subToPrimeRatio?.toFixed(1) || 'SIGNIFICANT'}X MORE 
                  REVENUE AS SUBCONTRACTOR. {opportunity.scores.hiddenRevenuePercentage.toFixed(0)}% 
                  REVENUE CONCEALED IN SUB-TIER. RECOMMENDED STRATEGIC OPERATIONS:
                </p>
                <ul className="space-y-1 text-xs text-gray-400 font-sans">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">▶</span>
                    PRIME CONTRACT GRADUATION PROTOCOLS
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">▶</span>
                    STRATEGIC PARTNERSHIP ACQUISITION
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">▶</span>
                    MENTOR-PROTÉGÉ ENGAGEMENT PROGRAMS
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">▶</span>
                    JOINT VENTURE OPPORTUNITY ASSESSMENT
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}