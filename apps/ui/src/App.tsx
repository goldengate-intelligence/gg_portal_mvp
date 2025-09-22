import { Link } from '@tanstack/react-router'
import { useAuth } from './contexts/auth-context'
import { Button } from './components/ui/button'
import { HeroText } from './components/HeroText'
import { CONTRACTOR_DETAIL_COLORS } from './logic/utils'
import { Building2, Bot, Shield } from 'lucide-react'

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen w-full text-white overflow-hidden pt-32 pb-6 bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90">
      <div className="h-full flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center">
          <HeroText />
          <h2 className="text-gray-400 mb-6 hero-subtext" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '20px' }}>
            Forensic Relational Data & Performance Analytics
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center group">
              <Button asChild className="bg-[#D2AC38] group-hover:bg-transparent group-hover:border group-hover:border-[#D2AC38] group-hover:text-[#D2AC38] hover:bg-[#D2AC38]/80 text-black text-lg px-8 py-4 transition-all duration-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#D2AC38] text-[#D2AC38] hover:bg-[#D2AC38] hover:text-black text-lg px-8 py-4 transition-all duration-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Link to="/register">
                  Create Account
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#D2AC38]/20 border border-[#D2AC38]/40 rounded-xl">
                <Building2 className="w-6 h-6 text-[#D2AC38]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-4 text-[#D2AC38] uppercase" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>Multi-Tenant</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Enterprise-grade infrastructure designed for streamlined deployment.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#D2AC38]/20 border border-[#D2AC38]/40 rounded-xl">
                <Bot className="w-6 h-6 text-[#D2AC38]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-4 text-[#D2AC38] uppercase" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>Agent Native</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Intelligent architecture optimized for autonomous workflows.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#D2AC38]/20 border border-[#D2AC38]/40 rounded-xl">
                <Shield className="w-6 h-6 text-[#D2AC38]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-4 text-[#D2AC38] uppercase" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>Elite Governance</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Zero-trust security framework with advanced access controls.
            </p>
          </div>
        </div>

        <div className="mt-14 text-center mb-32">
          <p className="uppercase tracking-wider" style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#D2AC38' }}>
            © 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}

export default App