import { Link } from '@tanstack/react-router'
import { useAuth } from './contexts/auth-context'
import { Button } from './components/ui/button'

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="hero-tagline text-6xl font-bold mb-2">
            <span className="logo-text">GoldenGate</span>
          </h1>
          <h2 className="midas-text text-3xl text-yellow-500 mb-8">
            Midas Platform
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-aptos">
            Autonomous Intelligence for Institutional Allocators - An agent-native platform for AI orchestration and management with multi-tenant architecture
          </p>

          {isAuthenticated ? (
            <div className="bg-medium-gray border border-yellow-500/20 p-8 rounded-lg max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4 font-aptos">
                Welcome back, {user?.fullName || user?.username}!
              </h2>
              <p className="text-gray-300 mb-6 font-aptos">
                You are logged in as: <span className="text-yellow-500 font-semibold">{user?.role}</span>
              </p>
              <div className="flex gap-3">
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-aptos">
                  <Link to="/platform">
                    Launch Platform
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-aptos">
                  <Link to="/dashboard">
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-aptos">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-aptos">
                <Link to="/register">
                  Create Account
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-medium-gray border border-dark-gray p-6 rounded-lg hover:border-yellow-500 transition-colors">
              <h3 className="text-lg font-semibold text-yellow-500 mb-3 font-aptos">Multi-Tenant</h3>
              <p className="text-gray-300 font-aptos">
                Built with multi-tenancy from the ground up for enterprise scalability
              </p>
            </div>
            <div className="bg-medium-gray border border-dark-gray p-6 rounded-lg hover:border-yellow-500 transition-colors">
              <h3 className="text-lg font-semibold text-yellow-500 mb-3 font-aptos">Agent Native</h3>
              <p className="text-gray-300 font-aptos">
                Designed specifically for AI agent orchestration and management
              </p>
            </div>
            <div className="bg-medium-gray border border-dark-gray p-6 rounded-lg hover:border-yellow-500 transition-colors">
              <h3 className="text-lg font-semibold text-yellow-500 mb-3 font-aptos">OAuth 2.0</h3>
              <p className="text-gray-300 font-aptos">
                Secure authentication with industry-standard OAuth 2.0 implementation
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
