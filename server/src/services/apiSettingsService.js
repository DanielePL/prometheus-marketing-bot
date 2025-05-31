// /prometheus-marketing-engine/server/src/services/apiSettingsService.js
// API Settings Service - Toggle Google API On/Off + Mock Mode

class ApiSettingsService {
  constructor() {
    this.settings = {
      googleAdsEnabled: false, // Start disabled
      metaAdsEnabled: false,
      tiktokAdsEnabled: false,
      linkedinAdsEnabled: false,
      mockMode: true, // Mock mode when APIs disabled
    };

    console.log('🔧 API Settings Service initialized');
    console.log('⚠️ Google Ads API: DISABLED (Mock Mode: ON)');
  }

  // Toggle Google API On/Off
  toggleGoogleAds(enabled = null) {
    if (enabled !== null) {
      this.settings.googleAdsEnabled = enabled;
    } else {
      this.settings.googleAdsEnabled = !this.settings.googleAdsEnabled;
    }

    console.log(`🔄 Google Ads API: ${this.settings.googleAdsEnabled ? 'ENABLED' : 'DISABLED'}`);
    return this.settings.googleAdsEnabled;
  }

  // Get current settings
  getSettings() {
    return {
      ...this.settings,
      timestamp: new Date().toISOString()
    };
  }

  // Set specific setting
  setSetting(key, value) {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value;
      console.log(`🔧 Setting updated: ${key} = ${value}`);
      return true;
    }
    return false;
  }

  // Check if Google Ads is enabled
  isGoogleAdsEnabled() {
    return this.settings.googleAdsEnabled;
  }

  // Check if we should use mock data
  shouldUseMockData() {
    return this.settings.mockMode || !this.settings.googleAdsEnabled;
  }
}

// Singleton
let apiSettingsService = null;

export function getApiSettingsService() {
  if (!apiSettingsService) {
    apiSettingsService = new ApiSettingsService();
  }
  return apiSettingsService;
}

export { ApiSettingsService };