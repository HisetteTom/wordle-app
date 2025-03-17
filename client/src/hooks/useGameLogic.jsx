import { useState, useEffect } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { checkAttempt, updateKeyboardStatus, getRandomWord } from "../GameLogic";

export function useGameLogic(wordLength, maxAttempts, currentUser, onStatsUpdated, hintsUsed = 0) {
  // État du jeu
  const [attempts, setAttempts] = useState(
    Array(maxAttempts).fill("").map(() => Array(wordLength).fill(""))
  );
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [targetWord, setTargetWord] = useState("");
  const [attemptResults, setAttemptResults] = useState(
    Array(maxAttempts).fill(null).map(() => Array(wordLength).fill(null))
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  // Fonction pour mettre à jour les statistiques utilisateur
  const updateUserStats = async (isWin, attemptNumber) => {
    if (!currentUser) return;
    
    try {
      console.log("Mise à jour des stats...");
      const userRef = doc(db, "users", currentUser.uid);
      
      if (isWin) {
        // Calcul du score: longueur du mot * 10 / nombre d'essais (arrondi au supérieur)
        let scoreToAdd = Math.ceil((wordLength * 10) / attemptNumber);
        
        // Appliquer la pénalité pour les indices utilisés: -5 points par indice
        const hintPenalty = hintsUsed * 5;
        scoreToAdd = Math.max(0, scoreToAdd - hintPenalty);
        
        console.log(`Indices utilisés: ${hintsUsed}, pénalité: -${hintPenalty} points`);
        
        await updateDoc(userRef, {
          gamesPlayed: increment(1),
          gamesWon: increment(1),
          score: increment(scoreToAdd)
        });
        
        console.log(`Partie gagnée! +${scoreToAdd} points (indices)`);
        
        // Propager les nouvelles statistiques au composant parent
        if (onStatsUpdated) {
          onStatsUpdated({
            gamesPlayed: 1,
            gamesWon: 1,
            score: scoreToAdd
          });
        }
      } else {
        // Si le joueur perd, on incrémente seulement le nombre de parties jouées
        await updateDoc(userRef, {
          gamesPlayed: increment(1)
        });
        
        console.log(`Looser.`);
        
        // Propager les nouvelles statistiques au composant parent
        if (onStatsUpdated) {
          onStatsUpdated({
            gamesPlayed: 1,
            gamesWon: 0,
            score: 0
          });
        }
      }
    } catch (error) {
      console.error("Erreur maj stat:", error);
    }
  };

  // Gérer l'entrée clavier
  const handleInput = (key) => {
    if (gameOver) return;
    
    if (key === "BACK") {
      if (currentPosition > 0) {
        const newAttempts = [...attempts];
        newAttempts[currentAttempt][currentPosition - 1] = "";
        setAttempts(newAttempts);
        setCurrentPosition(currentPosition - 1);
      }
    } else if (key === "ENTER") {
      if (currentPosition === wordLength) {
        const currentAttemptArray = attempts[currentAttempt];
        const result = checkAttempt(currentAttemptArray, targetWord);

        const newResults = [...attemptResults];
        newResults[currentAttempt] = result;
        setAttemptResults(newResults);

        const newKeyboardStatus = updateKeyboardStatus(
          currentAttemptArray,
          result,
          keyboardStatus,
          wordLength
        );
        setKeyboardStatus(newKeyboardStatus);

        // Vérifier si le joueur a gagné
        const isWin = result.every(r => r === "correct");
        
        if (isWin) {
          setGameWon(true);
          setGameOver(true);
          // Mettre à jour les statistiques pour une victoire
          updateUserStats(true, currentAttempt + 1);
        } else if (currentAttempt + 1 >= maxAttempts) {
          setGameOver(true);
          // Mettre à jour les statistiques pour une défaite
          updateUserStats(false, maxAttempts);
        }

        // Passer à l'essai suivant
        setCurrentAttempt(currentAttempt + 1);
        setCurrentPosition(0);
      }
    } else {
      if (currentPosition < wordLength) {
        const newAttempts = [...attempts];
        newAttempts[currentAttempt][currentPosition] = key;
        setAttempts(newAttempts);
        setCurrentPosition(currentPosition + 1);
      }
    }
  };

  // Fonction pour réinitialiser le jeu
  const resetGame = async () => {
    try {
      // Attendre que la Promise soit résolue
      const newWord = await getRandomWord(wordLength);
      console.log("Nouveau mot à deviner:", newWord);
      
      // Réinitialiser tous les états
      setTargetWord(newWord);
      setAttempts(Array(maxAttempts).fill("").map(() => Array(wordLength).fill("")));
      setCurrentAttempt(0);
      setCurrentPosition(0);
      setAttemptResults(Array(maxAttempts).fill(null).map(() => Array(wordLength).fill(null)));
      setKeyboardStatus({});
      setGameOver(false);
      setGameWon(false);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du jeu:", error);
      // Utiliser un mot par défaut en cas d'erreur
      setTargetWord("PIANO");
    }
  };

  // Gérer les touches du clavier physique
  const handleKeyPress = (e) => {
    if (gameOver) return;

    if (/^[a-zA-Z]$/.test(e.key) && currentPosition < wordLength) {
      const newAttempts = [...attempts];
      newAttempts[currentAttempt][currentPosition] = e.key.toUpperCase();
      setAttempts(newAttempts);
      setCurrentPosition(currentPosition + 1);
    } else if (e.key === "Backspace" && currentPosition > 0) {
      const newAttempts = [...attempts];
      newAttempts[currentAttempt][currentPosition - 1] = "";
      setAttempts(newAttempts);
      setCurrentPosition(currentPosition - 1);
    } else if (e.key === "Enter" && currentPosition === wordLength) {
      handleInput("ENTER");
    }
  };
//init game
useEffect(() => {
  const initGame = async () => {
    try {
      // Attend que la Promise soit résolue pour obtenir le mot réel
      const newWord = await getRandomWord(wordLength);
      setTargetWord(newWord);
      console.log("Nouveau mot à deviner:", newWord);
    } catch (error) {
      console.error("Erreur lors de l'obtention du mot:", error);
      // Utiliser un mot par défaut en cas d'erreur
      setTargetWord("PIANO");
    }
  };
  
  initGame();
}, [wordLength, maxAttempts]);

  // Écouter les événements clavier
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentAttempt, currentPosition, attempts, targetWord, gameOver]);

  return {
    attempts,
    currentAttempt,
    currentPosition,
    keyboardStatus,
    targetWord,
    attemptResults,
    gameOver,
    gameWon, 
    handleInput,
    resetGame
  };
}