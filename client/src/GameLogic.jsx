import { wordleService } from "./services/api";

// Disposition du clavier virtuel AZERTY
export const keyboardRows = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["ENTER", "W", "X", "C", "V", "B", "N", "BACK"],
];

// Vérifie la tentative et retourne un tableau avec le statut de chaque lettre
export const checkAttempt = (attempt, targetWord) => {
  const wordLength = targetWord.length;
  const result = Array(wordLength).fill("absent");
  const targetLetters = targetWord.split("");

  // Première passe: chercher les lettres correctes (position exacte)
  for (let i = 0; i < wordLength; i++) {
    if (attempt[i] === targetLetters[i]) {
      result[i] = "correct";
      targetLetters[i] = null; // Marque la lettre comme utilisée
    }
  }

  // Seconde passe: chercher les lettres présentes (mauvaise position)
  for (let i = 0; i < wordLength; i++) {
    if (result[i] !== "correct") {
      const letterIndex = targetLetters.indexOf(attempt[i]);
      if (letterIndex !== -1) {
        result[i] = "present";
        targetLetters[letterIndex] = null; // Évite de compter deux fois
      }
    }
  }

  return result;
};

// Met à jour l'état du clavier en fonction des résultats de la tentative
export const updateKeyboardStatus = (
  attempt,
  result,
  keyboardStatus,
  wordLength
) => {
  const newStatus = { ...keyboardStatus };

  for (let i = 0; i < wordLength; i++) {
    const letter = attempt[i];
    const status = result[i];

    // Priorité des états: correct > present > absent
    if (newStatus[letter] === "correct") continue;
    if (newStatus[letter] === "present" && status === "absent") continue;

    newStatus[letter] = status;
  }

  return newStatus;
};

// Fonctions importées depuis le service API
export const getRandomWord = wordleService.getRandomWord;
export const isValidWord = wordleService.isValidWord;
