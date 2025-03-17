// server.js
const express = require('express');
const cors = require('cors');
const wd = require('word-definition');
const dotenv = require('dotenv');
const wordsRoutes = require('./routes/words');

// Routes
const dictionaryRoutes = require('./routes/dictionary');
const multiplayerRoutes = require('./routes/multiplayer');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
  res.json({ status: 'Serveur dictionnaire en ligne' });
});

// Route principale
app.get('/', (req, res) => {
  res.send('Serveur dictionnaire et multijoueur pour Wordle en fonctionnement!');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});