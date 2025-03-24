import { diacriticsMap } from 'diacritics-map';

/**
 * Fonction pour supprimer les accents d'une chaîne de caractères
 * @param {string} str - La chaîne à normaliser
 * @return {string} - La chaîne sans accents
 */
export function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Cette fonction utilise l'API du dictionnaire pour trouver la forme accentuée d'un mot
 * @param {string} word - Le mot sans accent
 * @returns {Promise<string>} - Une promesse qui résout au mot avec accents
 */
export async function findAccentedWord(word) {
  try {
    // Appel à une API publique de dictionnaire français
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/fr/${word.toLowerCase()}`);
    
    if (!response.ok) {
      return word.toLowerCase(); // Par défaut, retourner le mot d'origine
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      // L'API renvoie le mot correctement orthographié avec ses accents
      return data[0].word;
    }
    
    return word.toLowerCase();
  } catch (error) {
    console.error("Erreur lors de la recherche du mot accentué:", error);
    return word.toLowerCase();
  }
}