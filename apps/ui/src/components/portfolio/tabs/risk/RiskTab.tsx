import React from 'react';
import { Button } from '../../../ui/button';
import { Shield } from 'lucide-react';

// Design Framework Components - Indigo Theme
const ExternalPanelContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full border border-[#8B8EFF]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#8B8EFF]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
    {/* Animated background grid */}
    <div className="absolute inset-0 opacity-5 z-0">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
          linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px'
      }} />
    </div>

    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
         style={{ background: 'linear-gradient(135deg, #8B8EFF20, transparent)' }} />

    {children}
  </div>
);

const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-gray-200 font-normal uppercase tracking-wider"
    style={{
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em'
    }}
  >
    {children}
  </h3>
);

export function RiskTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
      {/* Risk Assessment Dashboard */}
      <div className="lg:col-span-2">
        <ExternalPanelContainer>
          <InternalContentContainer>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#8B8EFF]" />
              <PanelTitle>RISK MONITORING DASHBOARD</PanelTitle>
              <div className="flex-1 h-px bg-gradient-to-r from-[#8B8EFF]/30 to-transparent" />
            </div>

            <div className="flex-1">
              <div className="h-full rounded-lg border border-gray-700/30 p-4" style={{ backgroundColor: '#223040' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="text-sm text-red-400 mb-2">HIGH RISK</div>
                    <div className="text-2xl font-bold text-red-400">3</div>
                    <div className="text-xs text-gray-400">Contractors requiring attention</div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="text-sm text-yellow-400 mb-2">MEDIUM RISK</div>
                    <div className="text-2xl font-bold text-yellow-400">12</div>
                    <div className="text-xs text-gray-400">Contractors under watch</div>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-sm text-green-400 mb-2">LOW RISK</div>
                    <div className="text-2xl font-bold text-green-400">45</div>
                    <div className="text-xs text-gray-400">Contractors performing well</div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-sm text-blue-400 mb-2">COMPLIANCE</div>
                    <div className="text-2xl font-bold text-blue-400">98%</div>
                    <div className="text-xs text-gray-400">Overall compliance score</div>
                  </div>
                </div>
              </div>
            </div>
          </InternalContentContainer>
        </ExternalPanelContainer>
      </div>

      <div className="space-y-6">
        <ExternalPanelContainer>
          <InternalContentContainer>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-400" />
              <PanelTitle>RISK ASSESSMENT</PanelTitle>
            </div>
            <div className="flex-1">
              <div className="h-full bg-gray-800/20 rounded-lg border border-gray-700/30 p-4 flex flex-col">
                <p className="text-gray-300 text-sm mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Monitor risk factors across your portfolio.
                </p>
                <Button className="w-full bg-red-500 hover:bg-red-500/80 text-white mt-auto">
                  Run Risk Analysis
                </Button>
              </div>
            </div>
          </InternalContentContainer>
        </ExternalPanelContainer>
      </div>
    </div>
  );
}