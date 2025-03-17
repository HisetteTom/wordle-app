// routes/multiplayer.js
const express = require('express');
const router = express.Router();

// Cette route sera utilisée pour créer une nouvelle partie
router.post('/games', (req, res) => {
  // Logique à implémenter plus tard
  res.status(501).json({ message: 'Fonctionnalité pas encore implémentée' });
});

// Cette route sera utilisée pour rejoindre une partie existante
router.post('/games/:gameId/join', (req, res) => {
  // Logique à implémenter plus tard
  res.status(501).json({ message: 'Fonctionnalité pas encore implémentée' });
});

// Cette route sera utilisée pour mettre à jour l'état d'une partie
router.put('/games/:gameId', (req, res) => {
  // Logique à implémenter plus tard
  res.status(501).json({ message: 'Fonctionnalité pas encore implémentée' });
});

module.exports = router;