import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { dictionaryService } from "../services/api";
import { removeAccents } from "../utils/stringUtils";

const DictionaryPage = ({ onBack, initialSearchTerm = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);

  const searchWord = async (word) => {
    if (!word.trim()) return;
  
    setLoading(true);
    setError(null);
  
    try {
      // Tentative 1: recherche directe du mot tel quel
      console.log("Tentative 1: recherche directe de", word);
      const data = await dictionaryService.getDefinition(word);
  
      // Si trouvé, afficher la définition
      const formattedDefinition = {
        word: data.word,
        category: data.category,
        definitions: [data.definition],
      };
  
      setDefinition(formattedDefinition);
      
      // Ajouter aux recherches récentes
      if (!recentSearches.includes(word)) {
        const newSearches = [word, ...recentSearches.slice(0, 4)];
        setRecentSearches(newSearches);
        localStorage.setItem("wordleRecentSearches", JSON.stringify(newSearches));
      }
    } catch (error) {
      console.error("Recherche directe échouée:", error);
  
      try {
        // Tentative 2: chercher parmi les mots disponibles un mot qui correspond après normalisation
        console.log("Tentative 2: recherche par normalisation pour", word);
        
        // Si nous avons des mots disponibles dans le dictionnaire
        if (availableWords && availableWords.length > 0) {
          const normalizedSearchTerm = removeAccents(word.toLowerCase());
          
          // Chercher un mot dans le dictionnaire qui, une fois les accents retirés, correspond au terme recherché
          const matchingWord = availableWords.find(dictWord => 
            removeAccents(dictWord.toLowerCase()) === normalizedSearchTerm
          );
          
          if (matchingWord) {
            console.log("Mot correspondant trouvé:", matchingWord);
            
            // Rechercher la définition du mot avec accents trouvé
            const data = await dictionaryService.getDefinition(matchingWord);
            
            setDefinition({
              word: data.word,
              category: data.category,
              definitions: [data.definition],
              original: word // Garder le mot original pour référence
            });
            
            return; // Sortir de la fonction car recherche réussie
          }
        }
        
        // Si on n'a pas trouvé de correspondance dans la liste locale,
        // essayer l'API spéciale pour les mots normalisés
        console.log("Tentative 3: API spéciale pour normalisation");
        const normalizedWord = removeAccents(word.toLowerCase());
        const data = await dictionaryService.getDefinitionByNormalized(normalizedWord);
        
        setDefinition({
          word: data.word,
          category: data.category,
          definitions: [data.definition],
          original: word
        });
      } catch (innerError) {
        console.error("Toutes les tentatives ont échoué:", innerError);
        setError(`Le mot "${word}" n'a pas été trouvé dans notre dictionnaire.`);
        setDefinition(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Ajoutez cet effet après les autres useEffect existants
  useEffect(() => {
    // Recherche automatique si un terme initial est fourni
    if (initialSearchTerm) {
      searchWord(initialSearchTerm);
    }
  }, [initialSearchTerm]); // Ce useEffect s'exécute uniquement lorsque initialSearchTerm change

  // Charger les mots disponibles au démarrage
  useEffect(() => {
    const loadAvailableWords = async () => {
      try {
        const words = await dictionaryService.getAvailableWords();
        setAvailableWords(words);
      } catch (err) {
        console.error("Erreur lors du chargement des mots disponibles:", err);
      }
    };

    loadAvailableWords();
  }, []);

  // Fonction pour chercher un mot via notre API


  // Charger l'historique de recherche au chargement de la page
  useEffect(() => {
    const savedSearches = localStorage.getItem("wordleRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Gérer le submit du formulaire de recherche
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchWord(searchTerm.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4 md:p-8">
      {/* Bouton retour en haut à gauche */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1 text-gray-600" />
          <span>Retour au jeu</span>
        </button>
      </div>

      {/* Titre de la page */}
      <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center flex items-center justify-center">
        <BookOpenIcon className="h-8 w-8 mr-2" />
        Dictionnaire Français
      </h1>

      {/* Formulaire de recherche */}
      <div className="w-full max-w-xl mx-auto mb-8">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un mot..."
            className="flex-grow py-2 px-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
            <span>Rechercher</span>
          </button>
        </form>

        {/* Recherches récentes */}
        {recentSearches.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Recherches récentes:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    searchWord(term);
                  }}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-6">
            <p>{error}</p>
            <p className="mt-2 text-sm">
              Essayez un autre mot ou vérifiez l'orthographe
            </p>
          </div>
        ) : definition ? (
          <div className="animate-fadeIn">
            {/* En-tête avec le mot recherché */}
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {definition.word}
              </h2>
              {definition.category && (
                <p className="text-gray-600 italic">{definition.category}</p>
              )}
            </div>

            {/* Définition principale */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Définition
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {definition.definitions.map((def, index) => (
                  <li key={index} className="text-gray-700">
                    {def}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2">
              Recherchez un mot pour afficher sa définition
            </p>
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl mx-auto mt-6 text-center text-gray-400 text-xs">
        <p>
          Définitions fournies par{" "}
          <a
            href="https://fr.wiktionary.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-500 underline"
          >
            Wiktionary
          </a>
        </p>
      </div>
    </div>
  );
};

export default DictionaryPage;
