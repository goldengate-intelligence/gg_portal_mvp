import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { useRouter } from '@tanstack/react-router';
import { Button } from '../ui/button';

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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 bg-medium-gray border border-yellow-500/20 rounded-lg p-8">
        <div className="text-center">
          <h1 className="font-michroma text-yellow-500 text-2xl mb-2">GoldenGate</h1>
          <h2 className="font-aptos text-white text-xl">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-yellow-500/80 font-aptos">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-yellow-500/20 bg-black placeholder-yellow-500/40 text-yellow-500 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 sm:text-sm font-aptos"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-yellow-500/80 font-aptos">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-yellow-500/20 bg-black placeholder-yellow-500/40 text-yellow-500 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 sm:text-sm font-aptos"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900 border border-red-800 p-4">
              <div className="text-sm text-red-300 font-aptos">{error}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-aptos"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}