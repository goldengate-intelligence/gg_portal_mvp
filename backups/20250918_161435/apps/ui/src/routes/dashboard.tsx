import { createRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/protected-route';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils';

function DashboardComponent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
        <nav className="border-b border-gray-600/20" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.bannerColor }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-6">
                <h1 className="text-xl text-white" style={{ fontFamily: 'Michroma, sans-serif' }}>GoldenGate Dashboard</h1>
                <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-black" style={{ fontFamily: 'Genos, sans-serif' }}>
                  <Link to="/platform">Go to Platform</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300" style={{ fontFamily: 'Genos, sans-serif' }}>Welcome, {user?.fullName || user?.username}</span>
                <span className="text-sm text-yellow-500" style={{ fontFamily: 'Genos, sans-serif' }}>({user?.role})</span>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                  style={{ fontFamily: 'Genos, sans-serif' }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Main Panel */}
            <div className="bg-gray-900/30 border border-gray-600/20 rounded-lg p-8 backdrop-blur-sm relative overflow-hidden">
              {/* Scanning line effect */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
              
              <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Genos, sans-serif' }}>Dashboard</h2>
              
              {/* User Information Container */}
              <div className="rounded-lg p-6 relative overflow-hidden border border-gray-600/20" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                {/* Container scanning line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
                
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-500/20" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-500/20" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-500/20" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-500/20" />
                
                {/* TRACKING Indicator */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                  <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                    TRACKING
                  </span>
                </div>
                <h3 className="text-xl font-medium text-gray-200 mb-4 tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>User Information</h3>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Full Name</dt>
                    <dd className="text-sm text-white mt-1">{user?.fullName || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Username</dt>
                    <dd className="text-sm text-white mt-1">{user?.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Email</dt>
                    <dd className="text-sm text-white mt-1">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Role</dt>
                    <dd className="text-sm text-yellow-500 mt-1 capitalize">{user?.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Tenant ID</dt>
                    <dd className="text-sm text-gray-300 font-mono mt-1 text-xs">{user?.tenantId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Organization ID</dt>
                    <dd className="text-sm text-gray-300 font-mono mt-1 text-xs">{user?.organizationId}</dd>
                  </div>
                </dl>
              </div>
              
              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Midas Platform Card */}
                <div className="bg-gray-900/30 border border-gray-600/20 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden hover:border-gray-500/30 transition-all duration-300 group">
                  {/* Scanning line effect */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
                  
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gray-500/20" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gray-500/20" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gray-500/20" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gray-500/20" />
                  
                  <h4 className="text-lg font-semibold text-gray-200 mb-2 tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>Midas Platform</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Access the main federal contracting intelligence platform
                  </p>
                  <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-black w-full" style={{ fontFamily: 'Genos, sans-serif' }}>
                    <Link to="/platform">Launch Platform</Link>
                  </Button>
                </div>
                
                {/* Agent Management Card */}
                <div className="bg-gray-900/30 border border-gray-600/20 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden hover:border-gray-500/30 transition-all duration-300 group">
                  {/* Scanning line effect */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
                  
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gray-500/20" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gray-500/20" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gray-500/20" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gray-500/20" />
                  
                  <h4 className="text-lg font-semibold text-gray-200 mb-2 tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>Agent Management</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    View and manage your AI agents
                  </p>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white w-full" style={{ fontFamily: 'Genos, sans-serif' }}>
                    View Agents
                  </Button>
                </div>
                
                {/* Analytics Card */}
                <div className="bg-gray-900/30 border border-gray-600/20 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden hover:border-gray-500/30 transition-all duration-300 group">
                  {/* Scanning line effect */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
                  
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gray-500/20" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gray-500/20" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gray-500/20" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gray-500/20" />
                  
                  <h4 className="text-lg font-semibold text-gray-200 mb-2 tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>Analytics</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    View platform usage and insights
                  </p>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white w-full" style={{ fontFamily: 'Genos, sans-serif' }}>
                    View Analytics
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export const dashboardRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardComponent,
});

export default dashboardRoute;