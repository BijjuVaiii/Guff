import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

// Whitelist of allowed emails — add your friends' emails here.
// These are also stored in Firestore under the `whitelist` collection.
export const WHITELISTED_EMAILS = [
  'aman@bijju.com',
  'bijay@admin.com',
  'kunal@bijju.com',
  'niraj@bijju.com',
  'prasan@bijju.com',
  'sujal@bijju.com',
  'yogesh@bijju.com',
];

// Default avatar emoji options
const AVATAR_EMOJIS = ['🦊', '🐼', '🐨', '🦁', '🐸', '🦄', '🐙', '🦋', '🐳', '🦝'];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle' | 'loading' | 'denied' | 'allowed'

  // Check whitelist from Firestore
  const checkWhitelist = useCallback(async (email) => {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    const docRef = doc(db, 'whitelist', normalized);
    try {
      const snap = await getDoc(docRef);
      return snap.exists();
    } catch {
      // Fallback to local list if Firestore is unavailable
      return WHITELISTED_EMAILS.map((e) => e.toLowerCase()).includes(normalized);
    }
  }, []);

  // Update online status in Firestore
  const setOnlineStatus = useCallback(async (uid, status) => {
    if (!uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        status,
        lastSeen: serverTimestamp(),
      });
    } catch {
      // Ignore errors silently (e.g., if user doc doesn't exist yet)
    }
  }, []);

  // Sign up
  const signup = async (email, displayName, password) => {
    const allowed = await checkWhitelist(email);
    if (!allowed) {
      throw new Error('ACCESS_DENIED');
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const avatarEmoji = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];

    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: avatarEmoji,
      status: 'online',
      lastSeen: serverTimestamp(),
      fcmToken: null,
    });

    // Ensure group-chat room exists
    const groupRef = doc(db, 'rooms', 'group-chat');
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) {
      await setDoc(groupRef, {
        id: 'group-chat',
        type: 'group',
        name: 'Boys',
        members: [user.uid],
        lastMessage: null,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });
    }

    return user;
  };

  // Login
  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const allowed = await checkWhitelist(email);
    if (!allowed) {
      await signOut(auth);
      throw new Error('ACCESS_DENIED');
    }
    await setOnlineStatus(user.uid, 'online');
    return user;
  };

  // Logout
  const logout = async () => {
    if (currentUser) {
      await setOnlineStatus(currentUser.uid, 'offline');
    }
    await signOut(auth);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setAuthStatus('loading');
        const allowed = await checkWhitelist(user.email);
        setAuthStatus(allowed ? 'allowed' : 'denied');
        if (!allowed) {
          await signOut(auth);
        }
      } else {
        setAuthStatus('idle');
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [checkWhitelist]);

  // Real-time user profile listener
  useEffect(() => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserProfile({ id: snap.id, ...snap.data() });
    });
    return unsubscribe;
  }, [currentUser]);

  // Online/offline heartbeat
  useEffect(() => {
    if (!currentUser) return;

    setOnlineStatus(currentUser.uid, 'online');

    const handleVisibilityChange = () => {
      setOnlineStatus(currentUser.uid, document.hidden ? 'offline' : 'online');
    };
    const handleBeforeUnload = () => {
      setOnlineStatus(currentUser.uid, 'offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setOnlineStatus(currentUser.uid, 'offline');
    };
  }, [currentUser, setOnlineStatus]);

  const value = {
    currentUser,
    userProfile,
    loading,
    authStatus,
    signup,
    login,
    logout,
    checkWhitelist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
