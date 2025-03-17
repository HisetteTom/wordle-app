// server.js
const express = require('express');
const cors = require('cors');
const wd = require('word-definition');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement seulement en développement
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Routes
const dictionaryRoutes = require('./routes/dictionary');
const multiplayerRoutes = require('./routes/multiplayer');
const wordsRoutes = require('./routes/words');

// Information de démarrage
console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
console.log(`Répertoire courant: ${process.cwd()}`);

const app = express();

// Middleware
app.use(cors({
  origin: ['https://wordle-game-822bb.web.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Dictionnaire local de secours pour les mots courants
const FALLBACK_DICTIONARY = {
  "maison": {
    word: "maison",
    category: "nom féminin",
    definition: "Bâtiment destiné à l'habitation. Ensemble des personnes qui vivent ensemble dans un même foyer."
  },
  "livre": {
    word: "livre",
    category: "nom masculin",
    definition: "Assemblage de feuilles imprimées et réunies en un volume, broché ou relié. Ouvrage littéraire ou scientifique."
  },
  "jouer": {
    word: "jouer",
    category: "verbe",
    definition: "Se livrer à un jeu. Pratiquer un jeu de société, un sport. Interpréter une œuvre musicale."
  },
  "chat": {
    word: "chat",
    category: "nom masculin",
    definition: "Mammifère carnivore de la famille des félidés, domestiqué comme animal de compagnie."
  },
  "chien": {
    word: "chien",
    category: "nom masculin",
    definition: "Mammifère carnivore domestique, de la famille des canidés, utilisé pour la garde, la chasse ou comme animal de compagnie."
  }
  // Plus de mots peuvent être ajoutés ici
};

// Route pour chercher une définition
app.get('/api/definition/:word', (req, res) => {
  const word = req.params.word.toLowerCase();
  
  // Vérifier dans le dictionnaire local d'abord (pour les mots courants)
  if (FALLBACK_DICTIONARY[word]) {
    console.log(`Définition trouvée localement pour: ${word}`);
    return res.json(FALLBACK_DICTIONARY[word]);
  }
  
  // Sinon chercher avec word-definition
  wd.getDef(word, "fr", null, (result) => {
    if (result.err) {
      console.log(`Aucune définition trouvée pour: ${word}`);
      return res.status(404).json({ 
        error: `Aucune définition trouvée pour "${word}"` 
      });
    }
    
    console.log(`Définition trouvée pour: ${word}`);
    res.json({
      word: result.word,
      category: result.category,
      definition: result.definition
    });
  });
});

// Route pour lister les mots disponibles dans le dictionnaire local
app.get('/api/available-words', (req, res) => {
  res.json(Object.keys(FALLBACK_DICTIONARY));
});

// Utiliser les routes
app.use('/api', dictionaryRoutes);
app.use('/api/multiplayer', multiplayerRoutes);
app.use('/api/words', wordsRoutes);

// Route pour la santé du serveur
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Serveur dictionnaire en ligne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route principale
app.get('/', (req, res) => {
  res.send('Serveur dictionnaire et multijoueur pour Wordle en fonctionnement!');
});

// Solution directe pour le problème de port
function getValidPort() {
  // Afficher toutes les variables d'environnement pour le débogage
  console.log('Variables d\'environnement:');
  console.log('PORT:', process.env.PORT);
  
  try {
    // Cas 1: Si PORT est défini et est un nombre valide
    if (process.env.PORT) {
      console.log(`process.env.PORT est défini: "${process.env.PORT}" (type: ${typeof process.env.PORT})`);
      
      // Supprimer tout caractère non numérique au début
      const cleanedPort = process.env.PORT.toString().replace(/^[^0-9]+/, '');
      console.log(`PORT nettoyé: "${cleanedPort}"`);
      
      const portNum = parseInt(cleanedPort, 10);
      console.log(`PORT parsé: ${portNum} (type: ${typeof portNum})`);
      
      if (!isNaN(portNum) && portNum > 0 && portNum < 65536) {
        console.log(`Utilisation du port fourni: ${portNum}`);
        return portNum;
      } else {
        console.log(`Port invalide après parsing: ${portNum}`);
      }
    } else {
      console.log('La variable PORT n\'est pas définie');
    }
    
    // Cas 2: Port par défaut pour Render
    console.log('Utilisation du port par défaut: 10000');
    return 10000;
  } catch (error) {
    console.error('Erreur lors de la récupération du port:', error);
    console.log('Utilisation du port de secours: 3001');
    return 3001; // Port par défaut en cas d'erreur
  }
}

// Résoudre le port de manière robuste
const PORT_TO_USE = getValidPort();
console.log(`Port final à utiliser: ${PORT_TO_USE} (type: ${typeof PORT_TO_USE})`);

// Écouter sur le port avec gestion des erreurs
try {
  // Utiliser 0.0.0.0 pour écouter sur toutes les interfaces
  const server = app.listen(PORT_TO_USE, '0.0.0.0', () => {
    console.log(`Serveur démarré avec succès sur le port ${PORT_TO_USE}`);
    console.log(`URL de base: http://localhost:${PORT_TO_USE}`);
  });
  
  // Gestion des erreurs au niveau du serveur
  server.on('error', (err) => {
    console.error(`Erreur du serveur: ${err.message}`);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`Le port ${PORT_TO_USE} est déjà utilisé. Tentative avec un autre port...`);
      
      // Tentative avec un port différent
      const ALTERNATIVE_PORT = 8080;
      app.listen(ALTERNATIVE_PORT, '0.0.0.0', () => {
        console.log(`Serveur démarré sur le port alternatif ${ALTERNATIVE_PORT}`);
      });
    }
  });
} catch (error) {
  console.error(`Erreur critique lors du démarrage du serveur: ${error.message}`);
  console.error(`Détails de l'erreur:`, error);
  
  // Tentative de secours sur un port différent
  const BACKUP_PORT = 8080;
  console.log(`Tentative sur le port de secours: ${BACKUP_PORT}`);
  
  try {
    app.listen(BACKUP_PORT, '0.0.0.0', () => {
      console.log(`Serveur démarré sur le port de secours ${BACKUP_PORT}`);
    });
  } catch (backupError) {
    console.error(`Échec également sur le port de secours: ${backupError.message}`);
    console.error('Impossible de démarrer le serveur. Vérifiez la configuration du port.');
    process.exit(1);  // Quitter avec code d'erreur
  }
}