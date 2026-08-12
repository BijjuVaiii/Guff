import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', displayName: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.displayName.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await signup(form.email.trim(), form.displayName.trim(), form.password);
      navigate('/chat');
    } catch (err) {
      if (err.message === 'ACCESS_DENIED') {
        navigate('/access-denied');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
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
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-3xl" />
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
            Join Guff
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Invite-only. Your crew is waiting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Display name
            </label>
            <input
              id="signup-name"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              value={form.displayName}
              onChange={handleChange}
              placeholder="What do your friends call you?"
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

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              name="confirm"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="signup-submit-btn"
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
              <UserPlus size={16} />
            )}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold transition-colors">
            Sign in
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
