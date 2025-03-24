import { isValidWord } from "../GameLogic";
import { useState } from "react";

export function useWordValidation(attempts, currentAttempt, currentPosition, wordLength, setErrorMessage) {
  // Cache pour les mots déjà vérifiés
  const [wordValidationCache, setWordValidationCache] = useState({});

  // Fonction pour normaliser un mot (enlever les accents)
  const normalizeWord = (word) => {
    return word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  };

  // Valider un mot avec gestion du cache et des accents
  const validateWord = async (word) => {
    const normalizedWord = normalizeWord(word);
    
    // Vérifier dans le cache
    if (wordValidationCache[normalizedWord] !== undefined) {
      if (!wordValidationCache[normalizedWord]) {
        setErrorMessage("Ce mot n'existe pas dans notre dictionnaire");
        shakeCurrentRow(currentAttempt);
        return false;
      }
      return true;
    }
    
    // Vérifier avec l'API
    try {
      const valid = await isValidWord(word);
      
      // Mettre en cache le résultat
      setWordValidationCache(prev => ({
        ...prev,
        [normalizedWord]: valid
      }));
      
      if (!valid) {
        setErrorMessage("Ce mot n'existe pas dans notre dictionnaire");
        shakeCurrentRow(currentAttempt);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation du mot:", error);
      setErrorMessage("Erreur lors de la validation");
      shakeCurrentRow(currentAttempt);
      return false;
    }
  };

  // Animation de secousse pour une rangée
  const shakeCurrentRow = (rowIndex) => {
    const currentRow = document.querySelector(`.attempt-row[data-attempt="${rowIndex}"]`);
    if (currentRow) {
      currentRow.classList.add("shake");
      setTimeout(() => {
        currentRow.classList.remove("shake");
      }, 500);
    }

    // Effacer le message d'erreur après un délai
    setTimeout(() => {
      setErrorMessage("");
    }, 2000);
  };

  return { validateWord, shakeCurrentRow };
}