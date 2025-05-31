// server/src/routes/aiConsultant.js
// AI Performance Marketing Consultant API Routes

import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { getAIConsultantService } from '../services/aiConsultantService.js';

const router = express.Router();

// Verbesserte Authentifizierungs-Middleware mit Dev-Mode-Unterstützung
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // Spezifische Logging für Debugging
    console.log('🔐 Auth-Anfrage erhalten:');
    console.log('   - Headers vorhanden:', !!req.headers.authorization);
    console.log('   - Token extrahiert:', token ? `${token.substring(0, 10)}...` : 'nicht vorhanden');
    console.log('   - Umgebung:', process.env.NODE_ENV);

    // Kein Token vorhanden
    if (!token) {
      console.log('❌ Kein Token bereitgestellt');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // ERWEITERTE DEV-MODE UNTERSTÜTZUNG
    if (process.env.NODE_ENV === 'development') {
      // Prüfe verschiedene Dev-Token-Formate
      if (token === 'dev-token' || 
          token.startsWith('dev-token-') || 
          token === 'dev-user-token' ||
          token === 'test-token') {
        
        console.log('✅ Dev-Token erkannt, auto-login aktiviert');
        const devUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
        req.user = {
          _id: devUserId,
          id: devUserId, // Wichtig: Füge beide Formate hinzu
          email: 'dev@prometheus.com',
          name: 'Dev User',
          plan: 'ENTERPRISE',
          status: 'ACTIVE'
        };
        return next();
      }
    }

    // DEMO-MODUS FÜR TESTS
    if (token === 'demo-token' || token === 'demo-user') {
      console.log('🎮 Demo-Modus aktiviert');
      const demoUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
      req.user = {
        _id: demoUserId,
        id: demoUserId, // Beide Formate
        email: 'demo@prometheus.com',
        name: 'Demo User',
        plan: 'BASIC',
        status: 'ACTIVE'
      };
      return next();
    }

    // Normaler JWT-Validierungsprozess
    try {
      console.log('🔑 JWT-Validierung wird versucht');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT erfolgreich validiert');
      
      // WICHTIG: Beide _id und id Formate bereitstellen
      req.user = { 
        _id: decoded.userId || decoded.id || decoded._id,
        id: decoded.userId || decoded.id || decoded._id,
      };
      
      console.log('👤 Benutzer authentifiziert:', req.user);
      return next();
    } catch (jwtError) {
      console.error('❌ JWT-Validierungsfehler:', jwtError.message);
      
      // Fallback für den Fall, dass JWT_SECRET fehlt
      if (process.env.NODE_ENV === 'development' && !process.env.JWT_SECRET) {
        console.log('⚠️ JWT_SECRET fehlt, verwende Development-Fallback');
        const fallbackUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439013');
        req.user = {
          _id: fallbackUserId,
          id: fallbackUserId,
          email: 'fallback@prometheus.com',
          name: 'Fallback User',
          plan: 'ENTERPRISE',
          status: 'ACTIVE'
        };
        return next();
      }
      
      throw jwtError; // Rethrow für den Haupt-Error-Handler
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==========================================
// CHAT INTERFACE ROUTES
// ==========================================

/**
 * POST /api/ai-consultant/chat
 * Main chat interface with AI consultant
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, campaignId, context } = req.body;
    const userId = req.user._id;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`🧠 AI Chat: User ${userId} asks: "${message.substring(0, 100)}..."`);

    const aiConsultant = getAIConsultantService();
    const response = await aiConsultant.chatWithConsultant(
      userId,
      message.trim(),
      campaignId,
      context || {}
    );

    res.json(response);

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI consultant temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// SPECIALIZED ANALYSIS ROUTES
// ==========================================

/**
 * POST /api/ai-consultant/analyze-campaign/:campaignId
 * Deep campaign performance analysis
 */
router.post('/analyze-campaign/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;

    console.log(`📊 AI Analysis: Campaign ${campaignId} for user ${userId}`);

    const aiConsultant = getAIConsultantService();
    const analysis = await aiConsultant.analyzeCampaignPerformance(campaignId, userId);

    res.json(analysis);

  } catch (error) {
    console.error('❌ Campaign analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Campaign analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ai-consultant/optimize-budget/:campaignId
 * Budget optimization recommendations
 */
router.post('/optimize-budget/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { totalBudget } = req.body;
    const userId = req.user._id;

    if (!totalBudget || totalBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total budget is required'
      });
    }

    console.log(`💰 Budget Optimization: Campaign ${campaignId}, Budget €${totalBudget}`);

    const aiConsultant = getAIConsultantService();
    const optimization = await aiConsultant.optimizeBudgetAllocation(
      campaignId,
      userId,
      totalBudget
    );

    res.json(optimization);

  } catch (error) {
    console.error('❌ Budget optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Budget optimization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ai-consultant/suggest-creatives/:campaignId
 * Creative improvement suggestions
 */
router.post('/suggest-creatives/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;

    console.log(`🎨 Creative Suggestions: Campaign ${campaignId}`);

    const aiConsultant = getAIConsultantService();
    const suggestions = await aiConsultant.suggestCreativeImprovements(campaignId, userId);

    res.json(suggestions);

  } catch (error) {
    console.error('❌ Creative suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Creative suggestions failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// QUICK INSIGHTS & RECOMMENDATIONS
// ==========================================

/**
 * GET /api/ai-consultant/quick-insights/:campaignId
 * Quick performance insights
 */
router.get('/quick-insights/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;

    console.log(`⚡ Quick Insights: Campaign ${campaignId}`);

    const aiConsultant = getAIConsultantService();
    const insights = await aiConsultant.getQuickInsights(campaignId, userId);

    res.json({
      success: true,
      insights: insights || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Quick insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not generate insights',
      insights: []
    });
  }
});

/**
 * GET /api/ai-consultant/daily-recommendations
 * Daily recommendations for all user campaigns
 */
router.get('/daily-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`📋 Daily Recommendations for user ${userId}`);

    const aiConsultant = getAIConsultantService();
    const recommendations = await aiConsultant.generateDailyRecommendations(userId);

    res.json({
      success: true,
      recommendations: recommendations,
      count: recommendations.length,
      generated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Daily recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not generate daily recommendations',
      recommendations: []
    });
  }
});

// ==========================================
// CONSULTANT INFORMATION
// ==========================================

/**
 * GET /api/ai-consultant/info
 * Get consultant personality and capabilities
 */
router.get('/info', authenticateToken, (req, res) => {
  try {
    const aiConsultant = getAIConsultantService();

    res.json({
      success: true,
      consultant: aiConsultant.consultantPersonality,
      capabilities: [
        'Real-time Campaign Analysis',
        'Budget Optimization',
        'Creative Performance Review',
        'ROAS Improvement Strategies',
        'Platform-specific Recommendations',
        'Troubleshooting & Problem Solving',
        'Strategic Planning & Forecasting'
      ],
      supportedPlatforms: ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN'],
      languages: ['German', 'English'],
      availability: '24/7'
    });

  } catch (error) {
    console.error('❌ Consultant info error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not load consultant information'
    });
  }
});

// ==========================================
// SAMPLE QUESTIONS & HELP
// ==========================================

/**
 * GET /api/ai-consultant/sample-questions
 * Get sample questions users can ask
 */
router.get('/sample-questions', authenticateToken, (req, res) => {
  try {
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
      },
      {
        category: 'Strategy',
        questions: [
          'Welche neue Zielgruppe sollte ich testen?',
          'Wie kann ich meine Reichweite erhöhen?',
          'Was sind die nächsten Schritte für Q2?',
          'Sollte ich neue Plattformen hinzufügen?'
        ]
      },
      {
        category: 'Troubleshooting',
        questions: [
          'Warum sinken meine Conversions?',
          'Was läuft schief bei meiner Meta-Kampagne?',
          'Warum steigen meine CPCs?',
          'Wie behebe ich niedrige Impressions?'
        ]
      }
    ];

    res.json({
      success: true,
      sampleQuestions: sampleQuestions,
      tips: [
        'Seien Sie spezifisch mit Ihren Fragen',
        'Erwähnen Sie konkrete Metriken oder Probleme',
        'Fragen Sie nach konkreten Handlungsempfehlungen',
        'Nutzen Sie Kampagnen-spezifische Anfragen für bessere Antworten'
      ]
    });

  } catch (error) {
    console.error('❌ Sample questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not load sample questions'
    });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================

/**
 * GET /api/ai-consultant/health
 * Check AI consultant service health
 */
router.get('/health', authenticateToken, (req, res) => {
  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    res.json({
      success: true,
      status: hasOpenAI ? 'ACTIVE' : 'LIMITED',
      openaiConnected: hasOpenAI,
      features: {
        chat: hasOpenAI,
        analysis: hasOpenAI,
        optimization: hasOpenAI,
        fallbackMode: !hasOpenAI
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Consultant health check error:', error);
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Health check failed'
    });
  }
});

// Test-Route für OpenAI API
router.post('/test-connection', async (req, res) => {
  try {
    const { message = "Gib mir 3 Tipps zur Verbesserung meiner ROAS." } = req.body;
    
    console.log('🧪 OpenAI API Test gestartet');
    
    const aiConsultant = getAIConsultantService();
    
    // Vereinfachter Test mit direktem API-Aufruf
    const response = await aiConsultant.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Du bist Marcus, ein Senior Performance Marketing Consultant." },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    // Einfaches JSON für die Antwort
    const result = {
      success: true,
      testId: `test-${Date.now()}`,
      rawResponse: response.choices[0].message.content,
      formattedResponse: {
        content: response.choices[0].message.content,
        suggestions: [
          "Testen Sie unterschiedliche Zielgruppen",
          "Optimieren Sie Ihre Landing Page",
          "Überwachen Sie Ihre Konkurrenz"
        ],
        actionItems: [
          "ROAS-Tracking einrichten",
          "A/B-Tests starten"
        ]
      }
    };
    
    console.log('✅ OpenAI API Test erfolgreich!');
    return res.json(result);
  } catch (error) {
    console.error('❌ OpenAI API Test Fehler:', error);
    return res.status(500).json({
      success: false,
      message: 'OpenAI API Test fehlgeschlagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test-Route für JSON-formatierte Antworten
router.post('/test-json-format', async (req, res) => {
  try {
    const { message = "Gib mir 3 Tipps zur Verbesserung meiner ROAS." } = req.body;
    
    console.log('🧪 OpenAI JSON-Format Test gestartet');
    
    const aiConsultant = getAIConsultantService();
    
    // Test mit JSON-Antwortformat
    const response = await aiConsultant.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Du bist Marcus, ein Senior Performance Marketing Consultant.
          Antworte NUR mit einem JSON-Objekt im folgenden Format:
          {
            "content": "Deine Hauptantwort",
            "suggestions": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"],
            "actionItems": ["Handlungsempfehlung 1", "Handlungsempfehlung 2"]
          }`
        },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse JSON response
    const parsedResponse = JSON.parse(response.choices[0].message.content);
    
    console.log('✅ OpenAI JSON-Format Test erfolgreich!');
    return res.json({
      success: true,
      testId: `json-test-${Date.now()}`,
      rawJsonString: response.choices[0].message.content,
      parsedResponse: parsedResponse
    });
  } catch (error) {
    console.error('❌ OpenAI JSON-Format Test Fehler:', error);
    return res.status(500).json({
      success: false,
      message: 'OpenAI JSON-Format Test fehlgeschlagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ai-consultant/public-test
 * Öffentlicher Testendpunkt ohne Authentifizierung
 */
router.post('/public-test', async (req, res) => {
  try {
    const { message = "Gib mir 3 Tipps zur Marketing-Optimierung." } = req.body;
    
    console.log('🔓 Öffentlicher OpenAI API Test gestartet');
    
    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API-Schlüssel fehlt'
      });
    }
    
    const aiConsultant = getAIConsultantService();
    
    // Einfacher OpenAI-Aufruf
    const response = await aiConsultant.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Du bist ein hilfreicher Marketing-Assistent." },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    return res.json({
      success: true,
      message: 'OpenAI API ist korrekt konfiguriert',
      response: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    });
    
  } catch (error) {
    console.error('❌ Öffentlicher Test Fehler:', error);
    return res.status(500).json({
      success: false,
      message: 'OpenAI API Test fehlgeschlagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ai-consultant/debug
 * Debug-Endpunkt für die Problemdiagnose
 */
router.post('/debug', authenticateToken, async (req, res) => {
  try {
    const { message, campaignId, debugMode } = req.body;
    const userId = req.user._id;
    
    console.log('🔍 AI Consultant Debug-Modus aktiviert');
    
    // Eingabedaten protokollieren
    const requestData = {
      timestamp: new Date().toISOString(),
      userId: userId.toString(),
      message: message || '[Keine Nachricht]',
      campaignId: campaignId || '[Keine Kampagne]',
      debugMode: debugMode || 'standard',
      headers: {
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? 'Bearer [vorhanden]' : '[fehlt]'
      }
    };
    
    console.log('📥 Debug Eingabedaten:', JSON.stringify(requestData, null, 2));
    
    // Einfache Antwort ohne AI-Aufruf
    if (debugMode === 'bypass-ai') {
      return res.json({
        success: true,
        debugMode: true,
        response: "Dies ist eine Debug-Antwort ohne AI-Aufruf.",
        suggestions: ["Debug-Vorschlag 1", "Debug-Vorschlag 2"],
        actionItems: ["Debug-Aktion 1"],
        timestamp: new Date().toISOString()
      });
    }
    
    // Einfacher AI-Test
    const aiConsultant = getAIConsultantService();
    const testMessage = "Erstelle eine kurze Test-Antwort für Debug-Zwecke.";
    
    const response = await aiConsultant.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Du bist ein Debug-System. Erstelle eine kurze Antwort." },
        { role: "user", content: testMessage }
      ],
      max_tokens: 100,
      temperature: 0.5
    });
    
    return res.json({
      success: true,
      debugMode: true,
      requestData: requestData,
      aiTest: {
        success: true,
        model: response.model,
        response: response.choices[0].message.content
      },
      mockResponse: {
        content: "Dies ist eine Debug-Antwort. Die AI funktioniert, aber dies ist eine Mockantwort.",
        suggestions: ["Debug-Vorschlag 1", "Debug-Vorschlag 2", "Debug-Vorschlag 3"],
        actionItems: ["Debug-Aktion 1", "Debug-Aktion 2"]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Debug-Endpunkt Fehler:', error);
    return res.status(500).json({
      success: false,
      debugMode: true,
      message: 'Debug-Endpunkt Fehler',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Neue Route für die Kampagnenerstellung
router.post('/campaign-guidance', authenticateToken, async (req, res) => {
  try {
    const { step, currentData } = req.body;
    const userId = req.user._id || req.user.id;

    if (!step) {
      return res.status(400).json({
        success: false,
        message: 'Step parameter is required'
      });
    }

    const aiConsultant = getAIConsultantService();
    const guidance = await aiConsultant.guideCampaignCreation(
      userId,
      step,
      currentData || {}
    );

    res.json(guidance);

  } catch (error) {
    console.error('❌ Campaign guidance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate campaign guidance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route für Kampagnen-Performance-Prognosen
router.post('/forecast', authenticateToken, async (req, res) => {
  try {
    const { campaignData } = req.body;
    const userId = req.user._id || req.user.id;

    if (!campaignData) {
      return res.status(400).json({
        success: false,
        message: 'Campaign data is required'
      });
    }

    const aiConsultant = getAIConsultantService();
    const forecast = await aiConsultant.forecastCampaignPerformance(campaignData);

    res.json(forecast);

  } catch (error) {
    console.error('❌ Campaign forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate campaign forecast',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;