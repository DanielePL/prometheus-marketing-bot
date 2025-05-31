// client/src/utils/aiTestUtil.js

/**
 * Testet die OpenAI API-Verbindung mit verschiedenen Testmodi
 * @param {string} testMode - 'simple', 'json', 'public' oder 'debug'
 * @param {string} message - Testnachricht
 * @returns {Promise<Object>} Ergebnis des Tests
 */
export const testAIConnection = async (testMode = 'simple', message = "Test Nachricht") => {
  try {
    const endpoints = {
      simple: '/api/ai-consultant/test-connection',
      json: '/api/ai-consultant/test-json-format',
      public: '/api/ai-consultant/public-test',
      debug: '/api/ai-consultant/debug'
    };
    
    const endpoint = endpoints[testMode] || endpoints.simple;
    
    // Lokalen Storage für Token prüfen
    const token = localStorage.getItem('userToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(testMode !== 'public' && token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    console.log(`🧪 Starte AI Test (${testMode}) an ${endpoint}`);
    console.log('Mit Nachricht:', message);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        message,
        debugMode: testMode === 'debug' ? 'standard' : undefined
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server-Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ AI Test (${testMode}) erfolgreich:`, data);
    
    return {
      success: true,
      testMode,
      data
    };
  } catch (error) {
    console.error(`❌ AI Test (${testMode}) fehlgeschlagen:`, error);
    return {
      success: false,
      testMode,
      error: error.message
    };
  }
};