import React, { useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { Folder, Radar } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { PortfolioMetrics, PortfolioTabs, ManagementTab, RiskTab, ReportingTab, NewsTab } from '../../components/portfolio';


export function ViewPortfolio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('management');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'management':
        return <ManagementTab />;
      case 'risk':
        return <RiskTab />;
      case 'reporting':
        return <ReportingTab />;
      case 'news':
        return <NewsTab />;
      default:
        return <ManagementTab />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white pb-20" style={{ backgroundColor: '#010204' }}>
        {/* Hero Portfolio Header */}
        <div className="relative overflow-hidden">
          {/* Ambient effects */}

          <div className="container mx-auto px-6 py-12 relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#8B8EFF]/20 to-purple-600/20 border border-[#8B8EFF]/40 rounded-xl backdrop-blur-sm">
                    <Folder className="w-8 h-8 text-[#8B8EFF]" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-light text-white uppercase tracking-wide" style={{ fontFamily: 'Michroma, sans-serif' }}>
                      Portfolio Management
                    </h1>
                    <p className="text-[#8B8EFF] text-sm tracking-wide">
                      ASSET MANAGEMENT • RISK MONITORING • PRESENTATION BUILDER
                    </p>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-[#8B8EFF]/30 rounded-lg backdrop-blur-sm">
                  <Radar className="w-4 h-4 text-[#8B8EFF] animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-xs text-[#8B8EFF] uppercase">TRACKING</span>
                </div>
                <Button asChild className="bg-[#F97316] hover:bg-[#F97316]/80 text-white font-bold">
                  <Link to="/platform/discovery">DISCOVER ASSETS</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Metrics Dashboard */}
        <div className="container mx-auto px-6">
          {/* Headline Metrics */}
          <PortfolioMetrics />

          {/* Tab Navigation */}
          <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {renderTabContent()}
        </div>

        {/* Footer Copyright */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}