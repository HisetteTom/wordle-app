import React, { useState } from "react";
import { ArrowPathIcon, HomeIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { findAccentedWord } from "../utils/stringUtils";

function GameControls({
  currentAttempt,
  wordLength,
  attemptResults,
  targetWord,
  maxAttempts,
  gameWon,
  gameOver,
  onRestart,
  onHome,
  onDictionary,
}) {
  // État pour stocker le résultat de la conversion
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour gérer le clic sur le bouton du dictionnaire
  const handleDictionaryClick = async () => {
    setIsLoading(true);
    
    try {
      // Obtenir la version accentuée du mot
      const accentedWord = await findAccentedWord(targetWord);
      console.log(`Recherche dans le dictionnaire: ${targetWord} → ${accentedWord}`);
      
      // Rediriger vers la page du dictionnaire
      onDictionary(accentedWord);
    } catch (error) {
      console.error("Erreur lors de la conversion du mot:", error);
      // En cas d'erreur, utiliser simplement le mot en minuscules
      onDictionary(targetWord.toLowerCase());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Messages pendant la partie normale */}
      {!gameOver && !gameWon && (
        <div className="text-center text-gray-600">
          <p>
            Essai {currentAttempt + 1} / {maxAttempts}
          </p>
          <p className="mt-1 text-sm">
            Entrez un mot de {wordLength} lettres et appuyez sur ENTER
          </p>
        </div>
      )}

      {/* Contrôles de fin de partie */}
      {(gameOver || gameWon) && (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
          <p className="text-lg font-bold text-center mb-2">
            {gameWon
              ? `Bravo ! Vous avez trouvé le mot en ${
                  currentAttempt + 1
                } essai${currentAttempt > 0 ? "s" : ""}!`
              : `Dommage ! Le mot était : ${targetWord.toUpperCase()}`}
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              Nouvelle partie
            </button>

            <button
              onClick={onHome}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <HomeIcon className="h-5 w-5 mr-1" />
              Accueil
            </button>
          </div>
          
          {/* Bouton pour le dictionnaire avec gestion de chargement */}
          <button
            onClick={handleDictionaryClick}
            disabled={isLoading}
            className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                Recherche...
              </>
            ) : (
              <>
                <BookOpenIcon className="h-5 w-5 mr-1" />
                Voir la définition de {targetWord.toUpperCase()}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default GameControls;