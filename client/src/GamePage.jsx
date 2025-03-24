import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ArrowLeftIcon,BookOpenIcon } from "@heroicons/react/24/outline";

// Composants
import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import GameControls from "./components/GameControls";
import UserStats from "./components/UserStats";
import ScoreAnimation from "./components/ScoreAnimation";
import HintBox from "./components/Hintbox";
import DictionaryPage from "./components/DictionaryPage";

// Hooks
import { useGameLogic } from "./hooks/useGameLogic";

function GamePage({ wordLength = 5, maxAttempts = 7, onBack }) {
  const { currentUser } = useAuth();
  const [hintsUsed, setHintsUsed] = useState(0);

  // État des statistiques utilisateur
  const [userStats, setUserStats] = useState({
    displayName: currentUser?.displayName || "Invité",
    gamesPlayed: 0,
    gamesWon: 0,
    score: 0,
    isGuest: !currentUser,
  });

  // État pour l'animation du score
  const [scoreAnimation, setScoreAnimation] = useState({
    visible: false,
    score: 0,
  });

  // Nouvel état pour gérer l'affichage du dictionnaire
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState("");

  const handleViewDictionary = (word) => {
    setDictionaryWord(word);
    setShowDictionary(true);
  };

  // Fonction pour revenir du dictionnaire au jeu
  const handleReturnFromDictionary = () => {
    setShowDictionary(false);
  };

  // Si on affiche le dictionnaire


  // Définir handleStatsUpdated AVANT de l'utiliser dans useGameLogic
  const handleStatsUpdated = (statsUpdate) => {
    if (currentUser) {
      setUserStats((prev) => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + statsUpdate.gamesPlayed,
        gamesWon: prev.gamesWon + statsUpdate.gamesWon,
        score: prev.score + statsUpdate.score,
      }));

      // Afficher l'animation de score uniquement si des points ont été gagnés
      if (statsUpdate.score > 0) {
        setScoreAnimation({
          visible: true,
          score: statsUpdate.score,
        });
      }
    }
  };

  // Utiliser le hook pour la logique du jeu
  const {
    attempts,
    currentAttempt,
    attemptResults,
    keyboardStatus,
    targetWord,
    handleInput,
    resetGame,
    gameOver,
    gameWon,
    errorMessage,
  } = useGameLogic(
    wordLength,
    maxAttempts,
    currentUser,
    handleStatsUpdated,
    hintsUsed
  );

  // Gestionnaire pour masquer l'animation une fois terminée
  const handleAnimationComplete = () => {
    setScoreAnimation({
      visible: false,
      score: 0,
    });
  };

  // Récupérer les stats depuis Firebase
  useEffect(() => {
    const fetchUserStats = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserStats({
              displayName:
                currentUser.displayName || userData.displayName || "Invité",
              gamesPlayed: userData.gamesPlayed || 0,
              gamesWon: userData.gamesWon || 0,
              score: userData.score || 0,
              isGuest: false,
            });
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des statistiques:",
            error
          );
        }
      } else {
        setUserStats({
          displayName: "Invité",
          gamesPlayed: 0,
          gamesWon: 0,
          score: 0,
          isGuest: true,
        });
      }
    };

    fetchUserStats();
  }, [currentUser]);

  const handleRestartGame = () => {
    if (typeof resetGame === "function") {
      resetGame();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Fonction pour retourner à l'accueil avec animation
  const handleReturnHome = () => {
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
      gameContainer.classList.add("fade-out");
      setTimeout(() => {
        onBack();
      }, 300);
    } else {
      onBack();
    }
  };

  if (showDictionary) {
    return (
      <DictionaryPage
        onBack={handleReturnFromDictionary}
        initialSearchTerm={dictionaryWord}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center pt-10 pb-20">
      {/* Bouton retour en haut à gauche */}
      <div className="absolute top-4 left-4">
        <button
          onClick={handleReturnHome}
          className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1 text-gray-600" />
          <span>Retour</span>
        </button>
      </div>

      {/* Profil utilisateur en haut à droite */}
      <UserStats userStats={userStats} />

      {/* Animation de score */}
      {scoreAnimation.visible && (
        <div
          className="fixed right-2 top-5 z-50"
          style={{ width: "180px", maxWidth: "180px" }}
        >
          <ScoreAnimation
            score={scoreAnimation.score}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* Message d'erreur flottant */}
      {errorMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {errorMessage}
        </div>
      )}

      {/* Utilisation d'indice */}
      <HintBox
        key={targetWord || "loading"} // Forcer la recréation quand le mot change
        targetWord={targetWord}
        onHintUsed={(hintCount) => {
          setHintsUsed(hintCount);
        }}
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-8 animate-fadeIn">
        WORDLE ({wordLength} lettres)
      </h1>

      {/* Grille de jeu */}
      <div className="game-container transition-opacity duration-300 flex flex-col items-center w-full">
        <div className="flex justify-center w-full">
          <GameBoard
            attempts={attempts}
            currentAttempt={currentAttempt}
            attemptResults={attemptResults}
            wordLength={wordLength}
            gameWon={gameWon} // Cette prop est manquante ou undefined
          />
        </div>

        {/* Zone de message entre la grille et le clavier */}
        <div className="my-4 w-full flex justify-center">
          <GameControls
            currentAttempt={currentAttempt}
            wordLength={wordLength}
            attemptResults={attemptResults}
            targetWord={targetWord}
            maxAttempts={maxAttempts}
            gameWon={gameWon}
            gameOver={gameOver}
            onRestart={handleRestartGame}
            onHome={handleReturnHome}
            onDictionary={handleViewDictionary}
          />
        </div>

        {/* Clavier virtuel */}
        <div className="flex justify-center w-full">
          <Keyboard handleInput={handleInput} keyboardStatus={keyboardStatus} />
        </div>
      </div>

      {/* Instructions en bas */}
      <div className="mt-4 text-center text-gray-600 max-w-md">
        <p>
          Utilisez votre clavier ou cliquez sur les touches ci-dessus pour
          deviner le mot.
        </p>
        <p className="mt-2">
          <strong>ENTER</strong> pour soumettre, <strong>←</strong> pour
          effacer.
        </p>
      </div>
    </div>
  );
}

export default GamePage;
