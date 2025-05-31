// /prometheus-marketing-engine/client/src/components/settings/ApiSettingsPanel.jsx
// API Settings Panel mit Google API Toggle

import React, { useState, useEffect } from 'react';
import './ApiSettingsPanel.css';

const ApiSettingsPanel = () => {
  const [settings, setSettings] = useState({
    googleAdsEnabled: false,
    mockMode: true,
    metaAdsEnabled: false,
    tiktokAdsEnabled: false,
    linkedinAdsEnabled: false
  });

  const [googleStatus, setGoogleStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        setGoogleStatus(data.data.googleAdsStatus);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoogleAds = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/settings/google-ads/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !settings.googleAdsEnabled
        })
      });

      const data = await response.json();

      if (data.success) {
        setSettings(prev => ({
          ...prev,
          googleAdsEnabled: data.data.googleAdsEnabled
        }));
        setGoogleStatus(data.data.status);
        setLastUpdate(new Date());

        // Show success notification
        showNotification(
          data.message,
          data.data.googleAdsEnabled ? 'success' : 'info'
        );
      } else {
        throw new Error(data.message || 'Toggle failed');
      }

    } catch (error) {
      console.error('❌ Failed to toggle Google Ads:', error);
      showNotification('Failed to toggle Google Ads API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const testGoogleConnection = async () => {
    try {
      setTesting(true);

      const response = await fetch('/api/settings/google-ads/test-connection', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        showNotification(
          `✅ Connection successful! Found ${data.data.campaignsFound} campaigns`,
          'success'
        );
        setGoogleStatus(prev => ({
          ...prev,
          connected: true,
          lastCheck: data.data.testTimestamp
        }));
      } else {
        showNotification(
          `❌ Connection failed: ${data.message}`,
          'error'
        );
      }

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      showNotification('Connection test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const toggleMockMode = async () => {
    try {
      const response = await fetch('/api/settings/mock-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !settings.mockMode
        })
      });

      const data = await response.json();

      if (data.success) {
        setSettings(prev => ({
          ...prev,
          mockMode: data.data.mockMode
        }));
        showNotification(data.message, 'info');
      }

    } catch (error) {
      console.error('❌ Failed to toggle mock mode:', error);
      showNotification('Failed to toggle mock mode', 'error');
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - you can replace with your preferred notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getStatusColor = (enabled, connected) => {
    if (!enabled) return '#6b7280'; // gray
    if (connected) return '#10b981'; // green
    return '#f59e0b'; // yellow
  };

  const getStatusText = (enabled, connected, mockMode) => {
    if (!enabled) return 'Disabled';
    if (mockMode) return 'Mock Mode';
    if (connected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <div className="api-settings-panel">
      <div className="panel-header">
        <h2>🔧 API Settings</h2>
        <div className="last-update">
          {lastUpdate && (
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Google Ads API Section */}
      <div className="api-section">
        <div className="api-header">
          <div className="api-info">
            <h3>Google Ads API</h3>
            <div className="api-status">
              <div
                className="status-dot"
                style={{
                  backgroundColor: getStatusColor(
                    settings.googleAdsEnabled,
                    googleStatus?.connected
                  )
                }}
              ></div>
              <span className="status-text">
                {getStatusText(
                  settings.googleAdsEnabled,
                  googleStatus?.connected,
                  settings.mockMode
                )}
              </span>
            </div>
          </div>

          <div className="api-controls">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.googleAdsEnabled}
                onChange={toggleGoogleAds}
                disabled={loading}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Google API Details */}
        {settings.googleAdsEnabled && (
          <div className="api-details">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`value ${googleStatus?.connected ? 'connected' : 'disconnected'}`}>
                  {googleStatus?.connected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">Mock Mode:</span>
                <span className={`value ${googleStatus?.mockMode ? 'enabled' : 'disabled'}`}>
                  {googleStatus?.mockMode ? '🎭 Enabled' : '❌ Disabled'}
                </span>
              </div>

              {googleStatus?.lastCheck && (
                <div className="detail-item">
                  <span className="label">Last Check:</span>
                  <span className="value">
                    {new Date(googleStatus.lastCheck).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            <div className="api-actions">
              <button
                className="test-button"
                onClick={testGoogleConnection}
                disabled={testing || !settings.googleAdsEnabled}
              >
                {testing ? '🔄 Testing...' : '🧪 Test Connection'}
              </button>

              <button
                className="mock-toggle-button"
                onClick={toggleMockMode}
                disabled={loading}
              >
                {settings.mockMode ? '📊 Use Real Data' : '🎭 Use Mock Data'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Future API Sections */}
      <div className="api-section disabled">
        <div className="api-header">
          <div className="api-info">
            <h3>Meta Ads API</h3>
            <div className="api-status">
              <div className="status-dot" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="status-text">Coming Soon</span>
            </div>
          </div>
          <div className="api-controls">
            <label className="toggle-switch disabled">
              <input type="checkbox" disabled />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="api-section disabled">
        <div className="api-header">
          <div className="api-info">
            <h3>TikTok Ads API</h3>
            <div className="api-status">
              <div className="status-dot" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="status-text">Coming Soon</span>
            </div>
          </div>
          <div className="api-controls">
            <label className="toggle-switch disabled">
              <input type="checkbox" disabled />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="api-section disabled">
        <div className="api-header">
          <div className="api-info">
            <h3>LinkedIn Marketing API</h3>
            <div className="api-status">
              <div className="status-dot" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="status-text">Coming Soon</span>
            </div>
          </div>
          <div className="api-controls">
            <label className="toggle-switch disabled">
              <input type="checkbox" disabled />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button
            className="action-button refresh"
            onClick={loadSettings}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh Settings'}
          </button>

          <button
            className="action-button view-performance"
            onClick={() => window.open('/api/campaigns/performance/live', '_blank')}
          >
            📊 View Live Performance
          </button>

          <button
            className="action-button view-dashboard"
            onClick={() => window.open('/api/campaigns/dashboard', '_blank')}
          >
            📈 View Dashboard Data
          </button>
        </div>
      </div>

      {/* Status Footer */}
      <div className="status-footer">
        <div className="prometheus-status">
          <span className="prometheus-label">🚀 Prometheus Engine:</span>
          <span className="prometheus-value">
            {settings.googleAdsEnabled ? 'Active' : 'Standby'}
            {settings.mockMode ? ' (Mock Mode)' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsPanel;