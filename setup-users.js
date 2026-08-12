/**
 * Setup script to create user profiles for all 7 team members in Firestore
 * 
 * How to use:
 * 1. Download your service account key from Firebase Console:
 *    - Firebase Console → Project Settings → Service Accounts → Generate new private key
 * 2. Save it as `serviceAccountKey.json` in this project root
 * 3. Run: node setup-users.js
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Make sure serviceAccountKey.json exists in the project root
let serviceAccount;
try {
  const serviceAccountPath = './serviceAccountKey.json';
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (err) {
  console.error('❌ serviceAccountKey.json not found!');
  console.error('Download it from Firebase Console → Project Settings → Service Accounts → Generate new private key');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const AVATAR_EMOJIS = ['🦊', '🐼', '🐨', '🦁', '🐸', '🦄', '🐙', '🦋', '🐳', '🦝'];

const users = [
  { email: 'aman@bijju.com', displayName: 'Aman' },
  { email: 'bijjay@admin.com', displayName: 'Bijjay' },
  { email: 'kunal@bijju.com', displayName: 'Kunal' },
  { email: 'niraj@bijju.com', displayName: 'Niraj' },
  { email: 'prasan@bijju.com', displayName: 'Prasan' },
  { email: 'sujal@bijju.com', displayName: 'Sujal' },
  { email: 'yogesh@bijju.com', displayName: 'Yogesh' },
];

async function setupUsers() {
  console.log('🚀 Setting up user profiles...\n');

  const userUids = [];

  for (const user of users) {
    try {
      // Find the user in Firebase Auth
      const userRecord = await admin.auth().getUserByEmail(user.email);
      userUids.push(userRecord.uid);
      
      // Create user profile in Firestore
      const avatarEmoji = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
      
      await db.collection('users').doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: avatarEmoji,
          status: 'online',
          lastSeen: admin.firestore.FieldValue.serverTimestamp(),
          fcmToken: null,
        },
        { merge: true }
      );
      
      console.log(`✅ ${user.displayName} (${user.email}) - ${avatarEmoji}`);
    } catch (err) {
      console.error(`❌ ${user.displayName} (${user.email}):`, err.message);
    }
  }

  // Create or update the group-chat room
  if (userUids.length > 0) {
    try {
      const roomRef = db.collection('rooms').doc('group-chat');
      const roomSnap = await roomRef.get();
      if (!roomSnap.exists) {
        await roomRef.set({
          id: 'group-chat',
          type: 'group',
          name: 'Boys',
          members: userUids,
          lastMessage: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await roomRef.update({
          name: 'Boys',
          members: userUids,
        });
      }
      console.log('\n✅ Group chat "Boys" successfully set up with all members.');
    } catch (err) {
      console.error('❌ Failed to set up group chat:', err.message);
    }
  }

  console.log('\n✨ Done! Users can now see each other in the Members list.');
  process.exit(0);
}

setupUsers();
