import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { formatDistanceToNow } from '../utils/formatTime';
import { Trash2 } from 'lucide-react';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export default function MessageBubble({ message, showAvatar, prevSameSender }) {
  const { currentUser, allUsers: ctxUsers } = useAuth();
  const { toggleReaction, deleteMessage, allUsers } = useChat();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const bubbleRef = useRef(null);

  const isOwn = message.senderId === currentUser?.uid;
  const reactions = message.reactions || {};
  const readBy = message.readBy || {};

  // Find display names of readers (excluding self)
  const readers = Object.keys(readBy)
    .filter((uid) => uid !== currentUser?.uid && uid !== message.senderId)
    .map((uid) => {
      const u = (allUsers || []).find((u) => u.uid === uid);
      return u?.displayName || 'Someone';
    });

  const handleReactionClick = (e) => {
    e.preventDefault();
    const rect = bubbleRef.current?.getBoundingClientRect();
    setPickerPos({
      x: isOwn ? -8 : 8,
      y: -(48 + 8),
    });
    setShowPicker((v) => !v);
  };

  const handlePickEmoji = (emoji) => {
    toggleReaction(message.id, emoji);
    setShowPicker(false);
  };

  const handleDeleteMessage = async () => {
    setIsDeleting(true);
    try {
      await deleteMessage(message.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!showActions) return;
    const handler = (e) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showActions]);

  return (
    <div
      className={`
        flex items-end gap-2 px-4 group
        ${isOwn ? 'flex-row-reverse' : 'flex-row'}
        ${prevSameSender ? 'mt-0.5' : 'mt-3'}
      `}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-8 ${!showAvatar ? 'invisible' : ''}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-slate-100 dark:bg-slate-800 select-none">
          {message.senderPhoto || '🦊'}
        </div>
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name (only for others, first in run) */}
        {!isOwn && showAvatar && (
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1">
            {message.senderName}
          </p>
        )}

        {/* Bubble wrapper for positioning reaction picker */}
        <div ref={bubbleRef} className="relative">
          {/* Hover reaction trigger and delete */}
          <div className={`
            absolute top-1/2 -translate-y-1/2 z-10 flex gap-1.5 
            transition-all duration-150
            ${showActions 
              ? 'opacity-100 scale-100 visible' 
              : 'opacity-0 scale-95 invisible md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:visible'
            }
            ${isOwn ? 'right-full mr-2.5' : 'left-full ml-2.5'}
          `}>
            <button
              id={`react-btn-${message.id}`}
              onClick={handleReactionClick}
              className={`
                text-base leading-none p-1 rounded-full
                bg-white dark:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-600
                hover:scale-110 active:scale-95 transition-transform
              `}
              aria-label="Add reaction"
            >
              😊
            </button>
            
            {/* Delete button (only for own messages) */}
            {isOwn && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`
                  text-base leading-none p-1 rounded-full
                  bg-white dark:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-600
                  hover:scale-110 active:scale-95 transition-transform
                  hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-600
                `}
                aria-label="Delete message"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            )}
          </div>

          {/* Emoji quick-pick popover */}
          {showPicker && (
            <div
              className={`
                absolute z-20 flex gap-1 p-2 rounded-2xl shadow-xl
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                bottom-full mb-2
                ${isOwn ? 'right-0' : 'left-0'}
              `}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handlePickEmoji(emoji)}
                  className="text-xl p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-125 transition-all"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message bubble */}
          <div
            onClick={() => setShowActions((v) => !v)}
            className={`
              px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words cursor-pointer select-text
              ${isOwn
                ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white rounded-br-md shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md shadow-sm'
              }
            `}
          >
            {message.text}
          </div>
        </div>

        {/* Reactions bar */}
        {Object.keys(reactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactions).map(([emoji, uids]) =>
              uids.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(message.id, emoji)}
                  className={`
                    flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                    transition-all hover:scale-110 active:scale-95
                    ${uids.includes(currentUser?.uid)
                      ? 'bg-brand-100 dark:bg-brand-900/40 border border-brand-400 text-brand-700 dark:text-brand-300'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold">{uids.length}</span>
                </button>
              ) : null
            )}
          </div>
        )}

        {/* Timestamp + read receipts */}
        <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {message.timestamp?.toDate
              ? formatDistanceToNow(message.timestamp.toDate())
              : 'just now'}
          </span>
          {isOwn && readers.length > 0 && (
            <span
              className="text-[10px] text-brand-500 font-medium"
              title={`Read by: ${readers.join(', ')}`}
            >
              ✓✓ {readers.length}
            </span>
          )}
          {isOwn && readers.length === 0 && (
            <span className="text-[10px] text-slate-400">✓</span>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete message?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This message will be deleted from both sides and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
