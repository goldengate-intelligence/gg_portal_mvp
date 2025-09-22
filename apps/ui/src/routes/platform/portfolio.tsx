import React, { useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { Folder, Radar } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { PortfolioMetrics, PortfolioTabs, AssetsTab, RiskTab, IntegrationTab } from '../../components/portfolio';


// Asset types
interface Asset {
  id: string;
  companyName: string;
  naicsDescription: string;
  marketType: 'civilian' | 'defense';
  uei: string;
  activeAwards: {
    value: string;
  };
}

interface GroupAsset {
  id: string;
  type: 'group';
  companyName: string;
  groupName: string;
  naicsDescription: string;
  marketType: 'civilian' | 'defense';
  uei: string;
  activeAwards: {
    value: string;
  };
  memberAssets: Asset[];
  entityCount: number;
  aggregatedMetrics: {
    lifetime: string;
    revenue: string;
    pipeline: string;
  };
}

export function ViewPortfolio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assets');

  // Shared assets state
  const [assets, setAssets] = useState<(Asset | GroupAsset)[]>([
    {
      id: 'TFL123456789',
      companyName: 'Trio Fabrication LLC',
      naicsDescription: 'Fabricated Plate Work Manufacturing',
      marketType: 'defense' as const,
      uei: 'TFL123456789',
      activeAwards: { value: '$125M' }
    },
    {
      id: 'RTX987654321',
      companyName: 'Raytheon Technologies Corporation',
      naicsDescription: 'Guided Missile and Space Vehicle Manufacturing',
      marketType: 'defense' as const,
      uei: 'RTX987654321',
      activeAwards: { value: '$2.1B' }
    },
    {
      id: 'BAE456789123',
      companyName: 'BAE Systems Inc',
      naicsDescription: 'Search Detection Navigation Guidance Aeronautical Systems',
      marketType: 'defense' as const,
      uei: 'BAE456789123',
      activeAwards: { value: '$1.8B' }
    },
    {
      id: 'ACI789123456',
      companyName: 'Applied Composites Inc',
      naicsDescription: 'Laminated Plastics Plate Sheet and Shape Manufacturing',
      marketType: 'civilian' as const,
      uei: 'ACI789123456',
      activeAwards: { value: '$180M' }
    }
  ]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assets':
        return <AssetsTab assets={assets} setAssets={setAssets} />;
      case 'risk':
        return <RiskTab />;
      case 'news':
        return <IntegrationTab />;
      default:
        return <AssetsTab assets={assets} setAssets={setAssets} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white pb-20 pt-20 relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10">
        {/* Hero Portfolio Header */}
        <div className="relative overflow-hidden mt-6">
          <div className="container mx-auto px-6 pt-0 pb-4 relative">
            <div className="w-full">
              <div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6 border border-gray-700/50 hover:border-gray-600/40">
                {/* Gradient background matching financial metric cards */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-[#8B8EFF]/20 to-purple-600/20 border border-[#8B8EFF]/40 rounded-xl backdrop-blur-sm">
                          <Folder className="w-8 h-8 text-[#8B8EFF]" />
                        </div>
                        <div>
                          <h1 className="text-4xl text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '250' }}>
                            Portfolio Management
                          </h1>
                          <p className="text-[#8B8EFF] font-sans text-sm tracking-wide">
                            ASSET MANAGEMENT • RISK MONITORING • PRESENTATION BUILDER
                          </p>
                        </div>
                      </div>
                      <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Monitor your contractor portfolio with comprehensive asset management tools.
                      </p>
                    </div>

                    {/* System Status */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-[#8B8EFF]/30 rounded-lg backdrop-blur-sm">
                        <Radar className="w-4 h-4 text-[#8B8EFF] animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="text-xs text-[#8B8EFF] font-sans uppercase">TRACKING</span>
                      </div>
                      <Button asChild className="bg-[#F97316] hover:bg-[#F97316]/80 text-white font-bold w-40">
                        <Link to="/platform/discovery">DISCOVER ASSETS</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Portfolio Metrics Dashboard */}
        <div className="container mx-auto px-6">
          {/* Headline Metrics */}
          <div className="mt-6">
            <PortfolioMetrics assets={assets} />
          </div>

          {/* Tab Navigation */}
          <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {renderTabContent()}
        </div>

        {/* Footer Copyright */}
        <div className="mt-16 text-center">
          <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}