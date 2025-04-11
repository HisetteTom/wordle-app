import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import GameControls from "./components/GameControls";
import UserStats from "./components/UserStats";
import ScoreAnimation from "./components/ScoreAnimation";
import HintBox from "./components/Hintbox";
import DictionaryPage from "./components/DictionaryPage";
import WordNetworkBackground from "./components/WordNetworkBackground";
import Header from "./components/Header";

import { useGameLogic } from "./hooks/useGameLogic";

function GamePage({
  wordLength = 5,
  maxAttempts = 7,
  onBack,
  onOpenDictionary: parentOnOpenDictionary,
}) {
  // États utilisateur et statistiques
  const { currentUser } = useAuth();
  const [hintsUsed, setHintsUsed] = useState(0);
  const [userStats, setUserStats] = useState({
    displayName: currentUser?.displayName || "Invité",
    gamesPlayed: 0,
    gamesWon: 0,
    score: 0,
    isGuest: !currentUser,
  });
  const [scoreAnimation, setScoreAnimation] = useState({
    visible: false,
    score: 0,
  });

  // États pour le dictionnaire
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState("");

  // Gestion du dictionnaire
  const handleViewDictionary = (word) => {
    setDictionaryWord(word);
    setShowDictionary(true);
  };

  const handleReturnFromDictionary = () => setShowDictionary(false);

  // Mise à jour des statistiques après une partie
  const handleStatsUpdated = (statsUpdate) => {
    if (currentUser) {
      setUserStats((prev) => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + statsUpdate.gamesPlayed,
        gamesWon: prev.gamesWon + statsUpdate.gamesWon,
        score: prev.score + statsUpdate.score,
      }));

      if (statsUpdate.score > 0) {
        setScoreAnimation({ visible: true, score: statsUpdate.score });
      }
    }
  };

  // Récupération de la logique de jeu depuis un hook personnalisé
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

  const handleAnimationComplete = () => {
    setScoreAnimation({ visible: false, score: 0 });
  };

  // Récupération des statistiques utilisateur depuis Firestore
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) {
        setUserStats({
          displayName: "Invité",
          gamesPlayed: 0,
          gamesWon: 0,
          score: 0,
          isGuest: true,
        });
        return;
      }

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
    };

    fetchUserStats();
  }, [currentUser]);

  // Fonctions de navigation
  const handleRestartGame = () => {
    if (resetGame) {
      resetGame();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReturnHome = () => {
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer?.classList) {
      gameContainer.classList.add("fade-out");
      setTimeout(onBack, 300);
    } else {
      onBack();
    }
  };

  const { isAuthenticated } = useAuth();

  // Affichage du dictionnaire si demandé
  if (showDictionary) {
    return (
      <DictionaryPage
        onBack={handleReturnFromDictionary}
        initialSearchTerm={dictionaryWord}
      />
    );
  }

  // Rendu principal de la page de jeu
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 relative overflow-hidden">
      <WordNetworkBackground gamePage={true} />

      <Header
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onNavigateHome={handleReturnHome}
        onNavigateToDictionary={() =>
          parentOnOpenDictionary && parentOnOpenDictionary()
        }
      />

      <div className="h-16"></div>

      {/* Notification de score */}
      {scoreAnimation.visible && (
        <div
          className="fixed right-2 top-20 z-50"
          style={{ width: "180px", maxWidth: "180px" }}
        >
          <ScoreAnimation
            score={scoreAnimation.score}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {errorMessage}
        </div>
      )}

      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 z-10">
        <div className="flex-1">
          <div className="w-full backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100/40 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text text-center mb-6">
              WORDLE ({wordLength} lettres)
            </h1>

            <div className="game-container transition-opacity duration-300 flex flex-col items-center w-full">
              {/* Grille de jeu */}
              <div className="flex justify-center w-full mb-6">
                <GameBoard
                  attempts={attempts}
                  currentAttempt={currentAttempt}
                  attemptResults={attemptResults}
                  wordLength={wordLength}
                  gameWon={gameWon}
                />
              </div>

              {/* Contrôles de jeu (fin de partie, nouveau jeu) */}
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
                <Keyboard
                  handleInput={handleInput}
                  keyboardStatus={keyboardStatus}
                />
              </div>
            </div>

            <div className="mt-6 text-center text-gray-600 max-w-md mx-auto border-t border-gray-100 pt-4">
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
        </div>

        {/* Boîte d'indices*/}
        <div className="fixed left-4 top-1/3 z-40 hidden xl:block">
          <HintBox
            key={`fixed-${targetWord || "loading"}`}
            targetWord={targetWord}
            onHintUsed={setHintsUsed}
            position="fixed-left"
          />
        </div>
      </div>
    </div>
  );
}

export default GamePage;
