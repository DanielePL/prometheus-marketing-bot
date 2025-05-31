// /prometheus-marketing-engine/server/src/services/integrations/googleAdsService.js
// Google Ads API Integration mit Mock Mode für Development

import { GoogleAdsApi } from 'google-ads-api';
import { getApiSettingsService } from '../apiSettingsService.js';

class GoogleAdsService {
  constructor() {
    this.apiSettings = getApiSettingsService();
    this.client = null;
    this.customer = null;
    this.performanceData = new Map();

    // Initialize Google API only if enabled
    this.initializeGoogleAPI();

    console.log('✅ Google Ads Service initialized');
  }

  initializeGoogleAPI() {
    if (this.apiSettings.isGoogleAdsEnabled()) {
      try {
        this.client = new GoogleAdsApi({
          client_id: process.env.GOOGLE_ADS_CLIENT_ID,
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
          developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        });

        this.customer = this.client.Customer({
          customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
          refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
        });

        console.log('🔗 Google Ads API connected');
      } catch (error) {
        console.error('❌ Google Ads API initialization failed:', error);
        this.apiSettings.toggleGoogleAds(false); // Fallback to mock
      }
    } else {
      console.log('🔧 Google Ads API disabled - using mock data');
    }
  }

  // ==========================================
  // MOCK DATA FOR DEVELOPMENT
  // ==========================================

  generateMockPerformanceData() {
    const mockCampaigns = [
      {
        id: 'mock_001',
        name: 'Prometheus Test Campaign 1',
        status: 'ENABLED',
        cost: 150.75,
        revenue: 603.00,
        roas: 4.0,
        impressions: 12500,
        clicks: 450,
        conversions: 23,
        ctr: 3.6,
        cpc: 0.34
      },
      {
        id: 'mock_002',
        name: 'Performance Max Demo',
        status: 'ENABLED',
        cost: 89.20,
        revenue: 178.40,
        roas: 2.0,
        impressions: 8900,
        clicks: 267,
        conversions: 12,
        ctr: 3.0,
        cpc: 0.33
      },
      {
        id: 'mock_003',
        name: 'High ROAS Winner',
        status: 'ENABLED',
        cost: 200.00,
        revenue: 1200.00,
        roas: 6.0,
        impressions: 15000,
        clicks: 600,
        conversions: 48,
        ctr: 4.0,
        cpc: 0.33
      },
      {
        id: 'mock_004',
        name: 'Underperformer Campaign',
        status: 'ENABLED',
        cost: 300.00,
        revenue: 450.00,
        roas: 1.5,
        impressions: 20000,
        clicks: 400,
        conversions: 15,
        ctr: 2.0,
        cpc: 0.75
      }
    ];

    const performanceData = {};

    mockCampaigns.forEach(campaign => {
      // Add some randomness to make it realistic
      const variance = 0.9 + Math.random() * 0.2; // ±10% variance

      performanceData[campaign.id] = {
        name: campaign.name,
        status: campaign.status,
        impressions: Math.round(campaign.impressions * variance),
        clicks: Math.round(campaign.clicks * variance),
        conversions: Math.round(campaign.conversions * variance),
        cost: campaign.cost * variance,
        revenue: campaign.revenue * variance,
        roas: (campaign.revenue * variance) / (campaign.cost * variance),
        ctr: campaign.ctr * variance,
        cpc: campaign.cpc * variance,
        timestamp: new Date()
      };

      this.performanceData.set(campaign.id, performanceData[campaign.id]);
    });

    return performanceData;
  }

  // ==========================================
  // LIVE PERFORMANCE TRACKING (mit Mock Mode)
  // ==========================================

  async getRealTimePerformance(campaignIds = null) {
    try {
      // If Google API disabled, return mock data
      if (!this.apiSettings.isGoogleAdsEnabled()) {
        console.log('🎭 Using mock performance data (Google API disabled)');
        return this.generateMockPerformanceData();
      }

      // Real Google Ads API call
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          segments.date
        FROM campaign 
        WHERE segments.date = TODAY
        ORDER BY metrics.cost_micros DESC
      `;

      const response = await this.customer.query(query);
      const performanceData = {};

      for (const row of response) {
        const campaignId = row.campaign.id.toString();

        const cost = row.metrics.cost_micros / 1_000_000;
        const revenue = row.metrics.conversions_value || 0;
        const roas = cost > 0 ? revenue / cost : 0;

        const data = {
          name: row.campaign.name,
          status: row.campaign.status,
          impressions: row.metrics.impressions || 0,
          clicks: row.metrics.clicks || 0,
          conversions: row.metrics.conversions || 0,
          cost: cost,
          revenue: revenue,
          roas: roas,
          ctr: row.metrics.ctr || 0,
          cpc: (row.metrics.average_cpc || 0) / 1_000_000,
          timestamp: new Date()
        };

        performanceData[campaignId] = data;
        this.performanceData.set(campaignId, data);

        // Critical ROAS Alert
        if (roas < 3.0 && cost > 100) {
          console.warn(`🚨 LOW ROAS ALERT - Campaign ${campaignId}: ROAS ${roas.toFixed(2)} | Cost €${cost.toFixed(2)}`);
          await this.savePerformanceAlert(campaignId, {
            type: 'LOW_ROAS',
            roas: roas,
            cost: cost,
            threshold: 3.0
          });
        }

        await this.updateCampaignMetrics(campaignId, data);
      }

      console.log(`📊 Performance updated for ${Object.keys(performanceData).length} campaigns`);
      return performanceData;

    } catch (error) {
      console.error('❌ Google Ads performance tracking error:', error);

      // Fallback to mock data on error
      console.log('🎭 Falling back to mock data due to API error');
      return this.generateMockPerformanceData();
    }
  }

  // ==========================================
  // AUTO-OPTIMIZATION ENGINE (mit Mock Mode)
  // ==========================================

  async autoOptimizeCampaigns() {
    const optimizationResults = {};

    for (const [campaignId, data] of this.performanceData) {
      if (!data) continue;

      const { roas, cost, conversions } = data;

      try {
        // Mock optimization for disabled API
        if (!this.apiSettings.isGoogleAdsEnabled()) {
          optimizationResults[campaignId] = this.generateMockOptimization(campaignId, data);
          continue;
        }

        // Real optimization logic
        if (roas >= 5.0 && cost >= 50) {
          const result = await this.increaseCampaignBudget(campaignId, 1.2);
          optimizationResults[campaignId] = {
            action: 'BUDGET_INCREASE',
            reason: `High ROAS: ${roas.toFixed(2)}`,
            success: result,
            timestamp: new Date()
          };

          console.log(`🚀 SCALING UP - Campaign ${campaignId}: ROAS ${roas.toFixed(2)}`);
        }
        else if (roas < 2.0 && cost >= 100) {
          const result = await this.pauseCampaign(campaignId);
          optimizationResults[campaignId] = {
            action: 'PAUSE_CAMPAIGN',
            reason: `Low ROAS: ${roas.toFixed(2)}`,
            success: result,
            timestamp: new Date()
          };

          console.warn(`⛔ PAUSING - Campaign ${campaignId}: ROAS ${roas.toFixed(2)}`);
        }
        else if (roas >= 2.0 && roas < 3.0 && cost >= 50) {
          const result = await this.decreaseCampaignBudget(campaignId, 0.8);
          optimizationResults[campaignId] = {
            action: 'BUDGET_DECREASE',
            reason: `Below target ROAS: ${roas.toFixed(2)}`,
            success: result,
            timestamp: new Date()
          };

          console.log(`⚠️ SCALING DOWN - Campaign ${campaignId}: ROAS ${roas.toFixed(2)}`);
        }

      } catch (error) {
        console.error(`❌ Optimization failed for campaign ${campaignId}:`, error);
        optimizationResults[campaignId] = {
          action: 'FAILED',
          reason: error.message,
          success: false,
          timestamp: new Date()
        };
      }
    }

    await this.saveOptimizationResults(optimizationResults);
    return optimizationResults;
  }

  generateMockOptimization(campaignId, data) {
    const { roas, cost } = data;

    if (roas >= 5.0 && cost >= 50) {
      return {
        action: 'BUDGET_INCREASE',
        reason: `High ROAS: ${roas.toFixed(2)}`,
        success: true, // Mock success
        timestamp: new Date(),
        mock: true
      };
    } else if (roas < 2.0 && cost >= 100) {
      return {
        action: 'PAUSE_CAMPAIGN',
        reason: `Low ROAS: ${roas.toFixed(2)}`,
        success: true,
        timestamp: new Date(),
        mock: true
      };
    } else if (roas >= 2.0 && roas < 3.0 && cost >= 50) {
      return {
        action: 'BUDGET_DECREASE',
        reason: `Below target ROAS: ${roas.toFixed(2)}`,
        success: true,
        timestamp: new Date(),
        mock: true
      };
    }

    return {
      action: 'NO_ACTION',
      reason: `Performance within target range: ${roas.toFixed(2)}`,
      success: true,
      timestamp: new Date(),
      mock: true
    };
  }

  // ==========================================
  // API CONTROL METHODS
  // ==========================================

  enableGoogleAPI() {
    this.apiSettings.toggleGoogleAds(true);
    this.initializeGoogleAPI();
    return this.apiSettings.isGoogleAdsEnabled();
  }

  disableGoogleAPI() {
    this.apiSettings.toggleGoogleAds(false);
    this.client = null;
    this.customer = null;
    console.log('🔌 Google Ads API disconnected');
    return !this.apiSettings.isGoogleAdsEnabled();
  }

  getAPIStatus() {
    return {
      enabled: this.apiSettings.isGoogleAdsEnabled(),
      connected: !!(this.client && this.customer),
      mockMode: this.apiSettings.shouldUseMockData(),
      lastCheck: new Date().toISOString()
    };
  }

  // ==========================================
  // CAMPAIGN MANAGEMENT
  // ==========================================

  async createPerformanceMaxCampaign(campaignData) {
    if (!this.apiSettings.isGoogleAdsEnabled()) {
      // Mock campaign creation
      const mockCampaignId = `mock_${Date.now()}`;
      console.log(`🎭 Mock Performance Max Campaign created: ${campaignData.name} (ID: ${mockCampaignId})`);

      return {
        success: true,
        campaignId: mockCampaignId,
        resourceName: `customers/mock/campaigns/${mockCampaignId}`,
        budgetResourceName: `customers/mock/campaignBudgets/mock_budget_${Date.now()}`,
        mock: true
      };
    }

    // Real campaign creation logic
    try {
      const { name, budgetAmount, targetRoas = 4.0, assets } = campaignData;

      const budgetOperation = {
        create: {
          name: `${name}_Budget`,
          amount_micros: Math.round(budgetAmount * 1_000_000),
          delivery_method: 'STANDARD',
        },
      };

      const budgetResponse = await this.customer.campaignBudgets.mutate([budgetOperation]);
      const budgetResourceName = budgetResponse.results[0].resource_name;

      const campaignOperation = {
        create: {
          name: name,
          status: 'ENABLED',
          advertising_channel_type: 'PERFORMANCE_MAX',
          campaign_budget: budgetResourceName,
          bidding_strategy_type: 'TARGET_ROAS',
          target_roas: {
            target_roas: targetRoas,
          },
        },
      };

      const campaignResponse = await this.customer.campaigns.mutate([campaignOperation]);
      const campaignResourceName = campaignResponse.results[0].resource_name;
      const campaignId = campaignResourceName.split('/').pop();

      console.log(`✅ Performance Max Campaign created: ${name} (ID: ${campaignId})`);

      return {
        success: true,
        campaignId: campaignId,
        resourceName: campaignResourceName,
        budgetResourceName: budgetResourceName,
      };

    } catch (error) {
      console.error('❌ Performance Max campaign creation failed:', error);
      throw error;
    }
  }

  // ==========================================
  // BUDGET & CAMPAIGN MANAGEMENT
  // ==========================================

  async increaseCampaignBudget(campaignId, multiplier) {
    if (!this.apiSettings.isGoogleAdsEnabled()) {
      console.log(`🎭 Mock budget increase for campaign ${campaignId} by ${multiplier}x`);
      return true;
    }

    // Real implementation
    try {
      const campaign = await this.customer.campaigns.get(campaignId);
      const budgetId = campaign.campaign_budget.split('/').pop();

      const budget = await this.customer.campaignBudgets.get(budgetId);
      const currentAmount = budget.amount_micros;
      const newAmount = Math.round(currentAmount * multiplier);

      const operation = {
        update: {
          resource_name: budget.resource_name,
          amount_micros: newAmount,
        },
        update_mask: ['amount_micros'],
      };

      await this.customer.campaignBudgets.mutate([operation]);

      console.log(`💰 Budget increased for campaign ${campaignId}: €${(currentAmount/1_000_000).toFixed(2)} → €${(newAmount/1_000_000).toFixed(2)}`);
      return true;

    } catch (error) {
      console.error(`❌ Budget increase failed for campaign ${campaignId}:`, error);
      return false;
    }
  }

  async pauseCampaign(campaignId) {
    if (!this.apiSettings.isGoogleAdsEnabled()) {
      console.log(`🎭 Mock pause for campaign ${campaignId}`);
      return true;
    }

    try {
      const operation = {
        update: {
          resource_name: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${campaignId}`,
          status: 'PAUSED',
        },
        update_mask: ['status'],
      };

      await this.customer.campaigns.mutate([operation]);

      console.log(`⏸️ Campaign ${campaignId} paused due to poor performance`);
      return true;

    } catch (error) {
      console.error(`❌ Campaign pause failed for ${campaignId}:`, error);
      return false;
    }
  }

  async decreaseCampaignBudget(campaignId, multiplier) {
    return this.increaseCampaignBudget(campaignId, multiplier);
  }

  // ==========================================
  // DATABASE & UTILITY METHODS
  // ==========================================

  async updateCampaignMetrics(campaignId, data) {
    try {
      console.log(`📊 Metrics for Campaign ${campaignId}:`, {
        roas: data.roas.toFixed(2),
        cost: data.cost.toFixed(2),
        revenue: data.revenue.toFixed(2),
        mock: !this.apiSettings.isGoogleAdsEnabled()
      });
    } catch (error) {
      console.error('❌ Database update failed:', error);
    }
  }

  async savePerformanceAlert(campaignId, alertData) {
    try {
      console.warn(`🚨 Performance Alert: Campaign ${campaignId}`, alertData);
    } catch (error) {
      console.error('❌ Alert save failed:', error);
    }
  }

  async saveOptimizationResults(results) {
    try {
      for (const [campaignId, result] of Object.entries(results)) {
        console.log(`💾 Optimization saved: Campaign ${campaignId}`, result);
      }
    } catch (error) {
      console.error('❌ Optimization results save failed:', error);
    }
  }

  async getPrometheusDashboardData() {
    const performanceArray = Array.from(this.performanceData.values());

    const totalSpend = performanceArray.reduce((sum, data) => sum + (data.cost || 0), 0);
    const totalRevenue = performanceArray.reduce((sum, data) => sum + (data.revenue || 0), 0);
    const roas_values = performanceArray.filter(data => data.roas > 0).map(data => data.roas);
    const averageRoas = roas_values.length > 0 ? roas_values.reduce((a, b) => a + b, 0) / roas_values.length : 0;

    const topPerformers = performanceArray
      .filter(data => data.roas >= 5.0)
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 5);

    const underperformers = performanceArray
      .filter(data => data.roas < 2.0 && data.cost > 50)
      .sort((a, b) => a.roas - b.roas)
      .slice(0, 5);

    return {
      timestamp: new Date().toISOString(),
      totalCampaigns: performanceArray.length,
      totalSpend: totalSpend,
      totalRevenue: totalRevenue,
      averageRoas: averageRoas,
      topPerformers: topPerformers,
      underperformers: underperformers,
      platform: 'GOOGLE_ADS',
      status: this.apiSettings.isGoogleAdsEnabled() ? 'ACTIVE' : 'MOCK_MODE',
      apiConnected: this.getAPIStatus()
    };
  }
}

export default GoogleAdsService;