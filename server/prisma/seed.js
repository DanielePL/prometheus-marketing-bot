import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prometheus database seeding...');

  // Clear existing data
  await prisma.metric.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.product.deleteMany();
  await prisma.marketIntelligence.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create demo users
  const hashedPassword = await bcrypt.hash('prometheus123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@prometheus.com',
      password: hashedPassword,
      name: 'Prometheus Admin',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'test@prometheus.com',
      password: hashedPassword,
      name: 'Test User',
      plan: 'GROWTH',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created demo users');

  // Create demo products
  const fitnessTracker = await prisma.product.create({
    data: {
      name: 'ProFit Tracker Elite',
      description: 'Advanced fitness tracker with AI-powered insights, heart rate monitoring, and 30-day battery life.',
      price: 299.99,
      category: 'Fitness Technology',
      imageUrl: 'https://example.com/fitness-tracker.jpg',
      websiteUrl: 'https://profitracker.com',
      userId: adminUser.id,
      features: {
        core: ['Heart Rate Monitoring', '30-day Battery', 'Waterproof Design', 'AI Insights'],
        advanced: ['Sleep Tracking', 'Stress Monitoring', 'GPS Tracking', 'Smart Notifications']
      },
      usps: [
        'Longest battery life in market (30 days)',
        'Military-grade waterproof rating',
        'AI-powered health insights',
        'Compatible with all major fitness apps'
      ],
      audiences: [
        {
          name: 'Fitness Enthusiasts',
          demographics: { age: '25-40', income: '$50k-100k', interests: ['fitness', 'health', 'technology'] },
          painPoints: ['Inaccurate tracking', 'Short battery life', 'Complex setup']
        },
        {
          name: 'Health-Conscious Professionals',
          demographics: { age: '30-50', income: '$75k-150k', interests: ['health', 'productivity', 'wellness'] },
          painPoints: ['Lack of time for fitness', 'Stress management', 'Health monitoring']
        }
      ]
    },
  });

  const supplementBrand = await prisma.product.create({
    data: {
      name: 'PowerMax Protein',
      description: 'Premium whey protein powder for serious athletes and fitness enthusiasts.',
      price: 49.99,
      category: 'Sports Nutrition',
      userId: testUser.id,
      features: {
        core: ['25g Protein per serving', 'Fast absorption', 'Multiple flavors', 'Third-party tested']
      },
      usps: [
        'Highest protein content per serving',
        'No artificial fillers',
        'Tested for banned substances'
      ]
    },
  });

  console.log('✅ Created demo products');

  // Create market intelligence data
  const fitnessMarketIntel = await prisma.marketIntelligence.create({
    data: {
      productCategory: 'Fitness Technology',
      market: 'DACH',
      competitors: [
        { name: 'Fitbit Charge 5', marketShare: 25, strength: 8.5, price: 179.99 },
        { name: 'Garmin Vivosmart 5', marketShare: 18, strength: 7.8, price: 149.99 },
        { name: 'Apple Watch SE', marketShare: 35, strength: 9.2, price: 299.99 }
      ],
      trends: [
        { keyword: 'fitness tracker 2025', volume: 12000, growth: '+15%', difficulty: 'Medium' },
        { keyword: 'heart rate monitor', volume: 8500, growth: '+8%', difficulty: 'High' },
        { keyword: 'waterproof fitness tracker', volume: 3200, growth: '+25%', difficulty: 'Low' }
      ],
      audiences: [
        {
          name: 'German Fitness Enthusiasts',
          size: '2.3M',
          engagement: 'High',
          demographics: { age: '25-45', income: '€40k-80k', location: 'Germany, Austria, Switzerland' },
          interests: ['fitness', 'health tracking', 'outdoor sports'],
          platforms: ['Instagram', 'YouTube', 'Facebook']
        }
      ],
      opportunities: [
        'Underserved premium segment (€250-350)',
        'Growing demand for long battery life',
        'Limited German-language marketing',
        'Opportunity in corporate wellness programs'
      ],
      channelRecommendations: [
        { platform: 'Meta', budget: 40, reason: 'Strong fitness community engagement' },
        { platform: 'Google', budget: 35, reason: 'High purchase intent searches' },
        { platform: 'YouTube', budget: 20, reason: 'Product demonstration potential' },
        { platform: 'TikTok', budget: 5, reason: 'Growing fitness content trend' }
      ],
      confidence: 87.5
    },
  });

  console.log('✅ Created market intelligence data');

  // Create demo campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'ProFit Tracker - DACH Launch',
      objective: 'CONVERSIONS',
      status: 'ACTIVE',
      dailyBudget: 500.0,
      totalBudget: 15000.0,
      spend: 2350.75,
      revenue: 9890.50,
      roas: 4.21,
      userId: adminUser.id,
      productId: fitnessTracker.id,
      content: {
        headlines: [
          'Revolutionary Fitness Tracker with 30-Day Battery',
          'Track Your Fitness Like Never Before',
          'The Smart Way to Monitor Your Health'
        ],
        descriptions: [
          'Experience unparalleled fitness tracking with our AI-powered device. 30-day battery life, waterproof design, and precision monitoring.',
          'Join thousands who transformed their fitness journey with our advanced tracking technology.'
        ],
        ctas: ['Shop Now', 'Learn More', 'Get Yours Today']
      },
      audiences: [
        {
          name: 'Fitness Enthusiasts 25-40',
          targeting: {
            age: { min: 25, max: 40 },
            interests: ['fitness', 'health', 'wearable technology'],
            behaviors: ['fitness app users', 'online shoppers']
          }
        }
      ],
      strategy: {
        phase: 'Launch',
        focus: 'Brand awareness and initial conversions',
        kpis: ['ROAS > 3.5', 'CPA < €35', 'CTR > 2.5%']
      }
    },
  });

  // Create performance metrics
  const metricsData = [
    { date: new Date('2025-01-01'), platform: 'meta', impressions: 45000, clicks: 1350, spend: 289.50, revenue: 1245.00 },
    { date: new Date('2025-01-02'), platform: 'meta', impressions: 52000, clicks: 1480, spend: 315.75, revenue: 1450.25 },
    { date: new Date('2025-01-03'), platform: 'google', impressions: 28000, clicks: 890, spend: 245.00, revenue: 1890.75 },
  ];

  for (const metric of metricsData) {
    await prisma.metric.create({
      data: {
        ...metric,
        campaignId: campaign1.id,
        ctr: (metric.clicks / metric.impressions) * 100,
        cpc: metric.spend / metric.clicks,
        roas: metric.revenue / metric.spend,
      },
    });
  }

  console.log('✅ Created demo campaigns and metrics');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log(`- ${await prisma.user.count()} users`);
  console.log(`- ${await prisma.product.count()} products`);
  console.log(`- ${await prisma.campaign.count()} campaigns`);
  console.log(`- ${await prisma.metric.count()} metrics`);
  console.log(`- ${await prisma.marketIntelligence.count()} market intelligence entries`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });