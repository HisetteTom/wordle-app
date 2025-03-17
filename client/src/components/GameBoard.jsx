import React from "react";

function GameBoard({ attempts, currentAttempt, attemptResults, wordLength }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid gap-2">
        {attempts.map((attempt, attemptIndex) => (
          <div key={attemptIndex} className="flex gap-2">
            {attempt.map((letter, letterIndex) => {
              // Déterminer la couleur de l'arrière-plan
              let bgColor = "";
              if (attemptIndex < currentAttempt && attemptResults[attemptIndex]) {
                switch (attemptResults[attemptIndex][letterIndex]) {
                  case "correct": bgColor = "bg-green-500 text-white border-green-500"; break;
                  case "present": bgColor = "bg-yellow-500 text-white border-yellow-500"; break;
                  case "absent": bgColor = "bg-gray-500 text-white border-gray-500"; break;
                  default: bgColor = letter ? "bg-gray-100" : "";
                }
              } else {
                bgColor = letter ? "bg-gray-100" : "";
              }

              return (
                <div
                  key={letterIndex}
                  className={`
                    w-12 h-12 border-2 flex items-center justify-center text-xl font-bold transition-colors duration-500
                    ${currentAttempt === attemptIndex ? "border-gray-500" : "border-gray-300"}
                    ${bgColor}
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