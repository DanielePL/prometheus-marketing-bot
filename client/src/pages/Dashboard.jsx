// client/src/pages/Dashboard.jsx - STEP 1: Echte API-Anbindung
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Zap, Target, BarChart3, Brain, Settings, Calendar, DollarSign, Plus, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();

  // State für echte API-Daten
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Kampagnen beim Laden des Dashboards abrufen
  useEffect(() => {
    fetchCampaigns();
  }, [api]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📋 Fetching real campaigns from API...');

      // API-Call mit Error Handling
      const response = await api.get('/campaigns');

      console.log('📦 API Response:', response.data);

      if (response.data && response.data.success) {
        const fetchedCampaigns = response.data.campaigns || [];
        setCampaigns(fetchedCampaigns);
        setLastFetch(new Date().toLocaleTimeString('de-DE'));

        console.log('✅ Campaigns loaded successfully:', fetchedCampaigns.length);
        console.log('📊 Campaign data:', fetchedCampaigns);

        if (fetchedCampaigns.length > 0) {
          toast.success(`${fetchedCampaigns.length} Kampagnen geladen`);
        }
      } else {
        throw new Error(response.data?.message || 'Unexpected API response format');
      }
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);

      let errorMessage = 'Fehler beim Laden der Kampagnen';

      if (error.response) {
        // Server responded with error
        errorMessage = `Server Error: ${error.response.data?.message || error.response.status}`;
        console.error('Server Error Response:', error.response.data);
      } else if (error.request) {
        // No response from server
        errorMessage = 'Keine Antwort vom Server - ist der Server gestartet?';
        console.error('No server response:', error.request);
      } else {
        // Other error
        errorMessage = error.message;
        console.error('Request setup error:', error.message);
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const handleViewCampaign = (campaignId) => {
    console.log('📋 Opening campaign details:', campaignId);
    navigate(`/campaign/${campaignId}`);
  };

  // Utility Functions für bessere Daten-Darstellung
  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht gesetzt';
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Ungültiges Datum';
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return 'Nicht gesetzt';
    try {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-500',
      'PENDING_REVIEW': 'bg-yellow-500',
      'ACTIVE': 'bg-green-500',
      'PAUSED': 'bg-orange-500',
      'COMPLETED': 'bg-blue-500',
      'ARCHIVED': 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      'DRAFT': 'Entwurf',
      'PENDING_REVIEW': 'Wird geprüft',
      'ACTIVE': 'Aktiv',
      'PAUSED': 'Pausiert',
      'COMPLETED': 'Beendet',
      'ARCHIVED': 'Archiviert'
    };
    return texts[status] || status;
  };

  const getObjectiveText = (objectives) => {
    if (!objectives) return 'Keine Ziele';

    const objectiveTexts = {
      'AWARENESS': 'Bekanntheit',
      'TRAFFIC': 'Traffic',
      'ENGAGEMENT': 'Engagement',
      'LEADS': 'Leads',
      'CONVERSIONS': 'Conversions',
      'SALES': 'Verkäufe'
    };

    if (Array.isArray(objectives)) {
      return objectives.map(obj => objectiveTexts[obj] || obj).join(', ');
    }

    return objectiveTexts[objectives] || objectives;
  };

  // Calculate Stats from real data
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    draft: campaigns.filter(c => c.status === 'DRAFT').length,
    aiOptimizations: campaigns.filter(c => c.aiContent).length
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
                <p className="text-xs text-gray-400">Marketing Engine</p>
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
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Dashboard 🔥
              </h2>
              <p className="text-gray-400 text-lg">
                Verwalte deine KI-gestützten Marketing-Kampagnen
              </p>
              {lastFetch && (
                <p className="text-xs text-gray-500 mt-1">
                  Letztes Update: {lastFetch}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCampaigns}
                disabled={isLoading}
                className="prometheus-button-secondary"
                title="Kampagnen aktualisieren"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                {isLoading ? 'Lädt...' : 'Aktualisieren'}
              </button>
              
              {/* HIER DEN NEUEN BUTTON HINZUFÜGEN */}
              <button
                onClick={() => navigate('/ai-consultant')}
                className="prometheus-button-secondary"
                title="AI Consultant öffnen"
              >
                <Brain size={16} />
                AI Consultant
              </button>
              
              <button
                onClick={handleCreateCampaign}
                className="prometheus-button-primary"
              >
                <Plus size={16} />
                Neue Kampagne
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aktive Kampagnen</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
              <Target className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gesamt Kampagnen</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <BarChart3 className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">KI-Optimiert</p>
                <p className="text-2xl font-bold text-white">{stats.aiOptimizations}</p>
              </div>
              <Brain className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="prometheus-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Entwürfe</p>
                <p className="text-2xl font-bold text-white">{stats.draft}</p>
              </div>
              <Zap className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Fehler beim Laden der Kampagnen</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchCampaigns}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Campaigns Section */}
        <div className="prometheus-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="text-orange-500" size={20} />
              Deine Kampagnen ({campaigns.length})
            </h3>
            <button
              onClick={fetchCampaigns}
              className="prometheus-button-secondary text-sm"
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Lädt...' : 'Neu laden'}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && campaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Kampagnen werden geladen...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && campaigns.length === 0 && (
            <div className="text-center py-12">
              <Brain size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
              <h4 className="text-lg font-semibold text-white mb-2">
                Noch keine Kampagnen vorhanden
              </h4>
              <p className="text-gray-400 mb-6">
                Erstelle deine erste KI-gestützte Marketing-Kampagne und starte durch!
              </p>
              <button
                onClick={handleCreateCampaign}
                className="prometheus-button-primary"
              >
                <Plus size={16} />
                Erste Kampagne erstellen
              </button>
            </div>
          )}

          {/* Real Campaigns Grid */}
          {!isLoading && campaigns.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer group"
                  onClick={() => handleViewCampaign(campaign._id)}
                >
                  {/* Campaign Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white truncate flex-1 mr-2">
                      {campaign.name || 'Unbenannte Kampagne'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs text-white flex-shrink-0 ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </div>

                  {/* Campaign Details */}
                  <div className="space-y-3 text-sm">
                    {/* Objectives */}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target size={14} className="flex-shrink-0" />
                      <span className="truncate">
                        {getObjectiveText(campaign.objective || campaign.primaryObjective)}
                      </span>
                    </div>

                    {/* Budget */}
                    {campaign.budget && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <DollarSign size={14} className="flex-shrink-0" />
                        <span className="truncate">
                          {formatCurrency(campaign.budget.daily, campaign.budget.currency)}/Tag
                          {campaign.budget.total && (
                            <span className="text-xs ml-1">
                              ({formatCurrency(campaign.budget.total, campaign.budget.currency)} gesamt)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Schedule */}
                    {campaign.schedule && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(campaign.schedule.startDate)}
                          {campaign.schedule.endDate && ` - ${formatDate(campaign.schedule.endDate)}`}
                        </span>
                      </div>
                    )}

                    {/* Platforms */}
                    {campaign.platforms && Object.keys(campaign.platforms).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {Object.keys(campaign.platforms).map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs uppercase font-medium"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Badge */}
                  {campaign.aiContent && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                      <Brain size={14} className="text-green-400" />
                      <span className="text-xs text-green-400">
                        KI-Strategie ({campaign.aiContent.confidence || 75}% Vertrauen)
                      </span>
                    </div>
                  )}

                  {/* View Button */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 group-hover:bg-orange-600 text-white rounded transition-colors">
                      <Eye size={16} />
                      Details anzeigen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
            <h4 className="text-green-500 font-semibold mb-2">🔧 Development Debug Info</h4>
            <div className="text-green-400 text-sm space-y-1">
              <p>✅ Step 1: Echte API-Anbindung implementiert</p>
              <p>📊 API Status: {error ? '❌ Fehler' : isLoading ? '⏳ Lädt' : '✅ OK'}</p>
              <p>📋 Gefundene Kampagnen: {campaigns.length}</p>
              <p>🔗 API Endpoint: GET /api/campaigns</p>
              <p>⏳ Nächster Schritt: Kampagnen-Details-Seite</p>
            </div>
          </div>
        )}
      </main>
      {/* Quick Actions in Dashboard.jsx */}
      <div className="prometheus-card p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="text-orange-500" size={20} />
          Schnellzugriff
        </h3>
        <div className="space-y-4">
          <button 
            onClick={handleCreateCampaign}
            className="w-full prometheus-button-primary justify-start"
          >
            <Target size={16} />
            Neue Kampagne erstellen
          </button>
          <button 
            onClick={() => navigate('/ai-consultant')}
            className="w-full prometheus-button-secondary justify-start"
          >
            <Brain size={16} />
            AI Marketing Consultant
          </button>
          {/* Weitere Buttons */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;