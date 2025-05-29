import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Settings, BarChart3, Zap, Target, Brain } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="prometheus-logo">⚡</div>
              <div>
                <h1 className="text-xl font-bold prometheus-gradient-text">
                  PROMETHEUS
                </h1>
                <p className="text-xs text-gray-400">Marketing Bot</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  Welcome, {user?.name || user?.email || 'User'}!
                </p>
                <p className="text-xs text-gray-400">
                  Plan: {user?.plan || 'STARTER'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="prometheus-button-secondary"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Prometheus 🔥
          </h2>
          <p className="text-gray-400 text-lg">
            Your AI-powered performance marketing automation platform is ready to ignite your campaigns.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Campaigns</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <Target className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total ROAS</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <BarChart3 className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">AI Optimizations</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <Brain className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Performance Score</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <Zap className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="prometheus-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="text-orange-500" size={20} />
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button className="w-full prometheus-button-primary justify-start">
                <Target size={16} />
                Create Your First Campaign
              </button>
              <button className="w-full prometheus-button-secondary justify-start">
                <Brain size={16} />
                Market Intelligence Analysis
              </button>
              <button className="w-full prometheus-button-secondary justify-start">
                <BarChart3 size={16} />
                View Performance Reports
              </button>
              <button className="w-full prometheus-button-secondary justify-start">
                <Settings size={16} />
                Connect Ad Accounts
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="prometheus-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Brain size={48} className="mx-auto opacity-50" />
              </div>
              <p className="text-gray-400">
                No activity yet. Create your first campaign to get started!
              </p>
            </div>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
            <h4 className="text-green-500 font-semibold mb-2">🔧 Development Mode</h4>
            <p className="text-green-400 text-sm">
              Dashboard is successfully loading! Next steps:
            </p>
            <ul className="text-green-400 text-sm mt-2 space-y-1">
              <li>• ✅ Authentication system working</li>
              <li>• ✅ Prometheus branding applied</li>
              <li>• ⏳ Database setup next</li>
              <li>• ⏳ Campaign creation flow</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;