import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Target,
  DollarSign,
  Calendar,
  Globe,
  Brain,
  BarChart3,
  Users,
  Lightbulb,
  AlertTriangle,
  Edit,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import LivePerformanceDashboard from '../components/LivePerformanceDashboard';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
    }
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📋 Fetching campaign details for ID:', id);

      const response = await api.get(`/campaigns/${id}`);

      if (response.data && response.data.success) {
        setCampaign(response.data.campaign);
        console.log('✅ Campaign details loaded:', response.data.campaign);
      } else {
        throw new Error(response.data?.message || 'Failed to load campaign');
      }
    } catch (error) {
      console.error('❌ Error fetching campaign details:', error);

      let errorMessage = 'Fehler beim Laden der Kampagne';
      if (error.response?.status === 404) {
        errorMessage = 'Kampagne nicht gefunden';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleEdit = () => {
    toast('Bearbeiten wird in Step 3 implementiert', {
      icon: '🔧'
    });
  };

  const handleToggleStatus = () => {
    toast('Status ändern wird in Step 3 implementiert', {
      icon: '⚙️'
    });
  };

  const handleDelete = () => {
    toast('Löschen wird in Step 3 implementiert', {
      icon: '🗑️'
    });
  };

  // Utility Functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht gesetzt';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return 'Nicht gesetzt';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Kampagne wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">Fehler beim Laden</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleGoBack} className="prometheus-button-secondary">
              <ArrowLeft size={16} />
              Zurück
            </button>
            <button onClick={fetchCampaignDetails} className="prometheus-button-primary">
              <RefreshCw size={16} />
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Kampagne nicht gefunden</p>
          <button onClick={handleGoBack} className="prometheus-button-secondary mt-4">
            <ArrowLeft size={16} />
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="prometheus-button-secondary"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                  {campaign.aiContent && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      KI-optimiert
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleEdit} className="prometheus-button-secondary">
                <Edit size={16} />
                Bearbeiten
              </button>
              <button onClick={handleToggleStatus} className="prometheus-button-secondary">
                {campaign.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
                {campaign.status === 'ACTIVE' ? 'Pausieren' : 'Starten'}
              </button>
              <button onClick={handleDelete} className="text-red-400 hover:text-red-300 p-2">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Live Performance Dashboard - TOP PRIORITY! */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-orange-500" size={24} />
            <h2 className="text-2xl font-bold text-white">Live Performance</h2>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
              REAL-TIME
            </span>
          </div>
          <LivePerformanceDashboard campaignId={campaign._id} />
        </div>
        
        {/* Rest des vorhandenen Inhalts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Campaign Overview */}
            <div className="prometheus-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-orange-500" size={20} />
                Kampagnen-Übersicht
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Ziele</label>
                  <p className="text-white">
                    {getObjectiveText(campaign.objective || campaign.primaryObjective)}
                  </p>
                </div>

                {campaign.budget && (
                  <div>
                    <label className="text-sm text-gray-400">Budget</label>
                    <p className="text-white">
                      {formatCurrency(campaign.budget.daily, campaign.budget.currency)}/Tag
                      {campaign.budget.total && (
                        <span className="text-gray-400 block text-sm">
                          Gesamt: {formatCurrency(campaign.budget.total, campaign.budget.currency)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {campaign.schedule && (
                  <div>
                    <label className="text-sm text-gray-400">Laufzeit</label>
                    <p className="text-white">
                      {formatDate(campaign.schedule.startDate)}
                      {campaign.schedule.endDate && ` - ${formatDate(campaign.schedule.endDate)}`}
                    </p>
                  </div>
                )}

                {campaign.platforms && Object.keys(campaign.platforms).length > 0 && (
                  <div>
                    <label className="text-sm text-gray-400">Plattformen</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.keys(campaign.platforms).map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-sm uppercase"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            {campaign.productId && (
              <div className="prometheus-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Produkt-Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <p className="text-white">{campaign.productId.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Kategorie</label>
                    <p className="text-white">{campaign.productId.category}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Preis</label>
                    <p className="text-white">€{campaign.productId.price}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Beschreibung</label>
                    <p className="text-white text-sm">{campaign.productId.description}</p>
                  </div>

                  {campaign.productId.websiteUrl && (
                    <div>
                      <label className="text-sm text-gray-400">Website</label>
                      <a
                        href={campaign.productId.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300"
                      >
                        {campaign.productId.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - AI Strategy */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Strategy Section */}
            {campaign.aiContent && (
              <>
                {/* Strategy Overview */}
                {campaign.aiContent.strategy && (
                  <div className="prometheus-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain className="text-green-400" size={20} />
                      KI-Strategie
                      <span className="text-sm text-green-400 ml-2">
                        ({campaign.aiContent.confidence}% Vertrauen)
                      </span>
                    </h3>

                    <div className="space-y-4">
                      {campaign.aiContent.strategy.marketAnalysis && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Markt-Analyse</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {campaign.aiContent.strategy.marketAnalysis}
                          </p>
                        </div>
                      )}

                      {campaign.aiContent.strategy.targetingStrategy && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Targeting-Strategie</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {campaign.aiContent.strategy.targetingStrategy}
                          </p>
                        </div>
                      )}

                      {campaign.aiContent.strategy.contentStrategy && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Content-Strategie</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {campaign.aiContent.strategy.contentStrategy}
                          </p>
                        </div>
                      )}

                      {campaign.aiContent.strategy.budgetRecommendation && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Budget-Empfehlung</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {campaign.aiContent.strategy.budgetRecommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expected Results */}
                {campaign.aiContent.strategy?.expectedResults && (
                  <div className="prometheus-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="text-blue-400" size={20} />
                      Erwartete Ergebnisse
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {campaign.aiContent.strategy.expectedResults.roas}x
                        </p>
                        <p className="text-sm text-gray-400">ROAS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          €{campaign.aiContent.strategy.expectedResults.cpc}
                        </p>
                        <p className="text-sm text-gray-400">CPC</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">
                          {campaign.aiContent.strategy.expectedResults.conversionRate}%
                        </p>
                        <p className="text-sm text-gray-400">Conversion Rate</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Creatives */}
                {campaign.aiContent.creatives && campaign.aiContent.creatives.length > 0 && (
                  <div className="prometheus-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="text-yellow-400" size={20} />
                      KI-generierte Creatives
                    </h3>

                    <div className="space-y-4">
                      {campaign.aiContent.creatives.map((creative, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs uppercase">
                              {creative.platform}
                            </span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                              {creative.type}
                            </span>
                          </div>

                          {creative.headlines && creative.headlines.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-white mb-2">Headlines</h5>
                              <ul className="space-y-1">
                                {creative.headlines.map((headline, i) => (
                                  <li key={i} className="text-gray-300 text-sm">• {headline}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {creative.descriptions && creative.descriptions.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-white mb-2">Beschreibungen</h5>
                              <ul className="space-y-1">
                                {creative.descriptions.map((desc, i) => (
                                  <li key={i} className="text-gray-300 text-sm">• {desc}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {creative.ctas && creative.ctas.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-white mb-2">Call-to-Actions</h5>
                              <div className="flex flex-wrap gap-2">
                                {creative.ctas.map((cta, i) => (
                                  <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                                    {cta}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {creative.visualDescription && (
                            <div>
                              <h5 className="font-medium text-white mb-2">Visuelles Konzept</h5>
                              <p className="text-gray-300 text-sm">{creative.visualDescription}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audiences */}
                {campaign.aiContent.audiences && campaign.aiContent.audiences.length > 0 && (
                  <div className="prometheus-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="text-purple-400" size={20} />
                      Zielgruppen-Empfehlungen
                    </h3>

                    <div className="space-y-4">
                      {campaign.aiContent.audiences.map((audience, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-white">{audience.name}</h4>
                            {audience.expectedReach && (
                              <span className="text-sm text-gray-400">
                                ~{audience.expectedReach.toLocaleString()} Personen
                              </span>
                            )}
                          </div>

                          {audience.description && (
                            <p className="text-gray-300 text-sm mb-3">{audience.description}</p>
                          )}

                          {audience.targeting && (
                            <div className="space-y-2">
                              {audience.targeting.demographics && (
                                <div>
                                  <span className="text-sm font-medium text-gray-400">Demografie: </span>
                                  <span className="text-sm text-gray-300">
                                    {audience.targeting.demographics.age?.min && audience.targeting.demographics.age?.max &&
                                      `${audience.targeting.demographics.age.min}-${audience.targeting.demographics.age.max} Jahre`}
                                    {audience.targeting.demographics.locations &&
                                      `, ${audience.targeting.demographics.locations.join(', ')}`}
                                  </span>
                                </div>
                              )}

                              {audience.targeting.interests && audience.targeting.interests.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-gray-400">Interessen: </span>
                                  <span className="text-sm text-gray-300">
                                    {audience.targeting.interests.join(', ')}
                                  </span>
                                </div>
                              )}

                              {audience.targeting.behaviors && audience.targeting.behaviors.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-gray-400">Verhalten: </span>
                                  <span className="text-sm text-gray-300">
                                    {audience.targeting.behaviors.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {campaign.aiContent.recommendations && campaign.aiContent.recommendations.length > 0 && (
                  <div className="prometheus-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="text-green-400" size={20} />
                      KI-Empfehlungen
                    </h3>

                    <ul className="space-y-2">
                      {campaign.aiContent.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <span className="text-gray-300 text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                {campaign.aiContent.riskFactors && campaign.aiContent.riskFactors.length > 0 && (
                  <div className="prometheus-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-red-400" size={20} />
                      Risiko-Faktoren
                    </h3>

                    <ul className="space-y-2">
                      {campaign.aiContent.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">⚠</span>
                          <span className="text-gray-300 text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
                {campaign.status === 'ACTIVE' && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="text-orange-500" size={20} />
                            Live Performance Dashboard
                        </h2>
                        <LivePerformanceDashboard campaignId={id} />
                    </div>
                )}

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
            <h4 className="text-green-500 font-semibold mb-2">🔧 Development Debug Info</h4>
            <div className="text-green-400 text-sm space-y-1">
              <p>✅ Step 2: Kampagnen-Details-Seite implementiert</p>
              <p>📋 Campaign ID: {campaign._id}</p>
              <p>🤖 KI-Strategie: {campaign.aiContent ? '✅ Vorhanden' : '❌ Nicht vorhanden'}</p>
              <p>📊 Confidence: {campaign.aiContent?.confidence}%</p>
              <p>⏳ Nächster Schritt: Bearbeiten & Status ändern (Step 3)</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampaignDetails;