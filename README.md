# 🗨️ GUFF - Friend Texting Web App

A modern, real-time chat application built with React and Firebase, enabling seamless communication between friends. Guff features authentication, real-time messaging, push notifications, and a beautiful responsive UI.

## ✨ Features

- **🔐 User Authentication**: Secure email/password login and signup with Firebase Auth
- **💬 Real-time Messaging**: Instant message delivery and updates using Firestore
- **🔔 Push Notifications**: Firebase Cloud Messaging (FCM) integration for alerts
- **🌓 Dark/Light Theme**: Toggle between dark and light mode with persistent settings
- **🛡️ Protected Routes**: Secure chat access only for authenticated users
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⏰ Timestamps**: Automatic message timestamp formatting
- **🎨 Modern UI**: Built with Tailwind CSS for a clean, modern interface

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **React Router v7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

### Backend & Services
- **Firebase Auth** - User authentication
- **Cloud Firestore** - Real-time database for messages and user data
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Hosting** - Production deployment

## 📁 Project Structure

```
guff-friend-texting-web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatRoom.jsx    # Main chat interface
│   │   ├── MessageBubble.jsx # Individual message component
│   │   ├── ProtectedRoute.jsx # Auth wrapper for protected pages
│   │   └── Sidebar.jsx     # Sidebar with chat list
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── ChatContext.jsx     # Chat state management
│   │   ├── NotificationContext.jsx # Push notification handling
│   │   └── ThemeContext.jsx    # Dark/light theme management
│   ├── firebase/
│   │   └── config.js       # Firebase configuration
│   ├── pages/              # Page components
│   │   ├── AccessDenied.jsx    # Error page for unauthorized access
│   │   ├── ChatDashboard.jsx   # Main chat application
│   │   ├── Login.jsx           # Login page
│   │   └── Signup.jsx          # Registration page
│   ├── utils/
│   │   └── formatTime.js   # Timestamp formatting utility
│   ├── App.jsx             # Root app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project (create one at [console.firebase.google.com](https://console.firebase.google.com))

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/BijjuVaiii/Guff.git
cd "Guff - Friend Texting Web"
npm install
```

### 2. Firebase Setup

1. **Create a Firebase Project**:
   - Go to Firebase Console → Add Project
   - Enable Email/Password authentication
   - Enable Cloud Firestore database
   - Enable Cloud Messaging for push notifications

2. **Configure Environment**:
   - Copy the example file and fill in your Firebase project credentials:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and replace the placeholders:
     ```env
     VITE_FIREBASE_API_KEY=YOUR_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID=YOUR_APP_ID
     ```
   - `src/firebase/config.js` reads these values automatically using Vite.
   - `.env.local` is ignored by git so your credentials stay private.

3. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to Firebase Hosting

```bash
firebase deploy
```

## 🔥 Firebase Architecture

### Firestore Collections

- **users**: Stores user profiles (displayName, email, createdAt, photoURL)
- **messages**: Stores chat messages with sender, receiver, text, timestamps
- **chats**: Tracks conversation metadata between users

### Security Rules

The app includes Firestore security rules that:
- Require authentication for all database access
- Only allow users to read/write messages they are part of
- Validate message and user data formats
- Prevent unauthorized access to other users' data

## 🎨 Features in Detail

### User Authentication
- Secure signup with email and password
- Login/logout functionality
- Persistent authentication state
- Protected routes that redirect unauthenticated users

### Real-time Chat
- Send and receive messages instantly
- Message bubbles differentiate between sender and receiver
- Automatic scrolling to latest messages
- Timestamps on all messages
- Online/offline status indicators (planned)

### Push Notifications
- Browser-based push notifications
- FCM token management
- Receive alerts when new messages arrive
- Notification permission handling

### Theme Support
- Toggle between light and dark modes
- Theme preference saved in localStorage
- Smooth transitions between themes
- Full UI support for both themes

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Lint code with ESLint
- `npm run preview` - Preview production build locally

## 📦 Dependencies

### Core Dependencies
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing
- `firebase` - Firebase SDK
- `lucide-react` - Icon library
- `tailwindcss` - CSS framework

### Development Dependencies
- `vite` - Build tool
- `eslint` - Code linting
- `firebase-tools` - Firebase CLI
- `@vitejs/plugin-react` - React plugin for Vite

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚧 Local Development with Emulators

For local development with Firebase Emulators:

1. Uncomment the emulator code in `src/firebase/config.js`
2. Start emulators:
   ```bash
   firebase emulators:start
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

## 📝 License

This project is private and intended for educational purposes.

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt it for your own use!

---

**Built with ❤️ using React and Firebase**