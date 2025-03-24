import React, { useRef, useEffect } from "react";

function GameBoard({
  attempts,
  currentAttempt,
  attemptResults,
  wordLength,
  gameWon,
}) {
  // Tableau de refs pour les lignes
  const rowRefs = useRef([]);


  // Configurer les refs pour les animations
  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, attempts.length);
  }, [attempts.length]);

  // Appliquer l'animation de victoire si nécessaire
  // Dans l'effet pour l'animation de victoire
  useEffect(() => {
    if (gameWon) {
      const winningRow = rowRefs.current[currentAttempt]; // <-- Supprimé le -1
      if (winningRow) {
        console.log(
          "Appliquer l'animation de victoire à la ligne:",
          currentAttempt
        );
        winningRow.classList.add("victory-animation");
      } else {
        console.log("Pas trouvé la ligne pour l'animation:", currentAttempt);
        console.log("Lignes disponibles:", rowRefs.current.length);
      }
    }
  }, [gameWon, currentAttempt]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid gap-2">
        {attempts.map((attempt, attemptIndex) => (
          <div
            key={attemptIndex}
            ref={(el) => (rowRefs.current[attemptIndex] = el)}
            className="flex gap-2 attempt-row"
            data-attempt={attemptIndex}
          >
            {attempt.map((letter, letterIndex) => {
              // Déterminer la couleur de l'arrière-plan
              let bgColor = "";

              if (
                (attemptIndex < currentAttempt ||
                  (gameWon && attemptIndex === currentAttempt)) &&
                attemptResults[attemptIndex]
              ) {
                switch (attemptResults[attemptIndex][letterIndex]) {
                  case "correct":
                    bgColor = "bg-green-500 text-white border-green-500";
                    break;
                  case "present":
                    bgColor = "bg-yellow-500 text-white border-yellow-500";
                    break;
                  case "absent":
                    bgColor = "bg-gray-500 text-white border-gray-500";
                    break;
                  default:
                    bgColor = letter ? "bg-gray-100" : "";
                }
              } else {
                bgColor = letter ? "bg-gray-100" : "";
              }


              // Animation pour les nouvelles lettres
              const isNewLetter = attemptIndex === currentAttempt && letter;
              const animationClass = isNewLetter ? "animate-pop" : "";

              return (
                <div
                  key={letterIndex}
                  className={`
                    w-12 h-12 border-2 flex items-center justify-center text-xl font-bold transition-colors duration-500
                    ${
                      currentAttempt === attemptIndex
                        ? "border-gray-500"
                        : "border-gray-300"
                    }
                    ${bgColor}
                    ${animationClass}
                  `}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameBoard;
