import React from 'react';
import { Button } from '../../../ui/button';
import { BarChart3 } from 'lucide-react';

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

export function ReportingTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
      <div className="lg:col-span-2">
        <ExternalPanelContainer>
          <InternalContentContainer>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-[#8B8EFF]" />
              <PanelTitle>ANALYTICS & REPORTING</PanelTitle>
              <div className="flex-1 h-px bg-gradient-to-r from-[#8B8EFF]/30 to-transparent" />
            </div>

            <div className="flex-1">
              <div className="h-full bg-gray-800/20 rounded-lg border border-gray-700/30 p-4">
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 border border-gray-700/30 rounded-lg">
                    <div className="text-sm text-white font-medium mb-2">Portfolio Performance Report</div>
                    <div className="text-xs text-gray-400">Last generated 2 hours ago</div>
                  </div>
                  <div className="p-4 bg-black/40 border border-gray-700/30 rounded-lg">
                    <div className="text-sm text-white font-medium mb-2">Risk Assessment Summary</div>
                    <div className="text-xs text-gray-400">Last generated yesterday</div>
                  </div>
                  <div className="p-4 bg-black/40 border border-gray-700/30 rounded-lg">
                    <div className="text-sm text-white font-medium mb-2">Contract Analytics Dashboard</div>
                    <div className="text-xs text-gray-400">Updated daily</div>
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
              <BarChart3 className="w-5 h-5 text-green-400" />
              <PanelTitle>PRESENTATION BUILDER</PanelTitle>
            </div>
            <div className="flex-1">
              <div className="h-full bg-gray-800/20 rounded-lg border border-gray-700/30 p-4 flex flex-col">
                <p className="text-gray-300 text-sm mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Construct decks with portfolio insights and analytics.
                </p>
                <Button className="w-full bg-green-500 hover:bg-green-500/80 text-white mt-auto">
                  Build Presentation
                </Button>
              </div>
            </div>
          </InternalContentContainer>
        </ExternalPanelContainer>
      </div>
    </div>
  );
}