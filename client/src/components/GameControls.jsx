import React from "react";
import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";

function GameControls({
  currentAttempt,
  wordLength,
  attemptResults,
  targetWord,
  maxAttempts,
  showBackButton,
  onRestart,  // Fonction pour relancer une partie
  onHome      // Fonction pour retourner à l'accueil
}) {
  // Vérifier si le jeu est terminé
  const isGameOver = currentAttempt > 0 && 
    (attemptResults[currentAttempt - 1]?.every(result => result === "correct") || 
     currentAttempt === maxAttempts);
  
  // Vérifier si c'est une victoire
  const isWin = currentAttempt > 0 && 
    attemptResults[currentAttempt - 1]?.every(result => result === "correct");
  
  // Si le jeu n'est pas terminé, ne rien afficher
  if (!isGameOver) {
    return null;
  }

  return (
    <div className="flex flex-col items-center bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
      {/* Message de victoire ou défaite */}
      <div className={`font-bold text-xl mb-3 ${isWin ? "text-green-600" : "text-red-600"}`}>
        {isWin ? "Félicitations!" : "Dommage!"}
      </div>
      
      <p className="mb-4 text-center">
        {isWin
          ? `Vous avez trouvé le mot en ${currentAttempt} essai${currentAttempt > 1 ? "s" : ""}.`
          : `Le mot était "${targetWord}".`}
      </p>
      
      {/* Boutons pour relancer ou retourner à l'accueil */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <button
          onClick={onRestart}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span>Nouvelle partie ({wordLength} lettres)</span>
        </button>
        
        <button
          onClick={onHome}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 transition-colors"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          <span>Retour à l'accueil</span>
        </button>
      </div>
    </div>
  );
}

export default GameControls;