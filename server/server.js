const express = require("express");
const cors = require("cors");
const wd = require("word-definition");
const dotenv = require("dotenv");

// Charger les variables d'environnement en développement uniquement
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Import des routes
const dictionaryRoutes = require("./routes/dictionary");
const wordsRoutes = require("./routes/words");

const app = express();

// Configuration CORS pour la sécurité
app.use(
  cors({
    origin: ["https://wordle-game-822bb.web.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Route pour chercher une définition via API externe
app.get("/api/definition/:word", (req, res) => {
  const word = req.params.word.toLowerCase();

  wd.getDef(word, "fr", null, (result) => {
    if (result.err) {
      return res.status(404).json({
        error: `Aucune définition trouvée pour "${word}"`,
      });
    }

    res.json({
      word: result.word,
      category: result.category,
      definition: result.definition,
    });
  });
});

// Utilisation des routeurs
app.use("/api", dictionaryRoutes);
app.use("/api/words", wordsRoutes);

// Route pour vérifier l'état du serveur
app.get("/api/health", (req, res) => {
  res.json({
    status: "Serveur dictionnaire en ligne",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Route principale
app.get("/", (req, res) => {
  res.send(
    "Serveur dictionnaire et multijoueur pour Wordle en fonctionnement!"
  );
});

// Configuration du port et démarrage
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
