// server/src/routes/campaigns.js - KOMBINIERTER OPTIMALER CODE
import express from 'express';
import jwt from 'jsonwebtoken';
import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateCampaignStrategy } from '../services/openaiService.js'; // ← OpenAI Integration

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
      
      // Erstelle ein Dev-User-Objekt
      req.user = {
        _id: 'dev-user-123',
        email: 'dev@prometheus.com',
        name: 'Dev User',
        plan: 'ENTERPRISE',
        status: 'ACTIVE'
      };
      
      console.log('✅ Dev user authenticated:', req.user.email);
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

// POST /api/campaigns - Create new campaign with OpenAI
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🚀 Creating campaign for user:', req.user.email);
    console.log('📝 Campaign request data:', JSON.stringify(req.body, null, 2));

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

    // Enhanced validation with specific error messages
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name is required'
      });
    }

    if (!objective || !Array.isArray(objective) || objective.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one campaign objective is required'
      });
    }

    if (!productName?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!productDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product description is required'
      });
    }

    if (!productPrice || isNaN(parseFloat(productPrice))) {
      return res.status(400).json({
        success: false,
        message: 'Valid product price is required'
      });
    }

    if (!productCategory) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required'
      });
    }

    if (!dailyBudget || isNaN(parseFloat(dailyBudget))) {
      return res.status(400).json({
        success: false,
        message: 'Valid daily budget is required'
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required'
      });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one platform must be selected'
      });
    }

    console.log('✅ Validation passed, proceeding with campaign creation');

    // Create or find product
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

    // Generate AI strategy - Try OpenAI first, fallback to basic
    console.log('🤖 Generating campaign strategy...');
    let aiStrategy;

    try {
      // Prepare data for OpenAI
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

      // Try OpenAI first
      aiStrategy = await generateCampaignStrategy(campaignDataForAI);
      console.log('✅ OpenAI strategy generated successfully');

    } catch (openaiError) {
      console.warn('⚠️ OpenAI failed, using fallback strategy:', openaiError.message);

      // Fallback to basic strategy
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
      console.log('✅ Fallback strategy generated');
    }

    // Create campaign with AI-generated content
    const campaign = new Campaign({
      name: name.trim(),
      objective: objective, // Array of objectives
      primaryObjective: objective[0], // First one as primary
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

      // Initialize platforms
      platforms: platforms.reduce((acc, platform) => {
        acc[platform.toLowerCase()] = {
          status: 'PENDING',
          lastSync: null
        };
        return acc;
      }, {}),

      // AI Generated Content (from OpenAI or fallback)
      aiContent: aiStrategy,

      // Relations
      userId: req.user._id,
      productId: product._id
    });

    await campaign.save();
    console.log('✅ Campaign created successfully with ID:', campaign._id);

    // Populate product data for response
    await campaign.populate('productId');

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully with AI-generated strategy',
      campaign: campaign.toJSON()
    });

  } catch (error) {
    console.error('❌ Campaign creation error:', error);
    console.error('❌ Error stack:', error.stack);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

export default router;
// Am Ende der Datei hinzufügen, nach der Definition aller Routen
console.log('📋 Campaign routes loaded successfully');