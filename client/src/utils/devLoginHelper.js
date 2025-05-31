// client/src/utils/devLoginHelper.js

// Einfache Hilfsfunktion für den schnellen Dev-Login
export const performDevLogin = async (api = null, navigate, setLoading) => {
  try {
    if (setLoading) setLoading(true);
    
    console.log('🔑 Schneller Dev-Login wird ausgeführt...');
    
    // Erstellen eines dev-tokens
    const devToken = 'dev-token-' + Date.now();
    
    // Token im lokalen Speicher speichern
    localStorage.setItem('prometheus_auth_token', devToken);
    
    // Standardbenutzerinformationen setzen
    const devUser = {
      _id: '507f1f77bcf86cd799439011', // Gültige ObjectId vom Server
      name: 'Entwicklerbenutzer',
      email: 'dev@prometheus.com',
      plan: 'ENTERPRISE',
      status: 'ACTIVE'
    };
    
    // Benutzerinformationen im lokalen Speicher speichern
    localStorage.setItem('prometheus_user', JSON.stringify(devUser));
    
    console.log('✅ Dev-Login erfolgreich! Token:', devToken);
    
    // Zur Dashboard-Seite navigieren, falls navigate bereitgestellt wurde
    if (navigate) {
      navigate('/dashboard');
    }
    
    // Seite neu laden, um die Authentifizierung anzuwenden
    window.location.reload();
    
    return {
      success: true,
      token: devToken,
      user: devUser
    };
  } catch (error) {
    console.error('❌ Dev-Login fehlgeschlagen:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (setLoading) setLoading(false);
  }
};

// Prüfen, ob wir im Entwicklungsmodus sind
export const isDevelopmentMode = () => {
  return import.meta.env.DEV || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};