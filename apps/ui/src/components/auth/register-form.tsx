import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { useRouter } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName || undefined,
        companyName: formData.companyName || undefined,
      });
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#D2AC38]/80" style={{ fontFamily: 'Genos, sans-serif' }}>
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-[#D2AC38]/80" style={{ fontFamily: 'Genos, sans-serif' }}>
                Company Name (Optional)
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#D2AC38]/80" style={{ fontFamily: 'Genos, sans-serif' }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
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
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#D2AC38]/80" style={{ fontFamily: 'Genos, sans-serif' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm"
                style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}