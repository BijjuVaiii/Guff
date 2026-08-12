import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/chat');
    } catch (err) {
      if (err.message === 'ACCESS_DENIED') {
        navigate('/access-denied');
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password. Double-check and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-light dark:bg-mesh-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30 animate-pulse">
            <span className="text-white text-xl">⚡</span>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-light dark:bg-mesh-dark px-4 transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div
        className="
          relative w-full max-w-md rounded-3xl shadow-2xl
          glass px-8 py-10
          animate-[scale-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_forwards]
        "
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/30 mb-4">
            <Zap className="text-white" size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-800 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to Guff — your private corner of the internet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="
                w-full px-4 py-3 rounded-xl text-sm
                bg-white/60 dark:bg-slate-700/60
                border border-slate-200 dark:border-slate-600
                text-slate-800 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500
                transition-all duration-200
              "
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="
                  w-full px-4 py-3 pr-11 rounded-xl text-sm
                  bg-white/60 dark:bg-slate-700/60
                  border border-slate-200 dark:border-slate-600
                  text-slate-800 dark:text-slate-100
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500
                  transition-all duration-200
                "
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                flex items-center gap-2 px-4 py-3 rounded-xl text-sm
                bg-red-50 dark:bg-red-900/30
                border border-red-200 dark:border-red-700
                text-red-600 dark:text-red-400
              "
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-2 px-6 py-3 mt-2 rounded-xl
              bg-gradient-to-r from-brand-500 to-violet-600
              hover:from-brand-600 hover:to-violet-700
              text-white font-semibold text-sm
              shadow-lg shadow-brand-500/30
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
            "
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          New to Guff?{' '}
          <Link
            to="/signup"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Made by your Buddy - Bijay🗿
        </p>
      </div>
    </div>
  );
}
