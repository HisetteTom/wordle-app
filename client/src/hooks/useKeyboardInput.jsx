import { useCallback } from "react";

export function useKeyboardInput(
  gameOver,
  currentPosition,
  wordLength,
  attempts,
  setAttempts,
  currentAttempt,
  setCurrentPosition,
  handleInput
) {
  const handleKeyPress = useCallback(
    (e) => {
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
    },
    [
      gameOver,
      currentPosition,
      wordLength,
      attempts,
      setAttempts,
      currentAttempt,
      setCurrentPosition,
      handleInput,
    ]
  );

  return { handleKeyPress };
}