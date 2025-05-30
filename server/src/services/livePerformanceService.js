// server/src/services/livePerformanceService.js - NEUE DATEI ERSTELLEN
import PerformanceMetric from '../models/PerformanceMetric.js';
import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';

class LivePerformanceService {
  constructor() {
    this.updateInterval = 15 * 60 * 1000; // 15 minutes
    this.isRunning = false;
    this.intervalId = null;

    console.log('🚀 Live Performance Service initialized');
  }

  // Start the live performance engine
  start() {
    if (this.isRunning) {
      console.log('⚠️ Live Performance Service already running');
      return;
    }

    console.log('🔥 Starting Live Performance Engine - Updates every 15min');
    this.isRunning = true;

    // Initial update
    this.updateAllCampaigns();

    // Set interval for continuous updates
    this.intervalId = setInterval(() => {
      this.updateAllCampaigns();
    }, this.updateInterval);
  }

  // Stop the live performance engine
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Live Performance Service stopped');
  }

  // Update performance for all active campaigns
  async updateAllCampaigns() {
    try {
      console.log('📊 ===== LIVE PERFORMANCE UPDATE CYCLE =====');
      console.log('🕒 Timestamp:', new Date().toISOString());

      // Get all active campaigns
      const activeCampaigns = await Campaign.find({
        status: { $in: ['ACTIVE', 'DRAFT'] } // Include drafts for demo
      }).populate('productId');

      console.log(`🎯 Found ${activeCampaigns.length} campaigns to update`);

      for (const campaign of activeCampaigns) {
        await this.updateCampaignPerformance(campaign);
      }

      console.log('✅ Live performance update cycle completed');

    } catch (error) {
      console.error('❌ Error in live performance update:', error);
    }
  }

  // Update performance for a specific campaign
  async updateCampaignPerformance(campaign) {
    try {
      console.log(`📈 Updating performance for: ${campaign.name}`);

      // Get platforms for this campaign - ✅ FIX: Normalize platform names
      const platforms = Object.keys(campaign.platforms || {});
      const normalizedPlatforms = platforms.map(platform => platform.toUpperCase());
      
      console.log(`🎯 Platforms found:`, platforms, '→ normalized:', normalizedPlatforms);
      
      // Update each platform + combined metrics
      for (const platform of normalizedPlatforms) {
        await this.generateLiveMetrics(campaign, platform);
      }
      
      // Generate combined metrics
      await this.generateCombinedMetrics(campaign);

    } catch (error) {
      console.error(`❌ Error updating campaign ${campaign.name}:`, error);
    }
  }

  // Generate realistic live metrics for a platform
  async generateLiveMetrics(campaign, platform) {
    try {
      // Get previous metric for trend calculation
      const previousMetric = await PerformanceMetric.findOne({
        campaignId: campaign._id,
        platform: platform
      }).sort({ timestamp: -1 });

      // Calculate time-based factors
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();

      // Performance multipliers based on time
      const hourMultiplier = this.getHourMultiplier(hour);
      const dayMultiplier = this.getDayMultiplier(dayOfWeek);
      const platformMultiplier = this.getPlatformMultiplier(platform);

      // Base metrics from campaign budget
      const dailyBudget = campaign.budget?.daily || 100;
      const baseSpend = (dailyBudget / 24) * hourMultiplier * dayMultiplier;

      // Generate realistic metrics with some randomness
      const variance = 0.8 + (Math.random() * 0.4); // 80% - 120% variance

      const spend = this.evolveMetric(
        previousMetric?.spend || 0,
        baseSpend * variance,
        0.1 // 10% max change per update
      );

      const impressions = this.evolveMetric(
        previousMetric?.impressions || 0,
        spend * (800 + Math.random() * 400) * platformMultiplier, // 800-1200 impressions per euro
        0.15
      );

      const clicks = this.evolveMetric(
        previousMetric?.clicks || 0,
        impressions * (0.01 + Math.random() * 0.04) * platformMultiplier, // 1-5% CTR
        0.2
      );

      const conversions = this.evolveMetric(
        previousMetric?.conversions || 0,
        clicks * (0.02 + Math.random() * 0.06) * platformMultiplier, // 2-8% conversion rate
        0.25
      );

      // Revenue calculation based on product price
      const productPrice = campaign.productId?.price || 100;
      const revenue = conversions * productPrice;

      // Create new metric
      const metric = new PerformanceMetric({
        campaignId: campaign._id,
        platform: platform,
        timestamp: new Date(),
        hour: hour,

        // Core metrics
        spend: Math.round(spend * 100) / 100,
        budget: dailyBudget,
        impressions: Math.round(impressions),
        clicks: Math.round(clicks),
        conversions: Math.round(conversions * 10) / 10, // Allow decimals
        revenue: Math.round(revenue * 100) / 100,
        reach: Math.round(impressions * (0.7 + Math.random() * 0.3)), // 70-100% of impressions

        // Profit calculation
        profit: revenue - spend - (conversions * (productPrice * 0.3)), // 30% COGS

        dataSource: 'SIMULATED',
        isLive: true
      });

      // Calculate all derived metrics
      metric.calculateMetrics();

      // Check for alerts
      metric.checkAlerts(campaign);

      await metric.save();

      console.log(`  ✅ ${platform}: €${metric.spend} spend, ${metric.conversions} conversions, ${metric.roas.toFixed(2)}x ROAS`);

      // Log alerts if any
      const activeAlerts = metric.alerts.filter(alert => alert.triggered);
      if (activeAlerts.length > 0) {
        console.log(`  🚨 ${activeAlerts.length} alerts triggered for ${platform}`);
        activeAlerts.forEach(alert => {
          console.log(`    - ${alert.severity}: ${alert.message}`);
        });
      }

    } catch (error) {
      console.error(`❌ Error generating metrics for ${platform}:`, error);
    }
  }

  // Generate combined metrics across all platforms
  async generateCombinedMetrics(campaign) {
    try {
      // Get latest metrics for all platforms
      const platformMetrics = await PerformanceMetric.find({
        campaignId: campaign._id,
        platform: { $ne: 'COMBINED' },
        timestamp: {
          $gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        }
      }).sort({ timestamp: -1 });

      if (platformMetrics.length === 0) return;

      // Aggregate metrics
      const combined = platformMetrics.reduce((acc, metric) => {
        acc.spend += metric.spend || 0;
        acc.impressions += metric.impressions || 0;
        acc.clicks += metric.clicks || 0;
        acc.conversions += metric.conversions || 0;
        acc.revenue += metric.revenue || 0;
        acc.reach += metric.reach || 0;
        acc.profit += metric.profit || 0;
        return acc;
      }, {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        reach: 0,
        profit: 0
      });

      // Create combined metric
      const combinedMetric = new PerformanceMetric({
        campaignId: campaign._id,
        platform: 'COMBINED',
        timestamp: new Date(),
        hour: new Date().getHours(),

        ...combined,
        budget: campaign.budget?.daily || 0,

        dataSource: 'SIMULATED',
        isLive: true
      });

      combinedMetric.calculateMetrics();
      combinedMetric.checkAlerts(campaign);

      await combinedMetric.save();

      console.log(`  🔥 COMBINED: €${combinedMetric.spend} spend, ${combinedMetric.roas.toFixed(2)}x ROAS, €${combinedMetric.profit.toFixed(2)} profit`);

    } catch (error) {
      console.error('❌ Error generating combined metrics:', error);
    }
  }

  // Helper methods for realistic data generation

  evolveMetric(previousValue, targetValue, maxChangePercent = 0.1) {
    if (previousValue === 0) return targetValue;

    const maxChange = previousValue * maxChangePercent;
    const change = Math.min(Math.max(targetValue - previousValue, -maxChange), maxChange);

    return Math.max(0, previousValue + change);
  }

  getHourMultiplier(hour) {
    // Performance varies by hour (9-17 = business hours = higher performance)
    const hourMultipliers = {
      0: 0.3, 1: 0.2, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.2,
      6: 0.4, 7: 0.6, 8: 0.8, 9: 1.0, 10: 1.1, 11: 1.2,
      12: 1.0, 13: 0.9, 14: 1.1, 15: 1.2, 16: 1.1, 17: 1.0,
      18: 0.9, 19: 0.8, 20: 0.7, 21: 0.6, 22: 0.5, 23: 0.4
    };
    return hourMultipliers[hour] || 0.5;
  }

  getDayMultiplier(dayOfWeek) {
    // 0 = Sunday, 6 = Saturday
    const dayMultipliers = [0.6, 1.0, 1.1, 1.2, 1.1, 1.0, 0.8]; // Sun-Sat
    return dayMultipliers[dayOfWeek] || 1.0;
  }

  getPlatformMultiplier(platform) {
    const platformMultipliers = {
      'META': 1.0,
      'GOOGLE': 1.2,
      'TIKTOK': 0.8,
      'LINKEDIN': 0.6,
      'YOUTUBE': 0.9
    };
    return platformMultipliers[platform] || 1.0;
  }

  // API Methods for frontend

  async getCampaignPerformance(campaignId) {
    try {
      const summary = await PerformanceMetric.getPerformanceSummary(campaignId);
      return summary;
    } catch (error) {
      console.error('❌ Error getting campaign performance:', error);
      throw error;
    }
  }

  async getRealtimeMetrics(campaignId, platform = 'COMBINED') {
    try {
      const latest = await PerformanceMetric.findOne({
        campaignId,
        platform,
        isLive: true
      }).sort({ timestamp: -1 });

      return latest;
    } catch (error) {
      console.error('❌ Error getting realtime metrics:', error);
      throw error;
    }
  }

  async getPerformanceHistory(campaignId, hours = 24) {
    try {
      const metrics = await PerformanceMetric.getHourlyMetrics(campaignId, hours);
      return metrics;
    } catch (error) {
      console.error('❌ Error getting performance history:', error);
      throw error;
    }
  }

  async acknowledgeAlert(campaignId, alertType) {
    try {
      await PerformanceMetric.updateOne(
        {
          campaignId,
          'alerts.type': alertType,
          'alerts.triggered': true
        },
        {
          $set: { 'alerts.$.acknowledgedAt': new Date() }
        }
      );

      console.log(`✅ Alert ${alertType} acknowledged for campaign ${campaignId}`);
      return true;
    } catch (error) {
      console.error('❌ Error acknowledging alert:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new LivePerformanceService();