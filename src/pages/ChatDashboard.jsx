import { useState, useEffect, useRef, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

// Sub-components
import Sidebar from '../components/Sidebar';
import ChatRoom from '../components/ChatRoom';
import { Menu, X } from 'lucide-react';

export default function ChatDashboard() {
  const { currentUser, userProfile } = useAuth();
  const { activeRoom, rooms } = useChat();
  const { addNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prevRoomsRef = useRef(new Map());

  // Global notifications for all rooms (DMs and Groups)
  useEffect(() => {
    rooms.forEach((room) => {
      const prevRoom = prevRoomsRef.current.get(room.id);
      
      if (!prevRoom) {
        prevRoomsRef.current.set(room.id, room);
        return;
      }

      const prevTime = prevRoom.lastMessage?.timestamp?.toMillis?.() || 0;
      const currTime = room.lastMessage?.timestamp?.toMillis?.() || 0;

      if (currTime > prevTime && room.lastMessage?.senderId !== currentUser?.uid) {
        const isBackground = document.hidden;
        const isNotActiveRoom = !activeRoom || activeRoom.id !== room.id;

        if (isBackground || isNotActiveRoom) {
          let title = room.type === 'group' ? room.name : room.lastMessage.senderName;
          if (room.type === 'group') {
            title += ` (${room.lastMessage.senderName})`;
          }
          
          addNotification({
            title,
            body: room.lastMessage.text.length > 80 ? room.lastMessage.text.slice(0, 80) + '…' : room.lastMessage.text,
            type: 'info',
          });
        }
      }

      prevRoomsRef.current.set(room.id, room);
    });
  }, [rooms, activeRoom, currentUser, addNotification]);

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30 md:z-auto
          h-full w-72 shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile top bar (only shown when no active room is selected) */}
        {!activeRoom && (
          <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="font-semibold text-slate-800 dark:text-white text-sm truncate">
              Guff
            </span>
          </header>
        )}

        {/* Chat area */}
        <main className="flex-1 min-h-0 flex flex-col h-full">
          {activeRoom ? (
            <ChatRoom onToggleSidebar={() => setSidebarOpen(true)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <p className="text-5xl mb-4">💬</p>
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white mb-2">
                Select a chat to start talking
              </h2>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Pick a room or a friend from the sidebar on the left
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
