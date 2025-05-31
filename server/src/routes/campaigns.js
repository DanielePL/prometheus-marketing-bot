// server/src/routes/campaigns.js - FIX: Gültige ObjectId für Dev-User
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // ← HINZUFÜGEN
import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateCampaignStrategy } from '../services/openaiService.js';

const router = express.Router();

// Enhanced middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    console.log('🔐 Validating token:', token.substring(0, 20) + '...');

    // DEV-MODE SUPPORT: Wenn es ein dev-token ist und wir im Entwicklungsmodus sind
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev-token-')) {
      console.log('🔧 Development token detected, using dev user');

      // ✅ FIX: Verwende eine gültige MongoDB ObjectId
      const devUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'); // Gültige ObjectId

      req.user = {
        _id: devUserId,  // ← Jetzt eine echte ObjectId!
        email: 'dev@prometheus.com',
        name: 'Dev User',
        plan: 'ENTERPRISE',
        status: 'ACTIVE'
      };

      console.log('✅ Dev user authenticated:', req.user.email);
      console.log('✅ Dev user ObjectId:', req.user._id);
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully for user ID:', decoded.userId);

    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'ACTIVE') {
      console.log('❌ User not found or inactive:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user inactive'
      });
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// POST /api/campaigns - Create new campaign with DEBUG LOGGING
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🚀 ===== CAMPAIGN CREATION DEBUG =====');
    console.log('👤 User:', req.user.email);
    console.log('📦 Raw Request Body Keys:', Object.keys(req.body));
    console.log('📝 Full Request Body:', JSON.stringify(req.body, null, 2));

    const {
      // Basic info
      name,
      objective,
      // Product info
      productName,
      productDescription,
      productPrice,
      productCategory,
      productUrl,
      // Budget & Schedule
      dailyBudget,
      totalBudget,
      currency,
      startDate,
      endDate,
      // Target Market
      targetMarket,
      platforms,
      // AI Preferences
      aiTone,
      aiLanguage,
      focusKeywords
    } = req.body;

    // DEBUG: Check specific values that might cause issues
    console.log('🔍 VALIDATION CHECK:');
    console.log('- name:', typeof name, '=', name);
    console.log('- objective:', typeof objective, Array.isArray(objective), '=', objective);
    console.log('- productName:', typeof productName, '=', productName);
    console.log('- productDescription:', typeof productDescription, '=', productDescription?.substring(0, 30) + '...');
    console.log('- productPrice:', typeof productPrice, '=', productPrice, '| parsed:', parseFloat(productPrice));
    console.log('- productCategory:', typeof productCategory, '=', productCategory);
    console.log('- dailyBudget:', typeof dailyBudget, '=', dailyBudget, '| parsed:', parseFloat(dailyBudget));
    console.log('- startDate:', typeof startDate, '=', startDate);
    console.log('- platforms:', typeof platforms, Array.isArray(platforms), '=', platforms);

    // Enhanced validation with DEBUG OUTPUT
    const errors = [];

    if (!name?.trim()) {
      errors.push('Campaign name is required');
      console.log('❌ FAIL: Campaign name');
    } else console.log('✅ PASS: Campaign name');

    if (!objective || !Array.isArray(objective) || objective.length === 0) {
      errors.push('At least one campaign objective is required');
      console.log('❌ FAIL: Objective -', typeof objective, Array.isArray(objective), objective?.length);
    } else console.log('✅ PASS: Objectives');

    if (!productName?.trim()) {
      errors.push('Product name is required');
      console.log('❌ FAIL: Product name');
    } else console.log('✅ PASS: Product name');

    if (!productDescription?.trim()) {
      errors.push('Product description is required');
      console.log('❌ FAIL: Product description');
    } else console.log('✅ PASS: Product description');

    if (!productPrice || isNaN(parseFloat(productPrice))) {
      errors.push('Valid product price is required');
      console.log('❌ FAIL: Product price -', productPrice, '| isNaN:', isNaN(parseFloat(productPrice)));
    } else console.log('✅ PASS: Product price');

    if (!productCategory) {
      errors.push('Product category is required');
      console.log('❌ FAIL: Product category');
    } else console.log('✅ PASS: Product category');

    if (!dailyBudget || isNaN(parseFloat(dailyBudget))) {
      errors.push('Valid daily budget is required');
      console.log('❌ FAIL: Daily budget -', dailyBudget, '| isNaN:', isNaN(parseFloat(dailyBudget)));
    } else console.log('✅ PASS: Daily budget');

    if (!startDate) {
      errors.push('Start date is required');
      console.log('❌ FAIL: Start date');
    } else console.log('✅ PASS: Start date');

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      errors.push('At least one platform must be selected');
      console.log('❌ FAIL: Platforms -', typeof platforms, Array.isArray(platforms), platforms?.length);
    } else console.log('✅ PASS: Platforms');

    // If validation fails, return detailed error info
    if (errors.length > 0) {
      console.log('❌ ===== VALIDATION FAILED =====');
      errors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        debug: {
          receivedFields: Object.keys(req.body),
          fieldTypes: {
            name: typeof name,
            objective: typeof objective + (Array.isArray(objective) ? ` [${objective?.length}]` : ''),
            productName: typeof productName,
            productDescription: typeof productDescription,
            productPrice: typeof productPrice,
            dailyBudget: typeof dailyBudget,
            platforms: typeof platforms + (Array.isArray(platforms) ? ` [${platforms?.length}]` : '')
          }
        }
      });
    }

    console.log('✅ All validations passed, proceeding...');

    // Rest of your existing code stays the same...
    // (Create/find product, generate AI strategy, create campaign)
    
    console.log('🔍 Looking for existing product with userId:', req.user._id);
    
    let product = await Product.findOne({
      name: productName.trim(),
      userId: req.user._id
    });

    if (!product) {
      console.log('📦 Creating new product:', productName);
      
      product = new Product({
        name: productName.trim(),
        description: productDescription.trim(),
        price: parseFloat(productPrice),
        category: productCategory,
        websiteUrl: productUrl?.trim() || '',
        userId: req.user._id,
        aiAnalysis: {
          confidence: 85,
          lastAnalyzed: new Date()
        }
      });
      
      await product.save();
      console.log('✅ Product created with ID:', product._id);
    } else {
      console.log('📦 Using existing product:', product._id);
    }

    // Generate AI strategy
    console.log('🤖 Generating campaign strategy...');
    let aiStrategy;

    try {
      // Import the openaiService and use the function
      const campaignDataForAI = {
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        productPrice: parseFloat(productPrice),
        productCategory,
        objective,
        targetMarket,
        platforms,
        aiTone,
        aiLanguage,
        focusKeywords: focusKeywords?.trim() || '',
        dailyBudget: parseFloat(dailyBudget)
      };
      
      // Rufe direkt die Fallback-Funktion auf
      console.log('⚠️ Verwende Fallback-Strategie (OpenAI für Debugging deaktiviert)');
      aiStrategy = generateBasicAIStrategy(campaignDataForAI);
      console.log('✅ Fallback-Strategie generiert');
      
    } catch (error) {
      console.warn('⚠️ Fehler bei der Strategiegenerierung:', error.message);
      
      // Verwende immer die Fallback-Strategie
      aiStrategy = generateBasicAIStrategy({
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        productPrice: parseFloat(productPrice),
        productCategory,
        objective,
        targetMarket,
        platforms,
        aiTone,
        aiLanguage,
        focusKeywords: focusKeywords?.trim() || ''
      });
      console.log('✅ Fallback-Strategie generiert nach Fehler');
    }

    // Create campaign with AI-generated content
    console.log('📋 Creating campaign object...');
    const campaign = new Campaign({
      name: name.trim(),
      objective: objective,
      primaryObjective: objective[0],
      status: 'DRAFT',

      budget: {
        daily: parseFloat(dailyBudget),
        total: totalBudget ? parseFloat(totalBudget) : null,
        currency: currency || 'EUR'
      },

      schedule: {
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        timezone: 'Europe/Berlin'
      },

      platforms: platforms.reduce((acc, platform) => {
        acc[platform.toLowerCase()] = {
          status: 'PENDING',
          lastSync: null
        };
        return acc;
      }, {}),

      aiContent: aiStrategy,
      userId: req.user._id,
      productId: product._id
    });

    console.log('💾 Saving campaign to database...');
    await campaign.save();
    console.log('✅ Campaign created successfully with ID:', campaign._id);

    await campaign.populate('productId');

    console.log('🎉 ===== SUCCESS: Campaign created =====');

    // Füge diesen Code direkt vor dem ursprünglichen res.status(201).json({...}) ein
    // und ersetze den ursprünglichen Response-Code

    // DEBUG: Check response before sending
    console.log('📤 ===== PREPARING RESPONSE =====');
    console.log('Campaign ID:', campaign._id);
    console.log('Campaign name:', campaign.name);
    console.log('AI Strategy generated:', !!campaign.aiContent);
    console.log('AI Strategy size:', JSON.stringify(campaign.aiContent).length, 'characters');

    try {
      const responseData = {
        success: true,
        message: 'Campaign created successfully with AI-generated strategy',
        campaign: campaign.toJSON()
      };
      
      console.log('Response data size:', JSON.stringify(responseData).length, 'characters');
      console.log('📤 SENDING RESPONSE...');
      
      res.status(201).json(responseData);
      
      console.log('✅ RESPONSE SENT SUCCESSFULLY');
    } catch (responseError) {
      console.error('❌ RESPONSE ERROR:', responseError);
      res.status(500).json({
        success: false,
        message: 'Error preparing response',
        error: responseError.message
      });
    }

  } catch (error) {
    console.error('❌ ===== CAMPAIGN CREATION ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Mongoose validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Database validation failed',
        errors,
        mongooseError: error.message
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during campaign creation',
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : 'Internal server error'
    });
  }
});

// GET /api/campaigns - Get user campaigns
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching campaigns for user:', req.user.email);

    const campaigns = await Campaign.find({ userId: req.user._id })
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('✅ Found', campaigns.length, 'campaigns for user');

    res.json({
      success: true,
      campaigns: campaigns.map(campaign => campaign.toJSON()),
      total: campaigns.length
    });

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching campaigns'
    });
  }
});

// GET /api/campaigns/:id - Get specific campaign
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching campaign:', req.params.id, 'for user:', req.user.email);

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('productId');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    console.log('✅ Campaign found:', campaign.name);

    res.json({
      success: true,
      campaign: campaign.toJSON()
    });

  } catch (error) {
    console.error('❌ Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching campaign'
    });
  }
});

// ============================================================================
// FALLBACK AI STRATEGY GENERATOR (wenn OpenAI fehlschlägt)
// ============================================================================

function generateBasicAIStrategy(data) {
  const {
    productName,
    productDescription,
    productPrice,
    productCategory,
    objective,
    targetMarket,
    platforms,
    aiTone,
    aiLanguage,
    focusKeywords
  } = data;

  // Generate market analysis
  const marketAnalysis = `Target market analysis for ${productName} in ${targetMarket} region. Product positioned in ${productCategory} category at €${productPrice} price point. Primary objectives: ${objective.join(', ')}.`;

  // Generate targeting strategy
  const targetingStrategy = `Focus on ${targetMarket} market with ${aiTone} messaging tone. Target audience interested in ${productCategory} products, with emphasis on ${focusKeywords ? focusKeywords.split(',').join(' and ') : 'core product benefits'}.`;

  // Generate content strategy
  const contentStrategy = `${aiLanguage === 'german' ? 'German-language' : 'English-language'} content with ${aiTone} tone. Emphasize product benefits and unique selling points. Content optimized for ${platforms.join(', ')} platforms.`;

  // Generate budget recommendation
  const budgetAllocation = generateBudgetAllocation(platforms);
  const budgetRecommendation = `Recommended budget allocation: ${budgetAllocation.map(p => `${p.platform}: ${p.percentage}%`).join(', ')}. Expected ROAS: 3.5-4.5x based on category benchmarks.`;

  // Generate creative suggestions
  const creatives = platforms.map(platform => ({
    type: platform === 'YOUTUBE' ? 'VIDEO' : 'IMAGE',
    headlines: generateHeadlines(productName, aiTone, aiLanguage),
    descriptions: generateDescriptions(productDescription, aiTone, aiLanguage),
    ctas: generateCTAs(objective, aiLanguage),
    visualDescription: `${aiTone} lifestyle imagery featuring ${productName} in use`,
    platform
  }));

  // Generate audience suggestions
  const audiences = [{
    name: `${productCategory} Enthusiasts - ${targetMarket}`,
    description: `Primary target audience for ${productName}`,
    targeting: {
      demographics: {
        age: { min: 25, max: 45 },
        genders: ['male', 'female'],
        locations: getLocationsByMarket(targetMarket)
      },
      interests: generateInterests(productCategory, focusKeywords),
      behaviors: ['online shoppers', 'product researchers'],
      customAudiences: []
    },
    expectedReach: estimateReach(targetMarket, productCategory),
    platform: 'META'
  }];

  return {
    strategy: {
      marketAnalysis,
      targetingStrategy,
      contentStrategy,
      budgetRecommendation,
      expectedResults: {
        roas: 4.0,
        cpc: estimateCPC(productCategory),
        conversionRate: estimateConversionRate(productCategory)
      }
    },
    creatives,
    audiences,
    generatedAt: new Date(),
    confidence: 75 // Lower confidence for fallback
  };
}

// Helper functions for fallback AI generation
function generateBudgetAllocation(platforms) {
  const allocations = {
    'META': 35,
    'GOOGLE': 30,
    'YOUTUBE': 20,
    'TIKTOK': 10,
    'LINKEDIN': 25
  };

  const total = platforms.reduce((sum, platform) => sum + (allocations[platform] || 15), 0);

  return platforms.map(platform => ({
    platform,
    percentage: Math.round(((allocations[platform] || 15) / total) * 100)
  }));
}

function generateHeadlines(productName, tone, language) {
  const headlines = {
    german: {
      professional: [
        `${productName} - Professionelle Qualität für Anspruchsvolle`,
        `Entdecken Sie ${productName} - Ihre neue Lösung`,
        `${productName}: Qualität, die überzeugt`
      ],
      casual: [
        `${productName} macht den Unterschied!`,
        `Warum alle über ${productName} sprechen`,
        `${productName} - Einfach genial!`
      ],
      energetic: [
        `${productName} - Power für Ihre Ziele! 🚀`,
        `Durchstarten mit ${productName}!`,
        `${productName}: Energie, die bewegt!`
      ],
      luxury: [
        `${productName} - Exklusiv für Sie`,
        `Premium-Qualität: ${productName}`,
        `${productName} - Luxus neu definiert`
      ]
    },
    english: {
      professional: [
        `${productName} - Professional Quality Solutions`,
        `Discover ${productName} - Your New Standard`,
        `${productName}: Quality That Delivers`
      ],
      casual: [
        `${productName} Makes All the Difference!`,
        `Why Everyone's Talking About ${productName}`,
        `${productName} - Simply Brilliant!`
      ],
      energetic: [
        `${productName} - Power Your Goals! 🚀`,
        `Get Started with ${productName}!`,
        `${productName}: Energy That Moves!`
      ],
      luxury: [
        `${productName} - Exclusively Yours`,
        `Premium Quality: ${productName}`,
        `${productName} - Luxury Redefined`
      ]
    }
  };

  return headlines[language]?.[tone] || headlines.english.professional;
}

function generateDescriptions(productDescription, tone, language) {
  return [
    productDescription,
    `${productDescription} Jetzt entdecken und überzeugen lassen.`,
    `Erleben Sie die Vorteile: ${productDescription}`
  ];
}

function generateCTAs(objectives, language) {
  const ctas = {
    german: {
      'AWARENESS': ['Mehr erfahren', 'Entdecken', 'Informieren'],
      'TRAFFIC': ['Jetzt besuchen', 'Zur Website', 'Mehr Details'],
      'CONVERSIONS': ['Jetzt kaufen', 'Bestellen', 'Sichern'],
      'SALES': ['Kaufen', 'Bestellen', 'Jetzt sichern'],
      'LEADS': ['Kostenlos testen', 'Info anfordern', 'Kontakt'],
      'ENGAGEMENT': ['Mitmachen', 'Teilnehmen', 'Kommentieren']
    },
    english: {
      'AWARENESS': ['Learn More', 'Discover', 'Find Out'],
      'TRAFFIC': ['Visit Now', 'See More', 'Get Details'],
      'CONVERSIONS': ['Buy Now', 'Order', 'Get Yours'],
      'SALES': ['Purchase', 'Buy Now', 'Order Today'],
      'LEADS': ['Try Free', 'Get Info', 'Contact Us'],
      'ENGAGEMENT': ['Join In', 'Participate', 'Engage']
    }
  };

  return objectives.reduce((allCTAs, objective) => {
    const objectiveCTAs = ctas[language]?.[objective] || ctas.english[objective] || ['Learn More'];
    return [...allCTAs, ...objectiveCTAs];
  }, []);
}

function getLocationsByMarket(market) {
  const markets = {
    'DACH': ['Germany', 'Austria', 'Switzerland'],
    'EU': ['Germany', 'France', 'Spain', 'Italy', 'Netherlands'],
    'USA': ['United States'],
    'GLOBAL': ['Worldwide']
  };
  return markets[market] || ['Germany'];
}

function generateInterests(category, keywords) {
  const baseInterests = {
    'Fitness Technology': ['fitness', 'health tracking', 'wearable technology', 'sports'],
    'Electronics': ['technology', 'gadgets', 'electronics', 'innovation'],
    'Fashion': ['fashion', 'style', 'clothing', 'accessories'],
    'Health & Beauty': ['health', 'beauty', 'wellness', 'self-care']
  };

  let interests = baseInterests[category] || ['lifestyle', 'quality products'];

  if (keywords) {
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
    interests = [...interests, ...keywordList];
  }

  return interests;
}

function estimateReach(market, category) {
  const baseReach = {
    'DACH': 250000,
    'EU': 800000,
    'USA': 1200000,
    'GLOBAL': 3000000
  };
  return baseReach[market] || 100000;
}

function estimateCPC(category) {
  const cpcs = {
    'Fitness Technology': 1.25,
    'Electronics': 1.10,
    'Fashion': 0.85,
    'Health & Beauty': 1.45
  };
  return cpcs[category] || 1.00;
}

function estimateConversionRate(category) {
  const rates = {
    'Fitness Technology': 3.2,
    'Electronics': 2.8,
    'Fashion': 2.1,
    'Health & Beauty': 3.8
  };
  return rates[category] || 2.5;
}

// Am Ende der Datei hinzufügen, nach der Definition aller Routen
console.log('📋 Campaign routes loaded successfully');
// /prometheus-marketing-engine/server/src/routes/campaigns.js
// Google Ads API Routes für Campaign Management

import GoogleAdsService from '../services/integrations/googleAdsService.js';

const googleAdsRouter = express.Router();

// Initialize Google Ads Service
const googleAdsService = new GoogleAdsService();

// Simple auth middleware (replace with your auth system)
const auth = (req, res, next) => {
  // Simple auth placeholder - implement your actual auth
  next();
};

// ==========================================
// LIVE PERFORMANCE ROUTES
// ==========================================

/**
 * GET /api/campaigns/performance/live
 * Holt Live-Performance Daten aller Kampagnen
 */
googleAdsRouter.get('/performance/live', auth, async (req, res) => {
  try {
    const performanceData = await googleAdsService.getRealTimePerformance();
    
    res.json({
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString(),
      platform: 'GOOGLE_ADS'
    });
    
    console.log(`📊 Live performance data delivered for ${Object.keys(performanceData).length} campaigns`);
    
  } catch (error) {
    console.error('❌ Live performance fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live performance data',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns/dashboard
 * Dashboard Übersicht mit allen wichtigen Metriken
 */
googleAdsRouter.get('/dashboard', auth, async (req, res) => {
  try {
    const dashboardData = await googleAdsService.getPrometheusDashboardData();
    
    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Dashboard data fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

// ==========================================
// CAMPAIGN MANAGEMENT ROUTES
// ==========================================

/**
 * POST /api/campaigns/create/performance-max
 * Erstellt neue Performance Max Kampagne
 */
googleAdsRouter.post('/create/performance-max', auth, async (req, res) => {
  try {
    const { name, budgetAmount, targetRoas, assets } = req.body;
    
    // Validation
    if (!name || !budgetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Name and budget amount are required'
      });
    }
    
    if (budgetAmount < 10 || budgetAmount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Budget must be between €10 and €10,000'
      });
    }
    
    const campaignData = {
      name,
      budgetAmount: parseFloat(budgetAmount),
      targetRoas: targetRoas || 4.0,
      assets: assets || {}
    };
    
    const result = await googleAdsService.createPerformanceMaxCampaign(campaignData);
    
    res.status(201).json({
      success: true,
      message: 'Performance Max campaign created successfully',
      data: result
    });
    
    console.log(`✅ New Performance Max campaign created: ${name}`);
    
  } catch (error) {
    console.error('❌ Campaign creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

/**
 * POST /api/campaigns/optimize
 * Triggert manuelle Optimierung aller Kampagnen
 */
googleAdsRouter.post('/optimize', auth, async (req, res) => {
  try {
    const optimizationResults = await googleAdsService.autoOptimizeCampaigns();
    
    const totalOptimizations = Object.keys(optimizationResults).length;
    const successfulOptimizations = Object.values(optimizationResults)
      .filter(result => result.success).length;
    
    res.json({
      success: true,
      message: `Optimization completed for ${totalOptimizations} campaigns`,
      data: {
        totalCampaigns: totalOptimizations,
        successfulOptimizations: successfulOptimizations,
        results: optimizationResults
      }
    });
    
    console.log(`🤖 Manual optimization completed: ${successfulOptimizations}/${totalOptimizations} successful`);
    
  } catch (error) {
    console.error('❌ Manual optimization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Optimization failed',
      message: error.message
    });
  }
});

/**
 * GET /api/campaigns/:campaignId/schedule-optimization
 * Analysiert und optimiert Ad Schedule für spezifische Kampagne
 */
googleAdsRouter.get('/:campaignId/schedule-optimization', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const scheduleRecommendations = await googleAdsService.optimizeAdSchedule(campaignId);
    
    res.json({
      success: true,
      data: {
        campaignId: campaignId,
        recommendations: scheduleRecommendations,
        recommendationCount: Object.keys(scheduleRecommendations).length
      }
    });
    
  } catch (error) {
    console.error(`❌ Schedule optimization failed for campaign ${req.params.campaignId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Schedule optimization failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/campaigns/:campaignId/budget
 * Manueller Budget Update
 */
googleAdsRouter.put('/:campaignId/budget', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { multiplier } = req.body;
    
    if (!multiplier) {
      return res.status(400).json({
        success: false,
        error: 'Multiplier is required'
      });
    }
    
    const result = await googleAdsService.increaseCampaignBudget(campaignId, parseFloat(multiplier));
    
    res.json({
      success: result,
      message: result ? 'Budget updated successfully' : 'Budget update failed',
      campaignId: campaignId
    });
    
  } catch (error) {
    console.error(`❌ Budget update failed for campaign ${req.params.campaignId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Budget update failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/campaigns/:campaignId/status
 * Pause/Enable Kampagne
 */
googleAdsRouter.put('/:campaignId/status', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.body; // 'PAUSED' or 'ENABLED'
    
    if (!['PAUSED', 'ENABLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either PAUSED or ENABLED'
      });
    }
    
    let result;
    if (status === 'PAUSED') {
      result = await googleAdsService.pauseCampaign(campaignId);
    } else {
      // Implement enableCampaign method if needed
      result = false;
    }
    
    res.json({
      success: result,
      message: `Campaign ${status.toLowerCase()} ${result ? 'successfully' : 'failed'}`,
      campaignId: campaignId,
      newStatus: status
    });
    
  } catch (error) {
    console.error(`❌ Status update failed for campaign ${req.params.campaignId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Status update failed',
      message: error.message
    });
  }
});

   // Am Ende der campaigns.js nach export default router
   
   // Google Ads Router-Routen als Sub-Router hinzufügen
   router.use('/google-ads', googleAdsRouter);
   
   export { router as default, googleAdsRouter };