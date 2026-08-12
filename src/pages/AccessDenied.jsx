import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-light dark:bg-mesh-dark px-4 transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div
        className="
          relative w-full max-w-md rounded-3xl shadow-2xl glass px-8 py-12 text-center
          animate-[scale-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_forwards]
        "
      >
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30 mb-6">
          <ShieldOff className="text-white" size={36} strokeWidth={2} />
        </div>

        <h1 className="text-3xl font-bold font-display text-slate-800 dark:text-white tracking-tight mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
          Your account <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.email}</span> is not on the guest list.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-8">
          Guff is a private app for a specific group of friends. If you think this is a mistake, reach out to the admin.
        </p>

        {/* Animated lock dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-red-400"
              style={{ animation: `pulse-subtle 1.5s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            id="access-denied-back-btn"
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
              bg-gradient-to-r from-red-500 to-orange-500
              hover:from-red-600 hover:to-orange-600
              text-white font-semibold text-sm
              shadow-lg shadow-red-500/20
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
            "
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
