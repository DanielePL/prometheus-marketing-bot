import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUp, ArrowDown, DollarSign, MousePointer, ShoppingCart, Users, Zap, RefreshCw } from 'lucide-react';

// Dummy-Daten für den Fall, dass die API nicht verfügbar ist
const DUMMY_PERFORMANCE_DATA = {
  dailyPerformance: [
    { date: '01.05', impressions: 1250, clicks: 84, conversions: 5, spend: 42 },
    { date: '02.05', impressions: 1320, clicks: 92, conversions: 6, spend: 45 },
    { date: '03.05', impressions: 1400, clicks: 105, conversions: 8, spend: 51 },
    { date: '04.05', impressions: 1650, clicks: 125, conversions: 10, spend: 62 },
    { date: '05.05', impressions: 1800, clicks: 142, conversions: 12, spend: 68 },
    { date: '06.05', impressions: 2100, clicks: 165, conversions: 15, spend: 78 },
    { date: '07.05', impressions: 2350, clicks: 190, conversions: 18, spend: 89 }
  ],
  metrics: {
    roas: {
      value: 312,
      change: 15.7,
      trend: 'up'
    },
    costPerAcquisition: {
      value: 25.3,
      change: -8.4,
      trend: 'down'
    },
    clickThroughRate: {
      value: 7.85,
      change: 3.2,
      trend: 'up'
    },
    conversionRate: {
      value: 4.65,
      change: 2.1,
      trend: 'up'
    }
  }
};

const LivePerformanceDashboard = ({ campaignId }) => {
  const { api } = useAuth();
  const [performanceData, setPerformanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let fetchInterval;

    const fetchLiveData = async () => {
      try {
        setError(null);
        console.log(`🔄 Fetching live data for campaign: ${campaignId}`);
        
        const response = await api.get(`/performance/dashboard/${campaignId}`);
        
        if (mounted) {
          if (response.data && response.data.success) {
            setPerformanceData(response.data);
            console.log('✅ Live data loaded:', response.data);
          } else {
            throw new Error(response.data?.message || 'Failed to load performance data');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching live data:', error);
        
        if (mounted) {
          // Hier verwenden wir Dummy-Daten, wenn der API-Aufruf fehlschlägt
          console.log('ℹ️ Using dummy performance data due to API error');
          setPerformanceData(DUMMY_PERFORMANCE_DATA);
          
          // Fehlermeldung für Debug-Zwecke
          setError('API nicht verfügbar - zeige Demo-Daten an');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLiveData();
    
    // Daten alle 30 Sekunden aktualisieren
    fetchInterval = setInterval(fetchLiveData, 30000);

    return () => {
      mounted = false;
      clearInterval(fetchInterval);
    };
  }, [campaignId, api]);

  // Format für Währung
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format für Prozent
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setPerformanceData(null);
    setTimeout(() => {
      setPerformanceData(DUMMY_PERFORMANCE_DATA);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="prometheus-card p-6 flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Performance-Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error && !performanceData) {
    return (
      <div className="prometheus-card p-6 flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-gray-400">Wir arbeiten daran, das Problem zu beheben.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hinweis, wenn Dummy-Daten verwendet werden */}
      {error && performanceData && (
        <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 p-3 rounded-lg mb-4 flex justify-between items-center">
          <p className="text-sm flex items-center">
            <Zap className="inline-block mr-2" size={16} />
            {error}
          </p>
          <button 
            onClick={handleRefresh} 
            className="text-blue-300 hover:text-blue-100 transition-colors p-1 rounded-full hover:bg-blue-500/20"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}
      
      {/* KPI-Metriken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ROAS */}
        <div className="prometheus-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">ROAS</p>
              <p className="text-2xl font-bold text-white">{performanceData.metrics.roas.value}%</p>
              <div className={`flex items-center text-sm ${
                performanceData.metrics.roas.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceData.metrics.roas.trend === 'up' ? 
                  <ArrowUp size={16} className="mr-1" /> : 
                  <ArrowDown size={16} className="mr-1" />
                }
                {Math.abs(performanceData.metrics.roas.change)}%
              </div>
            </div>
            <div className="bg-orange-500/20 p-2 rounded">
              <DollarSign className="text-orange-400" size={20} />
            </div>
          </div>
        </div>
        
        {/* CPA (Cost per Acquisition) */}
        <div className="prometheus-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">CPA</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(performanceData.metrics.costPerAcquisition.value)}</p>
              <div className={`flex items-center text-sm ${
                performanceData.metrics.costPerAcquisition.trend === 'down' ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceData.metrics.costPerAcquisition.trend === 'down' ? 
                  <ArrowDown size={16} className="mr-1" /> : 
                  <ArrowUp size={16} className="mr-1" />
                }
                {Math.abs(performanceData.metrics.costPerAcquisition.change)}%
              </div>
            </div>
            <div className="bg-purple-500/20 p-2 rounded">
              <ShoppingCart className="text-purple-400" size={20} />
            </div>
          </div>
        </div>
        
        {/* CTR (Click-Through-Rate) */}
        <div className="prometheus-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">CTR</p>
              <p className="text-2xl font-bold text-white">{formatPercent(performanceData.metrics.clickThroughRate.value)}</p>
              <div className={`flex items-center text-sm ${
                performanceData.metrics.clickThroughRate.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceData.metrics.clickThroughRate.trend === 'up' ? 
                  <ArrowUp size={16} className="mr-1" /> : 
                  <ArrowDown size={16} className="mr-1" />
                }
                {Math.abs(performanceData.metrics.clickThroughRate.change)}%
              </div>
            </div>
            <div className="bg-blue-500/20 p-2 rounded">
              <MousePointer className="text-blue-400" size={20} />
            </div>
          </div>
        </div>
        
        {/* CR (Conversion Rate) */}
        <div className="prometheus-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">CR</p>
              <p className="text-2xl font-bold text-white">{formatPercent(performanceData.metrics.conversionRate.value)}</p>
              <div className={`flex items-center text-sm ${
                performanceData.metrics.conversionRate.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceData.metrics.conversionRate.trend === 'up' ? 
                  <ArrowUp size={16} className="mr-1" /> : 
                  <ArrowDown size={16} className="mr-1" />
                }
                {Math.abs(performanceData.metrics.conversionRate.change)}%
              </div>
            </div>
            <div className="bg-green-500/20 p-2 rounded">
              <Users className="text-green-400" size={20} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance-Diagramm (vereinfacht) */}
      <div className="prometheus-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tägliche Kampagnen-Performance</h3>
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-3">Diagramm wird geladen...</p>
            <div className="flex gap-4 text-sm">
              <div className="text-orange-400 flex items-center"><span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>Impressionen</div>
              <div className="text-blue-400 flex items-center"><span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>Klicks</div>
              <div className="text-green-400 flex items-center"><span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>Conversions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ausgaben-Diagramm (vereinfacht) */}
      <div className="prometheus-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tägliche Ausgaben</h3>
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 h-48 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-3">Ausgaben-Diagramm wird geladen...</p>
            <p className="text-orange-400 text-sm flex items-center justify-center">
              <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
              Durchschnittliche Ausgaben: {formatCurrency(performanceData.dailyPerformance.reduce((sum, day) => sum + day.spend, 0) / performanceData.dailyPerformance.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePerformanceDashboard;