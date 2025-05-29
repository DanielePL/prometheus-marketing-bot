import mongoose from 'mongoose';

const marketIntelligenceSchema = new mongoose.Schema({
  // Analysis Target
  productCategory: {
    type: String,
    required: true,
    trim: true
  },
  market: {
    type: String,
    required: true,
    enum: ['GLOBAL', 'USA', 'DACH', 'EU', 'UK', 'ASIA', 'CUSTOM']
  },
  customMarket: {
    countries: [String],
    regions: [String]
  },

  // Competitor Analysis
  competitors: [{
    name: String,
    website: String,
    marketShare: Number, // Percentage
    strength: Number,    // 1-10 rating
    pricing: {
      min: Number,
      max: Number,
      currency: String
    },
    strengths: [String],
    weaknesses: [String],
    adStrategies: [{
      platform: String,
      approach: String,
      estimatedSpend: Number
    }]
  }],

  // Market Trends
  trends: [{
    keyword: String,
    searchVolume: Number,
    growth: String,      // "+15%", "-3%"
    difficulty: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    cpc: Number,
    seasonality: [{
      month: String,
      trend: String // "HIGH", "MEDIUM", "LOW"
    }]
  }],

  // Audience Analysis
  audiences: [{
    name: String,
    size: String,        // "2.3M", "450K"
    engagement: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    demographics: {
      age: String,
      income: String,
      education: String,
      location: String
    },
    psychographics: {
      interests: [String],
      values: [String],
      lifestyle: [String],
      painPoints: [String]
    },
    platforms: [{
      name: String,
      usage: String,     // "HIGH", "MEDIUM", "LOW"
      bestTimes: [String] // ["morning", "evening"]
    }],
    contentPreferences: [String]
  }],

  // Market Opportunities
  opportunities: [{
    type: {
      type: String,
      enum: ['MARKET_GAP', 'UNDERSERVED_SEGMENT', 'EMERGING_TREND', 'PRICING_OPPORTUNITY']
    },
    description: String,
    potential: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    effort: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    timeframe: String    // "immediate", "3-6 months", "6-12 months"
  }],

  // Channel Recommendations
  channelRecommendations: [{
    platform: {
      type: String,
      enum: ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'YOUTUBE', 'TWITTER', 'PINTEREST']
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW']
    },
    budgetAllocation: Number, // Percentage
    reasoning: String,
    expectedROAS: Number,
    targetAudience: String,
    contentStrategy: String,
    estimatedResults: {
      reach: Number,
      cpc: Number,
      conversionRate: Number
    }
  }],

  // Market Analysis Summary
  summary: {
    marketSize: String,
    competitionLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    marketMaturity: {
      type: String,
      enum: ['EMERGING', 'GROWTH', 'MATURE', 'DECLINING']
    },
    entryBarriers: [String],
    successFactors: [String],
    risks: [String],
    recommendations: [String]
  },

  // Analysis Metadata
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  dataSource: {
    type: String,
    enum: ['AI_ANALYSIS', 'MANUAL_RESEARCH', 'API_DATA', 'MIXED']
  },
  analysisDate: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,

  // User relation (optional - can be global data)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
marketIntelligenceSchema.index({ productCategory: 1, market: 1 });
marketIntelligenceSchema.index({ analysisDate: -1 });
marketIntelligenceSchema.index({ userId: 1, createdAt: -1 });

// Method to check if analysis is still valid
marketIntelligenceSchema.methods.isValid = function() {
  if (!this.validUntil) return true;
  return new Date() < this.validUntil;
};

// Method to get top opportunities
marketIntelligenceSchema.methods.getTopOpportunities = function(limit = 3) {
  return this.opportunities
    .filter(opp => opp.potential === 'HIGH')
    .slice(0, limit);
};

// Method to get recommended channels by priority
marketIntelligenceSchema.methods.getRecommendedChannels = function() {
  return this.channelRecommendations
    .sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
};

export default mongoose.model('MarketIntelligence', marketIntelligenceSchema);