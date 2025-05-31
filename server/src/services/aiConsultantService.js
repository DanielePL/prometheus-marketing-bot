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

  // Neue Methoden für aiConsultantService.js

  // Hauptfunktion für die Kampagnenerstellung
  async guideCampaignCreation(userId, step, currentData = {}) {
    try {
      console.log(`💬 Kampagnen-Guide: User ${userId}, Schritt: ${step}`);
      
      // System-Prompt für die Kampagnenerstellung vorbereiten
      const systemPrompt = this.getCampaignCreationSystemPrompt();
      
      // Schritt-spezifischen Prompt erstellen
      const userPrompt = this.getCampaignStepPrompt(step, currentData);
      
      // OpenAI API aufrufen
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1800,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      // Response parsen und zurückgeben
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      
      return {
        success: true,
        step,
        guidance: parsedResponse,
        consultant: this.consultantPersonality
      };
      
    } catch (error) {
      console.error('❌ Kampagnen-Guide Fehler:', error);
      return {
        success: false,
        step,
        error: error.message,
        fallbackGuidance: this.getFallbackGuidance(step)
      };
    }
  }

  // Hilfsmethode: System-Prompt für den Kampagnen-Guide
  getCampaignCreationSystemPrompt() {
    return `Du bist Marcus, ein erfahrener Performance Marketing Berater, der Nutzern hilft, erfolgreiche Werbekampagnen zu erstellen.

DEIN CHARAKTER:
- Professionell aber freundlich
- Erklärt komplexe Konzepte verständlich
- Gibt immer konkrete, umsetzbare Ratschläge
- Nutzt Beispiele und Vergleiche
- Spricht Deutsch mit gelegentlichen Fachbegriffen

DEINE AUFGABE:
- Führe den Nutzer durch den Kampagnen-Erstellungsprozess
- Erkläre jeden Schritt und seine Bedeutung
- Gib datenbasierte Empfehlungen (Budgets, Zielgruppen, etc.)
- Zeige verschiedene Optionen auf und erkläre Vor- und Nachteile
- Vermittle ein Gefühl der Sicherheit und Klarheit

WICHTIG:
- Benutze immer konkrete Zahlen und Beispiele
- Vermeide allgemeine Floskeln
- Mache Prognosen zu erwartbaren Ergebnissen
- Hilf Nutzern, informierte Entscheidungen zu treffen

ANTWORTFORMAT:
Du musst in einem strukturierten JSON-Format antworten mit folgenden Feldern:
{
  "mainAdvice": "Hauptratschlag im Markdown-Format mit Erklärungen",
  "recommendations": ["Liste mit 2-4 spezifischen Empfehlungen"],
  "estimations": {
    "description": "Erklärung der Schätzungen",
    "metrics": {"metric1": value, "metric2": value}
  },
  "options": [
    {"name": "Option 1", "description": "Beschreibung", "pros": ["Vorteil 1"], "cons": ["Nachteil 1"]},
    {"name": "Option 2", "description": "Beschreibung", "pros": ["Vorteil 1"], "cons": ["Nachteil 1"]}
  ],
  "nextSteps": ["Empfohlene nächste Schritte"]
}`;
  }

  // Hilfsmethode: Prompt für spezifischen Kampagnenschritt
  getCampaignStepPrompt(step, currentData) {
    const steps = {
      name: `Hilf dem Nutzer, einen effektiven Namen für die Kampagne zu finden.
    
Produktinfos: ${JSON.stringify(currentData.product || {})}
Ziel der Kampagne: ${currentData.objective || "Noch nicht festgelegt"}
Aktueller Kampagnenname: "${currentData.name || ''}"

Gib Vorschläge für Kampagnennamen, die folgende Kriterien erfüllen:
- Klar und präzise
- Erinnerungswürdig
- Gut für die interne Organisation
- Passen zum Produkt und Ziel

Erkläre auch, warum gute Kampagnennamen wichtig sind und wie sie bei der Analyse helfen.`,

      budget: `Empfehle ein passendes Werbebudget basierend auf folgenden Informationen:
    
Produkt: ${JSON.stringify(currentData.product || {})}
Preis: €${currentData.product?.price || "unbekannt"}
Gewinnmarge: ${currentData.product?.margin || "unbekannt"}%
Kampagnenziel: ${currentData.objective || "Verkäufe steigern"}
Plattform(en): ${currentData.platforms?.join(', ') || "META"}

Beantworte dabei folgende Fragen:
1. Welches tägliche Budget macht Sinn für dieses Produkt?
2. Was kann man mit €50, €100, €200 pro Tag erreichen?
3. Wie viele potentielle Kunden kann man damit erreichen?
4. Wie viele Conversions kann man mit diesem Budget erwarten?
5. Wie hoch ist der erwartete ROI bei verschiedenen Budgets?

Gib konkrete Zahlen und Schätzungen für verschiedene Budget-Szenarien.`,

      duration: `Empfehle eine optimale Laufzeit für die Kampagne:
    
Kampagne: ${currentData.name || "Neue Kampagne"}
Produkt: ${JSON.stringify(currentData.product || {})}
Tägliches Budget: €${currentData.budget?.daily || 50}
Ziel: ${currentData.objective || "Verkäufe steigern"}
Plattform(en): ${currentData.platforms?.join(', ') || "META"}

Beantworte folgende Fragen:
1. Wie lange sollte die Kampagne mindestens laufen?
2. Was sind Vor- und Nachteile von kurzen vs. langen Kampagnen?
3. Welche Phasen durchläuft eine Kampagne normalerweise?
4. Wann kann man erste Ergebnisse erwarten?
5. Wann sollte man Optimierungen vornehmen?

Gib eine klare Empfehlung für diesen speziellen Fall.`,

      audience: `Hilf bei der Zielgruppenauswahl für diese Kampagne:
    
Produkt: ${JSON.stringify(currentData.product || {})}
Kampagnenziel: ${currentData.objective || "Verkäufe steigern"}
Plattform(en): ${currentData.platforms?.join(', ') || "META"}

Beantworte folgende Fragen:
1. Welche Zielgruppe würde am besten zu diesem Produkt passen?
2. Wie spezifisch sollte die Zielgruppe sein?
3. Welche demografischen Merkmale sind relevant?
4. Welche Interessen sollten berücksichtigt werden?
5. Wie groß sollte die Zielgruppe sein für gute Ergebnisse?

Gib konkrete Vorschläge für Zielgruppeneinstellungen für dieses Produkt.`,

      creatives: `Empfehle Werbeformate und kreative Ansätze für:
    
Produkt: ${JSON.stringify(currentData.product || {})}
Zielgruppe: ${JSON.stringify(currentData.audience || "Noch nicht definiert")}
Plattform(en): ${currentData.platforms?.join(', ') || "META"}

Beantworte folgende Fragen:
1. Welche Anzeigenformate eignen sich am besten?
2. Welche kreativen Ansätze funktionieren typischerweise gut?
3. Welche Botschaft sollte kommuniziert werden?
4. Wie viele verschiedene Kreative sollte man testen?
5. Was sind Best Practices für Werbetexte und Bilder?

Gib konkrete Beispiele und Vorschläge für dieses Produkt.`
    };

    // Fallback für unbekannte Schritte
    return steps[step] || `Berate den Nutzer zum Thema Kampagnenerstellung (Schritt: ${step})
  
Aktueller Stand: ${JSON.stringify(currentData)}

Gib hilfreiche Ratschläge zur Kampagnenerstellung und beantworte mögliche Fragen.`;
  }

  // Hilfsmethode: Fallback-Antworten für Server-Fehler
  getFallbackGuidance(step) {
    const fallbacks = {
      name: {
        mainAdvice: "Ein guter Kampagnenname sollte klar, präzise und leicht zu merken sein. Er sollte Produkt, Ziel und idealerweise die Zielgruppe widerspiegeln.",
        recommendations: ["Verwende das Format [Produkt]-[Ziel]-[Monat/Jahr]", "Halte es kurz und aussagekräftig", "Sei konsistent in der Benennung aller Kampagnen"]
      },
      budget: {
        mainAdvice: "Das Budget sollte auf Produktwert, Gewinnmarge und Kampagnenziel basieren. Ein guter Startpunkt ist 10-20x des Produktwerts für ausreichend Testdaten.",
        recommendations: ["Beginne mit mindestens 30-50€ täglich für aussagekräftige Daten", "Plane ein Test-Budget für 5-7 Tage ein", "Berechne das Budget basierend auf Ziel-CAC"]
      },
      duration: {
        mainAdvice: "Die optimale Laufzeit hängt vom Ziel, Budget und Lernphase der Plattform ab. Typischerweise benötigen Kampagnen mindestens 5-7 Tage für die Lernphase.",
        recommendations: ["Mindestlaufzeit: 7 Tage für initiale Optimierung", "Evaluierung nach 14 Tagen", "Langfristige Kampagnen (30+ Tage) für konsistente Performance"]
      }
    };
    
    return fallbacks[step] || {
      mainAdvice: "Bei der Kampagnenerstellung ist es wichtig, klar definierte Ziele zu haben und alle Entscheidungen daran auszurichten.",
      recommendations: ["Definiere klare Kampagnenziele", "Wähle die richtigen Plattformen für deine Zielgruppe", "Teste verschiedene Creatives und Botschaften"]
    };
  }

  // Methode für Kampagnen-Budget-Prognosen
  async forecastCampaignPerformance(campaignData) {
    try {
      const productPrice = campaignData.product?.price || 50;
      const dailyBudget = campaignData.budget?.daily || 50;
      const platform = campaignData.platforms?.[0] || 'META';
      
      // Benchmarks basierend auf Plattform und Branche
      // Diese Werte könnten in einer Datenbank oder separaten Datei gespeichert werden
      const benchmarks = {
        META: {
          cpm: 8.5,                 // Kosten pro 1000 Impressions
          ctr: 1.2,                 // Click-Through-Rate (%)
          convRate: {               // Conversion Rates nach Kampagnenziel
            AWARENESS: 0.5,
            TRAFFIC: 1.0,
            LEADS: 2.5,
            SALES: 3.0
          },
          audience: {               // Durchschnittliche Zielgruppengrößen
            broad: 500000,
            targeted: 100000,
            specific: 20000
          }
        },
        GOOGLE: {
          cpm: 7.2,
          ctr: 2.1,
          convRate: {
            AWARENESS: 0.4,
            TRAFFIC: 1.8,
            LEADS: 3.0,
            SALES: 3.5
          },
          audience: {
            broad: 600000,
            targeted: 150000,
            specific: 30000
          }
        }
      };
      
      const bm = benchmarks[platform] || benchmarks.META;
      const objective = campaignData.objective || 'SALES';
      const convRate = bm.convRate[objective] || bm.convRate.SALES;
      
      // Basis-Berechnungen
      const dailyImpressions = (dailyBudget / bm.cpm) * 1000;
      const dailyClicks = dailyImpressions * (bm.ctr / 100);
      const dailyConversions = dailyClicks * (convRate / 100);
      const dailyRevenue = dailyConversions * productPrice;
      const dailyRoas = dailyBudget > 0 ? dailyRevenue / dailyBudget : 0;
      
      // Verschiedene Budget-Szenarien
      const scenarios = [30, 50, 100, 200, 500].map(budget => {
        const impressions = (budget / bm.cpm) * 1000;
        const clicks = impressions * (bm.ctr / 100);
        const conversions = clicks * (convRate / 100);
        const revenue = conversions * productPrice;
        const roas = budget > 0 ? revenue / budget : 0;
        
        return {
          budget,
          daily: {
            impressions: Math.round(impressions),
            clicks: Math.round(clicks),
            conversions: Number(conversions.toFixed(2)),
            revenue: Number(revenue.toFixed(2)),
            roas: Number(roas.toFixed(2))
          },
          monthly: {
            impressions: Math.round(impressions * 30),
            clicks: Math.round(clicks * 30),
            conversions: Number((conversions * 30).toFixed(2)),
            revenue: Number((revenue * 30).toFixed(2)),
            roas: Number(roas.toFixed(2))
          }
        };
      });
      
      // Zielgruppenschätzung
      const audienceType = campaignData.audience?.specificity || 'targeted';
      const estimatedAudienceSize = bm.audience[audienceType] || bm.audience.targeted;
      const dailyReach = Math.min(dailyImpressions, estimatedAudienceSize * 0.1);
      const monthlyReach = Math.min(dailyReach * 30, estimatedAudienceSize);
      
      // Formatiere die Ergebnisse
      return {
        success: true,
        currentBudget: {
          daily: dailyBudget,
          monthly: dailyBudget * 30
        },
        estimatedReach: {
          daily: Math.round(dailyReach),
          monthly: Math.round(monthlyReach),
          totalAudience: estimatedAudienceSize
        },
        dailyResults: {
          impressions: Math.round(dailyImpressions),
          clicks: Math.round(dailyClicks),
          conversions: Number(dailyConversions.toFixed(2)),
          revenue: Number(dailyRevenue.toFixed(2)),
          roas: Number(dailyRoas.toFixed(2))
        },
        monthlyResults: {
          impressions: Math.round(dailyImpressions * 30),
          clicks: Math.round(dailyClicks * 30),
          conversions: Number((dailyConversions * 30).toFixed(2)),
          revenue: Number((dailyRevenue * 30).toFixed(2)),
          roas: Number(dailyRoas.toFixed(2))
        },
        budgetScenarios: scenarios,
        recommendedBudget: this.getRecommendedBudget(productPrice, objective),
        recommendedDuration: this.getRecommendedDuration(objective)
      };
    } catch (error) {
      console.error('❌ Kampagnen-Prognose Fehler:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Hilfsmethode: Empfohlenes Budget basierend auf Produktpreis und Kampagnenziel
  getRecommendedBudget(productPrice, objective) {
    let factor;
    
    switch(objective) {
      case 'AWARENESS':
        factor = 0.5; // Kleineres Budget für Awareness
        break;
      case 'TRAFFIC':
        factor = 1.0;
        break;
      case 'LEADS':
        factor = 1.5;
        break;
      case 'SALES':
        factor = 2.0; // Höheres Budget für Sales-Kampagnen
        break;
      default:
        factor = 1.0;
    }
    
    // Basis-Budget-Berechnung basierend auf Produktpreis
    const baseRecommendation = Math.max(30, productPrice * factor);
    
    // Budget-Stufen für sinnvolle Empfehlungen
    const budgetTiers = [30, 50, 80, 100, 150, 200, 300, 500, 800, 1000];
    
    // Finde den nächsthöheren Budgetwert aus den Stufen
    let recommended = budgetTiers[0];
    for (let tier of budgetTiers) {
      if (tier >= baseRecommendation) {
        recommended = tier;
        break;
      }
    }
    
    return {
      daily: recommended,
      monthly: recommended * 30,
      minimum: Math.max(20, Math.floor(productPrice * 0.5)),
      optimal: recommended,
      aggressive: Math.floor(recommended * 2)
    };
  }

  // Hilfsmethode: Empfohlene Laufzeit basierend auf Kampagnenziel
  getRecommendedDuration(objective) {
    switch(objective) {
      case 'AWARENESS':
        return {
          minimum: 10,
          optimal: 30,
          explanation: "Awareness-Kampagnen benötigen Zeit, um Reichweite aufzubauen und Markenbekanntheit zu steigern."
        };
      case 'TRAFFIC':
        return {
          minimum: 7,
          optimal: 21,
          explanation: "Traffic-Kampagnen können schneller bewertet werden, benötigen aber Zeit für Optimierungen."
        };
      case 'LEADS':
        return {
          minimum: 14,
          optimal: 30,
          explanation: "Lead-Generierung erfordert eine stabile Datenbasis und mehrere Optimierungszyklen."
        };
      case 'SALES':
        return {
          minimum: 14,
          optimal: 30,
          explanation: "Verkaufskampagnen benötigen genügend Konversionsdaten und Lernzeit für die Algorithmen."
        };
      default:
        return {
          minimum: 10,
          optimal: 30,
          explanation: "Als Faustregel sollten Kampagnen mindestens 10 Tage laufen, optimal sind 30 Tage für vollständige Optimierung."
        };
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