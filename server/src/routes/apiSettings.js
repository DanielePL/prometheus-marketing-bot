// /prometheus-marketing-engine/server/src/routes/apiSettings.js
// API Settings Routes - Toggle Google API On/Off

import express from 'express';
import { getApiSettingsService } from '../services/apiSettingsService.js';
import GoogleAdsService from '../services/integrations/googleAdsService.js';

const router = express.Router();

// Get Google Ads Service instance
let googleAdsService = null;
try {
  googleAdsService = new GoogleAdsService();
} catch (error) {
  console.error('❌ Google Ads Service initialization failed:', error);
}

// Simple auth middleware
const auth = (req, res, next) => {
  next();
};

// ==========================================
// API SETTINGS ROUTES
// ==========================================

/**
 * GET /api/settings
 * Get current API settings
 */
router.get('/', auth, (req, res) => {
  try {
    const apiSettings = getApiSettingsService();
    const settings = apiSettings.getSettings();

    // Add Google API connection status
    const googleStatus = googleAdsService ? googleAdsService.getAPIStatus() : null;

    res.json({
      success: true,
      data: {
        ...settings,
        googleAdsStatus: googleStatus
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to get API settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API settings',
      message: error.message
    });
  }
});

/**
 * POST /api/settings/google-ads/toggle
 * Toggle Google Ads API On/Off
 */
router.post('/google-ads/toggle', auth, async (req, res) => {
  try {
    const { enabled } = req.body;
    const apiSettings = getApiSettingsService();

    // Toggle the setting
    const newStatus = apiSettings.toggleGoogleAds(enabled);

    // Update Google Ads Service
    if (googleAdsService) {
      if (newStatus) {
        googleAdsService.enableGoogleAPI();
        console.log('🔗 Google Ads API enabled');
      } else {
        googleAdsService.disableGoogleAPI();
        console.log('🔌 Google Ads API disabled');
      }
    }

    res.json({
      success: true,
      message: `Google Ads API ${newStatus ? 'enabled' : 'disabled'}`,
      data: {
        googleAdsEnabled: newStatus,
        status: googleAdsService ? googleAdsService.getAPIStatus() : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to toggle Google Ads API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle Google Ads API',
      message: error.message
    });
  }
});

/**
 * GET /api/settings/google-ads/status
 * Get Google Ads API status
 */
router.get('/google-ads/status', auth, (req, res) => {
  try {
    const apiSettings = getApiSettingsService();
    const googleStatus = googleAdsService ? googleAdsService.getAPIStatus() : null;

    res.json({
      success: true,
      data: {
        enabled: apiSettings.isGoogleAdsEnabled(),
        mockMode: apiSettings.shouldUseMockData(),
        connectionStatus: googleStatus,
        lastCheck: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to get Google Ads status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Google Ads status',
      message: error.message
    });
  }
});

/**
 * POST /api/settings/google-ads/test-connection
 * Test Google Ads API connection
 */
router.post('/google-ads/test-connection', auth, async (req, res) => {
  try {
    if (!googleAdsService) {
      return res.status(503).json({
        success: false,
        error: 'Google Ads Service not available'
      });
    }

    const apiSettings = getApiSettingsService();

    if (!apiSettings.isGoogleAdsEnabled()) {
      return res.json({
        success: false,
        message: 'Google Ads API is disabled',
        data: {
          enabled: false,
          mockMode: true
        }
      });
    }

    // Test connection by fetching performance data
    try {
      const performanceData = await googleAdsService.getRealTimePerformance();
      const campaignCount = Object.keys(performanceData).length;

      res.json({
        success: true,
        message: 'Google Ads API connection successful',
        data: {
          enabled: true,
          connected: true,
          campaignsFound: campaignCount,
          testTimestamp: new Date().toISOString()
        }
      });

    } catch (apiError) {
      res.status(500).json({
        success: false,
        message: 'Google Ads API connection failed',
        error: apiError.message,
        data: {
          enabled: true,
          connected: false
        }
      });
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      message: error.message
    });
  }
});

/**
 * POST /api/settings/mock-mode
 * Enable/Disable Mock Mode
 */
router.post('/mock-mode', auth, (req, res) => {
  try {
    const { enabled } = req.body;
    const apiSettings = getApiSettingsService();

    apiSettings.setSetting('mockMode', enabled);

    res.json({
      success: true,
      message: `Mock mode ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        mockMode: enabled,
        settings: apiSettings.getSettings()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to toggle mock mode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle mock mode',
      message: error.message
    });
  }
});

export default router;