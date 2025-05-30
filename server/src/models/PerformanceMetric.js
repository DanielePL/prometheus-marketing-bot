// server/src/models/PerformanceMetric.js - NEUE DATEI ERSTELLEN
import mongoose from 'mongoose';

const performanceMetricSchema = new mongoose.Schema({
  // Campaign Reference
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },

  // Time Dimension - für Live Tracking
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  hour: {
    type: Number,
    min: 0,
    max: 23
  },

  // Platform
  platform: {
    type: String,
    required: true,
    enum: ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'YOUTUBE', 'COMBINED'],
    index: true
  },

  // === LIVE PERFORMANCE METRICS ===

  // Spend Metrics
  spend: {
    type: Number,
    default: 0,
    min: 0
  },
  budget: {
    type: Number,
    default: 0,
    min: 0
  },
  budgetUtilization: {
    type: Number, // Percentage of budget used
    default: 0,
    min: 0,
    max: 100
  },

  // Traffic Metrics
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  reach: {
    type: Number,
    default: 0,
    min: 0
  },

  // Conversion Metrics
  conversions: {
    type: Number,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0
  },

  // === LIVE CALCULATED METRICS ===

  // Performance Ratios
  ctr: {
    type: Number, // Click-through rate (%)
    default: 0,
    min: 0
  },
  cpc: {
    type: Number, // Cost per click
    default: 0,
    min: 0
  },
  cpm: {
    type: Number, // Cost per 1000 impressions
    default: 0,
    min: 0
  },

  // Conversion Metrics
  conversionRate: {
    type: Number, // Conversion rate (%)
    default: 0,
    min: 0
  },
  cpa: {
    type: Number, // Cost per acquisition
    default: 0,
    min: 0
  },

  // === PROFIT & LOSS METRICS ===

  roas: {
    type: Number, // Return on ad spend
    default: 0,
    min: 0
  },
  profit: {
    type: Number, // Revenue - Spend - Product Costs
    default: 0
  },
  profitMargin: {
    type: Number, // Profit margin percentage
    default: 0
  },

  // === ADVANCED METRICS ===

  // Quality Metrics
  qualityScore: {
    type: Number,
    min: 1,
    max: 10
  },
  relevanceScore: {
    type: Number,
    min: 1,
    max: 10
  },

  // Engagement Metrics
  engagementRate: {
    type: Number,
    default: 0,
    min: 0
  },
  socialEngagement: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    saves: { type: Number, default: 0 }
  },

  // === ALERT TRIGGERS ===

  alerts: [{
    type: {
      type: String,
      enum: ['ROAS_DROP', 'BUDGET_EXHAUSTED', 'HIGH_CPA', 'LOW_CTR', 'CONVERSION_DROP', 'PROFIT_NEGATIVE']
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    message: String,
    triggered: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: Date
  }],

  // === META DATA ===

  dataSource: {
    type: String,
    enum: ['META_API', 'GOOGLE_API', 'TIKTOK_API', 'MANUAL', 'SIMULATED'],
    default: 'SIMULATED'
  },

  isLive: {
    type: Boolean,
    default: true
  },

  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// === INDEXES FÜR LIVE PERFORMANCE ===
performanceMetricSchema.index({ campaignId: 1, timestamp: -1 });
performanceMetricSchema.index({ platform: 1, timestamp: -1 });
performanceMetricSchema.index({ campaignId: 1, platform: 1, timestamp: -1 });
performanceMetricSchema.index({ timestamp: -1 }); // Latest metrics first
performanceMetricSchema.index({ 'alerts.triggered': 1, 'alerts.type': 1 }); // Alert queries

// === METHODS FÜR LIVE CALCULATIONS ===

// Calculate all performance metrics
performanceMetricSchema.methods.calculateMetrics = function() {
  // CTR
  if (this.impressions > 0) {
    this.ctr = (this.clicks / this.impressions) * 100;
  }

  // CPC
  if (this.clicks > 0) {
    this.cpc = this.spend / this.clicks;
  }

  // CPM
  if (this.impressions > 0) {
    this.cpm = (this.spend / this.impressions) * 1000;
  }

  // Conversion Rate
  if (this.clicks > 0) {
    this.conversionRate = (this.conversions / this.clicks) * 100;
  }

  // CPA
  if (this.conversions > 0) {
    this.cpa = this.spend / this.conversions;
  }

  // ROAS
  if (this.spend > 0) {
    this.roas = this.revenue / this.spend;
  }

  // Budget Utilization
  if (this.budget > 0) {
    this.budgetUtilization = (this.spend / this.budget) * 100;
  }

  this.lastUpdate = new Date();
  return this;
};

// Check for performance alerts
performanceMetricSchema.methods.checkAlerts = function(campaign) {
  const alerts = [];

  // ROAS Drop Alert
  if (this.roas < 3.0 && this.spend > 50) {
    alerts.push({
      type: 'ROAS_DROP',
      severity: this.roas < 2.0 ? 'CRITICAL' : 'HIGH',
      message: `ROAS dropped to ${this.roas.toFixed(2)}x - Expected: 3.0x+`,
      triggered: true
    });
  }

  // Budget Exhausted Alert
  if (this.budgetUtilization > 90) {
    alerts.push({
      type: 'BUDGET_EXHAUSTED',
      severity: this.budgetUtilization > 95 ? 'CRITICAL' : 'MEDIUM',
      message: `Budget ${this.budgetUtilization.toFixed(1)}% exhausted`,
      triggered: true
    });
  }

  // High CPA Alert
  const expectedCPA = campaign?.aiContent?.strategy?.expectedResults?.cpc * 10 || 20;
  if (this.cpa > expectedCPA && this.conversions > 0) {
    alerts.push({
      type: 'HIGH_CPA',
      severity: this.cpa > expectedCPA * 2 ? 'HIGH' : 'MEDIUM',
      message: `CPA €${this.cpa.toFixed(2)} above expected €${expectedCPA.toFixed(2)}`,
      triggered: true
    });
  }

  // Low CTR Alert
  if (this.ctr < 1.0 && this.impressions > 1000) {
    alerts.push({
      type: 'LOW_CTR',
      severity: this.ctr < 0.5 ? 'HIGH' : 'MEDIUM',
      message: `CTR ${this.ctr.toFixed(2)}% below industry average`,
      triggered: true
    });
  }

  // Negative Profit Alert
  if (this.profit < 0 && this.spend > 100) {
    alerts.push({
      type: 'PROFIT_NEGATIVE',
      severity: 'CRITICAL',
      message: `Campaign running at €${Math.abs(this.profit).toFixed(2)} loss`,
      triggered: true
    });
  }

  this.alerts = alerts;
  return alerts;
};

// === STATIC METHODS FÜR LIVE DASHBOARD ===

// Get latest metrics for a campaign
performanceMetricSchema.statics.getLatestMetrics = function(campaignId) {
  return this.findOne({
    campaignId,
    isLive: true
  }).sort({ timestamp: -1 });
};

// Get hourly metrics for live charts
performanceMetricSchema.statics.getHourlyMetrics = function(campaignId, hours = 24) {
  const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

  return this.find({
    campaignId,
    timestamp: { $gte: startTime },
    isLive: true
  }).sort({ timestamp: -1 });
};

// Get real-time alerts
performanceMetricSchema.statics.getActiveAlerts = function(campaignId) {
  return this.find({
    campaignId,
    'alerts.triggered': true,
    'alerts.acknowledgedAt': { $exists: false }
  }).sort({ timestamp: -1 });
};

// Get performance summary
performanceMetricSchema.statics.getPerformanceSummary = async function(campaignId) {
  const latest = await this.getLatestMetrics(campaignId);
  const last24h = await this.getHourlyMetrics(campaignId, 24);

  if (!latest) return null;

  // Calculate trends
  const previous = last24h[1]; // Second latest
  const trends = {};

  if (previous) {
    trends.roas = ((latest.roas - previous.roas) / previous.roas * 100) || 0;
    trends.spend = ((latest.spend - previous.spend) / previous.spend * 100) || 0;
    trends.conversions = ((latest.conversions - previous.conversions) / previous.conversions * 100) || 0;
  }

  return {
    current: latest,
    trends,
    alerts: latest.alerts.filter(alert => alert.triggered && !alert.acknowledgedAt),
    performance24h: last24h
  };
};

export default mongoose.model('PerformanceMetric', performanceMetricSchema);