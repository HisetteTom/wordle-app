// routes/dictionary.js
const express = require('express');
const router = express.Router();
const wd = require('word-definition');

// Dictionnaire local de secours
const FALLBACK_DICTIONARY = {
  // Le même dictionnaire que précédemment
  // ...
};

// Route pour chercher une définition
router.get('/definition/:word', (req, res) => {
  const word = req.params.word.toLowerCase();
  
  // Vérifier dans le dictionnaire local d'abord
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

// Route pour lister les mots disponibles
router.get('/available-words', (req, res) => {
  res.json(Object.keys(FALLBACK_DICTIONARY));
});

module.exports = router;