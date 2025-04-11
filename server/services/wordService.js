const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Cache pour stocker les mots par longueur
let wordsByLength = {};
let isLoaded = {};

const loadDictionaryByLength = async (length) => {
  if (isLoaded[length]) return;

  const dictionaryPath = path.join(__dirname, `../data/words_${length}.dic`);

  if (!fs.existsSync(dictionaryPath)) {
    console.warn(
      `Dictionnaire pour les mots de ${length} lettres non trouvé: ${dictionaryPath}`
    );
    wordsByLength[length] = [];
    isLoaded[length] = true;
    return;
  }

  console.log(
    `Chargement du dictionnaire pour les mots de ${length} lettres...`
  );

  wordsByLength[length] = [];

  const fileStream = fs.createReadStream(dictionaryPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // Nettoyer le mot (enlever les accents, mettre en majuscules)
    const word = line
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Enlever les accents

    if (!word || word.startsWith("//")) continue;

    if (word.length === length && /^[A-Z]+$/.test(word)) {
      wordsByLength[length].push(word);
    }
  }

  isLoaded[length] = true;
  console.log(
    `Dictionnaire pour les mots de ${length} lettres chargé: ${wordsByLength[length].length} mots`
  );
};

const discoverAvailableLengths = () => {
  const lengths = [];
  const dataDir = path.join(__dirname, "../data");

  const files = fs.readdirSync(dataDir);

  // Rechercher les fichiers qui correspondent au modèle words_X.dic
  files.forEach((file) => {
    const match = file.match(/^words_(\d+)\.dic$/);
    if (match) {
      lengths.push(parseInt(match[1]));
    }
  });

  return lengths.sort((a, b) => a - b);
};

const getRandomWord = async (length) => {
  if (!isLoaded[length]) {
    await loadDictionaryByLength(length);
  }

  if (!wordsByLength[length] || wordsByLength[length].length === 0) {
    throw new Error(
      `Aucun mot de ${length} lettres disponible dans le dictionnaire`
    );
  }

  const randomIndex = Math.floor(Math.random() * wordsByLength[length].length);
  return wordsByLength[length][randomIndex];
};

const isValidWord = async (word) => {
  const normalizedWord = word
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const length = normalizedWord.length;

  if (!isLoaded[length]) {
    await loadDictionaryByLength(length);
  }

  return (
    wordsByLength[length] && wordsByLength[length].includes(normalizedWord)
  );
};

const getAvailableLengths = () => {
  return discoverAvailableLengths();
};

// Map pour stocker les mots accentués
const accentMap = new Map();

// Fonction pour construire la map d'accents
const buildAccentMap = async () => {
  if (accentMap.size > 0) return;

  console.log("Construction de la map d'accents...");
  const lengths = discoverAvailableLengths();

  for (const length of lengths) {
    const dictionaryPath = path.join(__dirname, `../data/words_${length}.dic`);

    if (!fs.existsSync(dictionaryPath)) continue; // Ignore si le fichier n'existe pas

    const fileContent = await fs.promises.readFile(dictionaryPath, "utf8");
    const words = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"));

    for (const word of words) {
      // Version normalisée (sans accent) en minuscules
      const normalized = word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      // Stocker la correspondance (mot sans accent -> mot avec accent)
      accentMap.set(normalized, word.toLowerCase());
    }
  }

  console.log(
    `Map d'accents construite avec ${accentMap.size} correspondances`
  );
};

async function findAccentedWord(word) {
  await buildAccentMap();

  const normalizedInput = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const accentedVersion = accentMap.get(normalizedInput);

  return accentedVersion || null;
}

// Précharger les longueurs disponibles au démarrage
const availableLengths = discoverAvailableLengths();
console.log("Longueurs de mots disponibles:", availableLengths);

module.exports = {
  getRandomWord,
  isValidWord,
  getAvailableLengths,
  findAccentedWord,
};
