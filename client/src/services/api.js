// Service pour gérer toutes les requêtes API
import { removeAccents } from "../utils/stringUtils";

const API_PORT = import.meta.env.PORT|| 10000;
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://wordle-app-gym5.onrender.com/api'
  : `http://localhost:${API_PORT}/api`;

// Service pour le dictionnaire
export const dictionaryService = {
  getDefinitionByNormalized: async (normalizedWord) => {
    try {
      const response = await fetch(`${API_URL}/definition/${normalizedWord}`);
      
      if (!response.ok) {
        throw new Error(`Aucune définition trouvée pour "${normalizedWord}"`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  getDefinition: async (word) => {
    try {
      const response = await fetch(`${API_URL}/definition/${word}`);
      
      if (!response.ok) {
        throw new Error(`Aucune définition trouvée pour "${word}"`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la définition:', error);
      throw error;
    }
  }
};

// Service pour le jeu Wordle
export const wordleService = {
  getRandomWord: async (length) => {
    try {
      const response = await fetch(`${API_URL}/words/random/${length}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération d\'un mot');
      }
      
      const data = await response.json();
      return data.word;
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  },
  
  isValidWord: async (word) => {
    try {
      const response = await fetch(`${API_URL}/words/validate/${word}`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Erreur lors de la validation du mot:', error);
      return false;
    }
  }
};