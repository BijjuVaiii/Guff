import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import { Send, Hash, User, Smile, Trash2, Menu } from 'lucide-react';

const EMOJI_PANEL = ['😀','😂','😍','😎','🤔','😅','🥹','😭','🤩','🥳','👀','🙌','🔥','💯','✨','🎉','💀','🫡','💬','❤️','💔','👍','👎','🙏','🫶','💪','🤝','🎊','🚀','⚡'];

export default function ChatRoom({ onToggleSidebar }) {
  const { currentUser, userProfile } = useAuth();
  const { activeRoom, messages, typingUsers, loadingMessages, sendMessage, handleTyping, allUsers, clearChat } = useChat();
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPanelRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on room change
  useEffect(() => {
    inputRef.current?.focus();
    setInputText('');
    setShowEmoji(false);
  }, [activeRoom?.id]);

  // Close emoji panel on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e) => {
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  const handleInput = (e) => {
    setInputText(e.target.value);
    handleTyping();
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;
    const text = inputText;
    setInputText('');
    setSending(true);
    setSendError('');
    try {
      await sendMessage(text);
    } catch (error) {
      console.error('Send error:', error);
      setSendError('Failed to send message. Please try again.');
      setInputText(text); // Restore text on error
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const appendEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      await clearChat();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Room header info
  const roomName = activeRoom?.type === 'group'
    ? (activeRoom.name || 'Boys')
    : (() => {
        const partnerUid = activeRoom?.members?.find((uid) => uid !== currentUser?.uid);
        const partner = allUsers.find((u) => u.uid === partnerUid);
        return partner ? `${partner.photoURL || '🦊'} ${partner.displayName}` : 'Direct Message';
      })();

  const partnerStatus = (() => {
    if (activeRoom?.type !== 'dm') return null;
    const partnerUid = activeRoom?.members?.find((uid) => uid !== currentUser?.uid);
    return allUsers.find((u) => u.uid === partnerUid)?.status ?? null;
  })();

  // Group messages into runs by same sender
  const groupedMessages = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const sameSender = prev?.senderId === msg.senderId;
    const closeInTime = prev?.timestamp && msg.timestamp &&
      (msg.timestamp?.toMillis?.() ?? 0) - (prev.timestamp?.toMillis?.() ?? 0) < 5 * 60 * 1000;
    return {
      ...msg,
      showAvatar: !sameSender || !closeInTime,
      prevSameSender: sameSender && closeInTime,
    };
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* ── Room Header ─────────────────────────────── */}
      <header className="
        flex items-center gap-3 px-4 md:px-5 py-3.5
        border-b border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900 shrink-0
      ">
        {/* Menu toggle for mobile screens */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {activeRoom?.type === 'group'
            ? <Hash size={17} className="text-brand-500 shrink-0" strokeWidth={2.5} />
            : <User size={17} className="text-brand-500 shrink-0" strokeWidth={2.5} />
          }
          <h2 className="font-bold text-slate-800 dark:text-white text-base truncate">
            {roomName}
          </h2>
        </div>
        {partnerStatus && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span className={`w-2 h-2 rounded-full ${partnerStatus === 'online' ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {partnerStatus === 'online' ? 'Online' : 'Offline'}
          </div>
        )}
        {activeRoom?.type === 'group' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">{allUsers.filter((u) => u.status === 'online').length} online</span>
            <span className="sm:hidden">{allUsers.filter((u) => u.status === 'online').length}</span>
          </div>
        )}
        
        {/* Clear chat button */}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="shrink-0 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* ── Messages List ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4" id="messages-list">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-slate-400">Loading messages…</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <p className="text-4xl mb-3">
              {activeRoom?.type === 'group' ? '🔥' : '💬'}
            </p>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">
              {activeRoom?.type === 'group' ? 'The boys are here!' : 'Start the conversation'}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {activeRoom?.type === 'group'
                ? 'Be the first to say something 👋'
                : 'Send a message to kick things off'}
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                showAvatar={msg.showAvatar}
                prevSameSender={msg.prevSameSender}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Typing Indicator ───────────────────────── */}
      {typingUsers.length > 0 && (
        <div className="px-5 pb-1 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {typingUsers.map((u) => u.displayName).join(', ')}
            {typingUsers.length === 1 ? ' is typing…' : ' are typing…'}
          </span>
        </div>
      )}

      {/* ── Input Bar ─────────────────────────────── */}
      <div className="
        shrink-0 px-4 pb-4 pt-2
        bg-slate-50 dark:bg-slate-950
      ">
        {sendError && (
          <div className="
            mb-2 px-3 py-2 rounded-lg
            bg-red-50 dark:bg-red-900/30
            border border-red-200 dark:border-red-800
            text-sm text-red-700 dark:text-red-300
          ">
            {sendError}
          </div>
        )}
        <form
          onSubmit={handleSend}
          className="
            relative flex items-end gap-2
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-2xl shadow-sm
            px-3 py-2
          "
        >
          {/* Emoji toggle */}
          <div ref={emojiPanelRef} className="relative shrink-0 self-end pb-0.5">
            <button
              id="emoji-panel-toggle"
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className={`
                p-1.5 rounded-xl transition-all
                ${showEmoji
                  ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/30'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
              `}
              aria-label="Emoji picker"
            >
              <Smile size={20} />
            </button>

            {/* Emoji panel */}
            {showEmoji && (
              <div
                className="
                  absolute bottom-full left-0 mb-2 z-30
                  w-72 p-3 rounded-2xl shadow-2xl
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  grid grid-cols-10 gap-1
                "
              >
                {EMOJI_PANEL.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => appendEmoji(emoji)}
                    className="text-xl p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-125 transition-all leading-none"
                    aria-label={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text input */}
          <textarea
            id="message-input"
            ref={inputRef}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={`Message ${activeRoom?.type === 'group' ? '#boys' : roomName.split(' ').slice(1).join(' ')} …`}
            className="
              flex-1 resize-none bg-transparent outline-none
              text-sm text-slate-800 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              max-h-32 py-1.5 leading-relaxed
            "
            style={{ scrollbarWidth: 'none' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />

          {/* Send button */}
          <button
            id="send-message-btn"
            type="submit"
            disabled={!inputText.trim() || sending}
            className="
              shrink-0 self-end p-2 rounded-xl
              bg-gradient-to-br from-brand-500 to-violet-600
              text-white shadow-md shadow-brand-500/30
              hover:scale-105 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
              transition-all duration-150
            "
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-1.5">
          Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Enter</kbd> to send · <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Shift+Enter</kbd> for new line
        </p>
      </div>

      {/* Clear chat confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Clear all messages?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              All messages in this chat will be permanently deleted for both users and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                disabled={isClearing}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
