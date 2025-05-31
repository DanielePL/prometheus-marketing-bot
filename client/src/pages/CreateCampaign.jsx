// client/src/pages/CreateCampaign.jsx

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  DollarSign,
  Calendar,
  Zap,
  Globe,
  Users,
  Brain,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Eye,
  Lightbulb,
  AlertCircle,
  Save,
  Play,
  RefreshCw
} from 'lucide-react';
import InlineRecommendation from '../components/MarketingConsultant/InlineRecommendation';
import BudgetForecast from '../components/MarketingConsultant/BudgetForecast';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AIConsultantPage from "@pages/AIConsultantPage.jsx";

const CreateCampaign = ({ onGoBack = null, onSave = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(true);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [performanceForecast, setPerformanceForecast] = useState(null);
  const [stepGuidance, setStepGuidance] = useState({});

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
    focusKeywords: ''
  });

  useEffect(() => {
    // Hole Empfehlungen für den aktuellen Schritt
    fetchStepGuidance(currentStep);

    // Aktualisiere die Prognose wenn relevante Daten sich ändern
    if (currentStep === 3 && formData.dailyBudget && formData.productPrice) {
      fetchPerformanceForecast();
    }
  }, [currentStep, formData.dailyBudget, formData.productPrice, formData.objective]);

  const fetchStepGuidance = async (step) => {
    try {
      // API-Aufruf an den Backend-Service
      // In einer echten Implementierung würde dies an den AI-Consultant-Service gehen
      // Für den Moment verwenden wir lokale Daten
      /*
      const response = await axios.post('/api/ai-consultant/campaign-guidance', {
        step,
        currentData: {
          name: formData.name,
          objective: formData.objective,
          product: {
            name: formData.productName,
            price: formData.productPrice,
            category: formData.productCategory,
            description: formData.productDescription
          },
          platforms: formData.platforms,
          budget: {
            daily: formData.dailyBudget,
            total: formData.totalBudget
          },
          duration: {
            start: formData.startDate,
            end: formData.endDate
          }
        }
      });

      if (response.data.success) {
        setStepGuidance(prevGuidance => ({
          ...prevGuidance,
          [step]: response.data.guidance
        }));
      }
      */

      // Lokale Mock-Daten für Entwicklungszwecke
      setStepGuidance(prevGuidance => ({
        ...prevGuidance,
        [step]: getLocalGuidance(step)
      }));
    } catch (error) {
      console.error(`Failed to fetch guidance for step ${step}:`, error);
    }
  };

  const fetchPerformanceForecast = async () => {
    try {
      setIsLoadingForecast(true);

      // In einer echten Implementierung würde dies an den AI-Consultant-Service gehen
      /*
      const response = await axios.post('/api/ai-consultant/forecast', {
        product: {
          name: formData.productName,
          price: parseFloat(formData.productPrice) || 0,
          category: formData.productCategory
        },
        budget: {
          daily: parseFloat(formData.dailyBudget) || 0
        },
        platforms: formData.platforms.length > 0 ? formData.platforms : ['META'],
        objective: formData.objective.length > 0 ? formData.objective[0] : 'SALES'
      });

      if (response.data.success) {
        setPerformanceForecast(response.data);
      }
      */

      // Für Entwicklungszwecke simulieren wir die Prognose
      setTimeout(() => {
        const productPrice = parseFloat(formData.productPrice) || 50;
        const dailyBudget = parseFloat(formData.dailyBudget) || 50;
        const platform = formData.platforms[0] || 'META';
        const objective = formData.objective[0] || 'SALES';

        // Einfache Simulation
        const impressions = dailyBudget * 200;
        const clicks = impressions * 0.02;
        const conversions = clicks * 0.03;
        const revenue = conversions * productPrice;
        const roas = dailyBudget > 0 ? revenue / dailyBudget : 0;

        setPerformanceForecast({
          success: true,
          dailyResults: {
            impressions: Math.round(impressions),
            clicks: Math.round(clicks),
            conversions: Number(conversions.toFixed(2)),
            revenue: Number(revenue.toFixed(2)),
            roas: Number(roas.toFixed(2))
          },
          monthlyResults: {
            impressions: Math.round(impressions * 30),
            clicks: Math.round(clicks * 30),
            conversions: Number((conversions * 30).toFixed(2)),
            revenue: Number((revenue * 30).toFixed(2)),
            roas: Number(roas.toFixed(2))
          },
          recommendedBudget: {
            daily: Math.max(30, Math.round(productPrice * 0.5)),
            optimal: Math.max(50, Math.round(productPrice * 0.8)),
            aggressive: Math.max(100, Math.round(productPrice * 1.5))
          }
        });
        setIsLoadingForecast(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching performance forecast:', error);
      setIsLoadingForecast(false);
    }
  };

  const getLocalGuidance = (step) => {
    // Lokale Empfehlungen für Entwicklungszwecke
    const guidanceData = {
      1: {
        mainAdvice: "Ein klarer, spezifischer Name macht deine Kampagne leicht identifizierbar. Verwende eine Kombination aus Produktname, Ziel und Region/Zeitraum für optimale Übersichtlichkeit.",
        recommendations: [
          `"${formData.productName || 'Dein Produkt'} - Performance Boost Q2"`,
          `"${formData.productCategory || 'Produkt'} - DACH Launch 2025"`,
          `"${formData.productName || 'Produkt'} - ${formData.objective[0] || 'SALES'} Kampagne"`,
          `"Premium ${formData.productCategory || 'Produkt'} - Conversion Q2 2025"`
        ],
        options: [
          {
            name: "Produktfokussiert",
            description: "Stellt das Produkt in den Mittelpunkt",
            pros: ["Klare Zuordnung zum Produkt"],
            cons: ["Weniger Flexibilität bei mehreren Produkten"]
          },
          {
            name: "Zielfokussiert",
            description: "Betont das Kampagnenziel",
            pros: ["Optimiert für Performance-Tracking"],
            cons: ["Weniger markant bei vielen Kampagnen"]
          }
        ]
      },
      3: {
        mainAdvice: "Das optimale Budget hängt von deinem Produktpreis und Kampagnenziel ab. Als Faustregel empfehle ich 50-100% des Produktpreises als tägliches Budget für die ersten 14 Tage, um genügend Daten zu sammeln.",
        recommendations: [
          `€${Math.max(30, Math.round(parseFloat(formData.productPrice || 50) * 0.5))}/Tag (Minimum für erste Tests)`,
          `€${Math.max(50, Math.round(parseFloat(formData.productPrice || 50) * 0.8))}/Tag (Empfohlen für optimale Performance)`,
          `€${Math.max(100, Math.round(parseFloat(formData.productPrice || 50) * 1.5))}/Tag (Aggressives Wachstum)`
        ],
        estimations: {
          description: "Bei deinem Produktpreis sind folgende Ergebnisse zu erwarten:",
          metrics: {
            "ROAS": "3.2-4.5x",
            "CPM": "€7-9",
            "CTR": "1.0-1.8%",
            "Conversion Rate": "2.5-3.5%"
          }
        }
      },
      4: {
        mainAdvice: "Für dein Produkt und Budget ist eine Kombination aus Meta (Facebook/Instagram) und Google Ads optimal. Meta bietet die beste Skalierbarkeit, während Google Nutzer mit Kaufabsicht erreicht.",
        recommendations: [
          "Meta Ads + Google für beste Gesamtperformance",
          "Beginne mit Meta, wenn Budget < €1500/Monat",
          "Für B2B-Produkte: LinkedIn + Google",
          "Für Produkte unter €50: TikTok für junge Zielgruppen"
        ]
      }
    };

    return guidanceData[step] || {
      recommendations: getAIRecommendations()
    };
  };

  const handleBackToDashboard = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log('Navigate back to dashboard');
    }
  };

  const steps = [
    { id: 1, title: 'Grundlagen', icon: Target, description: 'Name und Ziele definieren' },
    { id: 2, title: 'Produkt', icon: Zap, description: 'Produktinformationen hinzufügen' },
    { id: 3, title: 'Budget & Zeit', icon: DollarSign, description: 'Budget und Zeitplan festlegen' },
    { id: 4, title: 'Zielgruppe', icon: Users, description: 'Markt und Plattformen wählen' },
    { id: 5, title: 'KI-Generierung', icon: Brain, description: 'AI-Einstellungen anpassen' },
    { id: 6, title: 'Überprüfung', icon: CheckCircle, description: 'Finale Kontrolle' }
  ];

  const objectives = [
    { id: 'AWARENESS', label: 'Markenbekanntheit', description: 'Mehr Menschen über dein Produkt informieren', icon: Eye },
    { id: 'TRAFFIC', label: 'Website-Traffic', description: 'Besucher auf deine Website leiten', icon: TrendingUp },
    { id: 'ENGAGEMENT', label: 'Engagement', description: 'Interaktionen und Engagement steigern', icon: Users },
    { id: 'LEADS', label: 'Lead-Generierung', description: 'Interessenten und potenzielle Kunden sammeln', icon: Target },
    { id: 'CONVERSIONS', label: 'Conversions', description: 'Direkte Verkäufe und Conversions erzielen', icon: BarChart3 },
    { id: 'SALES', label: 'Verkäufe', description: 'Maximale Verkaufszahlen erreichen', icon: DollarSign }
  ];

  const platforms = [
    { id: 'META', label: 'Meta (Facebook/Instagram)', description: 'Größte Reichweite, visuelle Inhalte', color: 'from-blue-500 to-purple-500' },
    { id: 'GOOGLE', label: 'Google Ads', description: 'Hohe Kaufbereitschaft, Suchintention', color: 'from-green-500 to-blue-500' },
    { id: 'TIKTOK', label: 'TikTok', description: 'Junge Zielgruppe, viral content', color: 'from-pink-500 to-red-500' },
    { id: 'LINKEDIN', label: 'LinkedIn', description: 'B2B, professionelle Zielgruppe', color: 'from-blue-600 to-blue-800' },
    { id: 'YOUTUBE', label: 'YouTube', description: 'Video-Content, Produktdemos', color: 'from-red-500 to-orange-500' }
  ];

  // AI Advisor Recommendations basierend auf aktuellem Schritt und Daten
  const getAIRecommendations = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name) {
          return [
            `"${formData.productName || 'Dein Produkt'} - DACH Launch 2025"`,
            `"Premium ${formData.productCategory || 'Produkt'} Marketing"`,
            `"Performance Campaign - ${formData.productName || 'Q1 2025'}"`,
            `"Conversion Boost - ${formData.productName || 'Deutschland'}"`
          ];
        }
        return [
          'Wähle 2-3 komplementäre Ziele für beste Performance',
          'SALES + TRAFFIC ist eine starke Kombination',
          'Beginne mit AWARENESS bei neuen Produkten'
        ];

      case 2:
        return [
          `Optimaler Preis für ${formData.productCategory || 'dieses Produkt'}: €${Math.round(parseFloat(formData.productPrice || 100) * 0.8)}-€${Math.round(parseFloat(formData.productPrice || 100) * 1.2)}`,
          'Füge emotional ansprechende Keywords hinzu',
          'Betone Unique Selling Points in der Beschreibung',
          'Verwende soziale Beweise und Testimonials'
        ];

      case 3:
        const dailyBudget = Math.max(30, parseFloat(formData.productPrice || 100) * 0.2);
        return [
          `Empfohlenes Tagesbudget: €${Math.round(dailyBudget)} (20% des Produktpreises)`,
          `Für Testing-Phase: €30-50/Tag optimal`,
          `Scale-Phase: €${Math.round(dailyBudget * 2)}-${Math.round(dailyBudget * 3)}/Tag`,
          'Beginne mit 2-4 Wochen Testlaufzeit'
        ];

      case 4:
        return [
          'DACH-Markt: Starte mit Deutschland, dann AT/CH',
          'Meta + Google = 80% der Performance-Marketing-Erfolge',
          'TikTok für Produkte <€50 und Zielgruppe 16-34',
          'LinkedIn nur für B2B-Produkte >€200'
        ];

      case 5:
        return [
          `${formData.productCategory === 'Fitness Technology' ? 'Energisch' : 'Professionell'} passt zu deiner Kategorie`,
          'Deutsche Anzeigen performen 23% besser im DACH-Raum',
          'Fokus-Keywords: Nutze 3-5 relevante Begriffe',
          'A/B-teste verschiedene Tonalitäten'
        ];

      default:
        return [
          'Deine Kampagne ist bereit für den Launch!',
          'Erwartete ROAS: 3.5-4.2x in den ersten 30 Tagen',
          'Performance-Optimierung nach 7 Tagen empfohlen'
        ];
    }
  };

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

  const handleRecommendationClick = (recommendation) => {
    switch (currentStep) {
      case 1:
        if (recommendation.includes('"')) {
          const nameMatch = recommendation.match(/"([^"]+)"/);
          if (nameMatch) {
            handleInputChange('name', nameMatch[1]);
          }
        } else if (recommendation.includes('SALES') || recommendation.includes('AWARENESS') || recommendation.includes('TRAFFIC')) {
          // Für Ziel-Empfehlungen
          const goals = ['SALES', 'TRAFFIC', 'AWARENESS', 'LEADS', 'ENGAGEMENT', 'CONVERSIONS'];
          for (const goal of goals) {
            if (recommendation.includes(goal) && !formData.objective.includes(goal)) {
              handleObjectiveToggle(goal);
              break;
            }
          }
        }
        break;

      case 2:
        // Für Produkt-Empfehlungen
        if (recommendation.includes('Keywords')) {
          // Setze Fokus auf Keywords-Feld
          document.getElementById('focusKeywords')?.focus();
        } else if (recommendation.includes('Unique Selling Points')) {
          // Fokus auf Produktbeschreibung
          document.getElementById('productDescription')?.focus();
        }
        break;

      case 3:
        const budgetMatch = recommendation.match(/€(\d+)/);
        if (budgetMatch) {
          handleInputChange('dailyBudget', budgetMatch[1]);
          // Berechne Gesamtbudget, wenn Daten vorhanden
          if (formData.startDate && formData.endDate) {
            const days = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            handleInputChange('totalBudget', (parseInt(budgetMatch[1], 10) * days).toFixed(2));
          }
        }
        break;

      case 4:
        // Für Plattform-Empfehlungen
        if (recommendation.includes('Meta') && !formData.platforms.includes('META')) {
          handlePlatformToggle('META');
        }
        if (recommendation.includes('Google') && !formData.platforms.includes('GOOGLE')) {
          handlePlatformToggle('GOOGLE');
        }
        if (recommendation.includes('TikTok') && !formData.platforms.includes('TIKTOK')) {
          handlePlatformToggle('TIKTOK');
        }
        if (recommendation.includes('LinkedIn') && !formData.platforms.includes('LINKEDIN')) {
          handlePlatformToggle('LINKEDIN');
        }
        break;

      default:
        console.log('Recommendation clicked:', recommendation);
        break;
    }
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
        toast.error('Kampagnenname ist erforderlich');
        return;
      }

      if (!formData.objective || formData.objective.length === 0) {
        toast.error('Bitte wähle mindestens ein Kampagnenziel');
        return;
      }

      if (!formData.dailyBudget) {
        toast.error('Bitte lege ein tägliches Budget fest');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ Campaign created successfully!');
      toast.success('Kampagne erfolgreich erstellt!');

      if (onSave) {
        onSave(formData);
      } else {
        console.log('Campaign data:', formData);
      }

    } catch (error) {
      console.error('❌ Campaign creation error:', error);
      toast.error('Fehler bei der Kampagnenerstellung: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const renderMarcusAdvice = (step) => {
    const guidance = stepGuidance[step];

    if (!guidance || !guidance.mainAdvice) return null;

    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <Lightbulb size={14} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Marcus' Expertentipp:</h4>
            <div className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: guidance.mainAdvice }} />
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {renderMarcusAdvice(currentStep)}

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Kampagnen-Grundlagen</h3>
              <p className="text-gray-400 mb-6">Gib deiner Kampagne einen Namen und wähle das Hauptziel.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kampagnen-Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="z.B. ProFit Tracker - Deutschland Launch"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              />

              {/* Inline-Empfehlungen für Kampagnennamen */}
              <InlineRecommendation
                recommendations={stepGuidance[1]?.recommendations?.filter(rec => rec.includes('"')) ||
                  getAIRecommendations().filter(rec => rec.includes('"'))}
                onSelect={handleRecommendationClick}
                title="Marcus empfiehlt diese Namen:"
              />
            </div>

            <div className="space-y-3 mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kampagnen-Ziele * (mindestens eins auswählen)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectives.map(objective => {
                  const IconComponent = objective.icon;
                  return (
                    <div
                      key={objective.id}
                      onClick={() => handleObjectiveToggle(objective.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                        formData.objective.includes(objective.id)
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="text-orange-500" size={24} />
                          <div>
                            <h4 className="font-medium text-white">{objective.label}</h4>
                            <p className="text-sm text-gray-400">{objective.description}</p>
                          </div>
                        </div>
                        {formData.objective.includes(objective.id) && (
                          <CheckCircle className="text-orange-500 h-5 w-5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline-Empfehlungen für Kampagnenziele */}
              <InlineRecommendation
                recommendations={stepGuidance[1]?.recommendations?.filter(rec => !rec.includes('"')) ||
                  getAIRecommendations().filter(rec => !rec.includes('"'))}
                onSelect={handleRecommendationClick}
                title="Marcus' Strategie-Tipps:"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {renderMarcusAdvice(currentStep)}

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Produktinformationen</h3>
              <p className="text-gray-400 mb-6">Gib Informationen zum beworbenen Produkt an, um die Kampagne zu optimieren.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Produktname *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="z.B. ProFit Tracker 3000"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Produktkategorie *
                </label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => handleInputChange('productCategory', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Kategorie auswählen</option>
                  <option value="Electronics">Elektronik</option>
                  <option value="Fashion">Mode & Bekleidung</option>
                  <option value="Health">Gesundheit & Fitness</option>
                  <option value="Home">Haus & Garten</option>
                  <option value="Beauty">Beauty & Kosmetik</option>
                  <option value="Software">Software & Apps</option>
                  <option value="Services">Dienstleistungen</option>
                  <option value="Food">Lebensmittel & Getränke</option>
                  <option value="Other">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Produktpreis (€) *
                </label>
                <input
                  type="number"
                  value={formData.productPrice}
                  onChange={(e) => handleInputChange('productPrice', e.target.value)}
                  placeholder="z.B. 49.99"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                />

                {/* Inline-Empfehlung für Produktpreis */}
                {formData.productPrice && (
                  <InlineRecommendation
                    recommendations={stepGuidance[2]?.recommendations?.filter(rec => rec.includes('Optimaler Preis')) ||
                      getAIRecommendations().filter(rec => rec.includes('Optimaler Preis'))}
                    onSelect={handleRecommendationClick}
                    title="Preisempfehlung:"
                    expanded={false}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Produkt-URL
                </label>
                <input
                  type="url"
                  value={formData.productUrl}
                  onChange={(e) => handleInputChange('productUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Produktbeschreibung
              </label>
              <textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => handleInputChange('productDescription', e.target.value)}
                placeholder="Beschreibe dein Produkt und seine Hauptvorteile..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 resize-none"
              />

              {/* Inline-Empfehlung für Produktbeschreibung */}
              <InlineRecommendation
                recommendations={stepGuidance[2]?.recommendations?.filter(rec => !rec.includes('Optimaler Preis')) ||
                  getAIRecommendations().filter(rec => !rec.includes('Optimaler Preis'))}
                onSelect={handleRecommendationClick}
                title="Produktbeschreibung verbessern:"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {renderMarcusAdvice(currentStep)}

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Budget & Zeitplan</h3>
              <p className="text-gray-400 mb-6">Lege dein Budget und den Zeitrahmen für die Kampagne fest.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tägliches Budget (€) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">€</span>
                  <input
                    type="number"
                    value={formData.dailyBudget}
                    onChange={(e) => {
                      handleInputChange('dailyBudget', e.target.value);
                      // Berechne automatisch das Gesamtbudget
                      if (formData.startDate && formData.endDate) {
                        const days = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                        handleInputChange('totalBudget', (parseFloat(e.target.value) * days).toFixed(2));
                      }
                    }}
                    placeholder="z.B. 50"
                    className="w-full px-4 py-3 pl-8 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                {/* Budgetwert-Visualisierung */}
                <div className="mt-1">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={formData.dailyBudget || 50}
                    onChange={(e) => handleInputChange('dailyBudget', e.target.value)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>€10</span>
                    <span>€250</span>
                    <span>€500</span>
                  </div>
                </div>

                {/* Inline-Empfehlungen für Budget */}
                <InlineRecommendation
                  recommendations={stepGuidance[3]?.recommendations ||
                    getAIRecommendations().filter(rec => rec.includes('€'))}
                  onSelect={handleRecommendationClick}
                  title="Empfohlenes Budget:"
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
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US-Dollar ($)</option>
                  <option value="GBP">Britisches Pfund (£)</option>
                  <option value="CHF">Schweizer Franken (CHF)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Startdatum *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    handleInputChange('startDate', e.target.value);
                    // Aktualisiere Gesamtbudget
                    if (formData.dailyBudget && formData.endDate) {
                      const days = Math.ceil((new Date(formData.endDate) - new Date(e.target.value)) / (1000 * 60 * 60 * 24)) + 1;
                      handleInputChange('totalBudget', (parseFloat(formData.dailyBudget) * days).toFixed(2));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enddatum *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    handleInputChange('endDate', e.target.value);
                    // Aktualisiere Gesamtbudget
                    if (formData.dailyBudget && formData.startDate) {
                      const days = Math.ceil((new Date(e.target.value) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                      handleInputChange('totalBudget', (parseFloat(formData.dailyBudget) * days).toFixed(2));
                    }
                  }}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gesamtbudget (geschätzt)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">€</span>
                  <input
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                    placeholder="Wird automatisch berechnet"
                    disabled={!formData.startDate || !formData.endDate || !formData.dailyBudget}
                    className="w-full px-4 py-3 pl-8 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Performance-Vorhersage, wenn Daten verfügbar */}
            {performanceForecast && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 size={18} className="text-orange-500 mr-2" />
                  Performance-Prognose
                </h4>

                <BudgetForecast forecast={performanceForecast} isLoading={isLoadingForecast} />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {renderMarcusAdvice(currentStep)}

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Zielgruppe & Plattformen</h3>
              <p className="text-gray-400 mb-6">Wähle deine Zielregion und die Plattformen für deine Kampagne.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zielmarkt *
                </label>
                <select
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="DACH">DACH (Deutschland, Österreich, Schweiz)</option>
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="EU">Europa</option>
                  <option value="US">USA</option>
                  <option value="GLOBAL">Global</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marketing-Plattformen * (mindestens eine auswählen)
                </label>

                <div className="space-y-4">
                  {platforms.map(platform => (
                    <div
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all overflow-hidden ${
                        formData.platforms.includes(platform.id)
                          ? 'border-orange-500'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {/* Background gradient when selected */}
                      {formData.platforms.includes(platform.id) && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${platform.color} opacity-10`}></div>
                      )}

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${platform.color}`}>
                            {platform.id === 'META' && <Globe className="text-white" size={20} />}
                            {platform.id === 'GOOGLE' && <Target className="text-white" size={20} />}
                            {platform.id === 'TIKTOK' && <Zap className="text-white" size={20} />}
                            {platform.id === 'LINKEDIN' && <Users className="text-white" size={20} />}
                            {platform.id === 'YOUTUBE' && <Play className="text-white" size={20} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{platform.label}</h4>
                            <p className="text-sm text-gray-400">{platform.description}</p>
                          </div>
                        </div>
                        {formData.platforms.includes(platform.id) && (
                          <CheckCircle className="text-orange-500 h-5 w-5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline-Empfehlungen für Plattformen */}
                <InlineRecommendation
                  recommendations={stepGuidance[4]?.recommendations || getAIRecommendations()}
                  onSelect={handleRecommendationClick}
                  title="Marcus' Plattform-Empfehlungen:"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {renderMarcusAdvice(currentStep)}

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">KI-Generierungseinstellungen</h3>
              <p className="text-gray-400 mb-6">Passe die KI-Einstellungen für deine automatisch generierten Anzeigen an.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tonalität der Anzeigen
                </label>
                <select
                  value={formData.aiTone}
                  onChange={(e) => handleInputChange('aiTone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="professional">Professionell</option>
                  <option value="friendly">Freundlich</option>
                  <option value="casual">Locker</option>
                  <option value="formal">Formell</option>
                  <option value="energetic">Energisch</option>
                  <option value="luxurious">Luxuriös</option>
                  <option value="humorous">Humorvoll</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sprache der Anzeigen
                </label>
                <select
                  value={formData.aiLanguage}
                  onChange={(e) => handleInputChange('aiLanguage', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="german">Deutsch</option>
                  <option value="english">Englisch</option>
                  <option value="french">Französisch</option>
                  <option value="italian">Italienisch</option>
                  <option value="spanish">Spanisch</option>
                  <option value="dutch">Niederländisch</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fokus-Keywords (durch Komma getrennt)
                </label>
                <input
                  id="focusKeywords"
                  type="text"
                  value={formData.focusKeywords}
                  onChange={(e) => handleInputChange('focusKeywords', e.target.value)}
                  placeholder="z.B. günstig, hochwertig, schnell, innovativ"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Diese Keywords werden in deinen Anzeigen bevorzugt verwendet.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mt-6">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Lightbulb className="text-orange-500" size={18} />
                Vorschau der generierten Anzeigentexte
              </h4>

              <div className="space-y-4">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-lg text-white font-medium">
                    {formData.productName || 'Dein Produkt'}: {formData.aiTone === 'professional' ? 'Professionelle' : formData.aiTone === 'friendly' ? 'Freundliche' : 'Überzeugende'} Lösung
                  </p>
                  <p className="text-gray-300 mt-1">
                    {formData.productDescription?.substring(0, 60) || `Entdecke die Vorteile von ${formData.productName || 'unserem Produkt'}. Jetzt ansehen!`}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.focusKeywords?.split(',').map((keyword, index) => (
                      keyword.trim() && <span key={index} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">{keyword.trim()}</span>
                    ))}
                    {(!formData.focusKeywords || formData.focusKeywords === '') && (
                      <span className="text-gray-400 text-xs italic">Füge Fokus-Keywords hinzu für eine Vorschau</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-lg text-white font-medium">
                    {formData.aiTone === 'professional' ? 'Top-Qualität garantiert' : formData.aiTone === 'friendly' ? 'Du wirst es lieben!' : 'Limited Offer!'}
                  </p>
                  <p className="text-gray-300 mt-1">
                    {formData.productPrice ? `Jetzt für nur €${formData.productPrice}. ` : ''}
                    {formData.aiTone === 'energetic' ? 'Schnapp dir jetzt dein Exemplar!' : 'Bestelle noch heute.'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                <AlertCircle size={14} className="text-orange-400" />
                Diese Vorschau ist ein Beispiel. Die KI wird optimierte Texte basierend auf allen deinen Kampagneneinstellungen generieren.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Kampagnenüberprüfung</h3>
              <p className="text-gray-400 mb-6">Überprüfe deine Kampagneneinstellungen vor dem Start.</p>
            </div>

            {/* Zusammenfassung in Karten mit Grid-Layout */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Kampagnenübersicht</h4>

              <div className="space-y-6">
                {/* Grundlagen */}
                <div>
                  <h5 className="text-sm font-medium text-orange-500 mb-2 flex items-center">
                    <Target size={16} className="inline mr-2" />
                    Grundlagen
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Kampagnenname</p>
                      <p className="text-white">{formData.name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Kampagnenziele</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.objective.map(obj => {
                          const objective = objectives.find(o => o.id === obj);
                          return (
                            <span key={obj} className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center">
                              {objective ? objective.label : obj}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Produkt */}
                <div>
                  <h5 className="text-sm font-medium text-orange-500 mb-2 flex items-center">
                    <Zap size={16} className="inline mr-2" />
                    Produktinformationen
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Produktname</p>
                      <p className="text-white">{formData.productName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Produktkategorie</p>
                      <p className="text-white">{formData.productCategory || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Produktpreis</p>
                      <p className="text-white">{formData.productPrice ? `€${formData.productPrice}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Produkt-URL</p>
                      <p className="text-white text-sm truncate">{formData.productUrl || '-'}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-xs text-gray-500">Produktbeschreibung</p>
                      <p className="text-white text-sm line-clamp-2">{formData.productDescription || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Budget & Zeitplan */}
                <div>
                  <h5 className="text-sm font-medium text-orange-500 mb-2 flex items-center">
                    <DollarSign size={16} className="inline mr-2" />
                    Budget & Zeitplan
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Tägliches Budget</p>
                      <p className="text-white">{formData.dailyBudget ? `€${formData.dailyBudget}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gesamtbudget</p>
                      <p className="text-white">{formData.totalBudget ? `€${formData.totalBudget}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Startdatum</p>
                      <p className="text-white">{formData.startDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Enddatum</p>
                      <p className="text-white">{formData.endDate || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Zielgruppe */}
                <div>
                  <h5 className="text-sm font-medium text-orange-500 mb-2 flex items-center">
                    <Users size={16} className="inline mr-2" />
                    Zielgruppe
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Zielmarkt</p>
                      <p className="text-white">{formData.targetMarket || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Plattformen</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.platforms.map(plt => {
                          const platform = platforms.find(p => p.id === plt);
                          return (
                            <span key={plt} className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full flex items-center">
                              {platform ? platform.label : plt}
                            </span>
                          );
                        })}
                        {formData.platforms.length === 0 && <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* KI-Generierung */}
                <div>
                  <h5 className="text-sm font-medium text-orange-500 mb-2 flex items-center">
                    <Brain size={16} className="inline mr-2" />
                    KI-Einstellungen
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Tonalität</p>
                      <p className="text-white capitalize">{formData.aiTone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sprache</p>
                      <p className="text-white capitalize">{formData.aiLanguage || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Fokus-Keywords</p>
                      <p className="text-white">{formData.focusKeywords || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance-Vorhersage, falls verfügbar */}
            {performanceForecast && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 size={18} className="text-orange-500 mr-2" />
                  Performance-Prognose
                </h4>

                <BudgetForecast forecast={performanceForecast} isLoading={isLoadingForecast} />
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h5 className="text-white font-medium mb-1">Kampagne kann jederzeit optimiert werden</h5>
                  <p className="text-sm text-gray-300">
                    Du kannst deine Kampagne nach dem Start jederzeit anpassen und optimieren.
                    Nutze die AI-Empfehlungen, um die Performance zu verbessern.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Kampagne wird erstellt...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Kampagne starten
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Zurück zum Dashboard</span>
            </button>

            <h1 className="text-2xl font-bold text-white">Kampagne erstellen</h1>

            <div className="flex items-center">
              <button
                onClick={() => setShowAdvisor(!showAdvisor)}
                className={`flex items-center gap-2 px-4 py-2 rounded border ${
                  showAdvisor 
                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' 
                    : 'bg-gray-700 text-gray-300 border-gray-600'
                }`}
              >
                <Brain size={18} />
                <span>KI-Beratung</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isCurrent = step.id === currentStep;
              const isComplete = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex flex-1 items-center ${
                    step.id === steps.length ? '' : 'md:flex-none'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-full ${
                      isComplete ? 'text-orange-500' : isCurrent ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                        isComplete
                          ? 'bg-orange-500/20 border-2 border-orange-500'
                          : isCurrent
                          ? 'bg-gray-700 border-2 border-orange-500'
                          : 'bg-gray-800 border border-gray-700'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle size={18} />
                      ) : (
                        <StepIcon size={18} />
                      )}
                    </div>
                    <div
                      className={`ml-3 hidden md:block ${
                        isComplete || isCurrent ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          isComplete ? 'text-orange-500' : isCurrent ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        Schritt {step.id}
                      </p>
                      <p
                        className={`text-base font-medium ${
                          isComplete ? 'text-orange-500' : isCurrent ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {step.id !== steps.length && (
                      <div className="flex-1 hidden md:block h-0.5 ml-3 mr-3 bg-gray-700">
                        {isComplete && <div className="h-full bg-orange-500"></div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden text-center mb-6">
            <p className="text-sm text-gray-400">Schritt {currentStep} von {steps.length}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Main Form Content */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={18} />
                Zurück
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Weiter
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Erstelle...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Kampagne erstellen
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI Advisor Sidebar */}
          {showAdvisor && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Brain className="text-orange-500 mr-2" size={20} />
                  KI-Berater
                </h3>

                {stepGuidance[currentStep] && (
                  <InlineRecommendation
                    recommendations={stepGuidance[currentStep].recommendations || getAIRecommendations()}
                    onSelect={handleRecommendationClick}
                    title={`Empfehlungen für Schritt ${currentStep}:`}
                    expanded={true}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;
