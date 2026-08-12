import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login.
 * Redirects non-whitelisted users to /access-denied.
 * Shows a spinner while auth state is being resolved.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading, authStatus } = useAuth();
  const location = useLocation();

  if (loading || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-light dark:bg-mesh-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30 animate-pulse">
            <span className="text-white text-xl">⚡</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading Guff…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authStatus === 'denied') {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
