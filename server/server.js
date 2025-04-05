const express = require('express');
const cors = require('cors');
const wd = require('word-definition');
const dotenv = require('dotenv');

// Charger les variables d'environnement seulement en développement
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Routes
const dictionaryRoutes = require('./routes/dictionary');
const multiplayerRoutes = require('./routes/multiplayer');
const wordsRoutes = require('./routes/words');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://wordle-game-822bb.web.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Route pour chercher une définition
app.get('/api/definition/:word', (req, res) => {
  const word = req.params.word.toLowerCase();
  
  wd.getDef(word, "fr", null, (result) => {
    if (result.err) {
      return res.status(404).json({ 
        error: `Aucune définition trouvée pour "${word}"` 
      });
    }
    
    res.json({
      word: result.word,
      category: result.category,
      definition: result.definition
    });
  });
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

// Port
const PORT = process.env.PORT || 3001;

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});