import { useState, useEffect } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import {
  checkAttempt,
  updateKeyboardStatus,
  getRandomWord,
  isValidWord,
} from "../GameLogic";
import { useKeyboardInput } from "./useKeyboardInput";
import { useGameStats } from "./useGameStats";
import { useWordValidation } from "./useWordValidation";

export function useGameLogic(
  wordLength = 5,
  maxAttempts = 6,
  currentUser,
  onStatsUpdated,
  hintsUsed = 0
) {
  // État du jeu
  const [attempts, setAttempts] = useState(
    Array(maxAttempts)
      .fill("")
      .map(() => Array(wordLength).fill(""))
  );
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [targetWord, setTargetWord] = useState("");
  const [attemptResults, setAttemptResults] = useState(
    Array(maxAttempts)
      .fill(null)
      .map(() => Array(wordLength).fill(null))
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Hooks personnalisés
  const { updateUserStats } = useGameStats(
    currentUser,
    onStatsUpdated,
    wordLength,
    hintsUsed
  );
  const { validateWord, shakeCurrentRow } = useWordValidation(
    attempts,
    currentAttempt,
    currentPosition,
    wordLength,
    setErrorMessage
  );

  const resetCurrentRow = () => {
    const newAttempts = [...attempts];
    newAttempts[currentAttempt] = Array(wordLength).fill("");
    setAttempts(newAttempts);
    setCurrentPosition(0);
    console.log("Rangée réinitialisée:", currentAttempt);
  };

  // Fonction pour soumettre une tentative
  const submitAttempt = async () => {
    const currentWordArray = attempts[currentAttempt];
    const currentWord = currentWordArray.join("");

    // Vérifier que le mot est complet
    if (currentPosition !== wordLength) {
      setErrorMessage("Le mot n'est pas complet");
      shakeCurrentRow(currentAttempt);
      return false;
    }

    // Vérifier si le mot existe dans le dictionnaire
    const valid = await validateWord(currentWord);
    if (!valid) {
      setErrorMessage("Ce mot n'existe pas dans notre dictionnaire");
      shakeCurrentRow(currentAttempt);

      // Ajouter cette ligne pour réinitialiser la rangée après l'animation de secousse
      setTimeout(() => {
        resetCurrentRow();
      }, 800); // Attendre la fin de l'animation de secousse

      return false;
    }

    // Calculer le résultat de la tentative
    const result = checkAttempt(currentWordArray, targetWord);

    console.log("Vérification résultat:", {
      attempt: currentWordArray,
      target: targetWord,
      result,
    });

    // Créer une copie des résultats actuels pour les mettre à jour
    const newResults = [...attemptResults];
    newResults[currentAttempt] = result;

    // Mettre à jour les résultats
    setAttemptResults(newResults);

    // Mettre à jour le statut du clavier
    setKeyboardStatus((prevStatus) =>
      updateKeyboardStatus(currentWordArray, result, prevStatus, wordLength)
    );

    // Vérifier si le joueur a gagné
    const isWin = result.every((r) => r === "correct");

    if (isWin) {
      console.log("Victoire détectée!");
      setGameWon(true);
      setGameOver(true);

      console.log("État après victoire:", {
        gameWon: true,
        gameOver: true,
        currentAttempt,
        attemptResults: newResults, // Utiliser la version mise à jour
      });

      // Laisser React mettre à jour le DOM avant d'appliquer l'animation
      setTimeout(() => {
        const currentRow = document.querySelector(
          `.attempt-row[data-attempt="${currentAttempt}"]`
        );
        if (currentRow) {
          currentRow.classList.add("victory-animation");
          console.log(
            "Animation de victoire appliquée à la ligne:",
            currentAttempt
          );
        } else {
          console.log(
            "Élément ligne non trouvé pour l'animation:",
            currentAttempt
          );
        }

        // Défiler pour afficher les contrôles de fin de partie
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        }, 500);
      }, 50);

      // Mise à jour des stats après un court délai
      setTimeout(() => {
        updateUserStats(true, currentAttempt + 1);
      }, 800);
    } else if (currentAttempt + 1 >= maxAttempts) {
      console.log("Défaite - fin de partie");
      setGameOver(true);

      // Défiler pour afficher les contrôles de fin de partie
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 500);

      updateUserStats(false, maxAttempts);
    } else {
      // Passer à la tentative suivante
      console.log("Passer à la tentative suivante");
      setCurrentAttempt(currentAttempt + 1);
      setCurrentPosition(0);
    }

    return true;
  };

  // Gérer l'entrée clavier
  const handleInput = async (key) => {
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
        console.log("ENTER detected");
        await submitAttempt();
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
      setAttempts(
        Array(maxAttempts)
          .fill("")
          .map(() => Array(wordLength).fill(""))
      );
      setCurrentAttempt(0);
      setCurrentPosition(0);
      setAttemptResults(
        Array(maxAttempts)
          .fill(null)
          .map(() => Array(wordLength).fill(null))
      );
      setKeyboardStatus({});
      setGameOver(false);
      setGameWon(false);
      setErrorMessage("");

      // Défiler vers le haut de la page
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du jeu:", error);
      // Utiliser un mot par défaut en cas d'erreur
      setTargetWord("PIANO");
    }
  };

  // Hook pour gérer les événements clavier
  const { handleKeyPress } = useKeyboardInput(
    gameOver,
    currentPosition,
    wordLength,
    attempts,
    setAttempts,
    currentAttempt,
    setCurrentPosition,
    handleInput
  );

  // Initialiser le jeu
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
  }, [handleKeyPress]);

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
    resetGame,
    errorMessage,
  };
}
