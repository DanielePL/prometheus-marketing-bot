import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Zap } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="prometheus-logo">⚡</div>
              <div>
                <h1 className="text-xl font-bold prometheus-gradient-text">PROMETHEUS</h1>
                <p className="text-xs text-gray-400">Marketing Bot</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  Welcome, {user?.name || user?.email || 'User'}!
                </p>
                <p className="text-xs text-gray-400">Plan: {user?.plan || 'STARTER'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="prometheus-button-secondary"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to Prometheus 🔥
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Your AI-powered performance marketing automation platform is ready!
          </p>

          <div className="prometheus-card p-8 max-w-md mx-auto">
            <Zap className="text-orange-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-4">Get Started</h3>
            <p className="text-gray-400 mb-6">
              Create your first campaign and let Prometheus automate your marketing success.
            </p>
            <button className="prometheus-button-primary w-full">
              Create Campaign
            </button>
          </div>

          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-green-900/20 border border-green-500/20 rounded-lg max-w-md mx-auto">
              <h4 className="text-green-500 font-semibold mb-2">🔧 Development Mode</h4>
              <p className="text-green-400 text-sm">
                ✅ Login system working<br />
                ✅ Prometheus branding applied<br />
                ⏳ Ready for next features
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;