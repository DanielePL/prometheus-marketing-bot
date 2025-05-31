// client/src/components/LivePerformanceDashboard.jsx - NEUE DATEI ERSTELLEN
import React, { useState, useEffect, useRef } from 'react';
// In dieser Datei wird AuthContext aus einem Verzeichnis namens "contexts" importiert
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

const LivePerformanceDashboard = ({ campaignId, className = '' }) => {
  const { api } = useAuth();

  // State Management
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Refs for animations
  const metricsRef = useRef({});
  const alertsRef = useRef([]);

  // Auto-refresh every 30 seconds (server updates every 15min, but we check more often)
  useEffect(() => {
    if (!campaignId) return;

    // Initial load
    fetchLiveData();

    // Set up auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveData();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [campaignId, autoRefresh]);

  const fetchLiveData = async () => {
    try {
      if (!campaignId) return;

      console.log('📊 Fetching live performance data...');

      const response = await api.get(`/performance/dashboard/${campaignId}`);

      if (response.data && response.data.success) {
        const newData = response.data;

        // Check for metric changes (for animations)
        if (liveData?.liveMetrics) {
          checkMetricChanges(liveData.liveMetrics, newData.liveMetrics);
        }

        // Check for new alerts
        if (newData.alerts && newData.alerts.length > alertsRef.current.length) {
          const newAlerts = newData.alerts.slice(alertsRef.current.length);
          newAlerts.forEach(alert => {
            toast.error(`🚨 ${alert.severity}: ${alert.message}`, {
              duration: 8000,
              position: 'top-right'
            });
          });
        }

        setLiveData(newData);
        setAlerts(newData.alerts || []);
        setLastUpdate(new Date().toLocaleTimeString('de-DE'));
        setRefreshCount(prev => prev + 1);
        alertsRef.current = newData.alerts || [];

        console.log('✅ Live data updated:', newData);
      }
    } catch (error) {
      console.error('❌ Error fetching live data:', error);
      if (error.response?.status !== 404) {
        toast.error('Fehler beim Laden der Live-Daten');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkMetricChanges = (oldMetrics, newMetrics) => {
    if (!oldMetrics || !newMetrics) return;

    const metrics = ['roas', 'spend', 'conversions', 'profit'];
    metrics.forEach(metric => {
      const oldValue = oldMetrics[metric];
      const newValue = newMetrics[metric];

      if (oldValue !== undefined && newValue !== undefined && oldValue !== newValue) {
        const change = newValue - oldValue;
        const isPositive = change > 0;

        // Animate metric change
        animateMetricChange(metric, isPositive);

        // Show toast for significant changes
        if (Math.abs(change) > (oldValue * 0.1)) { // 10% change
          const changePercent = ((change / oldValue) * 100).toFixed(1);
          const emoji = isPositive ? '📈' : '📉';
          toast.success(`${emoji} ${metric.toUpperCase()}: ${isPositive ? '+' : ''}${changePercent}%`);
        }
      }
    });
  };

  const animateMetricChange = (metric, isPositive) => {
    if (metricsRef.current[metric]) {
      const element = metricsRef.current[metric];
      element.style.transition = 'all 0.3s ease';
      element.style.transform = 'scale(1.05)';
      element.style.color = isPositive ? '#10b981' : '#ef4444';

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '';
      }, 300);
    }
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    fetchLiveData();
    toast.success('Daten aktualisiert');
  };

  const acknowledgeAlert = async (alert) => {
    try {
      await api.post(`/performance/alerts/${campaignId}/acknowledge`, {
        alertType: alert.type,
        metricId: alert.metricId
      });

      // Remove alert from local state
      setAlerts(prev => prev.filter(a =>
        !(a.type === alert.type && a.metricId === alert.metricId)
      ));

      toast.success('Alert bestätigt');
    } catch (error) {
      console.error('❌ Error acknowledging alert:', error);
      toast.error('Fehler beim Bestätigen des Alerts');
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return '€0';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const formatPercentage = (num) => {
    if (!num && num !== 0) return '0%';
    return num.toFixed(1) + '%';
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    return trend > 0 ?
      <TrendingUp className="text-green-400" size={16} /> :
      <TrendingDown className="text-red-400" size={16} />;
  };

  const getTrendColor = (trend) => {
    if (!trend) return 'text-gray-400';
    return trend > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getAlertIcon = (severity) => {
    const icons = {
      'CRITICAL': <AlertTriangle className="text-red-400" size={16} />,
      'HIGH': <AlertTriangle className="text-orange-400" size={16} />,
      'MEDIUM': <AlertTriangle className="text-yellow-400" size={16} />,
      'LOW': <AlertTriangle className="text-blue-400" size={16} />
    };
    return icons[severity] || icons['MEDIUM'];
  };

  const getAlertColor = (severity) => {
    const colors = {
      'CRITICAL': 'border-red-500 bg-red-500/10',
      'HIGH': 'border-orange-500 bg-orange-500/10',
      'MEDIUM': 'border-yellow-500 bg-yellow-500/10',
      'LOW': 'border-blue-500 bg-blue-500/10'
    };
    return colors[severity] || colors['MEDIUM'];
  };

  if (isLoading && !liveData) {
    return (
      <div className={`prometheus-card p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Live-Daten werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className={`prometheus-card p-6 ${className}`}>
        <div className="text-center py-8">
          <Activity className="text-gray-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Keine Live-Daten verfügbar</h3>
          <p className="text-gray-400 mb-4">
            Live-Performance-Daten werden generiert sobald die Kampagne läuft.
          </p>
          <button onClick={handleManualRefresh} className="prometheus-button-primary">
            <RefreshCw size={16} />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const { liveMetrics, profitDetails, trends, alerts: liveAlerts } = liveData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Live Status */}
      <div className="prometheus-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">LIVE Performance</span>
            </div>
            {lastUpdate && (
              <span className="text-sm text-gray-400">
                Letztes Update: {lastUpdate} (#{refreshCount})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded text-sm ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}
            >
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="prometheus-button-secondary"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Lädt...' : 'Aktualisieren'}
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="text-red-400" size={20} />
            Aktive Alerts ({alerts.length})
          </h3>
          {alerts.slice(0, 3).map((alert, index) => (
            <div
              key={`${alert.type}-${alert.metricId}-${index}`}
              className={`p-4 rounded-lg border-2 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.severity)}
                  <div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-400">
                      {alert.platform} • {new Date(alert.timestamp).toLocaleTimeString('de-DE')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  <CheckCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ROAS */}
        <div className="prometheus-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-orange-500" size={20} />
              <span className="text-sm text-gray-400">ROAS</span>
            </div>
            {getTrendIcon(trends?.roas)}
          </div>
          <div className="space-y-1">
            <p
              ref={el => metricsRef.current.roas = el}
              className="text-3xl font-bold text-white"
            >
              {liveMetrics?.roas?.toFixed(2) || '0.00'}x
            </p>
            {trends?.roas !== undefined && (
              <p className={`text-sm ${getTrendColor(trends.roas)}`}>
                {trends.roas > 0 ? '+' : ''}{trends.roas.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Spend */}
        <div className="prometheus-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-blue-500" size={20} />
              <span className="text-sm text-gray-400">Ausgaben</span>
            </div>
            {getTrendIcon(trends?.spend)}
          </div>
          <div className="space-y-1">
            <p
              ref={el => metricsRef.current.spend = el}
              className="text-3xl font-bold text-white"
            >
              {formatCurrency(liveMetrics?.spend)}
            </p>
            {trends?.spend !== undefined && (
              <p className={`text-sm ${getTrendColor(trends.spend)}`}>
                {trends.spend > 0 ? '+' : ''}{trends.spend.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Conversions */}
        <div className="prometheus-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="text-green-500" size={20} />
              <span className="text-sm text-gray-400">Conversions</span>
            </div>
            {getTrendIcon(trends?.conversions)}
          </div>
          <div className="space-y-1">
            <p
              ref={el => metricsRef.current.conversions = el}
              className="text-3xl font-bold text-white"
            >
              {liveMetrics?.conversions?.toFixed(0) || '0'}
            </p>
            {trends?.conversions !== undefined && (
              <p className={`text-sm ${getTrendColor(trends.conversions)}`}>
                {trends.conversions > 0 ? '+' : ''}{trends.conversions.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Profit */}
        <div className="prometheus-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className={liveMetrics?.profit >= 0 ? 'text-green-500' : 'text-red-500'} size={20} />
              <span className="text-sm text-gray-400">Profit</span>
            </div>
            {getTrendIcon(trends?.profit)}
          </div>
          <div className="space-y-1">
            <p
              ref={el => metricsRef.current.profit = el}
              className={`text-3xl font-bold ${liveMetrics?.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {formatCurrency(liveMetrics?.profit)}
            </p>
            {trends?.profit !== undefined && (
              <p className={`text-sm ${getTrendColor(trends.profit)}`}>
                {trends.profit > 0 ? '+' : ''}{trends.profit.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Details */}
        <div className="prometheus-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="text-orange-500" size={20} />
            Performance Details
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Impressions</span>
              <span className="text-white font-semibold">{formatNumber(liveMetrics?.impressions)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Clicks</span>
              <span className="text-white font-semibold">{formatNumber(liveMetrics?.clicks)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">CTR</span>
              <span className="text-white font-semibold">{formatPercentage(liveMetrics?.ctr)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">CPC</span>
              <span className="text-white font-semibold">{formatCurrency(liveMetrics?.cpc)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Conversion Rate</span>
              <span className="text-white font-semibold">{formatPercentage(liveMetrics?.conversionRate)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">CPA</span>
              <span className="text-white font-semibold">{formatCurrency(liveMetrics?.cpa)}</span>
            </div>
          </div>
        </div>

        {/* Profit & Loss Breakdown */}
        {profitDetails && (
          <div className="prometheus-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="text-green-500" size={20} />
              P&L Breakdown
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400 font-semibold">{formatCurrency(profitDetails.revenue)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ad Spend</span>
                <span className="text-red-400 font-semibold">-{formatCurrency(profitDetails.adSpend)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Product Costs</span>
                <span className="text-red-400 font-semibold">-{formatCurrency(profitDetails.productCosts)}</span>
              </div>

              <hr className="border-gray-700" />

              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Gross Profit</span>
                <span className={`font-bold text-lg ${profitDetails.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(profitDetails.grossProfit)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Profit Margin</span>
                <span className={`font-semibold ${profitDetails.profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(profitDetails.profitMargin)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="prometheus-card p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" size={14} />
              <span className="text-gray-400">Updates alle 15min</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-green-400" size={14} />
              <span className="text-gray-400">Live Engine: Aktiv</span>
            </div>
          </div>

          <div className="text-gray-400">
            Nächstes Update: {new Date(Date.now() + 15 * 60 * 1000 - ((Date.now() % (15 * 60 * 1000)))).toLocaleTimeString('de-DE')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePerformanceDashboard;