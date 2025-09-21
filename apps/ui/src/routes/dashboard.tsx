import { createRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/protected-route';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils';
import { User, UserCircle, Settings, Shield, Bell, HelpCircle, Bot, BarChart3 } from 'lucide-react';

function DashboardComponent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const userSettings = [
    { label: 'Profile Settings', icon: User, description: 'Manage your personal information and preferences' },
    { label: 'Account Security', icon: Shield, description: 'Update password and security settings' },
    { label: 'Agent Automation', icon: Bot, description: 'Configure AI agents and automated workflows' },
    { label: 'Usage Analytics', icon: BarChart3, description: 'View platform usage metrics and insights' },
    { label: 'Notifications', icon: Bell, description: 'Configure email and system notifications' },
    { label: 'Help & Support', icon: HelpCircle, description: 'Access documentation and support resources' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white pb-20" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
        <div className="container mx-auto px-6 py-12">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#D2AC38]/20 to-orange-600/20 border border-[#D2AC38]/40 rounded-xl backdrop-blur-sm">
                <UserCircle className="w-8 h-8 text-[#D2AC38]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Michroma, sans-serif' }}>
                  Dashboard
                </h1>
                <p className="text-gray-400">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Information */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-gradient-to-br from-black/90 via-gray-900/50 to-black/90 border border-[#4EC9B0]/30 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-6">Account Information</h3>
                <dl className="space-y-4">
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
                    <dd className="text-sm text-[#D2AC38] mt-1 capitalize font-medium">{user?.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Tenant ID</dt>
                    <dd className="text-sm text-gray-300 font-sans mt-1 text-xs">{user?.tenantId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Organization ID</dt>
                    <dd className="text-sm text-gray-300 font-sans mt-1 text-xs">{user?.organizationId}</dd>
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

            {/* Settings & Quick Actions */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-black/90 via-gray-900/50 to-black/90 border border-[#4EC9B0]/30 rounded-xl backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-6">Settings & Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userSettings.map((setting, index) => (
                      <div key={setting.label} className="p-4 bg-black/40 border border-gray-700/30 rounded-lg hover:border-[#4EC9B0]/30 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <setting.icon className="w-5 h-5 text-[#4EC9B0] mt-0.5 group-hover:text-[#D2AC38] transition-colors" />
                          <div>
                            <h4 className="text-sm font-medium text-white group-hover:text-[#D2AC38] transition-colors">
                              {setting.label}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Platform Access */}
                <div className="p-6 bg-gradient-to-br from-black/90 via-gray-900/50 to-black/90 border border-[#D2AC38]/30 rounded-xl backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-6">Quick Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button asChild className="bg-[#F97316] hover:bg-[#F97316]/80 text-white">
                      <Link to="/platform/discovery">Discovery Engine</Link>
                    </Button>
                    <Button asChild className="bg-[#8B8EFF] hover:bg-[#8B8EFF]/80 text-white">
                      <Link to="/platform/portfolio">Portfolio Management</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export const dashboardRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardComponent,
});

export default dashboardRoute;