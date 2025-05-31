// client/src/pages/CreateCampaign.jsx - KOMPLETTER FUNKTIONIERENDER CODE
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Target, DollarSign, Calendar, Zap, Globe, Users, Brain, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    objective: [],

    // Product Info
    productName: '',
    productDescription: '',
    productPrice: '',
    productCategory: '',
    productUrl: '',

    // Budget & Schedule
    dailyBudget: '',
    totalBudget: '',
    currency: 'EUR',
    startDate: '',
    endDate: '',

    // Target Market
    targetMarket: 'DACH',
    platforms: [],

    // AI Generation Preferences
    aiTone: 'professional',
    aiLanguage: 'german',
    focusKeywords: '',
  });

  // Debug: Log auth status
  console.log('🔍 CreateCampaign Auth Status:', {
    hasApi: !!api,
    hasUser: !!user,
    userEmail: user?.email,
    token: localStorage.getItem('prometheus_token') ? 'EXISTS' : 'MISSING'
  });

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const steps = [
    { id: 1, title: 'Grundlagen', icon: Target },
    { id: 2, title: 'Produkt', icon: Zap },
    { id: 3, title: 'Budget & Zeit', icon: DollarSign },
    { id: 4, title: 'Zielgruppe', icon: Users },
    { id: 5, title: 'KI-Generierung', icon: Brain },
    { id: 6, title: 'Überprüfung', icon: CheckCircle }
  ];

  const objectives = [
    { id: 'AWARENESS', label: 'Markenbekanntheit', description: 'Mehr Menschen über dein Produkt informieren' },
    { id: 'TRAFFIC', label: 'Website-Traffic', description: 'Besucher auf deine Website leiten' },
    { id: 'ENGAGEMENT', label: 'Engagement', description: 'Interaktionen und Engagement steigern' },
    { id: 'LEADS', label: 'Lead-Generierung', description: 'Interessenten und potenzielle Kunden sammeln' },
    { id: 'CONVERSIONS', label: 'Conversions', description: 'Direkte Verkäufe und Conversions erzielen' },
    { id: 'SALES', label: 'Verkäufe', description: 'Maximale Verkaufszahlen erreichen' }
  ];

  const platforms = [
    { id: 'META', label: 'Meta (Facebook/Instagram)', description: 'Größte Reichweite, visuelle Inhalte' },
    { id: 'GOOGLE', label: 'Google Ads', description: 'Hohe Kaufbereitschaft, Suchintention' },
    { id: 'TIKTOK', label: 'TikTok', description: 'Junge Zielgruppe, viral content' },
    { id: 'LINKEDIN', label: 'LinkedIn', description: 'B2B, professionelle Zielgruppe' },
    { id: 'YOUTUBE', label: 'YouTube', description: 'Video-Content, Produktdemos' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectiveToggle = (objectiveId) => {
    setFormData(prev => ({
      ...prev,
      objective: prev.objective.includes(objectiveId)
        ? prev.objective.filter(obj => obj !== objectiveId)
        : [...prev.objective, objectiveId]
    }));
  };

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsCreating(true);
      console.log('🚀 Starting campaign creation...');
      console.log('📊 Form Data:', formData);

      // Enhanced validation
      if (!formData.name?.trim()) {
        toast.error('Bitte gib einen Kampagnen-Namen ein');
        return;
      }

      if (!formData.objective || formData.objective.length === 0) {
        toast.error('Bitte wähle mindestens ein Kampagnen-Ziel');
        return;
      }

      if (!formData.productName?.trim()) {
        toast.error('Bitte gib einen Produkt-Namen ein');
        return;
      }

      if (!formData.productDescription?.trim()) {
        toast.error('Bitte füge eine Produkt-Beschreibung hinzu');
        return;
      }

      if (!formData.productPrice || isNaN(parseFloat(formData.productPrice))) {
        toast.error('Bitte gib einen gültigen Preis ein');
        return;
      }

      if (!formData.productCategory) {
        toast.error('Bitte wähle eine Produkt-Kategorie');
        return;
      }

      if (!formData.dailyBudget || isNaN(parseFloat(formData.dailyBudget))) {
        toast.error('Bitte gib ein gültiges Tagesbudget ein');
        return;
      }

      if (!formData.startDate) {
        toast.error('Bitte wähle ein Start-Datum');
        return;
      }

      if (!formData.platforms || formData.platforms.length === 0) {
        toast.error('Bitte wähle mindestens eine Plattform');
        return;
      }

      // Check API availability
      if (!api) {
        toast.error('API Verbindung fehlt. Bitte neu einloggen.');
        console.error('❌ API instance missing');
        return;
      }

      // Prepare campaign data
      const campaignData = {
        name: formData.name.trim(),
        objective: formData.objective,
        productName: formData.productName.trim(),
        productDescription: formData.productDescription.trim(),
        productPrice: parseFloat(formData.productPrice),
        productCategory: formData.productCategory,
        productUrl: formData.productUrl?.trim() || '',
        dailyBudget: parseFloat(formData.dailyBudget),
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : null,
        currency: formData.currency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        targetMarket: formData.targetMarket,
        platforms: formData.platforms,
        aiTone: formData.aiTone,
        aiLanguage: formData.aiLanguage,
        focusKeywords: formData.focusKeywords?.trim() || ''
      };

      console.log('📝 Sending campaign data:', campaignData);

      // Make API request
      const response = await api.post('/campaigns', campaignData);
      console.log('✅ API Response:', response.data);

      if (response.data && response.data.success) {
        console.log('🎉 Campaign created successfully!');
        toast.success('🔥 Kampagne erfolgreich erstellt!');
        
        // Small delay then navigate
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Campaign creation failed');
      }

    } catch (error) {
      console.error('❌ Campaign creation error:', error);
      
      let errorMessage = 'Unbekannter Fehler beim Erstellen der Kampagne';
      
      if (error.response) {
        console.error('❌ Server Error Response:', error.response);
        errorMessage = error.response.data?.message || `Server Error (${error.response.status})`;
        
        // Show validation errors if available
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            toast.error(err);
          });
          return; // Don't show generic error if we showed specific ones
        }
      } else if (error.request) {
        console.error('❌ No server response:', error.request);
        errorMessage = 'Keine Antwort vom Server. Ist der Server gestartet?';
      } else {
        console.error('❌ Request setup error:', error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Kampagnen-Grundlagen</h3>
              <p className="text-gray-400 mb-6">Gib deiner Kampagne einen Namen und wähle das Hauptziel.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kampagnen-Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="z.B. ProFit Tracker - Deutschland Launch"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Kampagnen-Ziele * (mindestens eins auswählen)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectives.map(objective => (
                  <div
                    key={objective.id}
                    onClick={() => handleObjectiveToggle(objective.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.objective.includes(objective.id)
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{objective.label}</h4>
                        <p className="text-sm text-gray-400">{objective.description}</p>
                      </div>
                      {formData.objective.includes(objective.id) && (
                        <CheckCircle className="text-orange-500" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Produkt-Informationen</h3>
              <p className="text-gray-400 mb-6">Erzähle uns von deinem Produkt, damit die KI perfekte Kampagnen erstellen kann.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Produkt-Name *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="z.B. ProFit Tracker Elite"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kategorie *
                </label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => handleInputChange('productCategory', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Kategorie wählen</option>
                  <option value="Fitness Technology">Fitness Technologie</option>
                  <option value="Fashion">Mode</option>
                  <option value="Electronics">Elektronik</option>
                  <option value="Health & Beauty">Gesundheit & Schönheit</option>
                  <option value="Home & Garden">Haus & Garten</option>
                  <option value="Food & Beverage">Essen & Trinken</option>
                  <option value="Other">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preis (€) *
                </label>
                <input
                  type="number"
                  value={formData.productPrice}
                  onChange={(e) => handleInputChange('productPrice', e.target.value)}
                  placeholder="299.99"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website-URL
                </label>
                <input
                  type="url"
                  value={formData.productUrl}
                  onChange={(e) => handleInputChange('productUrl', e.target.value)}
                  placeholder="https://www.meinprodukt.de"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Produkt-Beschreibung *
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) => handleInputChange('productDescription', e.target.value)}
                placeholder="Beschreibe dein Produkt, seine wichtigsten Features und Vorteile..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Budget & Zeitplan</h3>
              <p className="text-gray-400 mb-6">Definiere dein Budget und den Zeitraum für deine Kampagne.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tagesbudget (€) *
                </label>
                <input
                  type="number"
                  value={formData.dailyBudget}
                  onChange={(e) => handleInputChange('dailyBudget', e.target.value)}
                  placeholder="50"
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gesamtbudget (€)
                </label>
                <input
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                  placeholder="1500"
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Währung
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (Fr.)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start-Datum *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End-Datum
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {formData.dailyBudget && formData.startDate && formData.endDate && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <h4 className="text-orange-500 font-semibold mb-2">Budget-Übersicht</h4>
                <div className="text-sm text-gray-300">
                  <p>Tagesbudget: €{formData.dailyBudget}</p>
                  <p>Geschätzte Laufzeit: {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} Tage</p>
                  <p>Geschätztes Gesamtbudget: €{formData.dailyBudget * Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Zielgruppe & Plattformen</h3>
              <p className="text-gray-400 mb-6">Wähle deinen Zielmarkt und die gewünschten Werbe-Plattformen.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Zielmarkt *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['DACH', 'EU', 'USA', 'GLOBAL'].map(market => (
                  <div
                    key={market}
                    onClick={() => handleInputChange('targetMarket', market)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.targetMarket === market
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <Globe className="mx-auto mb-2 text-orange-500" size={24} />
                      <h4 className="font-semibold text-white">{market}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {market === 'DACH' && 'Deutschland, Österreich, Schweiz'}
                        {market === 'EU' && 'Europäische Union'}
                        {market === 'USA' && 'Vereinigte Staaten'}
                        {market === 'GLOBAL' && 'Weltweit'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Werbe-Plattformen * (mindestens eine auswählen)
              </label>
              <div className="space-y-3">
                {platforms.map(platform => (
                  <div
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.platforms.includes(platform.id)
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{platform.label}</h4>
                        <p className="text-sm text-gray-400">{platform.description}</p>
                      </div>
                      {formData.platforms.includes(platform.id) && (
                        <CheckCircle className="text-orange-500" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">KI-Generierung</h3>
              <p className="text-gray-400 mb-6">Passe die KI-Generierung für deine Kampagne an.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Ton der Anzeigen
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'professional', label: 'Professionell', desc: 'Seriös und vertrauenswürdig' },
                    { id: 'casual', label: 'Locker', desc: 'Freundlich und nahbar' },
                    { id: 'energetic', label: 'Energisch', desc: 'Motivierend und dynamisch' },
                    { id: 'luxury', label: 'Premium', desc: 'Exklusiv und hochwertig' }
                  ].map(tone => (
                    <div
                      key={tone.id}
                      onClick={() => handleInputChange('aiTone', tone.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.aiTone === tone.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-white font-medium">{tone.label}</h5>
                          <p className="text-xs text-gray-400">{tone.desc}</p>
                        </div>
                        {formData.aiTone === tone.id && (
                          <CheckCircle className="text-orange-500" size={20} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Sprache
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'german', label: 'Deutsch', desc: 'Für DACH-Märkte optimiert' },
                    { id: 'english', label: 'Englisch', desc: 'International verwendbar' },
                    { id: 'mixed', label: 'Gemischt', desc: 'Je nach Zielgruppe' }
                  ].map(lang => (
                    <div
                      key={lang.id}
                      onClick={() => handleInputChange('aiLanguage', lang.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.aiLanguage === lang.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-white font-medium">{lang.label}</h5>
                          <p className="text-xs text-gray-400">{lang.desc}</p>
                        </div>
                        {formData.aiLanguage === lang.id && (
                          <CheckCircle className="text-orange-500" size={20} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Focus Keywords (optional)
              </label>
              <input
                type="text"
                value={formData.focusKeywords}
                onChange={(e) => handleInputChange('focusKeywords', e.target.value)}
                placeholder="z.B. Fitness Tracker, Herzfrequenz, Wasserdicht"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Komma-getrennte Keywords, die in den Anzeigen betont werden sollen
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Kampagne Überprüfen</h3>
              <p className="text-gray-400 mb-6">Überprüfe alle Einstellungen vor der Erstellung.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="prometheus-card p-6">
                <h4 className="text-orange-500 font-semibold mb-4">Grundlagen</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Name:</span> <span className="text-white">{formData.name}</span></p>
                  <p>
                    <span className="text-gray-400">Ziele:</span>
                    <span className="text-white">
                      {formData.objective.map(objId =>
                        objectives.find(o => o.id === objId)?.label
                      ).join(', ')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="prometheus-card p-6">
                <h4 className="text-orange-500 font-semibold mb-4">Produkt</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Name:</span> <span className="text-white">{formData.productName}</span></p>
                  <p><span className="text-gray-400">Kategorie:</span> <span className="text-white">{formData.productCategory}</span></p>
                  <p><span className="text-gray-400">Preis:</span> <span className="text-white">€{formData.productPrice}</span></p>
                </div>
              </div>

              <div className="prometheus-card p-6">
                <h4 className="text-orange-500 font-semibold mb-4">Budget & Zeit</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Tagesbudget:</span> <span className="text-white">€{formData.dailyBudget}</span></p>
                  <p><span className="text-gray-400">Start:</span> <span className="text-white">{formData.startDate}</span></p>
                  <p><span className="text-gray-400">Ende:</span> <span className="text-white">{formData.endDate || 'Kein Enddatum'}</span></p>
                </div>
              </div>

              <div className="prometheus-card p-6">
                <h4 className="text-orange-500 font-semibold mb-4">Zielgruppe</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Markt:</span> <span className="text-white">{formData.targetMarket}</span></p>
                  <p><span className="text-gray-400">Plattformen:</span></p>
                  <div className="ml-4">
                    {formData.platforms.map(platformId => (
                      <p key={platformId} className="text-white">• {platforms.find(p => p.id === platformId)?.label}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Brain className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-green-500 font-semibold mb-2">KI-Generierung bereit</h4>
                  <p className="text-green-400 text-sm mb-3">
                    Prometheus wird automatisch erstellen:
                  </p>
                  <ul className="text-green-400 text-sm space-y-1">
                    <li>• Zielgruppen-Analyse für {formData.targetMarket}</li>
                    <li>• Anzeigen-Texte im {formData.aiTone}en Stil</li>
                    <li>• Optimierte Kampagnen-Struktur</li>
                    <li>• Performance-Vorhersagen</li>
                    <li>• Plattform-spezifische Anpassungen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name?.trim() && formData.objective.length > 0;
      case 2:
        return formData.productName?.trim() &&
               formData.productCategory &&
               formData.productPrice &&
               !isNaN(parseFloat(formData.productPrice)) &&
               formData.productDescription?.trim();
      case 3:
        return formData.dailyBudget &&
               !isNaN(parseFloat(formData.dailyBudget)) &&
               formData.startDate;
      case 4:
        return formData.targetMarket && formData.platforms.length > 0;
      case 5:
        return formData.aiTone && formData.aiLanguage;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="prometheus-button-secondary"
            >
              <ArrowLeft size={16} />
              Zurück zum Dashboard
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Neue Kampagne erstellen</h1>
              <p className="text-sm text-gray-400">Schritt {currentStep} von {steps.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive ? 'bg-orange-500/20 text-orange-500' :
                    isCompleted ? 'bg-green-500/20 text-green-500' :
                    'text-gray-500'
                  }`}>
                    <StepIcon size={20} />
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-8 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="prometheus-card p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'prometheus-button-secondary'
              }`}
            >
              <ArrowLeft size={16} />
              Zurück
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  canProceed()
                    ? 'prometheus-button-primary'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Weiter
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isCreating}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  canProceed() && !isCreating
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Erstelle Kampagne...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Kampagne erstellen
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;