// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prometheus_token');
    console.log('🔐 API Request Interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE'
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });

    if (error.response?.status === 401) {
      console.log('🚪 Token expired/invalid, redirecting to login...');
      // Token expired or invalid
      localStorage.removeItem('prometheus_token');
      localStorage.removeItem('prometheus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('prometheus_token');
      const savedUser = localStorage.getItem('prometheus_user');

      if (token && savedUser) {
        // Validate token with server
        try {
          const response = await api.get('/auth/verify');
          if (response.data.success) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
            console.log('✅ Auth: User authenticated from storage');
          } else {
            throw new Error('Token validation failed');
          }
        } catch (error) {
          console.warn('⚠️ Auth: Token validation failed, clearing storage');
          localStorage.removeItem('prometheus_token');
          localStorage.removeItem('prometheus_user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('📝 Auth: No stored credentials found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth: Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('🔐 Auth: Attempting login for:', email);

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Store auth data
        localStorage.setItem('prometheus_token', token);
        localStorage.setItem('prometheus_user', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);

        console.log('✅ Auth: Login successful for user:', userData.email);
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Auth: Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      console.log('📝 Auth: Attempting registration for:', userData.email);

      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { token, user: newUser } = response.data;

        // Store auth data
        localStorage.setItem('prometheus_token', token);
        localStorage.setItem('prometheus_user', JSON.stringify(newUser));

        // Update state
        setUser(newUser);
        setIsAuthenticated(true);

        console.log('✅ Auth: Registration successful for user:', newUser.email);
        return { success: true, user: newUser };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Auth: Registration failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Auth: Logging out user:', user?.email);

      // Call logout endpoint (optional, for server-side cleanup)
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.warn('⚠️ Auth: Server logout failed (continuing with local logout)');
      }

      // Clear local storage
      localStorage.removeItem('prometheus_token');
      localStorage.removeItem('prometheus_user');

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      console.log('✅ Auth: Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Auth: Logout error:', error);
      // Force logout anyway
      localStorage.removeItem('prometheus_token');
      localStorage.removeItem('prometheus_user');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('prometheus_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ Auth: User data updated');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('❌ Auth: Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  // Development helper functions
  const devLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      const devUser = {
        id: 'dev-user-123',
        email: 'dev@prometheus.com',
        name: 'Dev User',
        plan: 'ENTERPRISE',
        status: 'ACTIVE'
      };
      const devToken = 'dev-token-' + Date.now();

      localStorage.setItem('prometheus_token', devToken);
      localStorage.setItem('prometheus_user', JSON.stringify(devUser));
      setUser(devUser);
      setIsAuthenticated(true);

      console.log('🔧 Auth: Development login activated');
      return { success: true, user: devUser };
    }
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,

    // Development helpers
    devLogin: process.env.NODE_ENV === 'development' ? devLogin : null,

    // API instance for authenticated requests
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark">
          <div className="text-center">
            <div className="prometheus-logo animate-pulse-prometheus mb-4">
              ⚡
            </div>
            <div className="text-orange-500 font-semibold">
              Loading Prometheus...
            </div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;