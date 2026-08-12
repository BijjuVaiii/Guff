import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext(null);

let notifIdCounter = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Request HTML5 Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = useCallback(({ title, body, type = 'info', duration = 5000 }) => {
    const id = ++notifIdCounter;
    setNotifications((prev) => [...prev, { id, title, body, type }]);

    // Dispatch HTML5 OS notification if the app is in the background
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (err) {
        console.warn('Failed to dispatch HTML5 Notification', err);
      }
    }

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationToasts notifications={notifications} onDismiss={removeNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationToasts({ notifications, onDismiss }) {
  if (!notifications.length) return null;

  const iconMap = {
    info: '💬',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div
      id="notification-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: '340px' }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className="
            pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl
            bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl
            border border-white/30 dark:border-white/10
            text-slate-800 dark:text-slate-100
            animate-[fade-in-up_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]
          "
          style={{ minWidth: '280px' }}
        >
          <span className="text-2xl leading-none mt-0.5 shrink-0">{iconMap[n.type]}</span>
          <div className="flex-1 min-w-0">
            {n.title && (
              <p className="font-semibold text-sm truncate">{n.title}</p>
            )}
            {n.body && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {n.body}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            className="
              shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
              transition-colors text-lg leading-none mt-0.5 cursor-pointer
            "
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside <NotificationProvider>');
  return ctx;
}
