import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Wenn noch geladen wird, zeige Lade-Indikator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Laden...</span>
      </div>
    );
  }
  
  // Wenn nicht authentifiziert, zur Login-Seite umleiten
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Ansonsten, die geschützte Komponente rendern
  return children;
};

export default ProtectedRoute;