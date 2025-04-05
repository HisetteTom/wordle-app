const express = require('express');
const router = express.Router();
const wordService = require('../services/wordService');

// Route pour obtenir un mot aléatoire d'une longueur spécifique
router.get('/random/:length', async (req, res) => {
  try {
    const length = parseInt(req.params.length);
    
    // Valider la longueur
    if (isNaN(length) || length < 4 || length > 10) {
      return res.status(400).json({ 
        error: 'La longueur doit être un nombre entre 4 et 10'
      });
    }
    
    const word = await wordService.getRandomWord(length);
    res.json({ word });
  } catch (error) {
    console.error('Erreur lors de la génération d\'un mot aléatoire:', error);
    res.status(404).json({ error: error.message });
  }
});

// Route pour vérifier si un mot existe dans le dictionnaire
router.get('/validate/:word', async (req, res) => {
  try {
    const word = req.params.word;
    const isValid = await wordService.isValidWord(word);
    res.json({ word, isValid });
  } catch (error) {
    console.error('Erreur lors de la validation du mot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les longueurs de mots disponibles
router.get('/available-lengths', async (req, res) => {
  try {
    const lengths = wordService.getAvailableLengths();
    res.json({ lengths });
  } catch (error) {
    console.error('Erreur lors de la récupération des longueurs disponibles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour trouver un mot avec ses accents
router.get('/accentuate/:word', async (req, res) => {
  const word = req.params.word.toLowerCase();
  
  try {
    // Utiliser le service de mots pour trouver la version accentuée
    const accentedWord = await wordService.findAccentedWord(word);
    
    if (accentedWord) {
      return res.json({ word: accentedWord });
    }
    
    res.status(404).json({ error: 'Mot non trouvé' });
  } catch (error) {
    console.error('Erreur lors de la recherche du mot accentué:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;