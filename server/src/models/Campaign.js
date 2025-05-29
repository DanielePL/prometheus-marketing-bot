// server/src/models/Campaign.js - KOMPLETTER CODE
import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  // Multiple objectives support
  objective: [{
    type: String,
    enum: ['AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'CONVERSIONS', 'SALES']
  }],
  // Primary objective for compatibility
  primaryObjective: {
    type: String,
    required: [true, 'Primary campaign objective is required'],
    enum: ['AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'CONVERSIONS', 'SALES']
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'],
    default: 'DRAFT'
  },

  // Budget & Performance
  budget: {
    daily: {
      type: Number,
      min: [1, 'Daily budget must be at least $1']
    },
    total: {
      type: Number,
      min: [1, 'Total budget must be at least $1']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CHF']
    }
  },

  performance: {
    spend: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    roas: Number,
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    ctr: Number,
    cpc: Number,
    conversions: {
      type: Number,
      default: 0
    },
    conversionRate: Number
  },

  // Platform Integration
  platforms: {
    meta: {
      campaignId: String,
      adSetIds: [String],
      adIds: [String],
      status: String,
      lastSync: Date
    },
    google: {
      campaignId: String,
      adGroupIds: [String],
      adIds: [String],
      status: String,
      lastSync: Date
    },
    tiktok: {
      campaignId: String,
      adGroupIds: [String],
      adIds: [String],
      status: String,
      lastSync: Date
    }
  },

  // AI Generated Content
  aiContent: {
    strategy: {
      marketAnalysis: String,
      targetingStrategy: String,
      contentStrategy: String,
      budgetRecommendation: String,
      expectedResults: {
        roas: Number,
        cpc: Number,
        conversionRate: Number
      }
    },
    creatives: [{
      type: {
        type: String,
        enum: ['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT']
      },
      headlines: [String],
      descriptions: [String],
      ctas: [String],
      visualDescription: String,
      platform: {
        type: String,
        enum: ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN']
      }
    }],
    audiences: [{
      name: String,
      description: String,
      targeting: {
        demographics: {
          age: {
            min: Number,
            max: Number
          },
          genders: [String],
          locations: [String]
        },
        interests: [String],
        behaviors: [String],
        customAudiences: [String]
      },
      expectedReach: Number,
      platform: String
    }],
    generatedAt: Date,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Schedule
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: {
      type: String,
      default: 'UTC'
    },
    dayParting: [{
      day: {
        type: String,
        enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      },
      hours: [{
        start: String, // "09:00"
        end: String    // "17:00"
      }]
    }]
  },

  // Relations
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for metrics
campaignSchema.virtual('metrics', {
  ref: 'Metric',
  localField: '_id',
  foreignField: 'campaignId'
});

// Calculate ROAS
campaignSchema.methods.calculateROAS = function() {
  if (this.performance.spend > 0) {
    this.performance.roas = this.performance.revenue / this.performance.spend;
  }
  return this.performance.roas;
};

// Calculate CTR
campaignSchema.methods.calculateCTR = function() {
  if (this.performance.impressions > 0) {
    this.performance.ctr = (this.performance.clicks / this.performance.impressions) * 100;
  }
  return this.performance.ctr;
};

// Calculate CPC
campaignSchema.methods.calculateCPC = function() {
  if (this.performance.clicks > 0) {
    this.performance.cpc = this.performance.spend / this.performance.clicks;
  }
  return this.performance.cpc;
};

// Update performance metrics
campaignSchema.methods.updatePerformance = function(metrics) {
  Object.assign(this.performance, metrics);
  this.calculateROAS();
  this.calculateCTR();
  this.calculateCPC();
  return this.save();
};

// Indexes
campaignSchema.index({ userId: 1, createdAt: -1 });
campaignSchema.index({ productId: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

export default mongoose.model('Campaign', campaignSchema);