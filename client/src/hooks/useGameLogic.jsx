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
  const [errorMessage, setErrorMessage] = useState("");

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
    setAttempts(prev => {
      const newAttempts = [...prev];
      newAttempts[currentAttempt] = Array(wordLength).fill("");
      return newAttempts;
    });
    setCurrentPosition(0);
  };

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
    setAttemptResults(prev => {
      const newResults = [...prev];
      newResults[currentAttempt] = result;
      return newResults;
    });

    setKeyboardStatus(prevStatus =>
      updateKeyboardStatus(currentWordArray, result, prevStatus, wordLength)
    );


    const isWin = result.every(r => r === "correct");

    if (isWin) {
      console.log("Victoire détectée!");
      setGameWon(true);
      setGameOver(true);
      // Ajout d'un délai pour permettre à l'animation de se jouer
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        console.log("MAJ stats utilisateur");
        updateUserStats(true, currentAttempt + 1);
      }, 500); 
    } else if (currentAttempt + 1 >= maxAttempts) {
      setGameOver(true);
      setTimeout(() => {
        updateUserStats(false, maxAttempts);
      }, 500);
    } else {
      setCurrentAttempt(prev => prev + 1);
      setCurrentPosition(0);
    }

    return true;
  };

  const handleInput = async (key) => {
    if (gameOver) return;

    if (key === "BACK" && currentPosition > 0) {
      setAttempts(prev => {
        const newAttempts = [...prev];
        newAttempts[currentAttempt][currentPosition - 1] = "";
        return newAttempts;
      });
      setCurrentPosition(prev => prev - 1);
    } else if (key === "ENTER" && currentPosition === wordLength) {
      await submitAttempt();
    } else if (currentPosition < wordLength && key !== "ENTER" && key !== "BACK") {
      setAttempts(prev => {
        const newAttempts = [...prev];
        newAttempts[currentAttempt][currentPosition] = key;
        return newAttempts;
      });
      setCurrentPosition(prev => prev + 1);
    }
  };

  const resetGame = async () => {
    const newWord = await getRandomWord(wordLength);
    setTargetWord(newWord);
    console.log("Mot a deviner:", newWord);
    setAttempts(Array(maxAttempts).fill("").map(() => Array(wordLength).fill("")));
    setCurrentAttempt(0);
    setCurrentPosition(0);
    setAttemptResults(Array(maxAttempts).fill(null).map(() => Array(wordLength).fill(null)));
    setKeyboardStatus({});
    setGameOver(false);
    setGameWon(false);
    setErrorMessage("");
    
    // Ajouter behavior: 'smooth' et un délai
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
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
    handleInput
  );

  useEffect(() => {
    const initGame = async () => {
      const newWord = await getRandomWord(wordLength);
      setTargetWord(newWord);
      console.log("Mot a deviner:", newWord);
    };
    initGame();
  }, [wordLength, maxAttempts]);

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
  };
}