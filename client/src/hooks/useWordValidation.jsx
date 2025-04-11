import { isValidWord } from "../GameLogic";
import { useState } from "react";

// Hook pour valider les mots entrés dans le jeu
export function useWordValidation(
  attempts,
  currentAttempt,
  currentPosition,
  wordLength,
  setErrorMessage
) {
  const [wordValidationCache, setWordValidationCache] = useState({});

  // Normalise le mot (retire les accents, met en majuscules)
  const normalizeWord = (word) => {
    return word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  };

  const validateWord = async (word) => {
    const normalizedWord = normalizeWord(word);

    // Utilise le cache pour éviter des appels API répétés
    if (wordValidationCache[normalizedWord] !== undefined) {
      if (!wordValidationCache[normalizedWord]) {
        setErrorMessage("Ce mot n'existe pas dans notre dictionnaire");
        shakeCurrentRow(currentAttempt);
        return false;
      }
      return true;
    }

    const valid = await isValidWord(word);
    setWordValidationCache((prev) => ({
      ...prev,
      [normalizedWord]: valid,
    }));

    if (!valid) {
      setErrorMessage("Ce mot n'existe pas dans notre dictionnaire");
      shakeCurrentRow(currentAttempt);
      return false;
    }

    return true;
  };

  // Animation visuelle quand un mot est invalide
  const shakeCurrentRow = (rowIndex) => {
    const currentRow = document.querySelector(
      `.attempt-row[data-attempt="${rowIndex}"]`
    );
    if (currentRow) {
      currentRow.classList.add("shake");
      setTimeout(() => currentRow.classList.remove("shake"), 500);
    }
    setTimeout(() => setErrorMessage(""), 2000);
  };

  return { validateWord, shakeCurrentRow };
}
