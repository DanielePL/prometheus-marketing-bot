import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, devLogin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Welcome to Prometheus! 🔥');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    if (devLogin) {
      const result = devLogin();
      if (result.success) {
        toast.success('Development login activated! 🔧');
        navigate('/dashboard', { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="prometheus-logo mx-auto mb-4">⚡</div>
          <h1 className="text-3xl font-bold prometheus-gradient-text">PROMETHEUS</h1>
          <p className="text-gray-400 mt-2">Performance Marketing Engine</p>
        </div>

        {/* Development Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-green-900/20 border border-green-500/20 rounded p-3 mb-6 text-sm">
            <p className="text-green-400">
              <strong>Development Mode:</strong><br />
              Use any email/password or click Dev Login
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full prometheus-button-primary justify-center py-3"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Launching...
              </>
            ) : (
              '⚡ Launch Prometheus'
            )}
          </button>
        </form>

        {/* Dev Login */}
        {process.env.NODE_ENV === 'development' && devLogin && (
          <button
            onClick={handleDevLogin}
            className="w-full mt-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
          >
            🔧 Quick Dev Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;