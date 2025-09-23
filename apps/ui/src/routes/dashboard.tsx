import { createRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/protected-route';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../logic/utils';
import { User, UserCircle, Settings, Shield, Bell, HelpCircle, Bot, BarChart3 } from 'lucide-react';

function DashboardComponent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const userSettings = [
    { label: 'Profile Settings', icon: User, description: 'Manage your personal information and preferences', href: '/settings/profile' },
    { label: 'Account Security', icon: Shield, description: 'Update password and security settings', href: '/settings/security' },
    { label: 'Agent Automation', icon: Bot, description: 'Configure AI agents and automated workflows', href: '/settings/agents' },
    { label: 'Usage Analytics', icon: BarChart3, description: 'View platform usage metrics and insights', href: '/settings/analytics' },
    { label: 'Notifications', icon: Bell, description: 'Configure email and system notifications', href: '/settings/notifications' },
    { label: 'Help & Support', icon: HelpCircle, description: 'Access documentation and support resources', href: '/settings/support' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white pb-20 bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 relative">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #D2AC38 1px, transparent 1px),
              linear-gradient(180deg, #D2AC38 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>
        <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
          {/* Dashboard Header */}
          <div className="mb-8 mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#D2AC38]/20 to-orange-600/20 border border-[#D2AC38]/40 rounded-xl backdrop-blur-sm">
                <UserCircle className="w-8 h-8 text-[#D2AC38]" />
              </div>
              <div>
                <h1 className="text-4xl text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '250' }}>
                  Dashboard
                </h1>
                <p className="text-[#D2AC38] font-sans text-sm tracking-wide">
                  ACCOUNT MANAGEMENT • SETTINGS • PREFERENCES
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Information */}
            <div className="lg:col-span-1">
              <div className="h-full border border-gray-700/50 hover:border-gray-600/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative" style={{ backgroundColor: '#111726' }}>
                {/* Gradient background matching contractor-detail */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

                <div className="p-6 relative z-10">
                <h3 className="text-gray-200 mb-6 uppercase tracking-wide font-bold" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>ACCOUNT INFORMATION</h3>
                <div className="p-6 border border-gray-700 rounded-xl relative overflow-hidden" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-white">Full Name</dt>
                    <dd className="text-sm text-gray-400 mt-1">{user?.fullName || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-white">Username</dt>
                    <dd className="text-sm text-gray-400 mt-1">{user?.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-white">Email</dt>
                    <dd className="text-sm text-gray-400 mt-1">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-white">Role</dt>
                    <dd className="text-sm text-gray-400 mt-1 capitalize font-medium">{user?.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-white">Tenant ID</dt>
                    <dd className="text-sm text-gray-400 font-sans mt-1 text-xs">{user?.tenantId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-white">Organization ID</dt>
                    <dd className="text-sm text-gray-400 font-sans mt-1 text-xs">{user?.organizationId}</dd>
                  </div>
                </dl>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Sign Out
                  </Button>
                </div>
                </div>
                </div>
              </div>
            </div>

            {/* Settings & Quick Actions */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="border border-gray-700/50 hover:border-gray-600/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative" style={{ backgroundColor: '#111726' }}>
                  {/* Gradient background matching contractor-detail */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

                  <div className="p-6 relative z-10">
                  <h3 className="text-gray-200 mb-6 uppercase tracking-wide font-bold" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>SETTINGS & PREFERENCES</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userSettings.map((setting, index) => (
                      <Link key={setting.label} to={setting.href} className="p-6 border border-gray-700 hover:border-[#D2AC38]/50 rounded-lg transition-all cursor-pointer group relative overflow-hidden block" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                        <div className="flex items-start gap-3">
                          <setting.icon className="text-[#D2AC38] group-hover:text-[#D2AC38] transition-colors mt-1" style={{ width: '30px', height: '30px' }} />
                          <div>
                            <h4 className="font-medium text-white group-hover:text-[#D2AC38] transition-colors" style={{ fontFamily: 'Michroma, sans-serif', fontSize: '18px' }}>
                              {setting.label}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>

                {/* Quick Platform Access */}
                <div className="h-full border border-gray-700/50 hover:border-gray-600/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative" style={{ backgroundColor: '#111726' }}>
                  {/* Gradient background matching contractor-detail */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>

                  <div className="p-6 relative z-10">
                  <h3 className="text-gray-200 mb-6 uppercase tracking-wide font-bold" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>QUICK ACCESS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button asChild className="bg-[#F97316] hover:bg-[#F97316]/80 text-white font-bold w-full">
                      <Link to="/platform/discovery">DISCOVER ASSETS</Link>
                    </Button>
                    <Button asChild className="bg-[#6366F1] hover:bg-[#6366F1]/80 text-white font-bold w-full">
                      <Link to="/platform/portfolio">VIEW PORTFOLIO</Link>
                    </Button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="mt-16 text-center">
          <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
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