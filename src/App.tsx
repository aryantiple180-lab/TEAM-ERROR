import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LanguageSelect from './pages/LanguageSelect';
import LocationSetup from './pages/LocationSetup';
import Home from './pages/Home';
import Medicine from './pages/Medicine';
import Health from './pages/Health';
import Hospitals from './pages/Hospitals';
import Order from './pages/Order';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/language" element={<ProtectedRoute><LanguageSelect /></ProtectedRoute>} />
      <Route path="/location" element={<ProtectedRoute><LocationSetup /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/medicine" element={<ProtectedRoute><Medicine /></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute><Health /></ProtectedRoute>} />
      <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
      <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
