// server/services/wordService.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cache pour stocker les mots par longueur
let wordsByLength = {};
let isLoaded = {};

/**
 * Charge le dictionnaire d'une longueur spécifique en mémoire
 * @param {number} length - Longueur des mots à charger
 */
const loadDictionaryByLength = async (length) => {
  // Vérifier si cette longueur est déjà chargée
  if (isLoaded[length]) return;
  
  const dictionaryPath = path.join(__dirname, `../data/words_${length}.dic`);
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(dictionaryPath)) {
    console.warn(`Dictionnaire pour les mots de ${length} lettres non trouvé: ${dictionaryPath}`);
    wordsByLength[length] = [];
    isLoaded[length] = true;
    return;
  }
  
  console.log(`Chargement du dictionnaire pour les mots de ${length} lettres...`);
  
  // Initialiser la liste pour cette longueur
  wordsByLength[length] = [];
  
  // Créer une interface de lecture de fichier
  const fileStream = fs.createReadStream(dictionaryPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Lire le fichier ligne par ligne
  for await (const line of rl) {
    // Nettoyer le mot (enlever les accents, mettre en majuscules)
    const word = line.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Ignorer les lignes vides ou les commentaires
    if (!word || word.startsWith('//')) continue;
    
    // Vérifier que le mot a la bonne longueur et ne contient que des lettres
    if (word.length === length && /^[A-Z]+$/.test(word)) {
      wordsByLength[length].push(word);
    }
  }
  
  isLoaded[length] = true;
  console.log(`Dictionnaire pour les mots de ${length} lettres chargé: ${wordsByLength[length].length} mots`);
};

/**
 * Découvre les longueurs de mots disponibles
 */
const discoverAvailableLengths = () => {
  const lengths = [];
  const dataDir = path.join(__dirname, '../data');
  
  // Lire le contenu du répertoire data
  const files = fs.readdirSync(dataDir);
  
  // Rechercher les fichiers qui correspondent au modèle words_X.dic
  files.forEach(file => {
    const match = file.match(/^words_(\d+)\.dic$/);
    if (match) {
      lengths.push(parseInt(match[1]));
    }
  });
  
  return lengths.sort((a, b) => a - b);
};

/**
 * Obtient un mot aléatoire d'une longueur spécifique
 * @param {number} length - Longueur du mot souhaitée
 * @returns {string} Un mot aléatoire
 */
const getRandomWord = async (length) => {
  // S'assurer que le dictionnaire est chargé pour cette longueur
  if (!isLoaded[length]) {
    await loadDictionaryByLength(length);
  }
  
  // Valider la longueur demandée
  if (!wordsByLength[length] || wordsByLength[length].length === 0) {
    throw new Error(`Aucun mot de ${length} lettres disponible dans le dictionnaire`);
  }
  
  // Choisir un mot aléatoire
  const randomIndex = Math.floor(Math.random() * wordsByLength[length].length);
  return wordsByLength[length][randomIndex];
};

/**
 * Vérifie si un mot existe dans le dictionnaire
 * @param {string} word - Le mot à vérifier
 * @returns {boolean} Vrai si le mot existe
 */
const isValidWord = async (word) => {
  const normalizedWord = word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const length = normalizedWord.length;
  
  // S'assurer que le dictionnaire est chargé pour cette longueur
  if (!isLoaded[length]) {
    await loadDictionaryByLength(length);
  }
  
  return wordsByLength[length] && wordsByLength[length].includes(normalizedWord);
};

/**
 * Obtient la liste des longueurs de mots disponibles
 * @returns {number[]} Liste des longueurs disponibles
 */
const getAvailableLengths = () => {
  return discoverAvailableLengths();
};

// Précharger les longueurs disponibles au démarrage
const availableLengths = discoverAvailableLengths();
console.log('Longueurs de mots disponibles:', availableLengths);

module.exports = {
  getRandomWord,
  isValidWord,
  getAvailableLengths
};