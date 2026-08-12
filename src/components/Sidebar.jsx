import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import {
  LogOut, Sun, Moon, Hash, MessageCircle, Users, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

export default function Sidebar({ onClose }) {
  const { userProfile, logout, currentUser } = useAuth();
  const { rooms, allUsers, activeRoom, setActiveRoom, openDM } = useChat();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const groupRoom = rooms.find((r) => r.type === 'group');
  const dmRooms = rooms.filter((r) => r.type === 'dm');

  const getDMPartner = (room) => {
    const partnerUid = room.members?.find((uid) => uid !== currentUser?.uid);
    return allUsers.find((u) => u.uid === partnerUid);
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    onClose?.();
  };

  const handleOpenDM = async (user) => {
    await openDM(user);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header / Logo */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/30">
          <Zap size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold font-display text-slate-800 dark:text-white tracking-tight">
          Guff
        </span>
        <div className="ml-auto flex items-center gap-1">
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">

        {/* ── Group Chat ─────────────────────────── */}
        <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Channels
        </p>

        {groupRoom && (
          <RoomButton
            id="group-chat-btn"
            icon={<Hash size={15} />}
            label={groupRoom.name || 'Boys'}
            active={activeRoom?.id === groupRoom.id}
            preview={groupRoom.lastMessage?.text}
            onClick={() => handleSelectRoom(groupRoom)}
          />
        )}

        {/* ── Direct Messages ──────────────────────*/}
        <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Direct Messages
        </p>

        {dmRooms.map((room) => {
          const partner = getDMPartner(room);
          if (!partner) return null;
          return (
            <RoomButton
              key={room.id}
              id={`dm-room-${room.id}`}
              icon={
                <span className="text-base leading-none">{partner.photoURL || '🦊'}</span>
              }
              label={partner.displayName || 'Friend'}
              active={activeRoom?.id === room.id}
              preview={room.lastMessage?.text}
              status={partner.status}
              onClick={() => handleSelectRoom(room)}
            />
          );
        })}

        {/* ── Members / Online Status ──────────────*/}
        <div className="pt-4">
          <button
            id="toggle-members-btn"
            onClick={() => setShowMembers((v) => !v)}
            className="
              w-full flex items-center px-3 pb-1.5
              text-[10px] font-semibold uppercase tracking-widest
              text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              transition-colors
            "
          >
            <Users size={11} className="mr-1.5" />
            Members — {allUsers.filter((u) => u.status === 'online').length} online
            <span className="ml-auto">
              {showMembers ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </span>
          </button>

          {showMembers && (
            <div className="space-y-0.5 mt-1">
              {allUsers
                .filter((u) => u.uid !== currentUser?.uid)
                .sort((a, b) => (a.status === 'online' ? -1 : 1))
                .map((user) => (
                  <button
                    key={user.uid}
                    id={`member-dm-btn-${user.uid}`}
                    onClick={() => handleOpenDM(user)}
                    className="
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                      text-left text-sm
                      text-slate-600 dark:text-slate-400
                      hover:bg-slate-100 dark:hover:bg-slate-800
                      hover:text-slate-800 dark:hover:text-slate-200
                      transition-all duration-150 group
                    "
                  >
                    <div className="relative shrink-0">
                      <span className="text-xl leading-none">{user.photoURL || '🦊'}</span>
                      <span
                        className={`
                          absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                          border-2 border-white dark:border-slate-900
                          ${user.status === 'online' ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}
                        `}
                      />
                    </div>
                    <span className="font-medium truncate flex-1">{user.displayName}</span>
                    <MessageCircle
                      size={13}
                      className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                    />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Current User Profile + Logout ─────────── */}
      <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className="relative shrink-0">
            <span className="text-2xl leading-none">{userProfile?.photoURL || '🦊'}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {userProfile?.displayName || 'You'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {userProfile?.email}
            </p>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
        <div className="text-center mt-3 mb-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Made by your Buddy - Bijay🗿
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Reusable room button ──────────────────────────────────────────────────────
function RoomButton({ id, icon, label, active, preview, status, onClick }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left
        transition-all duration-150 group relative
        ${active
          ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
      )}
      <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
        {icon}
        {status !== undefined && (
          <span
            className={`
              absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900
              ${status === 'online' ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}
            `}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {preview && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {preview}
          </p>
        )}
      </div>
    </button>
  );
}
