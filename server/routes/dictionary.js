const express = require('express');
const router = express.Router();
const wd = require('word-definition');

// Route pour obtenir la définition d'un mot
router.get('/definition/:word', (req, res) => {
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

module.exports = router;