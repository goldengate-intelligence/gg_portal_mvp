import { Link, useLocation } from '@tanstack/react-router'
import { useAuth } from '../contexts/auth-context'
import { Button } from './ui/button'
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  // Dynamic header background based on current page
  const getHeaderBackground = () => {
    const pathname = location.pathname
    if (pathname.includes('/platform/discovery')) {
      return '#000000' // Pure black for discovery
    }
    if (pathname.includes('/platform/portfolio')) {
      return '#000000' // Pure black for portfolio
    }
    if (pathname.includes('/login') || pathname.includes('/register')) {
      return '#000000' // Pure black for login and register pages
    }
    if (pathname === '/') {
      return 'transparent' // Transparent for homepage only
    }
    if (pathname === '/dashboard') {
      return '#000000' // Pure black for dashboard
    }
    if (pathname.includes('/contractor-detail')) {
      return '#000000' // Black for contractor detail pages
    }
    if (pathname === '/platform') {
      return '#000000' // Pure black for platform page
    }
    return CONTRACTOR_DETAIL_COLORS.backgroundColor // Default for other pages
  }

  const handleLogout = async () => {
    await logout()
    // Stay on current page after logout instead of redirecting to login
  }

  return (
    <header className="px-6 py-4 border-b border-gray-600/20 fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: getHeaderBackground() }}>
      <nav className="flex items-baseline justify-between text-white">
        <div className="flex items-baseline">
          <div className="py-1 text-[#D2AC38] mr-6 text-2xl" style={{ fontFamily: 'Michroma, sans-serif' }}>
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
            <div className="flex items-baseline gap-4">
              <div className="py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span className="text-gray-300 header-nav-text">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>
              <div className="py-1 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span
                  onClick={handleLogout}
                  className="text-red-500 hover:brightness-125 transition-all cursor-pointer header-nav-text"
                >
                  Sign Out
                </span>
              </div>
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