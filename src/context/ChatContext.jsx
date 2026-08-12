import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const typingTimeoutRef = useRef(null);
  const unsubMessagesRef = useRef(null);
  const unsubTypingRef = useRef(null);

  // ── Fetch all whitelisted users ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllUsers(users);
    });
    return unsubscribe;
  }, [currentUser]);

  // ── Fetch all rooms the user belongs to ─────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const groupRef = doc(db, 'rooms', 'group-chat');
    const dmQuery = query(
      collection(db, 'rooms'),
      where('type', '==', 'dm'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubGroup = onSnapshot(groupRef, (snap) => {
      if (snap.exists()) {
        setRooms((prev) => {
          const filtered = prev.filter((r) => r.id !== 'group-chat');
          return [{ id: snap.id, ...snap.data() }, ...filtered].sort((a) =>
            a.id === 'group-chat' ? -1 : 1
          );
        });
        // Auto-select the group chat on first load
        setActiveRoom((prev) => prev ?? { id: snap.id, ...snap.data() });
      }
    });

    const unsubDMs = onSnapshot(dmQuery, (snap) => {
      const dmRooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRooms((prev) => {
        const withoutDMs = prev.filter((r) => r.type !== 'dm');
        return [...withoutDMs, ...dmRooms].sort((a) => (a.id === 'group-chat' ? -1 : 1));
      });
    });

    return () => {
      unsubGroup();
      unsubDMs();
    };
  }, [currentUser]);

  // ── Ensure group chat exists and current user is a member ────────────────
  useEffect(() => {
    if (!currentUser) return;

    const ensureGroupChat = async () => {
      try {
        const groupRef = doc(db, 'rooms', 'group-chat');
        const snap = await getDoc(groupRef);
        if (!snap.exists()) {
          await setDoc(groupRef, {
            id: 'group-chat',
            type: 'group',
            name: 'Boys',
            members: [currentUser.uid],
            lastMessage: null,
            createdAt: serverTimestamp(),
          });
        } else {
          const data = snap.data();
          const members = data.members || [];
          const name = data.name;
          
          const updates = {};
          if (!members.includes(currentUser.uid)) {
            updates.members = arrayUnion(currentUser.uid);
          }
          if (name !== 'Boys') {
            updates.name = 'Boys';
          }
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(groupRef, updates);
          }
        }
      } catch (err) {
        console.warn('Failed to ensure group chat membership:', err);
      }
    };

    ensureGroupChat();
  }, [currentUser]);

  // ── Subscribe to messages for the active room ────────────────────────────
  useEffect(() => {
    if (unsubMessagesRef.current) unsubMessagesRef.current();
    if (unsubTypingRef.current) unsubTypingRef.current();
    if (!activeRoom || !currentUser) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    const messagesQuery = query(
      collection(db, 'rooms', activeRoom.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    unsubMessagesRef.current = onSnapshot(messagesQuery, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoadingMessages(false);
    });

    const typingRef = collection(db, 'rooms', activeRoom.id, 'typing');
    unsubTypingRef.current = onSnapshot(typingRef, (snap) => {
      const typers = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (t) =>
            t.id !== currentUser.uid &&
            t.isTyping &&
            Date.now() - (t.timestamp?.toMillis?.() ?? 0) < 5000
        );
      setTypingUsers(typers);
    });

    return () => {
      if (unsubMessagesRef.current) unsubMessagesRef.current();
      if (unsubTypingRef.current) unsubTypingRef.current();
    };
  }, [activeRoom, currentUser]);

  // ── Mark unread messages as read (debounced to avoid overwhelming Firestore) ─
  useEffect(() => {
    if (!activeRoom || !currentUser || messages.length === 0) return;

    // Debounce the read-by update with a timer to batch multiple message arrivals
    const timer = setTimeout(() => {
      // Find unread messages
      const unreadMessages = messages.filter(
        (msg) => !msg.readBy?.[currentUser.uid]
      );

      if (unreadMessages.length === 0) return;

      // Use batch writes to mark all unread messages as read in one operation
      const batch = writeBatch(db);
      
      unreadMessages.forEach((msg) => {
        const msgRef = doc(db, 'rooms', activeRoom.id, 'messages', msg.id);
        batch.update(msgRef, {
          [`readBy.${currentUser.uid}`]: serverTimestamp(),
        });
      });

      batch.commit().catch((err) => {
        console.warn('Failed to mark messages as read:', err);
      });
    }, 2000); // Debounce by 2 seconds to batch updates

    return () => clearTimeout(timer);
  }, [activeRoom, currentUser, messages]);

  // ── Typing indicator ─────────────────────────────────────────────────────
  const setTypingIndicator = useCallback(
    async (isTyping) => {
      if (!activeRoom || !currentUser) return;
      const typingRef = doc(db, 'rooms', activeRoom.id, 'typing', currentUser.uid);
      try {
        await setDoc(typingRef, {
          uid: currentUser.uid,
          displayName: userProfile?.displayName || 'Someone',
          isTyping,
          timestamp: serverTimestamp(),
        });
      } catch {
        // Ignore
      }
    },
    [activeRoom, currentUser, userProfile]
  );

  const handleTyping = useCallback(() => {
    setTypingIndicator(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTypingIndicator(false), 3000);
  }, [setTypingIndicator]);

  // ── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !activeRoom || !currentUser) return;
      const trimmed = text.trim();

      // Wrap with timeout to prevent hanging if Firestore connection drops
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Message send timeout - please check your connection')), 30000)
      );

      try {
        const msgData = {
          text: trimmed,
          senderId: currentUser.uid,
          senderName: userProfile?.displayName || currentUser.displayName || 'Unknown',
          senderPhoto: userProfile?.photoURL || '🦊',
          timestamp: serverTimestamp(),
          readBy: { [currentUser.uid]: serverTimestamp() },
          reactions: {},
        };

        await Promise.race([
          addDoc(collection(db, 'rooms', activeRoom.id, 'messages'), msgData),
          timeout
        ]);

        // Update room's last message preview
        await Promise.race([
          updateDoc(doc(db, 'rooms', activeRoom.id), {
            lastMessage: {
              text: trimmed,
              senderId: currentUser.uid,
              senderName: msgData.senderName,
              timestamp: serverTimestamp(),
            },
          }),
          timeout
        ]);

        // Clear typing indicator
        await setTypingIndicator(false);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Re-throw to allow UI to handle the error
        throw error;
      }
    },
    [activeRoom, currentUser, userProfile]
  );

  // ── Toggle emoji reaction ────────────────────────────────────────────────
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!activeRoom || !currentUser) return;
      const msgRef = doc(db, 'rooms', activeRoom.id, 'messages', messageId);
      const snap = await getDoc(msgRef);
      if (!snap.exists()) return;

      const reactions = snap.data().reactions || {};
      const reactors = reactions[emoji] || [];
      const alreadyReacted = reactors.includes(currentUser.uid);

      const updated = {
        ...reactions,
        [emoji]: alreadyReacted
          ? reactors.filter((uid) => uid !== currentUser.uid)
          : [...reactors, currentUser.uid],
      };

      // Remove emoji key if no one reacted
      if (updated[emoji].length === 0) delete updated[emoji];

      await updateDoc(msgRef, { reactions: updated });
    },
    [activeRoom, currentUser]
  );

  // ── Delete a message ────────────────────────────────────────────────────
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!activeRoom || !currentUser) return;
      try {
        await deleteDoc(doc(db, 'rooms', activeRoom.id, 'messages', messageId));
      } catch (error) {
        console.error('Failed to delete message:', error);
        throw error;
      }
    },
    [activeRoom, currentUser]
  );

  // ── Clear entire chat ────────────────────────────────────────────────────
  const clearChat = useCallback(
    async () => {
      if (!activeRoom || !currentUser) return;
      try {
        // Get all messages in the room
        const messagesRef = collection(db, 'rooms', activeRoom.id, 'messages');
        const snapshot = await getDocs(messagesRef);
        
        // Delete all messages in batch
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        // Clear the room's last message
        await updateDoc(doc(db, 'rooms', activeRoom.id), {
          lastMessage: null,
        });
        
        await batch.commit();
      } catch (error) {
        console.error('Failed to clear chat:', error);
        throw error;
      }
    },
    [activeRoom, currentUser]
  );



  // ── Get or create a DM room ──────────────────────────────────────────────
  const openDM = useCallback(
    async (otherUser) => {
      if (!currentUser || otherUser.uid === currentUser.uid) return;

      const members = [currentUser.uid, otherUser.uid].sort();
      const roomId = `dm_${members[0]}_${members[1]}`;
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);

      if (!snap.exists()) {
        await setDoc(roomRef, {
          id: roomId,
          type: 'dm',
          members,
          lastMessage: null,
          createdAt: serverTimestamp(),
        });
      }

      setActiveRoom({ id: roomId, type: 'dm', members, ...(snap.data() || {}) });
    },
    [currentUser]
  );

  const value = {
    rooms,
    activeRoom,
    setActiveRoom,
    messages,
    allUsers,
    typingUsers,
    loadingMessages,
    sendMessage,
    toggleReaction,
    deleteMessage,
    clearChat,
    handleTyping,
    openDM,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}
