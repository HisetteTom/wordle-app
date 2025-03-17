// Disposition du clavier
export const keyboardRows = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["ENTER", "W", "X", "C", "V", "B", "N", "BACK"]
];

// Fonction pour vérifier une tentative
export const checkAttempt = (attempt, targetWord) => {
  const wordLength = targetWord.length;
  const result = Array(wordLength).fill('absent');
  const targetLetters = targetWord.split('');
  
  // Vérifier d'abord les lettres correctes
  for (let i = 0; i < wordLength; i++) {
    if (attempt[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null; // Marquer comme utilisée
    }
  }
  
  // Ensuite vérifier les lettres présentes mais mal placées
  for (let i = 0; i < wordLength; i++) {
    if (result[i] !== 'correct') {
      const letterIndex = targetLetters.indexOf(attempt[i]);
      if (letterIndex !== -1) {
        result[i] = 'present';
        targetLetters[letterIndex] = null; // Marquer comme utilisée
      }
    }
  }
  
  return result;
};

// Fonction pour mettre à jour le statut du clavier
export const updateKeyboardStatus = (attempt, result, keyboardStatus, wordLength) => {
  const newStatus = { ...keyboardStatus };
  
  for (let i = 0; i < wordLength; i++) {
    const letter = attempt[i];
    const status = result[i];
    
    // Ne pas modifier si déjà marqué comme correct
    if (newStatus[letter] === 'correct') continue;
    
    // Ne pas dégrader une lettre de "present" à "absent"
    if (newStatus[letter] === 'present' && status === 'absent') continue;
    
    newStatus[letter] = status;
  }
  
  return newStatus;
};

export const getRandomWord = async (length) => {
  try {
    const response = await fetch(`http://localhost:3001/api/words/random/${length}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération d\'un mot');
    }
    
    const data = await response.json();
    return data.word;
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Vous pouvez également ajouter une fonction pour valider les tentatives
export const isValidWord = async (word) => {
  try {
    const response = await fetch(`http://localhost:3001/api/words/validate/${word}`);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Erreur lors de la validation du mot:', error);
    return true; // En cas d'erreur, considérer le mot comme valide pour ne pas bloquer le jeu
  }
};