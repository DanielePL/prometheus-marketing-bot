// server/src/services/aiConsultantService.js
// AI Performance Marketing Consultant - The Brain of Prometheus

import OpenAI from 'openai';
import Campaign from '../models/Campaign.js';
import PerformanceMetric from '../models/PerformanceMetric.js';
import dotenv from 'dotenv';

dotenv.config();

class AIConsultantService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.consultantPersonality = {
      name: "Marcus",
      role: "Senior Performance Marketing Consultant",
      experience: "15+ years in digital marketing",
      specialties: ["Meta Ads", "Google Ads", "Performance Optimization", "ROAS Improvement"],
      tone: "Professional but approachable, data-driven, actionable advice"
    };

    console.log('🧠 AI Performance Marketing Consultant initialized');
  }

  // ==========================================
  // MAIN CHAT INTERFACE
  // ==========================================

  async chatWithConsultant(userId, message, campaignId = null, context = {}) {
    try {
      console.log(`💬 AI Consultant chat: User ${userId}, Campaign: ${campaignId}`);

      // Gather context data
      const contextData = await this.gatherContext(userId, campaignId, context);

      // Generate AI response
      const response = await this.generateConsultantResponse(message, contextData);

      // Log conversation for learning
      await this.logConversation(userId, message, response, campaignId);

      return {
        success: true,
        response: response.content,
        suggestions: response.suggestions,
        actionItems: response.actionItems,
        consultant: this.consultantPersonality,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ AI Consultant error:', error);
      return {
        success: false,
        response: "Entschuldigung, ich habe gerade technische Schwierigkeiten. Können Sie Ihre Frage wiederholen?",
        error: error.message
      };
    }
  }

  // ==========================================
  // SPECIALIZED CONSULTANT FUNCTIONS
  // ==========================================

  async analyzeCampaignPerformance(campaignId, userId) {
    try {
      const campaign = await Campaign.findOne({ _id: campaignId, userId }).populate('productId');
      if (!campaign) throw new Error('Campaign not found');

      const metrics = await PerformanceMetric.getLatestMetrics(campaignId);
      const history = await PerformanceMetric.getHourlyMetrics(campaignId, 48);

      const analysis = await this.generatePerformanceAnalysis(campaign, metrics, history);

      return {
        success: true,
        analysis: analysis.content,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        urgentActions: analysis.urgentActions,
        score: analysis.score
      };

    } catch (error) {
      console.error('❌ Performance analysis error:', error);
      throw error;
    }
  }

  async optimizeBudgetAllocation(campaignId, userId, totalBudget) {
    try {
      const campaign = await Campaign.findOne({ _id: campaignId, userId });
      const performanceData = await this.getPerformanceByPlatform(campaignId);

      const optimization = await this.generateBudgetOptimization(
        campaign,
        performanceData,
        totalBudget
      );

      return {
        success: true,
        currentAllocation: optimization.current,
        recommendedAllocation: optimization.recommended,
        expectedImpact: optimization.impact,
        reasoning: optimization.reasoning
      };

    } catch (error) {
      console.error('❌ Budget optimization error:', error);
      throw error;
    }
  }

  async suggestCreativeImprovements(campaignId, userId) {
    try {
      const campaign = await Campaign.findOne({ _id: campaignId, userId }).populate('productId');
      const metrics = await this.getCreativePerformanceData(campaignId);

      const suggestions = await this.generateCreativeSuggestions(campaign, metrics);

      return {
        success: true,
        currentCreatives: suggestions.current,
        improvements: suggestions.improvements,
        newCreativeIdeas: suggestions.newIdeas,
        testingStrategy: suggestions.testing
      };

    } catch (error) {
      console.error('❌ Creative suggestions error:', error);
      throw error;
    }
  }

  // ==========================================
  // AI RESPONSE GENERATION
  // ==========================================

  async generateConsultantResponse(userMessage, contextData) {
    const systemPrompt = `Du bist Marcus, ein Senior Performance Marketing Consultant mit 15+ Jahren Erfahrung. 

DEINE PERSÖNLICHKEIT:
- Professionell aber zugänglich
- Datengetrieben und analytisch
- Gibst konkrete, umsetzbare Ratschläge
- Spezialist für Meta Ads, Google Ads, Performance Optimization
- Sprichst Deutsch mit gelegentlichen englischen Fachbegriffen

VERFÜGBARE DATEN:
${JSON.stringify(contextData, null, 2)}

AUFGABE:
Beantworte die Nutzerfrage basierend auf den verfügbaren Kampagnendaten. Gib konkrete, umsetzbare Empfehlungen.

ANTWORT-FORMAT:
{
  "content": "Hauptantwort als Markdown-formatierter Text",
  "suggestions": ["3-5 konkrete Quick-Wins"],
  "actionItems": ["2-3 prioritäre Handlungsempfehlungen"],
  "insights": ["1-2 wichtige Erkenntnisse aus den Daten"]
}

Antworte NUR mit dem JSON-Objekt, keine zusätzliche Formatierung.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async generatePerformanceAnalysis(campaign, currentMetrics, historicalData) {
    const analysisPrompt = `Führe eine detaillierte Performance-Analyse durch als Senior Marketing Consultant.

KAMPAGNE: ${campaign.name}
PRODUKT: ${campaign.productId?.name} (€${campaign.productId?.price})
BUDGET: €${campaign.budget?.daily}/Tag

AKTUELLE METRIKEN:
${currentMetrics ? JSON.stringify(currentMetrics, null, 2) : 'Keine aktuellen Daten'}

HISTORISCHE DATEN (48h):
${JSON.stringify(historicalData.slice(0, 10), null, 2)}

Erstelle eine umfassende Analyse mit:

{
  "content": "Detaillierte Analyse der Kampagnen-Performance",
  "insights": ["3-4 wichtige Erkenntnisse"],
  "recommendations": ["4-5 konkrete Optimierungsempfehlungen"],
  "urgentActions": ["1-2 sofortige Maßnahmen bei kritischen Issues"],
  "score": 85
}

Score: 0-100 basierend auf Performance vs. Benchmarks.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async generateBudgetOptimization(campaign, performanceData, totalBudget) {
    const optimizationPrompt = `Optimiere die Budget-Verteilung als Performance Marketing Experte.

KAMPAGNE: ${campaign.name}
VERFÜGBARES BUDGET: €${totalBudget}
PLATTFORMEN: ${Object.keys(campaign.platforms || {}).join(', ')}

AKTUELLE PERFORMANCE NACH PLATTFORM:
${JSON.stringify(performanceData, null, 2)}

Erstelle Budget-Optimierung:

{
  "current": {
    "META": {"budget": 200, "percentage": 40},
    "GOOGLE": {"budget": 150, "percentage": 30}
  },
  "recommended": {
    "META": {"budget": 250, "percentage": 50, "reason": "Beste ROAS"},
    "GOOGLE": {"budget": 100, "percentage": 20, "reason": "Hohe CPCs"}
  },
  "impact": {
    "expectedROASImprovement": 15,
    "projectedRevenue": 2500
  },
  "reasoning": "Detaillierte Begründung der Umverteilung"
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: optimizationPrompt }],
      max_tokens: 1200,
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // ==========================================
  // CONTEXT GATHERING
  // ==========================================

  async gatherContext(userId, campaignId, additionalContext) {
    const context = {
      timestamp: new Date().toISOString(),
      userId: userId,
      ...additionalContext
    };

    try {
      // Campaign-specific context
      if (campaignId) {
        const campaign = await Campaign.findOne({ _id: campaignId, userId }).populate('productId');
        if (campaign) {
          context.campaign = {
            name: campaign.name,
            status: campaign.status,
            budget: campaign.budget,
            objective: campaign.objective,
            platforms: Object.keys(campaign.platforms || {}),
            product: {
              name: campaign.productId?.name,
              price: campaign.productId?.price,
              category: campaign.productId?.category
            }
          };

          // Get latest performance
          const metrics = await PerformanceMetric.getLatestMetrics(campaignId);
          if (metrics) {
            context.performance = {
              roas: metrics.roas,
              spend: metrics.spend,
              revenue: metrics.revenue,
              conversions: metrics.conversions,
              ctr: metrics.ctr,
              cpc: metrics.cpc
            };
          }

          // Get active alerts
          const alerts = await PerformanceMetric.getActiveAlerts(campaignId);
          context.alerts = alerts.length;
        }
      }

      // User's overall portfolio context
      const userCampaigns = await Campaign.find({ userId }).limit(5);
      context.portfolioSize = userCampaigns.length;

      return context;

    } catch (error) {
      console.error('❌ Context gathering error:', error);
      return context;
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  async getPerformanceByPlatform(campaignId) {
    try {
      const metrics = await PerformanceMetric.find({
        campaignId,
        platform: { $ne: 'COMBINED' },
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: -1 });

      const platformData = {};

      metrics.forEach(metric => {
        if (!platformData[metric.platform]) {
          platformData[metric.platform] = {
            spend: 0,
            revenue: 0,
            conversions: 0,
            impressions: 0,
            clicks: 0
          };
        }

        platformData[metric.platform].spend += metric.spend;
        platformData[metric.platform].revenue += metric.revenue;
        platformData[metric.platform].conversions += metric.conversions;
        platformData[metric.platform].impressions += metric.impressions;
        platformData[metric.platform].clicks += metric.clicks;
      });

      // Calculate ROAS for each platform
      Object.keys(platformData).forEach(platform => {
        const data = platformData[platform];
        data.roas = data.spend > 0 ? data.revenue / data.spend : 0;
        data.ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        data.cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
      });

      return platformData;

    } catch (error) {
      console.error('❌ Platform performance error:', error);
      return {};
    }
  }

  async getCreativePerformanceData(campaignId) {
    // This would integrate with actual ad platform APIs to get creative-level data
    // For now, return mock structure
    return {
      topPerforming: [],
      underPerforming: [],
      testingOpportunities: []
    };
  }

  async logConversation(userId, userMessage, aiResponse, campaignId) {
    try {
      // Log conversation for analytics and learning
      console.log(`📝 AI Consultant Log: User ${userId} - ${userMessage.substring(0, 50)}...`);

      // Here you could save to database for conversation history
      // ConversationLog.create({ userId, userMessage, aiResponse, campaignId, timestamp: new Date() });

    } catch (error) {
      console.error('❌ Conversation logging error:', error);
    }
  }

  // ==========================================
  // QUICK ANALYSIS METHODS
  // ==========================================

  async getQuickInsights(campaignId, userId) {
    try {
      const metrics = await PerformanceMetric.getLatestMetrics(campaignId);
      if (!metrics) return null;

      const insights = [];

      // ROAS Analysis
      if (metrics.roas > 5.0) {
        insights.push({ type: 'success', message: `Excellent ROAS of ${metrics.roas.toFixed(2)}x - Consider scaling budget` });
      } else if (metrics.roas < 2.0) {
        insights.push({ type: 'warning', message: `Low ROAS of ${metrics.roas.toFixed(2)}x - Optimization needed` });
      }

      // CTR Analysis
      if (metrics.ctr < 1.0) {
        insights.push({ type: 'suggestion', message: `CTR ${metrics.ctr.toFixed(2)}% is below average - Test new creatives` });
      }

      // Budget Analysis
      if (metrics.budgetUtilization > 90) {
        insights.push({ type: 'action', message: `Budget ${metrics.budgetUtilization.toFixed(0)}% utilized - Consider increasing` });
      }

      return insights;

    } catch (error) {
      console.error('❌ Quick insights error:', error);
      return [];
    }
  }

  async generateDailyRecommendations(userId) {
    try {
      const userCampaigns = await Campaign.find({
        userId,
        status: { $in: ['ACTIVE', 'DRAFT'] }
      }).limit(10);

      const recommendations = [];

      for (const campaign of userCampaigns) {
        const insights = await this.getQuickInsights(campaign._id, userId);
        if (insights.length > 0) {
          recommendations.push({
            campaignId: campaign._id,
            campaignName: campaign.name,
            insights: insights
          });
        }
      }

      return recommendations;

    } catch (error) {
      console.error('❌ Daily recommendations error:', error);
      return [];
    }
  }
}

// Singleton
let aiConsultantService = null;

export function getAIConsultantService() {
  if (!aiConsultantService) {
    aiConsultantService = new AIConsultantService();
  }
  return aiConsultantService;
}

export default AIConsultantService;