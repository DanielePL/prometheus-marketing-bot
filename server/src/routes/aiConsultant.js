// server/src/routes/aiConsultant.js
// AI Performance Marketing Consultant API Routes

import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { getAIConsultantService } from '../services/aiConsultantService.js';

const router = express.Router();

// Enhanced middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // DEV-MODE SUPPORT
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev-token-')) {
      const devUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      req.user = {
        _id: devUserId,
        email: 'dev@prometheus.com',
        name: 'Dev User',
        plan: 'ENTERPRISE',
        status: 'ACTIVE'
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Note: In real implementation, fetch user from database
    req.user = { _id: decoded.userId };
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
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

export default router;