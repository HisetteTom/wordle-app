import React, { useState, useEffect } from "react";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { dictionaryService } from "../services/api";
import { removeAccents } from "../utils/stringUtils";
import Header from "./Header";
import WordNetworkBackground from "./WordNetworkBackground";
import { useAuth } from "../AuthContext";

const DictionaryPage = ({ onBack, initialSearchTerm = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const { currentUser, isAuthenticated } = useAuth();

  const searchWord = async (word) => {
    if (!word.trim()) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const data = await dictionaryService.getDefinition(word);
      
      const formattedDefinition = {
        word: data.word,
        category: data.category,
        definitions: [data.definition],
      };
  
      setDefinition(formattedDefinition);
      
      if (!recentSearches.includes(word)) {
        const newSearches = [word, ...recentSearches.slice(0, 4)];
        setRecentSearches(newSearches);
        localStorage.setItem("wordleRecentSearches", JSON.stringify(newSearches));
      }
    } catch (error) {
      try {
        const normalizedWord = removeAccents(word.toLowerCase());
        const data = await dictionaryService.getDefinitionByNormalized(normalizedWord);
        
        setDefinition({
          word: data.word,
          category: data.category,
          definitions: [data.definition],
          original: word
        });
      } catch (innerError) {
        setError(`Le mot "${word}" n'a pas été trouvé dans notre dictionnaire.`);
        setDefinition(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearchTerm) {
      searchWord(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    const savedSearches = localStorage.getItem("wordleRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchWord(searchTerm.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Animation d'arrière-plan */}
      <WordNetworkBackground />
      
      {/* Header commun à toutes les pages */}
      <Header
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onNavigateHome={onBack}
        onNavigateToDictionary={() => {}}
      />
      
      {/* Espacement pour compenser le header fixe */}
      <div className="h-16"></div>
      
      {/* Contenu principal */}
      <div className="max-w-5xl w-full mx-auto z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 text-indigo-600" />
            <span className="text-indigo-700">Retour au jeu</span>
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Dictionnaire
          </h1>
        </div>

        <div className="w-full backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-indigo-100/40 bg-white/80 mb-6">
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un mot..."
              className="flex-grow py-3 px-4 border border-indigo-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-5 rounded-r-lg hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center shadow-md"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              <span>Rechercher</span>
            </button>
          </form>

          {recentSearches.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-indigo-700 font-medium">Recherches récentes:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchTerm(term);
                      searchWord(term);
                    }}
                    className="text-sm bg-gradient-to-br from-indigo-50 to-white text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 hover:shadow-sm transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-100/40 bg-white/80">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-300 border-t-indigo-600"></div>
              <span className="ml-3 text-indigo-700">Recherche en cours...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <p className="text-red-600">{error}</p>
                <p className="mt-2 text-sm text-red-500">
                  Essayez un autre mot ou vérifiez l'orthographe
                </p>
              </div>
            </div>
          ) : definition ? (
            <div className="animate-fadeIn">
              <div className="border-b border-indigo-100 pb-4 mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 text-transparent bg-clip-text">
                  {definition.word}
                </h2>
                {definition.category && (
                  <div className="flex items-center mt-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      {definition.category}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Définition
                </h3>
                <div className="bg-indigo-50/50 rounded-lg p-4">
                  <ul className="list-disc pl-5 space-y-3">
                    {definition.definitions.map((def, index) => (
                      <li key={index} className="text-gray-700">
                        {def}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <div className="bg-indigo-50/50 p-6 rounded-lg border border-indigo-100">
                <BookOpenIcon className="h-16 w-16 mx-auto text-indigo-400 mb-3" />
                <p className="text-indigo-700 text-lg">
                  Recherchez un mot pour afficher sa définition
                </p>
                <p className="mt-2 text-indigo-600/70 text-sm">
                  Entrez un mot dans la barre de recherche ci-dessus
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full mt-6 text-center text-indigo-500/70 text-xs">
          <p className="bg-white/60 backdrop-blur-sm py-2 px-4 rounded-lg inline-block">
            Définitions fournies par{" "}
            <a
              href="https://fr.wiktionary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline transition-colors"
            >
              Wiktionary
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DictionaryPage;