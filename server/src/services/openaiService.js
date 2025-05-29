// server/src/services/openaiService.js - NEUE DATEI ERSTELLEN
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate complete campaign strategy using OpenAI
export async function generateCampaignStrategy(campaignData) {
  try {
    console.log('🤖 Generating AI campaign strategy for:', campaignData.productName);

    const {
      productName,
      productDescription,
      productPrice,
      productCategory,
      objective,
      targetMarket,
      platforms,
      aiTone,
      aiLanguage,
      focusKeywords,
      dailyBudget
    } = campaignData;

    // Create comprehensive prompt for OpenAI
    const prompt = `
Du bist ein Experte für Performance Marketing und AI-gestützte Kampagnen-Strategien. Erstelle eine detaillierte Marketing-Kampagnen-Strategie basierend auf folgenden Informationen:

**PRODUKT:**
- Name: ${productName}
- Beschreibung: ${productDescription}
- Preis: €${productPrice}
- Kategorie: ${productCategory}
- Keywords: ${focusKeywords || 'Keine spezifischen Keywords'}

**KAMPAGNEN-ZIELE:**
- Hauptziele: ${objective.join(', ')}

**ZIELMARKT & BUDGET:**
- Zielmarkt: ${targetMarket}
- Plattformen: ${platforms.join(', ')}
- Tagesbudget: €${dailyBudget}
- Ton: ${aiTone}
- Sprache: ${aiLanguage}

Erstelle eine umfassende JSON-Antwort mit folgender Struktur:

{
  "marketAnalysis": "Detaillierte Marktanalyse für das Produkt und den Zielmarkt",
  "targetingStrategy": "Spezifische Targeting-Strategie für die gewählten Plattformen",
  "contentStrategy": "Inhalts- und Botschafts-Strategie",
  "budgetRecommendation": "Budget-Verteilung und Empfehlungen",
  "expectedResults": {
    "roas": 4.2,
    "cpc": 1.25,
    "conversionRate": 3.8
  },
  "creatives": [
    {
      "platform": "META",
      "type": "IMAGE",
      "headlines": ["3-5 kraftvolle Headlines"],
      "descriptions": ["2-3 überzeugende Beschreibungen"],
      "ctas": ["3-4 Call-to-Actions"],
      "visualDescription": "Beschreibung des idealen Bildmaterials"
    }
  ],
  "audiences": [
    {
      "name": "Zielgruppen-Name",
      "description": "Detaillierte Zielgruppen-Beschreibung",
      "demographics": {
        "age": {"min": 25, "max": 45},
        "genders": ["male", "female"],
        "locations": ["Deutschland", "Österreich", "Schweiz"]
      },
      "interests": ["Liste der Interessen"],
      "behaviors": ["Verhaltens-Targeting"],
      "expectedReach": 250000,
      "platform": "META"
    }
  ],
  "recommendations": [
    "5-7 spezifische Handlungsempfehlungen für optimale Performance"
  ],
  "riskFactors": [
    "3-5 potentielle Risiken und wie man sie minimiert"
  ]
}

Wichtige Anforderungen:
- Alle Texte auf ${aiLanguage === 'german' ? 'Deutsch' : 'Englisch'}
- Tonalität: ${aiTone}
- Fokus auf ${targetMarket}-Markt
- Berücksichtige die Besonderheiten von ${productCategory}
- Erstelle plattform-spezifische Inhalte für: ${platforms.join(', ')}
- Alle Empfehlungen sollen praxisorientiert und umsetzbar sein
- Zahlen sollen realistisch und auf Branchenbenchmarks basieren

Antworte NUR mit dem JSON-Objekt, ohne zusätzliche Erklärungen oder Formatierung.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Latest GPT-4 model
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte für Performance Marketing und AI-gestützte Kampagnen-Strategien. Du antwortest immer mit validen JSON-Objekten ohne zusätzliche Formatierung."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('🤖 OpenAI Raw Response:', aiResponse);

    // Parse and validate JSON response
    let strategyData;
    try {
      strategyData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('❌ Raw AI Response:', aiResponse);
      throw new Error('AI response is not valid JSON');
    }

    // Enhance with additional calculated data
    const enhancedStrategy = {
      strategy: {
        marketAnalysis: strategyData.marketAnalysis,
        targetingStrategy: strategyData.targetingStrategy,
        contentStrategy: strategyData.contentStrategy,
        budgetRecommendation: strategyData.budgetRecommendation,
        expectedResults: strategyData.expectedResults || {
          roas: 4.0,
          cpc: estimateCPC(productCategory),
          conversionRate: estimateConversionRate(productCategory)
        }
      },
      creatives: strategyData.creatives || [],
      audiences: strategyData.audiences || [],
      recommendations: strategyData.recommendations || [],
      riskFactors: strategyData.riskFactors || [],
      generatedAt: new Date(),
      confidence: 92 // High confidence for OpenAI generated content
    };

    console.log('✅ AI Strategy generated successfully');
    return enhancedStrategy;

  } catch (error) {
    console.error('❌ OpenAI Strategy Generation Error:', error);

    // Fallback to basic strategy if OpenAI fails
    console.log('🔄 Falling back to basic strategy generation');
    return generateBasicStrategy(campaignData);
  }
}

// Fallback strategy generator (your existing logic)
function generateBasicStrategy(campaignData) {
  const {
    productName,
    productDescription,
    productPrice,
    productCategory,
    objective,
    targetMarket,
    platforms,
    aiTone,
    aiLanguage,
    focusKeywords
  } = campaignData;

  return {
    strategy: {
      marketAnalysis: `Target market analysis for ${productName} in ${targetMarket} region. Product positioned in ${productCategory} category at €${productPrice} price point. Primary objectives: ${objective.join(', ')}.`,
      targetingStrategy: `Focus on ${targetMarket} market with ${aiTone} messaging tone. Target audience interested in ${productCategory} products.`,
      contentStrategy: `${aiLanguage === 'german' ? 'German-language' : 'English-language'} content with ${aiTone} tone. Content optimized for ${platforms.join(', ')} platforms.`,
      budgetRecommendation: `Recommended budget allocation based on platform performance. Expected ROAS: 3.5-4.5x.`,
      expectedResults: {
        roas: 4.0,
        cpc: estimateCPC(productCategory),
        conversionRate: estimateConversionRate(productCategory)
      }
    },
    creatives: platforms.map(platform => ({
      type: platform === 'YOUTUBE' ? 'VIDEO' : 'IMAGE',
      headlines: generateBasicHeadlines(productName, aiTone, aiLanguage),
      descriptions: generateBasicDescriptions(productDescription, aiTone, aiLanguage),
      ctas: generateBasicCTAs(objective, aiLanguage),
      visualDescription: `${aiTone} lifestyle imagery featuring ${productName}`,
      platform
    })),
    audiences: [{
      name: `${productCategory} Enthusiasts - ${targetMarket}`,
      description: `Primary target audience for ${productName}`,
      demographics: {
        age: { min: 25, max: 45 },
        genders: ['male', 'female'],
        locations: getLocationsByMarket(targetMarket)
      },
      interests: generateInterests(productCategory, focusKeywords),
      behaviors: ['online shoppers', 'product researchers'],
      expectedReach: estimateReach(targetMarket, productCategory),
      platform: 'META'
    }],
    generatedAt: new Date(),
    confidence: 75 // Lower confidence for fallback
  };
}

// Helper functions (your existing ones)
function estimateCPC(category) {
  const cpcs = {
    'Fitness Technology': 1.25,
    'Electronics': 1.10,
    'Fashion': 0.85,
    'Health & Beauty': 1.45
  };
  return cpcs[category] || 1.00;
}

function estimateConversionRate(category) {
  const rates = {
    'Fitness Technology': 3.2,
    'Electronics': 2.8,
    'Fashion': 2.1,
    'Health & Beauty': 3.8
  };
  return rates[category] || 2.5;
}

function generateBasicHeadlines(productName, tone, language) {
  return [`${productName} - Premium Quality`, `Discover ${productName}`, `${productName} - Best Choice`];
}

function generateBasicDescriptions(description, tone, language) {
  return [description, `Experience the benefits of ${description}`, `High-quality solution for your needs`];
}

function generateBasicCTAs(objectives, language) {
  return ['Learn More', 'Shop Now', 'Get Started'];
}

function getLocationsByMarket(market) {
  const markets = {
    'DACH': ['Germany', 'Austria', 'Switzerland'],
    'EU': ['Germany', 'France', 'Spain', 'Italy'],
    'USA': ['United States'],
    'GLOBAL': ['Worldwide']
  };
  return markets[market] || ['Germany'];
}

function generateInterests(category, keywords) {
  const baseInterests = {
    'Fitness Technology': ['fitness', 'health tracking', 'wearable technology'],
    'Electronics': ['technology', 'gadgets', 'innovation'],
    'Fashion': ['fashion', 'style', 'clothing'],
    'Health & Beauty': ['health', 'beauty', 'wellness']
  };
  return baseInterests[category] || ['lifestyle', 'quality products'];
}

function estimateReach(market, category) {
  const baseReach = {
    'DACH': 250000,
    'EU': 800000,
    'USA': 1200000,
    'GLOBAL': 3000000
  };
  return baseReach[market] || 100000;
}

export default { generateCampaignStrategy };