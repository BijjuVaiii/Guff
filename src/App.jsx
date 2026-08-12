import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AccessDenied from './pages/AccessDenied';
import ChatDashboard from './pages/ChatDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Protected chat route — wraps ChatProvider inside so auth is ready */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatProvider>
                      <ChatDashboard />
                    </ChatProvider>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
