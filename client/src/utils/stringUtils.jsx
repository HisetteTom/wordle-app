/**
 * Fonction pour supprimer les accents d'une chaîne de caractères
 * @param {string} str - La chaîne à normaliser
 * @return {string} - La chaîne sans accents
 */
export function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Cette fonction utilise l'API locale pour trouver la forme accentuée d'un mot
 * @param {string} word - Le mot sans accent
 * @returns {Promise<string>} - Une promesse qui résout au mot avec accents
 */
export async function findAccentedWord(word) {
  const normalizedWord = word.toLowerCase();
  console.log(`Recherche d'accents pour: ${normalizedWord}`);
  
  try {
    // URL dynamique selon l'environnement
    const apiBaseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:10000/api'
      : 'https://wordle-app-gym5.onrender.com/api';
    
    const response = await fetch(`${apiBaseUrl}/words/accentuate/${normalizedWord}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.word) {
        console.log(`Mot trouvé avec accents: ${data.word}`);
        return data.word;
      }
    }
    
    // Si l'API ne trouve rien, retourner le mot original
    console.log(`Aucun accent trouvé pour ${normalizedWord}`);
    return normalizedWord;
  } catch (error) {
    console.error("Erreur lors de la recherche du mot accentué:", error);
    return normalizedWord;
  }
}