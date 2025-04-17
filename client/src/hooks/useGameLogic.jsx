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

// Hook principal gérant toute la logique du jeu Wordle
export function useGameLogic(
  wordLength = 5,
  maxAttempts = 6,
  currentUser,
  onStatsUpdated,
  hintsUsed = 0
) {
  // États pour suivre la progression du jeu
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
  // Suivi des lettres pré-remplies
  const [preFilled, setPreFilled] = useState(
    Array(maxAttempts)
      .fill(null)
      .map(() => Array(wordLength).fill(false))
  );
  // Suivi des lettres éditées par l'utilisateur
  const [userEdited, setUserEdited] = useState(
    Array(maxAttempts)
      .fill(null)
      .map(() => Array(wordLength).fill(false))
  );

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

  // Réinitialise la ligne actuelle en préservant les lettres pré-remplies
  const resetCurrentRow = () => {
    setAttempts((prev) => {
      const newAttempts = [...prev];
      const newRow = Array(wordLength).fill("");
      newAttempts[currentAttempt] = newRow;
      return newAttempts;
    });

    setUserEdited((prev) => {
      const newEdited = prev.map((arr) => Array(wordLength).fill(false));
      return newEdited;
    });

    setPreFilled((prev) => {
      const newPreFilled = prev.map((arr) => [...arr]);
      newPreFilled[currentAttempt] = Array(wordLength).fill(false);
      return newPreFilled;
    });

    setCurrentPosition(0);
  };

  // Soumet l'essai actuel et vérifie le résultat
  const submitAttempt = async () => {
    const currentWordArray = attempts[currentAttempt];
    const currentWord = currentWordArray.join("");

    if (currentPosition !== wordLength) {
      setErrorMessage("Le mot n'est pas complet");
      shakeCurrentRow(currentAttempt);
      return false;
    }

    const valid = await validateWord(currentWord);
    if (!valid) {
      setErrorMessage("Ce mot n'existe pas dans notre dictionnaire");
      shakeCurrentRow(currentAttempt);
      setTimeout(resetCurrentRow, 800);
      return false;
    }

    const result = checkAttempt(currentWordArray, targetWord);
    setAttemptResults((prev) => {
      const newResults = [...prev];
      newResults[currentAttempt] = result;
      return newResults;
    });

    setKeyboardStatus((prevStatus) =>
      updateKeyboardStatus(currentWordArray, result, prevStatus, wordLength)
    );

    const isWin = result.every((r) => r === "correct");

    if (isWin) {
      setGameWon(true);
      setGameOver(true);
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        updateUserStats(true, currentAttempt + 1);
      }, 500);
    } else if (currentAttempt + 1 >= maxAttempts) {
      setGameOver(true);
      setTimeout(() => {
        updateUserStats(false, maxAttempts);
      }, 500);
    } else {
      // Pré-remplit les lettres correctes pour la ligne suivante
      const nextAttemptIndex = currentAttempt + 1;

      const correctLetters = Array(wordLength).fill(null);

      for (let attempt = 0; attempt < currentAttempt; attempt++) {
        const results = attemptResults[attempt];
        for (let i = 0; i < wordLength; i++) {
          if (results && results[i] === "correct") {
            correctLetters[i] = attempts[attempt][i];
          }
        }
      }

      // Ajouter AUSSI les résultats qu'on vient de calculer
      for (let i = 0; i < wordLength; i++) {
        if (result[i] === "correct") {
          correctLetters[i] = currentWordArray[i];
        }
      }

      // Mettre à jour preFilled avec toutes les positions correctes connues
      setPreFilled((prev) => {
        const newPreFilled = [...prev];
        for (let i = 0; i < wordLength; i++) {
          newPreFilled[nextAttemptIndex][i] = correctLetters[i] !== null;
        }
        return newPreFilled;
      });

      // Mettre à jour attempts avec toutes les lettres correctes connues
      setAttempts((prev) => {
        const newAttempts = [...prev];
        for (let i = 0; i < wordLength; i++) {
          if (correctLetters[i] !== null) {
            newAttempts[nextAttemptIndex][i] = correctLetters[i];
          }
        }
        return newAttempts;
      });

      setUserEdited((prev) => {
        const newEdited = prev.map((arr) => [...arr]);
        newEdited[nextAttemptIndex] = Array(wordLength).fill(false);
        return newEdited;
      });

      setCurrentAttempt((prev) => prev + 1);
      setCurrentPosition(0);
    }

    return true;
  };

  // Gère les entrées clavier (lettres, effacement, validation)
  const handleInput = async (key) => {
    if (gameOver) return;

    if (key === "BACK" && currentPosition > 0) {
      setAttempts((prev) => {
        const newAttempts = [...prev];
        newAttempts[currentAttempt][currentPosition - 1] = "";
        return newAttempts;
      });
      setUserEdited((prev) => {
        const newEdited = prev.map((arr) => [...arr]);
        newEdited[currentAttempt][currentPosition - 1] = false;
        return newEdited;
      });
      setCurrentPosition(currentPosition - 1);
    } else if (key === "ENTER" && currentPosition === wordLength) {
      await submitAttempt();
    } else if (
      currentPosition < wordLength &&
      key !== "ENTER" &&
      key !== "BACK"
    ) {
      setAttempts((prev) => {
        const newAttempts = [...prev];
        newAttempts[currentAttempt][currentPosition] = key;
        return newAttempts;
      });
      setUserEdited((prev) => {
        const newEdited = prev.map((arr) => [...arr]);
        newEdited[currentAttempt][currentPosition] = true;
        return newEdited;
      });
      setCurrentPosition(currentPosition + 1);
    }
  };

  // Réinitialise le jeu avec un nouveau mot
  const resetGame = async () => {
    const newWord = await getRandomWord(wordLength);
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
    setPreFilled(
      Array(maxAttempts)
        .fill(null)
        .map(() => Array(wordLength).fill(false))
    );
    setUserEdited(
      Array(maxAttempts)
        .fill(null)
        .map(() => Array(wordLength).fill(false))
    );

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  const { handleKeyPress } = useKeyboardInput(
    gameOver,
    currentPosition,
    wordLength,
    attempts,
    setAttempts,
    currentAttempt,
    setCurrentPosition,
    handleInput,
    preFilled
  );

  // Initialise le jeu avec un nouveau mot aléatoire
  useEffect(() => {
    const initGame = async () => {
      const newWord = await getRandomWord(wordLength);
      setTargetWord(newWord);
    };
    initGame();
  }, [wordLength, maxAttempts]);

  // Configuration des écouteurs d'événements clavier
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
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
    preFilled,
    userEdited,
  };
}
