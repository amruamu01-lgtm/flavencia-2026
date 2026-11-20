import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('flavencia2026');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F3F4F6] relative overflow-hidden font-sans">
      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-sm z-10">
        {/* Festival Crest & Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#1E3A5F] flex items-center justify-center shadow-none mb-4">
            <span className="font-serif text-3xl font-extrabold text-white">F</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#1E3A5F] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            FLAVENCIA 2026
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Finance & Accounts
          </h2>

          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mt-1">
            BEYOND BOUNDARIES
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Secure Single Admin Authorization Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4 text-[#1E3A5F]" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] placeholder-gray-400 text-sm focus:bg-white focus:outline-none focus:border-[#1E3A5F] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4 text-[#1E3A5F]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] placeholder-gray-400 text-sm focus:bg-white focus:outline-none focus:border-[#1E3A5F] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-sm bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-all shadow-none flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Sign In to Financial Console
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Button */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-2">First time logging in?</p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-50 text-[#1E3A5F] hover:bg-navy-100 border border-navy-200 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A5F]" />
            Fill Default Admin Credentials (`admin` / `flavencia2026`)
          </button>
        </div>
      </div>
    </div>
  );
};
