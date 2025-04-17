import { useCallback } from "react";

// Hook gérant les entrées clavier pour le jeu Wordle
export function useKeyboardInput(
  gameOver,
  currentPosition,
  wordLength,
  attempts,
  setAttempts,
  currentAttempt,
  setCurrentPosition,
  handleInput,
  preFilled
) {
  const handleKeyPress = useCallback(
    (e) => {
      if (gameOver) return;

      //Handleinput va gérer toute la logique d'entrée de lettre
      if (/^[a-zA-Z]$/.test(e.key) && currentPosition < wordLength) {
        handleInput(e.key.toUpperCase());
      } else if (e.key === "Backspace" && currentPosition > 0) {
        handleInput("BACK");
      } else if (e.key === "Enter" && currentPosition === wordLength) {
        handleInput("ENTER");
      } else if (e.key === "ArrowLeft" && currentPosition > 0) {
        setCurrentPosition(currentPosition - 1);
      } else if (e.key === "ArrowRight" && currentPosition < wordLength) {
        setCurrentPosition(Math.min(currentPosition + 1, wordLength));
      }
    },
    [gameOver, currentPosition, wordLength, handleInput, setCurrentPosition]
  );

  return { handleKeyPress };
}
