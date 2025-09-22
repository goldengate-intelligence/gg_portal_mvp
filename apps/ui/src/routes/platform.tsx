import { createRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/protected-route';
import { Link } from '@tanstack/react-router';
import {
  Search,
  Database,
  Globe,
  Brain,
  Eye,
  Layers,
  BarChart3,
  FolderOpen,
  Folder
} from 'lucide-react';
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils';

function PlatformComponent() {

  const modes = [
    {
      id: 'recon' as const,
      label: 'Discovery Engine',
      description: 'Primary research workspace for discovering, analyzing, and investigating federal contractors and organizations',
      icon: Brain,
      gradient: 'from-orange-600/25 to-red-600/25',
      accentColor: '#F97316', // Burnt orange
      iconBg: 'bg-orange-600/20',
      borderColor: 'border-orange-500/40',
      features: ['Neural Search', 'Pattern Recognition', 'Entity Mapping', 'Risk Assessment'],
      capabilities: [
        { icon: Search, label: 'Asset Origination', desc: 'Advanced contractor discovery' },
        { icon: Eye, label: 'Forensic Due Diligence', desc: 'Comprehensive entity profiling' },
        { icon: Globe, label: 'Business Development', desc: 'Contact intelligence via Lusha' }
      ]
    },
    {
      id: 'assets' as const,
      label: 'Portfolio Management',
      description: 'Organize and manage your saved entities with grouping, tagging, and aggregation capabilities',
      icon: Folder,
      gradient: 'from-indigo-500/25 to-purple-600/25',
      accentColor: '#8B8EFF', // Deep indigo - complementary to orange
      iconBg: 'bg-indigo-500/20',
      borderColor: 'border-indigo-500/40',
      features: ['Entity Storage', 'Custom Groups', 'Bulk Operations', 'Export Tools'],
      capabilities: [
        { icon: Layers, label: 'Asset Management', desc: 'Organize saved contractors' },
        { icon: BarChart3, label: 'Risk Monitoring', desc: 'Portfolio risk assessment' },
        { icon: FolderOpen, label: 'Presentation Builder', desc: 'Construct compelling client decks' }
      ]
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full text-white bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90">
        <div className="container mx-auto px-6 pt-24 pb-20 max-w-7xl">

            {/* Hero Header */}
            <div className="text-center mb-12 mt-8">
              <h1 className="text-white tracking-wide mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '64px', lineHeight: '0.9', letterSpacing: '-0.02em', fontWeight: '100' }}>
                <span className="text-[#D2AC38]" style={{ fontWeight: '250' }}>Select</span> <span className="text-white" style={{ fontWeight: '100' }}>Function</span>
              </h1>
              <p className="text-gray-400 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Choose your workspace.
              </p>
            </div>

            {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {modes.map((mode) => {
              const Icon = mode.icon;

              return (
                <Link
                  key={mode.id}
                  to={mode.id === 'recon' ? '/platform/discovery' : '/platform/portfolio'}
                  className={`block cursor-pointer transition-all duration-200 border rounded-lg ${mode.borderColor} hover:${mode.borderColor.replace('/40', '/60')}`}
                  style={{
                    backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor
                  }}
                >
                  <div className="p-6">
                    {/* Monolithic Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="mb-2">
                            <h3
                              className="text-6xl leading-none tracking-tight"
                              style={{
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontWeight: '250',
                                color: mode.accentColor
                              }}
                            >
                              {mode.id === 'recon' ? 'Discovery' : 'Portfolio'}
                            </h3>
                            <h3
                              className="text-6xl leading-none tracking-tight text-white"
                              style={{
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontWeight: '100'
                              }}
                            >
                              {mode.id === 'recon' ? 'Engine' : 'Management'}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Minimalist Icon */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${mode.accentColor}15` }}>
                          <Icon className="w-6 h-6" style={{ color: mode.accentColor }} />
                        </div>
                        <div className="h-px flex-1" style={{ backgroundColor: `${mode.accentColor}20` }} />
                      </div>

                      {/* Clean Description */}
                      <p
                        className="text-base text-gray-300 leading-relaxed max-w-md"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {mode.description}
                      </p>
                    </div>

                    {/* Capability Grid */}
                    <div className="grid grid-cols-1 gap-1">
                      {mode.capabilities.map((capability, index) => (
                        <div key={index} className="flex items-center gap-4 py-1">
                          <capability.icon className="w-4 h-4 opacity-70" style={{ color: mode.accentColor }} />
                          <span
                            className="text-sm font-medium text-gray-200"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
                          >
                            {capability.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-16 mb-12 text-center">
            <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
              © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

export const platformRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform',
  component: PlatformComponent,
});

export default platformRoute;