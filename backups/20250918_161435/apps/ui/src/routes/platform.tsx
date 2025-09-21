import { createRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/protected-route';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { 
  Search, 
  Target, 
  BarChart3, 
  User, 
  Snowflake,
  Shield,
  Crosshair,
  Radio,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  Cpu,
  Radar,
  Navigation,
  Command,
  Zap,
  Globe,
  Terminal,
  Settings,
  FolderOpen
} from 'lucide-react';
import { IdentifyTargets } from './platform/identify';
import { ViewPortfolio } from './platform/portfolio';
import { PlatformFooter } from '../components/platform/PlatformFooter';
import { HudCard, TargetReticle } from '../components/ui/hud-card';

type PlatformMode = 'recon' | 'assets';

function PlatformComponent() {
  const [activeMode, setActiveMode] = useState<PlatformMode>('recon');
  const { user, logout } = useAuth();
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const modes = [
    {
      id: 'recon' as const,
      label: 'IDENTIFY ENTITIES',
      codename: 'RECON',
      description: 'Discover and research federal contractors',
      icon: Crosshair,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500',
      status: 'READY',
      clearance: 'L3'
    },
    {
      id: 'assets' as const,
      label: 'VIEW PORTFOLIO',
      codename: 'ASSETS',
      description: 'Manage your tracked contractors',
      icon: FolderOpen,
      color: 'text-gray-400',
      bgColor: 'bg-gray-800/50',
      borderColor: 'border-gray-700',
      status: 'READY',
      clearance: 'L2'
    },
  ];

  const renderModeContent = () => {
    switch (activeMode) {
      case 'recon':
        return <IdentifyTargets />;
      case 'assets':
        return <ViewPortfolio />;
      // Legacy fallbacks during transition
      case 'identify':
        return <IdentifyTargets />;
      case 'portfolio':
        return <ViewPortfolio />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 tactical-grid" />
          <div className="absolute inset-0 hex-pattern opacity-5" />
        </div>

        {/* Top Command Bar - Hybrid Luxury/HUD Style */}
        <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-gray-800 z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5" />
          
          {/* Alert Status Strip */}
          <div className="bg-gray-950/50 px-6 py-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-3 w-3 text-green-400 animate-pulse" />
                  <span className="text-green-400">SYSTEM: {systemStatus}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">{time.toTimeString().split(' ')[0]} UTC</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">V.1.2.2_GGI</span>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Logo - Matching Header.tsx Style */}
                <div className="font-michroma text-yellow-500 text-3xl">
                  Goldengate
                </div>

              </div>
              
              {/* User Panel */}
              <div className="flex items-center">
                <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-mono uppercase">OPERATOR</p>
                      <p className="text-sm font-light text-white">
                        {user?.fullName || user?.username}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <button className="text-xs text-gray-400 font-mono uppercase hover:text-gray-300">
                        <Settings className="w-3 h-3 inline mr-1" />
                        User Settings
                      </button>
                      <span className="text-gray-600">|</span>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-red-400 font-mono uppercase hover:text-red-300"
                      >
                        <Lock className="w-3 h-3 inline mr-1" />
                        Secure Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>


        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative min-h-0 pt-[140px]"> {/* Added top padding for fixed header */}
          <div className="absolute inset-0 data-stream opacity-5" />
          
          {/* Mission Control Panel - Now scrollable */}
          <div className="relative bg-gray-900/80 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />
            
            <div className="container mx-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-6 w-full">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;
                  
                  return (
                    <HudCard
                      key={mode.id}
                      variant={isActive ? 'warning' : 'default'}
                      priority={isActive ? 'high' : 'medium'}
                      targetLocked={isActive}
                      className="cursor-pointer transform transition-all hover:scale-[1.02] bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-xl"
                    >
                      <button
                        onClick={() => setActiveMode(mode.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${isActive ? 'bg-yellow-500/20' : 'bg-gray-800/50'} border ${isActive ? 'border-yellow-500/30' : 'border-gray-700'}`}>
                              <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
                                {mode.codename}
                              </p>
                              <h3 className={`font-orbitron text-sm font-semibold uppercase tracking-wide ${isActive ? 'text-yellow-400' : 'text-gray-300'}`}>
                                {mode.label}
                              </h3>
                            </div>
                          </div>
                          
                        </div>
                        
                        <p className="text-xs text-gray-400 font-mono mb-3">
                          {mode.description}
                        </p>
                        
                        {/* Status Bar */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                            <span className="text-xs text-green-400 font-mono uppercase">{mode.status}</span>
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-yellow-400 font-mono">ENGAGED</span>
                            </div>
                          )}
                        </div>
                      </button>
                    </HudCard>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Mission Content */}
          <div className="container mx-auto px-6 py-6 max-w-7xl relative z-10">
            <div className="boot-sequence">
              {renderModeContent()}
            </div>
          </div>
        </div>

        {/* Platform Footer */}
        <PlatformFooter mode={activeMode} contextInfo="US-EAST-1" />
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