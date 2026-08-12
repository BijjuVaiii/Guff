import { initializeApp } from 'firebase/app';
import { initializeAuth, connectAuthEmulator, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// Firebase project credentials are loaded from Vite environment variables.
// Create `.env.local` from `.env.example` and keep it out of source control.
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error(
    'Missing Firebase config values. Copy .env.example to .env.local and fill in VITE_FIREBASE_* variables.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
});

// Firestore
export const db = getFirestore(app);

// Messaging (may not be supported on all browsers)
export const messagingPromise = isSupported().then((supported) => {
  if (supported) return getMessaging(app);
  return null;
});

// ─── Emulator Setup ──────────────────────────────────────────────────────────
// When running locally with `firebase emulators:start`, connect to local emulators.
// Remove or comment out this block when deploying to production.
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;
