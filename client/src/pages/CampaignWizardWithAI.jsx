// Pfad: src/pages/CampaignWizardWithAI.jsx
// Integration Beispiel für die neuen AI-Features

import React, { useState, useEffect } from 'react';
import SmartKeywordSuggestions from '../components/campaign/SmartKeywordSuggestions';
import SmartCampaignNameGenerator from '../components/campaign/SmartCampaignNameGenerator';
import EnhancedMarcusAdvisor from '../components/campaign/EnhancedMarcusAdvisor';

const CampaignWizardWithAI = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Schritt 1 - Grundlagen
    campaignName: '',
    goals: [],

    // Schritt 2 - Produkt
    productName: '',
    category: '',
    price: 0,
    productUrl: '',
    description: '',
    keywords: [],

    // Schritt 3 - Budget & Zeit
    dailyBudget: 50,
    totalBudget: 400,
    startDate: '',
    endDate: '',

    // Schritt 4 - Zielgruppe
    targetMarket: 'DACH',
    platforms: [],

    // Schritt 5 - KI-Einstellungen
    tone: 'Professionell',
    language: 'Deutsch',
    focusKeywords: ''
  });

  const handleFormDataUpdate = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddKeywords = (newKeywords) => {
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, ...newKeywords]
    }));
  };

  const handleSuggestionApply = (suggestion) => {
    switch (suggestion.action) {
      case 'limit_goals':
        if (formData.goals.length > 2) {
          setFormData(prev => ({
            ...prev,
            goals: prev.goals.slice(0, 2)
          }));
        }
        break;

      case 'increase_budget':
        setFormData(prev => ({
          ...prev,
          dailyBudget: Math.floor(prev.dailyBudget * 1.2)
        }));
        break;

      case 'focus_dach':
        setFormData(prev => ({
          ...prev,
          targetMarket: 'DACH'
        }));
        break;

      default:
        console.log('Suggestion applied:', suggestion);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderFoundationStep();
      case 2:
        return renderProductStep();
      case 3:
        return renderBudgetStep();
      case 4:
        return renderTargetingStep();
      case 5:
        return renderAIStep();
      case 6:
        return renderReviewStep();
      default:
        return renderFoundationStep();
    }
  };

  const renderFoundationStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6">Kampagnen-Grundlagen</h2>

        {/* Campaign Goals */}
        <div className="mb-6">
          <label className="text-white font-medium mb-3 block">Kampagnen-Ziele *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'awareness', label: 'Markenbekanntheit', icon: '👁️' },
              { id: 'traffic', label: 'Website-Traffic', icon: '📈' },
              { id: 'leads', label: 'Lead-Generierung', icon: '🎯' },
              { id: 'conversions', label: 'Conversions', icon: '💰' },
              { id: 'engagement', label: 'Engagement', icon: '👥' },
              { id: 'sales', label: 'Verkäufe', icon: '🛒' }
            ].map(goal => (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  formData.goals.includes(goal.label)
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
                onClick={() => {
                  const newGoals = formData.goals.includes(goal.label)
                    ? formData.goals.filter(g => g !== goal.label)
                    : [...formData.goals, goal.label];
                  handleFormDataUpdate('goals', newGoals);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <div className="text-white text-sm font-medium">{goal.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Campaign Name Generator */}
        <SmartCampaignNameGenerator
          productName={formData.productName}
          selectedGoals={formData.goals}
          campaignName={formData.campaignName}
          onCampaignNameChange={(name) => handleFormDataUpdate('campaignName', name)}
        />
      </div>
    </div>
  );

  const renderProductStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6">Produktinformationen</h2>

        {/* Basic Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-white font-medium mb-2 block">Produktname *</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleFormDataUpdate('productName', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              placeholder="z.B. tracker"
            />
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Produktkategorie *</label>
            <select
              value={formData.category}
              onChange={(e) => handleFormDataUpdate('category', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="">Kategorie wählen</option>
              <option value="Gesundheit & Fitness">Gesundheit & Fitness</option>
              <option value="Technologie">Technologie</option>
              <option value="Mode & Accessoires">Mode & Accessoires</option>
              <option value="Haus & Garten">Haus & Garten</option>
            </select>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Produktpreis (€) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleFormDataUpdate('price', Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              placeholder="45"
            />
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Produkt-URL</label>
            <input
              type="url"
              value={formData.productUrl}
              onChange={(e) => handleFormDataUpdate('productUrl', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              placeholder="http://mein.com"
            />
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-6">
          <label className="text-white font-medium mb-2 block">Produktbeschreibung</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFormDataUpdate('description', e.target.value)}
            rows={4}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
            placeholder="Beschreibe dein Produkt..."
          />
        </div>

        {/* Current Keywords Display */}
        {formData.keywords.length > 0 && (
          <div className="mb-6">
            <label className="text-white font-medium mb-2 block">Aktuelle Keywords</label>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm border border-orange-500/30"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Smart Keyword Suggestions */}
        <SmartKeywordSuggestions
          productName={formData.productName}
          category={formData.category}
          price={formData.price}
          currentKeywords={formData.keywords}
          onAddKeywords={handleAddKeywords}
          onUpdateKeywords={(keywords) => handleFormDataUpdate('keywords', keywords)}
        />
      </div>
    </div>
  );

  const renderBudgetStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6">Budget & Zeitplan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-white font-medium mb-2 block">Tägliches Budget (€)</label>
            <input
              type="number"
              value={formData.dailyBudget}
              onChange={(e) => handleFormDataUpdate('dailyBudget', Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Gesamtbudget (€)</label>
            <input
              type="number"
              value={formData.totalBudget}
              onChange={(e) => handleFormDataUpdate('totalBudget', Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTargetingStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6">Zielgruppe</h2>

        {/* Target Market */}
        <div className="mb-6">
          <label className="text-white font-medium mb-2 block">Zielmarkt</label>
          <select
            value={formData.targetMarket}
            onChange={(e) => handleFormDataUpdate('targetMarket', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="DACH">DACH</option>
            <option value="Europa">Europa</option>
            <option value="Global">Global</option>
          </select>
        </div>

        {/* Platforms */}
        <div>
          <label className="text-white font-medium mb-3 block">Plattformen</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'meta', name: 'Meta (Facebook/Instagram)', icon: '📱' },
              { id: 'google', name: 'Google Ads', icon: '🔍' },
              { id: 'tiktok', name: 'TikTok', icon: '🎵' }
            ].map(platform => (
              <div
                key={platform.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  formData.platforms.includes(platform.id)
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
                onClick={() => {
                  const newPlatforms = formData.platforms.includes(platform.id)
                    ? formData.platforms.filter(p => p !== platform.id)
                    : [...formData.platforms, platform.id];
                  handleFormDataUpdate('platforms', newPlatforms);
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div className="text-white text-sm font-medium">{platform.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6">KI-Generierungseinstellungen</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-white font-medium mb-2 block">Tonalität der Anzeigen</label>
            <select
              value={formData.tone}
              onChange={(e) => handleFormDataUpdate('tone', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="Professionell">Professionell</option>
              <option value="Freundlich">Freundlich</option>
              <option value="Dynamisch">Dynamisch</option>
            </select>
          </div>

          <div>
            <label className="text-white font-medium mb-2 block">Sprache der Anzeigen</label>
            <select
              value={formData.language}
              onChange={(e) => handleFormDataUpdate('language', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="Deutsch">Deutsch</option>
              <option value="Englisch">Englisch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6">Kampagne überprüfen</h2>

        {/* Campaign Summary */}
        <div className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Kampagnen-Name</h3>
            <p className="text-slate-300">{formData.campaignName || 'Nicht festgelegt'}</p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Produkt</h3>
            <p className="text-slate-300">
              {formData.productName} - {formData.category} - €{formData.price}
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Budget</h3>
            <p className="text-slate-300">
              €{formData.dailyBudget}/Tag - Gesamtbudget: €{formData.totalBudget}
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Keywords ({formData.keywords.length})</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.keywords.slice(0, 10).map((keyword, index) => (
                <span key={index} className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-sm">
                  {keyword}
                </span>
              ))}
              {formData.keywords.length > 10 && (
                <span className="text-slate-400 text-sm">+{formData.keywords.length - 10} weitere</span>
              )}
            </div>
          </div>
        </div>

        {/* Launch Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
            🚀 Kampagne starten
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
            📋 Kampagne erstellen
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Step Navigation */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5, 6].map(step => (
                  <div
                    key={step}
                    className={`flex items-center ${step < 6 ? 'flex-1' : ''}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep === step
                          ? 'bg-orange-500 text-white'
                          : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {currentStep > step ? '✓' : step}
                    </div>
                    {step < 6 && (
                      <div
                        className={`flex-1 h-1 mx-4 ${
                          currentStep > step ? 'bg-green-500' : 'bg-slate-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                ← Zurück
              </button>

              <button
                onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                disabled={currentStep === 6}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Weiter →
              </button>
            </div>
          </div>

          {/* Enhanced Marcus Advisor Sidebar */}
          <div className="lg:col-span-1">
            <EnhancedMarcusAdvisor
              currentStep={currentStep}
              formData={formData}
              onSuggestionApply={handleSuggestionApply}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizardWithAI;