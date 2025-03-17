// src/services/api.js
const API_URL = 'http://localhost:3001/api';

export const dictionaryService = {
  // Chercher la définition d'un mot
  async getDefinition(word) {
    try {
      const response = await fetch(`${API_URL}/definition/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Aucune définition trouvée pour "${word}"`);
        }
        throw new Error('Erreur de serveur');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  },
  
  // Obtenir la liste des mots disponibles
  async getAvailableWords() {
    try {
      const response = await fetch(`${API_URL}/available-words`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des mots disponibles');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return [];
    }
  }
};