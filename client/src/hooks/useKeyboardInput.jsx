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
      // Ignore les touches si le jeu est terminé

      // Vérifie si la touche est une lettre et si la position actuelle est valide
      if (/^[a-zA-Z]$/.test(e.key) && currentPosition < wordLength) {
        const newAttempts = [...attempts];
        newAttempts[currentAttempt][currentPosition] = e.key.toUpperCase();
        setAttempts(newAttempts);
        setCurrentPosition(currentPosition + 1);
      } else if (e.key === "Backspace" && currentPosition > 0) {
        // Vérifie si la touche est "Backspace" pour effacer une lettre
        const newAttempts = [...attempts];
        newAttempts[currentAttempt][currentPosition - 1] = "";
        setAttempts(newAttempts);

        setCurrentPosition(currentPosition - 1);
      } else if (e.key === "Enter" && currentPosition === wordLength) {
        handleInput("ENTER");
      } else if (e.key === "ArrowLeft" && currentPosition > 0) {
        setCurrentPosition(currentPosition - 1);
      } else if (e.key === "ArrowRight" && currentPosition < wordLength) {
        setCurrentPosition(Math.min(currentPosition + 1, wordLength));
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
