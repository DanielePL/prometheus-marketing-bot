// server/src/controllers/aiConsultantController.js

import { getAIConsultantService } from '../services/aiConsultantService.js';

const aiConsultantService = getAIConsultantService();

export const chatWithConsultant = async (req, res) => {
  try {
    const { message, campaignId } = req.body;
    const userId = req.user.id;

    console.log(`AI Consultant API Anfrage erhalten: ${message}`);

    // Überprüfung der Eingabeparameter
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Nachricht darf nicht leer sein'
      });
    }

    // Servicemethode aufrufen
    const response = await aiConsultantService.chatWithConsultant(
      userId,
      message,
      campaignId || null
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error('AI Consultant Controller Fehler:', error);

    return res.status(500).json({
      success: false,
      message: 'Serverfehler beim Verarbeiten der AI Consultant Anfrage',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const analyzeCampaignPerformance = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const userId = req.user.id;

    const analysis = await aiConsultantService.analyzeCampaignPerformance(campaignId, userId);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Performance-Analyse Fehler:', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler bei der Performance-Analyse',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const optimizeBudgetAllocation = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const userId = req.user.id;
    const { totalBudget } = req.body;

    if (!totalBudget) {
      return res.status(400).json({
        success: false,
        message: 'Gesamtbudget ist erforderlich'
      });
    }

    const optimization = await aiConsultantService.optimizeBudgetAllocation(
      campaignId,
      userId,
      totalBudget
    );

    return res.status(200).json(optimization);
  } catch (error) {
    console.error('Budget-Optimierung Fehler:', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler bei der Budget-Optimierung',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const suggestCreativeImprovements = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const userId = req.user.id;

    const suggestions = await aiConsultantService.suggestCreativeImprovements(campaignId, userId);
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Creative-Vorschläge Fehler:', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler bei den Creative-Vorschlägen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};