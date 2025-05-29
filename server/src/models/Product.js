// server/src/models/Product.js - KOMPLETTER CODE
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Fitness Technology',
      'Fashion',
      'Electronics',
      'Health & Beauty',
      'Home & Garden',
      'Food & Beverage',
      'Other'
    ]
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  websiteUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
    default: 'ACTIVE'
  },

  // AI Analysis
  aiAnalysis: {
    features: {
      core: [String],
      advanced: [String],
      unique: [String]
    },
    usps: [String],
    targetAudiences: [{
      name: String,
      demographics: {
        ageRange: String,
        income: String,
        location: String,
        interests: [String]
      },
      psychographics: {
        values: [String],
        lifestyle: [String],
        painPoints: [String],
        motivations: [String]
      },
      size: String,
      platforms: [String]
    }],
    marketPosition: {
      competitorLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
      priceSegment: {
        type: String,
        enum: ['BUDGET', 'MID-RANGE', 'PREMIUM', 'LUXURY']
      },
      marketMaturity: {
        type: String,
        enum: ['EMERGING', 'GROWTH', 'MATURE', 'DECLINING']
      }
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    lastAnalyzed: Date
  },

  // Relations
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for campaigns
productSchema.virtual('campaigns', {
  ref: 'Campaign',
  localField: '_id',
  foreignField: 'productId'
});

// Indexes
productSchema.index({ userId: 1, createdAt: -1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

export default mongoose.model('Product', productSchema);