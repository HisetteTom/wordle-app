// Service pour gérer toutes les requêtes API

import { removeAccents } from "../utils/stringUtils";


// URL de base de l'API, avec détection automatique de l'environnement
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://wordle-app-gym5.onrender.com/api'
  : 'http://localhost:3001/api';

// Service pour le dictionnaire
export const dictionaryService = {
  // Obtenir la liste des mots disponibles
  getAvailableWords: async () => {
    try {
      const response = await fetch(`${API_URL}/available-words`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des mots disponibles:', error);
      // Retourner la liste des mots disponibles connue du serveur
      return ["maison", "livre", "jouer", "chat", "chien"];
    }
  },

  getDefinitionByNormalized: async (normalizedWord) => {
    try {
      // D'abord, récupérer la liste des mots disponibles
      const availableWords = await dictionaryService.getAvailableWords();
      
      // Chercher un mot qui correspond après normalisation
      const matchingWord = availableWords.find(word => 
        removeAccents(word.toLowerCase()) === normalizedWord.toLowerCase()
      );
      
      if (matchingWord) {
        // Si on trouve une correspondance, rechercher sa définition
        return await dictionaryService.getDefinition(matchingWord);
      } else {
        throw new Error(`Aucun mot correspondant à "${normalizedWord}" trouvé`);
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Obtenir la définition d'un mot
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
  // Obtenir un mot aléatoire d'une longueur spécifique
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
      
      // Fallback en cas d'erreur
      const fallbackWords = {
        4: ['CHAT', 'LUNE', 'BLEU', 'VOIX', 'VENT'],
        5: ['JOUER', 'PIANO', 'LIVRE', 'AVOIR', 'COEUR'],
        6: ['ORANGE', 'JARDIN', 'MARCHE', 'PLEINS', 'SALUER'],
        7: ['BONJOUR', 'TRAVAIL', 'MARIAGE', 'CUISINE', 'NOUVEAU'],
        8: ['CHATOYEZ', 'ABJECTES', 'ADJACENT', 'SOMMAIRE', 'GRACIEUX'],
        9: ['ACCOUDOIR', 'AIGUILLER', 'EPUISABLE', 'BOULEVARD', 'PARTICULE'],
        10: ['PERSONNAGE', 'BOULEVARD', 'GOUVERNER', 'ABRICOTIER', 'ASTRONAUTE']
      };
      
      const wordList = fallbackWords[length] || ['PIANO'];
      return wordList[Math.floor(Math.random() * wordList.length)];
    }
  },
  
  // Vérifier si un mot existe
  isValidWord: async (word) => {
    try {
      const API_URL = process.env.NODE_ENV === 'production'
        ? 'https://wordle-app-gym5.onrender.com/api'
        : 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/words/validate/${word}`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Erreur lors de la validation du mot:', error);
      
      // Fallback en cas d'erreur: accepter le mot
      // Vous pourriez ajouter une validation locale ici
      return true;
    }
  }
};