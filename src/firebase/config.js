import { initializeApp } from 'firebase/app';
import { initializeAuth, connectAuthEmulator, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// Replace these placeholder values with your actual Firebase project credentials.
// Find them in: Firebase Console → Project Settings → General → Your Apps → SDK Setup
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAriElO5tvuWrDJTyQXnxDRKnlHDASsHJc",
  authDomain: "guff-1d17e.firebaseapp.com",
  projectId: "guff-1d17e",
  storageBucket: "guff-1d17e.firebasestorage.app",
  messagingSenderId: "973034159993",
  appId: "1:973034159993:web:be5dae0df211b1dd6039a8"
};

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
