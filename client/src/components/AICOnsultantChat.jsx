import React, { useState, useEffect } from 'react';
import {
  Brain,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Target,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Send,
  Bot,
  User,
  HelpCircle
} from 'lucide-react';

const AIConsultantPage = ({ campaignId = null, onGoBack = null }) => {
  // State
  const [consultant] = useState({
    name: "Marcus",
    role: "Senior Performance Marketing Consultant",
    experience: "15+ Jahre Performance Marketing",
    specialties: ["Meta Ads", "Google Ads", "Performance Optimization", "ROAS Improvement"]
  });

  const [campaign] = useState(campaignId ? {
    name: "ProFit Tracker - DACH Launch Campaign",
    status: "ACTIVE",
    budget: { daily: 500 },
    platforms: { META: true, GOOGLE: true }
  } : null);

  const [dailyRecommendations] = useState([
    {
      campaignName: "ProFit Tracker Campaign",
      insights: [
        { type: 'success', message: 'Excellent ROAS of 4.2x - Consider scaling budget' },
        { type: 'warning', message: 'CTR 1.1% is below average - Test new creatives' },
        { type: 'action', message: 'Budget 89% utilized - Consider increasing' }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      content: `👋 Hallo! Ich bin **Marcus**, Ihr AI Performance Marketing Consultant.\n\nIch helfe Ihnen dabei, Ihre Kampagnen zu optimieren und bessere Ergebnisse zu erzielen. Wie kann ich Ihnen heute helfen?`,
      timestamp: new Date(),
      suggestions: [
        'Analysiere meine aktuelle Kampagne',
        'Wie kann ich meine ROAS verbessern?',
        'Zeige mir Budget-Optimierungen',
        'Was sind meine nächsten Schritte?'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSampleQuestions, setShowSampleQuestions] = useState(true);

  const sampleQuestions = [
    {
      category: 'Performance Analysis',
      questions: [
        'Wie performt meine Kampagne heute?',
        'Warum ist meine ROAS so niedrig?',
        'Welche Plattform bringt die besten Ergebnisse?',
        'Sind meine CTR-Werte im grünen Bereich?'
      ]
    },
    {
      category: 'Optimization',
      questions: [
        'Wie kann ich mein Budget besser verteilen?',
        'Welche Anzeigen sollte ich pausieren?',
        'Wann sollte ich das Budget erhöhen?',
        'Wie optimiere ich für bessere Conversions?'
      ]
    }
  ];

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log('Go back to dashboard');
    }
  };

  const sendMessage = (message = null) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSampleQuestions(false);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageToSend);
      const aiMessage = {
        id: 'ai-' + Date.now(),
        type: 'ai',
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
        actionItems: aiResponse.actionItems,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('roas') || lowerMessage.includes('performance')) {
      return {
        content: `Ich analysiere Ihre **ROAS-Performance**:\n\n📊 **Aktuelle Metriken:**\n- ROAS: 4.2x (Sehr gut!)\n- Spend: €2,450 heute\n- Revenue: €10,290\n\n💡 **Verbesserungsvorschläge:**\n- Erhöhen Sie das Budget für Top-Performer um 20%\n- Testen Sie neue Audiences mit ähnlichen Profilen\n- Optimieren Sie Landingpage für mobile Nutzer`,
        suggestions: [
          'Zeige mir die besten Audiences',
          'Wie kann ich Budget erhöhen?',
          'Welche Creatives performen am besten?'
        ],
        actionItems: [
          'Budget für Lookalike 1% um €50/Tag erhöhen',
          'A/B Test neue Headlines starten'
        ]
      };
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('kosten')) {
      return {
        content: `**Budget-Optimierung Analyse:**\n\n💰 **Aktuelle Verteilung:**\n- Meta Ads: 60% (€300/Tag) - ROAS 4.5x\n- Google Ads: 40% (€200/Tag) - ROAS 3.8x\n\n🎯 **Empfohlene Umverteilung:**\n- Meta Ads: 70% (€350/Tag)\n- Google Ads: 30% (€150/Tag)\n\n**Erwartete Verbesserung:** +15% ROAS`,
        suggestions: [
          'Führe die Budget-Umverteilung durch',
          'Zeige mir Performance-Trends',
          'Welche Tageszeiten sind optimal?'
        ],
        actionItems: [
          'Meta Budget um €50 erhöhen',
          'Google Budget um €50 reduzieren'
        ]
      };
    }

    if (lowerMessage.includes('creative') || lowerMessage.includes('anzeige')) {
      return {
        content: `**Creative-Performance Analyse:**\n\n🎨 **Top Performer:**\n- Video Creative #3: CTR 3.8%, ROAS 5.2x\n- Carousel #1: CTR 2.9%, ROAS 4.6x\n\n⚠️ **Underperformer:**\n- Static Image #2: CTR 0.8%, ROAS 1.9x\n\n**Empfehlung:** Pausieren Sie underperformende Creatives und testen Sie neue Video-Varianten.`,
        suggestions: [
          'Erstelle neue Video-Creatives',
          'Analysiere Zielgruppen-Performance',
          'Starte Creative A/B Tests'
        ],
        actionItems: [
          'Static Image #2 pausieren',
          '3 neue Video-Varianten testen'
        ]
      };
    }

    // Default response
    return {
      content: `Danke für Ihre Frage! Als Ihr **Performance Marketing Consultant** kann ich Ihnen bei folgenden Bereichen helfen:\n\n📊 **Performance-Analyse** - ROAS, CTR, Conversion-Optimierung\n💰 **Budget-Optimierung** - Plattform-Verteilung, Bid-Strategien\n🎨 **Creative-Optimierung** - A/B Testing, Content-Strategien\n🎯 **Targeting** - Audience-Entwicklung, Lookalikes\n\nWas möchten Sie genauer besprechen?`,
      suggestions: [
        'Analysiere meine Performance',
        'Optimiere mein Budget',
        'Verbessere meine Creatives',
        'Zeige mir neue Zielgruppen'
      ],
      actionItems: []
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const getInsightIcon = (type) => {
    const icons = {
      'success': <CheckCircle className="text-green-400" size={16} />,
      'warning': <AlertTriangle className="text-yellow-400" size={16} />,
      'suggestion': <Lightbulb className="text-blue-400" size={16} />,
      'action': <Zap className="text-orange-400" size={16} />
    };
    return icons[type] || <AlertTriangle className="text-gray-400" size={16} />;
  };

  const triggerSpecializedAnalysis = (type) => {
    const analysisMessages = {
      'performance': 'Führe eine detaillierte Performance-Analyse der aktuellen Kampagne durch',
      'budget': 'Optimiere die Budget-Verteilung für bessere Performance',
      'creatives': 'Analysiere die Creative-Performance und gib Verbesserungsvorschläge'
    };

    sendMessage(analysisMessages[type]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-orange-500 rounded transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {campaignId ? 'Kampagne' : 'Dashboard'}
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Marketing Consultant</h1>
                  <p className="text-sm text-gray-400">
                    {consultant.name} • {consultant.experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Info */}
            {campaign && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Aktuelle Kampagne:</p>
                <p className="text-white font-semibold">{campaign.name}</p>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageCircle size={16} className="inline mr-2" />
              Chat
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'insights'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Lightbulb size={16} className="inline mr-2" />
              Insights
            </button>

            <button
              onClick={() => setActiveTab('capabilities')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'capabilities'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Brain size={16} className="inline mr-2" />
              Expertise
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg h-[calc(100vh-300px)] flex flex-col border border-gray-700">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Brain className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">AI Marketing Consultant</h3>
                      <p className="text-sm text-gray-400">Marcus • 15+ Jahre Erfahrung</p>
                    </div>
                  </div>

                  {/* Specialized Analysis Buttons */}
                  {campaignId && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <button
                        onClick={() => triggerSpecializedAnalysis('performance')}
                        disabled={isLoading}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        <TrendingUp className="text-green-400" size={20} />
                        <span className="text-xs text-white">Performance</span>
                      </button>

                      <button
                        onClick={() => triggerSpecializedAnalysis('budget')}
                        disabled={isLoading}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        <DollarSign className="text-blue-400" size={20} />
                        <span className="text-xs text-white">Budget</span>
                      </button>

                      <button
                        onClick={() => triggerSpecializedAnalysis('creatives')}
                        disabled={isLoading}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        <Lightbulb className="text-yellow-400" size={20} />
                        <span className="text-xs text-white">Creatives</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="text-white" size={16} />
                        </div>
                      )}

                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formatMessage(message.content)
                            }}
                          />

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm text-gray-300 font-medium">💡 Vorschläge:</p>
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => sendMessage(suggestion)}
                                  className="block w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Action Items */}
                          {message.actionItems && message.actionItems.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm text-orange-300 font-medium">🎯 Handlungsempfehlungen:</p>
                              {message.actionItems.map((item, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-orange-500/10 rounded">
                                  <Target className="text-orange-400 flex-shrink-0 mt-0.5" size={14} />
                                  <span className="text-sm text-orange-200">{item}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {message.timestamp.toLocaleTimeString('de-DE')}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="text-gray-300" size={16} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="bg-gray-700 text-white p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="animate-spin text-orange-400" size={16} />
                          <span className="text-sm">Marcus denkt nach...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sample Questions */}
                {showSampleQuestions && messages.length <= 1 && (
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-300">💬 Beispiel-Fragen:</h4>
                      <button
                        onClick={() => setShowSampleQuestions(false)}
                        className="text-gray-500 hover:text-gray-300"
                      >
                        <HelpCircle size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {sampleQuestions[0]?.questions.slice(0, 4).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(question)}
                          className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Fragen Sie Marcus nach Optimierungsstrategien..."
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                      />
                      {inputMessage && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Sparkles className="text-orange-400" size={16} />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => sendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send size={16} />
                      {isLoading ? 'Sendet...' : 'Senden'}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 text-center">
                    💡 Tipp: Seien Sie spezifisch mit Ihren Fragen für bessere Antworten
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-orange-500" size={20} />
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => triggerSpecializedAnalysis('performance')}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-orange-500 rounded transition-colors flex items-center gap-2 justify-start"
                  >
                    <BarChart3 size={16} />
                    Performance analysieren
                  </button>

                  <button
                    onClick={() => triggerSpecializedAnalysis('budget')}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-orange-500 rounded transition-colors flex items-center gap-2 justify-start"
                  >
                    <DollarSign size={16} />
                    Budget optimieren
                  </button>

                  <button
                    onClick={() => triggerSpecializedAnalysis('creatives')}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-orange-500 rounded transition-colors flex items-center gap-2 justify-start"
                  >
                    <Lightbulb size={16} />
                    Creatives bewerten
                  </button>
                </div>
              </div>

              {/* Campaign Quick Info */}
              {campaign && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="text-orange-500" size={20} />
                    Kampagnen-Info
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">{campaign.status}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-white">€{campaign.budget.daily}/Tag</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Plattformen:</span>
                      <span className="text-white">
                        {Object.keys(campaign.platforms).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Daily Recommendations */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="text-orange-500" size={24} />
                  Tägliche Empfehlungen
                </h2>

                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-orange-500 rounded transition-colors flex items-center gap-2">
                  <RefreshCw size={16} />
                  Aktualisieren
                </button>
              </div>

              <div className="space-y-4">
                {dailyRecommendations.map((recommendation, index) => (
                  <div key={index} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{recommendation.campaignName}</h4>
                      <span className="text-xs text-gray-400">
                        {recommendation.insights.length} Insights
                      </span>
                    </div>

                    <div className="space-y-2">
                      {recommendation.insights.map((insight, insightIndex) => (
                        <div key={insightIndex} className="flex items-start gap-3 p-3 bg-gray-700 rounded">
                          {getInsightIcon(insight.type)}
                          <span className="text-sm text-gray-300">{insight.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="space-y-6">
            {/* Consultant Profile */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{consultant.name}</h2>
                  <p className="text-gray-400">{consultant.role}</p>
                  <p className="text-sm text-orange-400">{consultant.experience}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialties */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Spezialgebiete</h3>
                  <div className="space-y-2">
                    {consultant.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Sparkles className="text-orange-400" size={16} />
                        <span className="text-gray-300">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Fähigkeiten</h3>
                  <div className="space-y-2">
                    {[
                      'Real-time Performance Analysis',
                      'Budget Optimization',
                      'Creative Performance Review',
                      'ROAS Improvement Strategies',
                      'Platform-specific Recommendations',
                      'Strategic Planning'
                    ].map((capability, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={16} />
                        <span className="text-gray-300">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">So nutzen Sie den AI Consultant optimal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <MessageCircle className="text-blue-400 mb-2" size={20} />
                  <h4 className="font-semibold text-white mb-2">Spezifische Fragen stellen</h4>
                  <p className="text-sm text-gray-400">
                    Fragen Sie nach konkreten Metriken, Problemen oder Zielen für bessere Antworten.
                  </p>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <BarChart3 className="text-green-400 mb-2" size={20} />
                  <h4 className="font-semibold text-white mb-2">Daten kontextualisieren</h4>
                  <p className="text-sm text-gray-400">
                    Erwähnen Sie Kampagnen-IDs oder spezifische Zeiträume für präzise Analysen.
                  </p>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <Target className="text-orange-400 mb-2" size={20} />
                  <h4 className="font-semibold text-white mb-2">Handlungsempfehlungen folgen</h4>
                  <p className="text-sm text-gray-400">
                    Setzen Sie die AI-Empfehlungen um und fragen Sie nach weiteren Optimierungen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIConsultantPage;