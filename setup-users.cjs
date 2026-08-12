/**
 * Setup script to create user profiles for all 7 team members in Firestore
 * 
 * How to use:
 * 1. Make sure serviceAccountKey.json is in your project root
 * 2. Run: node setup-users.cjs
 */

const admin = require('firebase-admin/app');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const auth = getAuth();

const AVATAR_EMOJIS = ['🦊', '🐼', '🐨', '🦁', '🐸', '🦄', '🐙', '🦋', '🐳', '🦝'];

const users = [
  { email: 'aman@bijju.com', displayName: 'Aman' },
  { email: 'bijay@admin.com', displayName: 'Bijay' },
  { email: 'kunal@bijju.com', displayName: 'Kunal' },
  { email: 'niraj@bijju.com', displayName: 'Niraj' },
  { email: 'prasan@bijju.com', displayName: 'Prasan' },
  { email: 'sujal@bijju.com', displayName: 'Sujal' },
  { email: 'yogesh@bijju.com', displayName: 'Yogesh' },
];

async function setupUsers() {
  console.log('🚀 Setting up user profiles...\n');

  // Shuffle emojis and assign unique ones
  const shuffledEmojis = [...AVATAR_EMOJIS].sort(() => Math.random() - 0.5);
  const userUids = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      // Find the user in Firebase Auth
      const userRecord = await auth.getUserByEmail(user.email);
      userUids.push(userRecord.uid);
      
      // Create user profile in Firestore
      const avatarEmoji = shuffledEmojis[i];
      
      await db.collection('users').doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: avatarEmoji,
          status: 'online',
          lastSeen: new Date(),
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
          createdAt: new Date(),
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
