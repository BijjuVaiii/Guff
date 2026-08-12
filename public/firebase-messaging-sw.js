// Firebase Cloud Messaging Service Worker
// This file must be at the root public directory for FCM to work.
// It handles background push notifications when the app is not focused.

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// Replace these values with your actual Firebase project credentials.
// These MUST match the values in src/firebase/config.js
// ─────────────────────────────────────────────────────────────────────────────
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'Guff – New Message', {
    body: body || 'You have a new message',
    icon: icon || '/guff-icon.png',
    badge: '/guff-badge.png',
    vibrate: [200, 100, 200],
    tag: 'guff-notification',
    renotify: true,
    data: payload.data || {},
  });
});

// Handle notification click → open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
