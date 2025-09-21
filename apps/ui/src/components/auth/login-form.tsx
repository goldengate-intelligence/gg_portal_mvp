import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { useRouter } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
      <div className="max-w-md w-full space-y-8 border border-gray-700/30 rounded-lg p-8" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColorHex }}>
        <div className="text-center">
          <h1 className="text-[#D2AC38] text-2xl mb-2" style={{ fontFamily: 'Michroma, sans-serif' }}>Goldengate</h1>
          <h2 className="text-white text-xl" style={{ fontFamily: 'Genos, sans-serif' }}>
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#D2AC38]/80" style={{ fontFamily: 'Genos, sans-serif' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#D2AC38]/80" style={{ fontFamily: 'Genos, sans-serif' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900 border border-red-800 p-4">
              <div className="text-sm text-red-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{error}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D2AC38] hover:bg-[#D2AC38]/80 text-black"
              style={{ fontFamily: 'Genos, sans-serif' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}