import React, { useRef, useEffect } from "react";

function GameBoard({
  attempts,
  currentAttempt,
  attemptResults,
  wordLength,
  gameWon,
  preFilled,
  userEdited,
}) {
  const rowRefs = useRef([]);

  // Configurer les refs pour les animations
  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, attempts.length);
  }, [attempts.length]);

  // Appliquer l'animation de victoire
  useEffect(() => {
    if (gameWon) {
      const winningRow = rowRefs.current[currentAttempt];
      if (winningRow) {
        winningRow.classList.remove("victory-animation");
        void winningRow.offsetWidth;
        winningRow.classList.add("victory-animation");
      }
    }
  }, [gameWon, currentAttempt]);

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <div className="grid gap-2">
        {attempts.map((attempt, attemptIndex) => (
          <div
            key={attemptIndex}
            ref={(el) => (rowRefs.current[attemptIndex] = el)}
            className="flex gap-2 attempt-row"
            data-attempt={attemptIndex}
          >
            {attempt.map((letter, letterIndex) => {
              // Déterminer si c'est une lettre pré-remplie
              const isPreFilled =
                attemptIndex === currentAttempt &&
                preFilled &&
                preFilled[attemptIndex] &&
                preFilled[attemptIndex][letterIndex];

              // Vérifier si l'utilisateur a édité cette lettre
              const isUserEditedLetter =
                userEdited &&
                userEdited[attemptIndex] &&
                userEdited[attemptIndex][letterIndex];

              // Déterminer la couleur de l'arrière-plan
              let bgColor = "";
              let textColor = "";

              if (
                (attemptIndex < currentAttempt ||
                  (gameWon && attemptIndex === currentAttempt)) &&
                attemptResults[attemptIndex]
              ) {
                switch (attemptResults[attemptIndex][letterIndex]) {
                  case "correct":
                    bgColor = "bg-green-500 border-green-500";
                    // La lettre est grise si pré-remplie et non éditée, sinon blanche
                    textColor =
                      isPreFilled && !isUserEditedLetter
                        ? "text-gray-400"
                        : "text-white";
                    break;
                  case "present":
                    bgColor = "bg-yellow-500 border-yellow-500";
                    textColor =
                      isPreFilled && !isUserEditedLetter
                        ? "text-gray-400"
                        : "text-white";
                    break;
                  case "absent":
                    bgColor = "bg-gray-500 border-gray-500";
                    textColor =
                      isPreFilled && !isUserEditedLetter
                        ? "text-gray-400"
                        : "text-white";
                    break;
                  default:
                    bgColor = letter ? "bg-gray-100" : "";
                    textColor =
                      isPreFilled && !isUserEditedLetter ? "text-gray-400" : "";
                }
              } else {
                // Pour toutes les cellules normales
                bgColor = letter ? "bg-gray-100" : "";
                textColor =
                  isPreFilled && !isUserEditedLetter ? "text-gray-400" : "";
              }

              // Animation pour les nouvelles lettres
              const isNewLetter =
                attemptIndex === currentAttempt && letter && !isPreFilled;
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
                  <span
                    className={
                      isPreFilled && !isUserEditedLetter
                        ? "text-gray-400"
                        : (attemptIndex < currentAttempt ||
                            (gameWon && attemptIndex === currentAttempt)) &&
                          attemptResults[attemptIndex]
                        ? "text-white"
                        : "text-black"
                    }
                  >
                    {letter}
                  </span>
                  {isPreFilled && !isUserEditedLetter && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-300 rounded-full"></div>
                  )}
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
