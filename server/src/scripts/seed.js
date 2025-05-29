import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Campaign from '../models/Campaign.js';
import MarketIntelligence from '../models/MarketIntelligence.js';
import Metric from '../models/Metric.js';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting Prometheus database seeding...');

    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Campaign.deleteMany({}),
      MarketIntelligence.deleteMany({}),
      Metric.deleteMany({})
    ]);

    console.log('🗑️ Cleared existing data');

    // Create demo users
    const adminUser = new User({
      email: 'admin@prometheus.com',
      password: 'prometheus123',
      name: 'Prometheus Admin',
      plan: 'ENTERPRISE',
      status: 'ACTIVE'
    });

    const testUser = new User({
      email: 'test@prometheus.com',
      password: 'prometheus123',
      name: 'Test User',
      plan: 'GROWTH',
      status: 'ACTIVE'
    });

    await Promise.all([adminUser.save(), testUser.save()]);
    console.log('✅ Created demo users');

    // Create your fitness tracker product
    const fitnessTracker = new Product({
      name: 'ProFit Tracker Elite',
      description: 'Advanced fitness tracker with AI-powered insights, heart rate monitoring, and 30-day battery life. Perfect for serious athletes and fitness enthusiasts.',
      price: 299.99,
      category: 'Fitness Technology',
      imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
      websiteUrl: 'https://profitracker.com',
      userId: adminUser._id,
      aiAnalysis: {
        features: {
          core: ['Heart Rate Monitoring', '30-day Battery Life', 'Waterproof Design', 'AI Health Insights'],
          advanced: ['Sleep Tracking', 'Stress Monitoring', 'GPS Tracking', 'Smart Notifications'],
          unique: ['Longest battery in market', 'Military-grade waterproof', 'AI predictive health alerts']
        },
        usps: [
          'Industry-leading 30-day battery life',
          'Military-grade IP68 waterproof rating',
          'AI-powered health insights and predictions',
          'Compatible with 50+ fitness apps',
          '24/7 heart rate variability monitoring'
        ],
        targetAudiences: [
          {
            name: 'Serious Athletes',
            demographics: {
              ageRange: '22-35',
              income: '$60k-120k',
              location: 'Urban areas, DACH region',
              interests: ['competitive sports', 'performance optimization', 'health tracking']
            },
            psychographics: {
              values: ['performance', 'precision', 'achievement'],
              lifestyle: ['active', 'goal-oriented', 'tech-savvy'],
              painPoints: ['inaccurate tracking', 'short battery life', 'complex data'],
              motivations: ['beat personal records', 'optimize training', 'prevent injuries']
            },
            size: '2.3M',
            platforms: ['Instagram', 'YouTube', 'Strava', 'MyFitnessPal']
          },
          {
            name: 'Health-Conscious Professionals',
            demographics: {
              ageRange: '28-45',
              income: '$80k-150k',
              location: 'Major cities, DACH + USA',
              interests: ['wellness', 'productivity', 'work-life balance']
            },
            psychographics: {
              values: ['health', 'efficiency', 'quality'],
              lifestyle: ['busy', 'wellness-focused', 'premium buyers'],
              painPoints: ['lack of time', 'stress management', 'health monitoring'],
              motivations: ['stay healthy', 'manage stress', 'track progress']
            },
            size: '1.8M',
            platforms: ['LinkedIn', 'Facebook', 'Apple Health ecosystem']
          }
        ],
        marketPosition: {
          competitorLevel: 'HIGH',
          priceSegment: 'PREMIUM',
          marketMaturity: 'GROWTH'
        },
        confidence: 92,
        lastAnalyzed: new Date()
      }
    });

    await fitnessTracker.save();
    console.log('✅ Created fitness tracker product');

    // Create market intelligence for fitness tracker
    const fitnessMarketIntel = new MarketIntelligence({
      productCategory: 'Fitness Technology',
      market: 'DACH',
      competitors: [
        {
          name: 'Fitbit Charge 6',
          website: 'fitbit.com',
          marketShare: 28,
          strength: 8.2,
          pricing: { min: 159.99, max: 199.99, currency: 'EUR' },
          strengths: ['Brand recognition', 'App ecosystem', 'Community features'],
          weaknesses: ['Battery life', 'Premium pricing', 'Limited customization'],
          adStrategies: [
            { platform: 'META', approach: 'Lifestyle marketing', estimatedSpend: 50000 },
            { platform: 'GOOGLE', approach: 'Search dominance', estimatedSpend: 80000 }
          ]
        },
        {
          name: 'Garmin Vivosmart 5',
          website: 'garmin.com',
          marketShare: 22,
          strength: 7.8,
          pricing: { min: 149.99, max: 179.99, currency: 'EUR' },
          strengths: ['GPS accuracy', 'Sport-specific features', 'Durability'],
          weaknesses: ['Complex interface', 'Limited smart features', 'Design'],
          adStrategies: [
            { platform: 'GOOGLE', approach: 'Performance marketing', estimatedSpend: 40000 },
            { platform: 'YOUTUBE', approach: 'Product demonstrations', estimatedSpend: 25000 }
          ]
        }
      ],
      trends: [
        {
          keyword: 'fitness tracker 2025',
          searchVolume: 18500,
          growth: '+22%',
          difficulty: 'MEDIUM',
          cpc: 1.85,
          seasonality: [
            { month: 'January', trend: 'HIGH' },
            { month: 'September', trend: 'HIGH' },
            { month: 'December', trend: 'LOW' }
          ]
        },
        {
          keyword: 'herzfrequenz tracker',
          searchVolume: 12000,
          growth: '+15%',
          difficulty: 'MEDIUM',
          cpc: 2.20
        }
      ],
      audiences: [
        {
          name: 'German Fitness Enthusiasts',
          size: '2.8M',
          engagement: 'HIGH',
          demographics: {
            age: '25-40',
            income: '€45k-90k',
            education: 'University+',
            location: 'Germany, Austria, Switzerland'
          },
          psychographics: {
            interests: ['fitness', 'health optimization', 'wearable tech', 'outdoor sports'],
            values: ['performance', 'precision', 'quality'],
            lifestyle: ['active', 'tech-savvy', 'goal-oriented'],
            painPoints: ['data accuracy', 'battery life', 'app integration']
          },
          platforms: [
            { name: 'Instagram', usage: 'HIGH', bestTimes: ['morning', 'evening'] },
            { name: 'YouTube', usage: 'HIGH', bestTimes: ['evening', 'weekend'] },
            { name: 'Facebook', usage: 'MEDIUM', bestTimes: ['evening'] }
          ],
          contentPreferences: ['workout videos', 'health tips', 'product reviews', 'success stories']
        }
      ],
      opportunities: [
        {
          type: 'MARKET_GAP',
          description: 'Premium segment (€250-350) with extended battery life',
          potential: 'HIGH',
          effort: 'MEDIUM',
          timeframe: '3-6 months'
        },
        {
          type: 'UNDERSERVED_SEGMENT',
          description: 'German-language fitness content and support',
          potential: 'HIGH',
          effort: 'LOW',
          timeframe: 'immediate'
        }
      ],
      channelRecommendations: [
        {
          platform: 'META',
          priority: 'HIGH',
          budgetAllocation: 40,
          reasoning: 'Strong fitness community, visual product showcase, precise targeting',
          expectedROAS: 4.2,
          targetAudience: 'Fitness enthusiasts 25-40',
          contentStrategy: 'Lifestyle videos, user testimonials, workout integration',
          estimatedResults: { reach: 280000, cpc: 0.85, conversionRate: 3.2 }
        },
        {
          platform: 'GOOGLE',
          priority: 'HIGH',
          budgetAllocation: 35,
          reasoning: 'High purchase intent searches, brand protection',
          expectedROAS: 5.1,
          targetAudience: 'Active shoppers researching fitness trackers',
          contentStrategy: 'Product-focused ads, comparison content, reviews',
          estimatedResults: { reach: 150000, cpc: 1.20, conversionRate: 4.8 }
        },
        {
          platform: 'YOUTUBE',
          priority: 'MEDIUM',
          budgetAllocation: 20,
          reasoning: 'Product demonstration potential, review ecosystem',
          expectedROAS: 3.8,
          targetAudience: 'Tech reviewers audience, fitness channels',
          contentStrategy: 'Product demos, influencer partnerships, how-to content',
          estimatedResults: { reach: 450000, cpc: 0.65, conversionRate: 2.1 }
        }
      ],
      summary: {
        marketSize: '€2.8B in DACH region',
        competitionLevel: 'HIGH',
        marketMaturity: 'GROWTH',
        entryBarriers: ['Brand recognition', 'Distribution channels', 'R&D costs'],
        successFactors: ['Product differentiation', 'German localization', 'Influencer partnerships'],
        risks: ['Market saturation', 'Price competition', 'Tech disruption'],
        recommendations: [
          'Focus on unique 30-day battery USP',
          'Emphasize German engineering quality',
          'Build partnerships with German fitness influencers',
          'Invest heavily in Meta and Google ads for launch'
        ]
      },
      confidence: 89,
      dataSource: 'AI_ANALYSIS',
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    });

    await fitnessMarketIntel.save();
    console.log('✅ Created market intelligence');

    // Create demo campaign
    const campaign = new Campaign({
      name: 'ProFit Tracker - DACH Launch Campaign',
      objective: 'CONVERSIONS',
      status: 'ACTIVE',
      budget: {
        daily: 500,
        total: 15000,
        currency: 'EUR'
      },
      performance: {
        spend: 3420.75,
        revenue: 14650.30,
        impressions: 125000,
        clicks: 3750,
        conversions: 142
      },
      userId: adminUser._id,
      productId: fitnessTracker._id,
      aiContent: {
        strategy: {
          marketAnalysis: 'Target premium fitness tracker segment in DACH with focus on battery life USP',
          targetingStrategy: 'Focus on fitness enthusiasts 25-40 and health-conscious professionals',
          contentStrategy: 'Emphasize 30-day battery life and German quality engineering',
          budgetRecommendation: 'Allocate 40% to Meta, 35% to Google, 25% to YouTube for optimal reach',
          expectedResults: {
            roas: 4.2,
            cpc: 0.85,
            conversionRate: 3.8
          }
        },
        creatives: [
          {
            type: 'IMAGE',
            headlines: [
              '30 Tage Akkulaufzeit - Endlich ein Fitness Tracker der mithält',
              'Fitness Tracker der Extraklasse - Made for Champions',
              'Nie wieder leerer Akku beim Training'
            ],
            descriptions: [
              'Revolutionärer Fitness Tracker mit 30-Tagen Akkulaufzeit. Wasserdicht, präzise und mit KI-gestützten Gesundheitseinblicken.',
              'Erlebe Fitness-Tracking auf einem neuen Level. Herzfrequenz, Schlaf, Stress - alles in einem Gerät.'
            ],
            ctas: ['Jetzt bestellen', 'Mehr erfahren', 'Kaufen'],
            visualDescription: 'Lifestyle shot of athlete wearing tracker during workout',
            platform: 'META'
          }
        ],
        audiences: [
          {
            name: 'Fitness Enthusiasts DACH',
            description: 'Active individuals who regularly exercise and value precision tracking',
            targeting: {
              demographics: {
                age: { min: 25, max: 40 },
                genders: ['male', 'female'],
                locations: ['Germany', 'Austria', 'Switzerland']
              },
              interests: ['fitness', 'running', 'gym', 'health tracking', 'wearable technology'],
              behaviors: ['fitness app users', 'premium buyers', 'early adopters']
            },
            expectedReach: 280000,
            platform: 'META'
          }
        ],
        generatedAt: new Date(),
        confidence: 87
      },
      schedule: {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        timezone: 'Europe/Berlin'
      }
    });

    // Calculate performance metrics
    campaign.calculateROAS();
    campaign.calculateCTR();
    campaign.calculateCPC();

    await campaign.save();
    console.log('✅ Created demo campaign');

    // Create some performance metrics
    const metricsData = [
      {
        date: new Date('2025-01-15'),
        platform: 'META',
        impressions: 15000,
        clicks: 450,
        spend: 382.50,
        revenue: 1650.00,
        conversions: 18,
        campaignId: campaign._id,
        userId: adminUser._id
      },
      {
        date: new Date('2025-01-16'),
        platform: 'META',
        impressions: 18200,
        clicks: 520,
        spend: 441.00,
        revenue: 1890.00,
        conversions: 21,
        campaignId: campaign._id,
        userId: adminUser._id
      },
      {
        date: new Date('2025-01-17'),
        platform: 'GOOGLE',
        impressions: 8500,
        clicks: 340,
        spend: 408.00,
        revenue: 2180.00,
        conversions: 24,
        campaignId: campaign._id,
        userId: adminUser._id
      }
    ];

    await Metric.insertMany(metricsData);
    console.log('✅ Created performance metrics');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Products: ${await Product.countDocuments()}`);
    console.log(`- Campaigns: ${await Campaign.countDocuments()}`);
    console.log(`- Market Intelligence: ${await MarketIntelligence.countDocuments()}`);
    console.log(`- Metrics: ${await Metric.countDocuments()}`);

    console.log('\n🔐 Demo Login Credentials:');
    console.log('Email: admin@prometheus.com');
    console.log('Password: prometheus123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();