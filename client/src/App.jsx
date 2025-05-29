// client/src/App.jsx - UPDATE: CreateCampaign Route hinzufügen
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign'; // ← NEUER IMPORT

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark">
    <div className="text-center">
      <div className="prometheus-logo mb-4">⚡</div>
      <div className="text-orange-500 font-semibold">Loading Prometheus...</div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* ← NEUE ROUTE HINZUFÜGEN */}
          <Route path="/create-campaign" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;