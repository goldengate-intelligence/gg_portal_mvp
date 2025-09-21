import { Link } from '@tanstack/react-router'
import { useAuth } from './contexts/auth-context'
import { Button } from './components/ui/button'
import { HeroText } from './components/HeroText'
import { CONTRACTOR_DETAIL_COLORS } from './lib/utils'

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center">
          <HeroText />
          <h2 className="text-gray-400 mb-8 hero-subtext uppercase" style={{ fontFamily: 'Michroma, sans-serif', fontSize: '12px' }}>
            FEDERAL SUPPLY CHAIN & PERFORMANCE ANALYTICS
          </h2>

          {isAuthenticated ? (
            <div className="flex justify-center">
              <Button asChild className="bg-[#D2AC38] hover:bg-[#D2AC38]/80 text-black text-lg px-8 py-4">
                <Link to="/platform">
                  Launch Platform
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-[#D2AC38] hover:bg-[#D2AC38]/80 text-black" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#D2AC38] text-[#D2AC38] hover:bg-[#D2AC38] hover:text-black" style={{ fontFamily: 'Genos, sans-serif' }}>
                <Link to="/register">
                  Create Account
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur">
            <h3 className="text-lg font-semibold mb-4 text-[#D2AC38] uppercase" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>Multi-Tenant</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Enterprise-grade infrastructure designed for streamlined deployment.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur">
            <h3 className="text-lg font-semibold mb-4 text-[#D2AC38] uppercase" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>Agent Native</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Intelligent architecture optimized for autonomous workflows.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur">
            <h3 className="text-lg font-semibold mb-4 text-[#D2AC38] uppercase" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>Elite Governance</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Zero-trust security framework with advanced access controls.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App