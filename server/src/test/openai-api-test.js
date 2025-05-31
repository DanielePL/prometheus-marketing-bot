// server/src/test/openai-api-test.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Überprüfen, ob der API-Schlüssel gesetzt ist
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ FEHLER: OPENAI_API_KEY ist nicht in der .env-Datei gesetzt');
  process.exit(1);
}

// OpenAI Client initialisieren
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Einfache Testfunktion
async function testOpenAIConnection() {
  console.log('🧪 Starte OpenAI API Test...');
  
  try {
    console.log('🔑 API-Schlüssel gefunden:', maskApiKey(process.env.OPENAI_API_KEY));
    
    // Einfache Chat-Completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Du bist Marcus, ein Senior Performance Marketing Consultant." },
        { role: "user", content: "Gib mir 3 Tipps zur Verbesserung meiner ROAS." }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('✅ API-Verbindung erfolgreich!');
    console.log('📝 Modell:', response.model);
    console.log('📝 Antwort:');
    console.log(response.choices[0].message.content);
    
    // JSON Format testen
    console.log('\n🧪 Teste JSON-Antwortformat...');
    
    const jsonResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Antworte nur mit einem JSON-Objekt, das diese Felder enthält: content, suggestions, actionItems" },
        { role: "user", content: "Gib mir Tipps zur Budget-Optimierung" }
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const jsonData = JSON.parse(jsonResponse.choices[0].message.content);
    console.log('✅ JSON-Antwort erfolgreich:');
    console.log(JSON.stringify(jsonData, null, 2));
    
    return {
      success: true,
      standardResponse: response.choices[0].message.content,
      jsonResponse: jsonData
    };
    
  } catch (error) {
    console.error('❌ OpenAI API Test fehlgeschlagen:', error);
    
    // Detaillierte Fehlerdiagnose
    if (error.response) {
      console.error('Statuscode:', error.response.status);
      console.error('Fehlerdaten:', error.response.data);
    } else if (error.message.includes('API key')) {
      console.error('API-Schlüssel Problem: Überprüfen Sie, ob der Schlüssel gültig ist und das richtige Format hat');
    } else if (error.message.includes('network')) {
      console.error('Netzwerkfehler: Überprüfen Sie Ihre Internetverbindung');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// API-Schlüssel aus Sicherheitsgründen maskieren
function maskApiKey(key) {
  if (!key) return 'undefined';
  return key.substring(0, 3) + '...' + key.substring(key.length - 4);
}

// Test ausführen
testOpenAIConnection()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 OpenAI API Test abgeschlossen. Alles funktioniert!');
    } else {
      console.log('\n⚠️ OpenAI API Test fehlgeschlagen. Siehe Fehler oben.');
    }
  })
  .catch(err => {
    console.error('💥 Unerwarteter Fehler:', err);
  });