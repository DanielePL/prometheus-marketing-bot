import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  // Time dimension
  date: {
    type: Date,
    required: true
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
    enum: ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'YOUTUBE']
  },

  // Core Metrics
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
  spend: {
    type: Number,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  conversions: {
    type: Number,
    default: 0,
    min: 0
  },

  // Calculated Metrics (auto-calculated)
  ctr: Number,        // Click-through rate (%)
  cpc: Number,        // Cost per click
  cpm: Number,        // Cost per mille (1000 impressions)
  roas: Number,       // Return on ad spend
  conversionRate: Number, // Conversion rate (%)
  cpa: Number,        // Cost per acquisition

  // Advanced Metrics
  reach: Number,
  frequency: Number,
  engagement: {
    likes: Number,
    shares: Number,
    comments: Number,
    saves: Number
  },

  // Video Metrics (for video ads)
  videoMetrics: {
    views: Number,
    viewRate: Number,
    averageViewDuration: Number,
    completionRate: Number
  },

  // Demographics Breakdown
  demographics: {
    ageGroups: [{
      range: String, // "25-34"
      percentage: Number
    }],
    genders: [{
      gender: String, // "male", "female", "unknown"
      percentage: Number
    }],
    locations: [{
      country: String,
      percentage: Number
    }]
  },

  // Device & Placement
  devices: {
    mobile: Number,
    desktop: Number,
    tablet: Number
  },
  placements: [{
    name: String, // "feed", "stories", "reels"
    impressions: Number,
    clicks: Number,
    spend: Number
  }],

  // Relations
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate metrics
metricSchema.pre('save', function(next) {
  // Calculate CTR
  if (this.impressions > 0) {
    this.ctr = (this.clicks / this.impressions) * 100;
  }

  // Calculate CPC
  if (this.clicks > 0) {
    this.cpc = this.spend / this.clicks;
  }

  // Calculate CPM
  if (this.impressions > 0) {
    this.cpm = (this.spend / this.impressions) * 1000;
  }

  // Calculate ROAS
  if (this.spend > 0) {
    this.roas = this.revenue / this.spend;
  }

  // Calculate Conversion Rate
  if (this.clicks > 0) {
    this.conversionRate = (this.conversions / this.clicks) * 100;
  }

  // Calculate CPA
  if (this.conversions > 0) {
    this.cpa = this.spend / this.conversions;
  }

  next();
});

// Compound indexes for better query performance
metricSchema.index({ campaignId: 1, date: -1 });
metricSchema.index({ userId: 1, date: -1 });
metricSchema.index({ platform: 1, date: -1 });
metricSchema.index({ date: -1, platform: 1, campaignId: 1 });

// Unique constraint to prevent duplicate metrics
metricSchema.index({
  campaignId: 1,
  platform: 1,
  date: 1,
  hour: 1
}, { unique: true });

export default mongoose.model('Metric', metricSchema);