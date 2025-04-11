// Composant principal de l'application Wordle
import React, { useState, useEffect } from "react";
import GamePage from "./GamePage";
import DictionaryPage from "./components/DictionaryPage";
import AuthModal from "./AuthModal";
import { AuthProvider, useAuth } from "./AuthContext";
import { logoutUser, db } from "./firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import {
  TrophyIcon,
  SparklesIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import Header from "./components/Header";
import WordNetworkBackground from "./components/WordNetworkBackground";

function AppContent() {
  // État de l'application
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedLength, setSelectedLength] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const wordleLengths = [4, 5, 6, 7, 8, 9]; // Longueurs de mot disponibles

  const { currentUser, isAuthenticated } = useAuth();

  // Récupération du classement depuis Firestore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoadingLeaderboard(true);
        const leaderboardQuery = query(
          collection(db, "users"),
          orderBy("score", "desc"),
          limit(10)
        );

        const querySnapshot = await getDocs(leaderboardQuery);
        const leaderboardData = querySnapshot.docs.map((doc) => {
          const userData = doc.data();
          return {
            id: doc.id,
            displayName: userData.displayName || "Utilisateur",
            score: userData.score || 0,
            isCurrentUser: currentUser ? doc.id === currentUser.uid : false,
          };
        });

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Erreur lors de la récupération du classement:", error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [currentUser]);

  // Handlers pour la navigation
  const handleButtonClick = (length) => {
    setSelectedLength(length);
    setCurrentPage("game");
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleLogoutClick = async () => {
    const result = await logoutUser();
    if (result.error) {
      console.error("Erreur deco:", result.error);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    setSelectedLength(null);
  };

  const handleNavigateToDictionary = () => {
    setCurrentPage("dictionary");
  };

  const handleBackToGame = () => {
    setCurrentPage("game");
  };

  // Navigation conditionnelle vers la page de jeu
  if (currentPage === "game" && selectedLength) {
    return (
      <GamePage
        wordLength={selectedLength}
        onBack={handleBackToHome}
        onOpenDictionary={handleNavigateToDictionary}
      />
    );
  }

  // Navigation conditionnelle vers le dictionnaire
  if (currentPage === "dictionary") {
    return <DictionaryPage onBack={handleBackToGame} />;
  }

  // Page d'accueil
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Animation d'arrière-plan */}
      <WordNetworkBackground />

      {/* Header avec navigation */}
      <Header
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogin={handleLoginClick}
        onLogout={handleLogoutClick}
        onNavigateHome={handleBackToHome}
        onNavigateToDictionary={handleNavigateToDictionary}
      />

      <div className="h-16"></div>

      <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row gap-8 items-stretch z-10">
        {/* Carte principale avec sélection du jeu */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40">
          <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="h-8 w-8 text-amber-500 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              WORDLE
            </h1>
            <SparklesIcon className="h-8 w-8 text-amber-500 ml-3" />
          </div>

          <div className="h-1 w-48 bg-gradient-to-r from-indigo-300 to-purple-300 mx-auto mb-8 rounded-full"></div>

          <p className="text-gray-700 text-center mb-8 text-lg">
            Devinez le mot en un minimum d'essais. Choisissez la longueur du mot
            pour commencer votre aventure lexicale.
          </p>

          {/* Boutons de sélection de la longueur du mot */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {wordleLengths.map((length) => (
              <button
                key={length}
                onClick={() => handleButtonClick(length)}
                className="py-4 px-6 rounded-xl text-lg font-medium transition-all duration-300 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-md hover:shadow-lg hover:scale-105 hover:border-indigo-300 flex flex-col items-center justify-center"
              >
                <span className="text-2xl font-bold text-indigo-600">
                  {length}
                </span>
                <span className="text-gray-600">lettres</span>
              </button>
            ))}
          </div>

          {/* Instructions de jeu */}
          <div className="border-t border-indigo-100 pt-6 px-3">
            <div className="flex items-center justify-center mb-3">
              <AcademicCapIcon className="h-6 w-6 text-indigo-500 mr-2" />
              <h2 className="text-xl font-bold text-indigo-700">
                Comment jouer
              </h2>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Devinez le mot en 7 essais ou moins.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Les lettres correctes à la bonne position deviendront
                    vertes.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Les lettres correctes à la mauvaise position seront jaunes.
                  </span>
                </li>
                <li className="flex items-start">
                  <LightBulbIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Des indices sont disponibles pour vous aider, mais ils
                    réduisent votre score.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tableau de classement */}
        <div className="md:w-80 w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/40">
          <div className="flex items-center justify-center mb-4">
            <TrophyIcon className="h-6 w-6 text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-transparent bg-clip-text">
              Classement
            </h2>
          </div>

          <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-yellow-300 mx-auto mb-6 rounded-full"></div>

          {/* Affichage conditionnel du classement */}
          {isLoadingLeaderboard ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin h-10 w-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full"></div>
              <p className="mt-3 text-gray-600">Chargement...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-amber-700">
                  Aucun score disponible pour le moment.
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  Soyez le premier à jouer !
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Joueur
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leaderboard.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`
                      ${
                        player.isCurrentUser
                          ? "bg-indigo-50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }
                      transition-colors hover:bg-indigo-50/50
                    `}
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-center">
                        <div
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full 
                        ${
                          index < 3
                            ? index === 0
                              ? "bg-amber-100 text-amber-700"
                              : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-50 text-amber-800"
                            : "text-gray-700"
                        }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        <div
                          className={`${
                            player.isCurrentUser
                              ? "font-bold text-indigo-700"
                              : "text-gray-700"
                          }`}
                        >
                          {player.displayName}
                          {player.isCurrentUser && (
                            <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                              vous
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-bold">
                        <span
                          className={`${
                            player.isCurrentUser
                              ? "text-indigo-700"
                              : "text-gray-900"
                          }`}
                        >
                          {player.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Connectez-vous pour sauvegarder votre score et apparaître dans le
              classement !
            </p>
          </div>
        </div>
      </div>

      {/* Modal d'authentification */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

// Wrapper avec contexte d'authentification
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
