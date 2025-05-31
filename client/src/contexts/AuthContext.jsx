import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// API-Client erstellen
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API-Interceptor für Auth-Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Context erstellen
const AuthContext = createContext();

// Custom Hook für einfachen Zugriff auf den Auth-Kontext
export const useAuth = () => useContext(AuthContext);

// Auth Provider Komponente
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Prüfen ob der Benutzer angemeldet ist (z.B. beim App-Start)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // API-Anfrage an das Backend, um den Token zu validieren
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token ist ungültig oder abgelaufen
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth-Status-Prüfung fehlgeschlagen:', err);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Anmelde-Funktion
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(response.data.message || 'Anmeldung fehlgeschlagen');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Anmeldung fehlgeschlagen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Registrierungs-Funktion
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || 'Registrierung fehlgeschlagen');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registrierung fehlgeschlagen';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Abmelde-Funktion
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Werte, die der Kontext bereitstellt
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    setError,
    api // API-Client hinzufügen
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;