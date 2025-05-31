// client/src/App.jsx
// Zusätzliche Importe für App.jsx
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AIConsultantPage from './pages/AIConsultantPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
// Andere Importe...

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Öffentliche Routen */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Geschützte Routen */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ai-consultant" element={<ProtectedRoute><AIConsultantPage /></ProtectedRoute>} />
          <Route 
            path="/ai-consultant/:campaignId" 
            element={
              <ProtectedRoute>
                <CampaignParamWrapper Component={AIConsultantPage} />
              </ProtectedRoute>
            } 
          />
          
          {/* Standardroute zur Startseite oder Login umleiten */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404-Seite */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Hilfskomponente für das Übergeben des campaignId-Parameters
function CampaignParamWrapper({ Component }) {
  const { campaignId } = useParams();
  return <Component campaignId={campaignId} />;
}

export default App;