// client/src/utils/devAuthUtil.js

/**
 * Hilfsfunktionen für Development-Authentifizierung
 */

// Generiert ein Development-Token für Test-Zwecke
export const generateDevToken = () => {
  return `dev-token-${Date.now()}`;
};

// Setzt einen Dev-Token in den lokalen Speicher
export const setDevToken = () => {
  const token = generateDevToken();
  localStorage.setItem('userToken', token);
  return token;
};

// Prüft, ob die Anwendung im Dev-Modus läuft
export const isDevMode = () => {
  return process.env.NODE_ENV === 'development';
};

// Holt den aktuellen Token aus dem Speicher oder erzeugt einen Dev-Token
export const getTokenOrCreateDevToken = () => {
  const token = localStorage.getItem('userToken');
  if (token) return token;

  if (isDevMode()) {
    return setDevToken();
  }

  return null;
};

// Fügt den Authorization-Header zu einer Anfrage hinzu
export const addAuthHeader = (headers = {}) => {
  const token = getTokenOrCreateDevToken();

  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }

  return headers;
};