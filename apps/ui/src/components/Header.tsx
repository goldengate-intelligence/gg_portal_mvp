import { Link } from '@tanstack/react-router'
import { useAuth } from '../contexts/auth-context'
import { Button } from './ui/button'
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <header className="px-6 py-4 border-b border-gray-600/20" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
      <nav className="flex items-baseline justify-between text-white">
        <div className="flex items-baseline">
          <div className="px-3 py-1 text-[#D2AC38] mr-6 text-2xl" style={{ fontFamily: 'Michroma, sans-serif' }}>
            <Link to="/" className="hover:brightness-125 transition-all tracking-tighter">
              Goldengate
            </Link>
          </div>

          {isAuthenticated && (
            <>
              <div className="px-3 py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Link to="/platform" className="text-gray-300 hover:brightness-125 transition-all header-nav-text">
                  Platform
                </Link>
              </div>
              <div className="px-3 py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Link to="/dashboard" className="text-gray-300 hover:brightness-125 transition-all header-nav-text">
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex items-baseline">
          {isAuthenticated ? (
            <div className="px-3 py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span
                onClick={handleLogout}
                className="text-red-500 hover:brightness-125 transition-all cursor-pointer header-nav-text"
              >
                Sign Out
              </span>
            </div>
          ) : (
            <>
              <div className="px-3 py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Link to="/login" className="text-white hover:brightness-125 transition-all">
                  Sign In
                </Link>
              </div>
              <div className="px-3 py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <Link to="/register" className="text-[#D2AC38] hover:brightness-125 transition-all">
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}