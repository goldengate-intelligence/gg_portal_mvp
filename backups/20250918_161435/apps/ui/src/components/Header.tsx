import { Link } from '@tanstack/react-router'
import { useAuth } from '../contexts/auth-context'
import { Button } from './ui/button'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <header className="px-6 py-4 flex gap-4 bg-black text-white justify-between border-b border-dark-gray">
      <nav className="flex flex-row items-center">
        <div className="px-3 py-1 font-michroma text-yellow-500 mr-6">
          <Link to="/" className="hover:text-yellow-400 transition-colors tracking-tighter">
            GoldenGate
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <div className="px-3 py-1 font-aptos">
              <Link to="/platform" className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium">
                Platform
              </Link>
            </div>
            <div className="px-3 py-1 font-aptos">
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </>
        )}

      </nav>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-300 font-aptos">
              Welcome, {user?.fullName || user?.username}
            </span>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="font-aptos"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black font-aptos">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-aptos">
              <Link to="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
