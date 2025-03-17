import React, { useState, useEffect } from "react";
import GamePage from "./GamePage";
import DictionaryPage from "./components/DictionaryPage";
import AuthModal from "./AuthModal";
import { AuthProvider, useAuth } from "./AuthContext";
import { logoutUser, db } from "./firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import {
  ArrowRightOnRectangleIcon,
  UserIcon,
  TrophyIcon,
  BookOpenIcon, // Ajout de l'icône pour le dictionnaire
} from "@heroicons/react/24/outline";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedLength, setSelectedLength] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const wordleLengths = [4, 5, 6, 7, 8, 9];
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  const { currentUser, isAuthenticated } = useAuth();

  // Charger le classement depuis Firestore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoadingLeaderboard(true);
        console.log("Chargement du classement...");
        
        // Créer une requête pour récupérer tous les utilisateurs (pas seulement ceux avec un score)
        const leaderboardQuery = query(
          collection(db, "users"),
          orderBy("score", "desc"),
          limit(10)
        );
        
        const querySnapshot = await getDocs(leaderboardQuery);
        console.log(`Nombre de documents récupérés: ${querySnapshot.size}`);
        
        const leaderboardData = [];
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          console.log(`Utilisateur: ${userData.displayName || "Sans nom"}, Score: ${userData.score || 0}`);
          
          leaderboardData.push({
            id: doc.id,
            displayName: userData.displayName || "Utilisateur",
            score: userData.score || 0,
            isCurrentUser: currentUser ? doc.id === currentUser.uid : false
          });
        });
        
        // Si aucun utilisateur n'est trouvé avec un score, essayons d'afficher au moins ceux qui existent
        if (leaderboardData.length === 0) {
          console.log("Aucun utilisateur avec score trouvé, on récupère tous les utilisateurs");
          const allUsersQuery = query(
            collection(db, "users"),
            limit(10)
          );
          
          const allUsersSnapshot = await getDocs(allUsersQuery);
          console.log(`Nombre d'utilisateurs (sans tri par score): ${allUsersSnapshot.size}`);
          
          allUsersSnapshot.forEach((doc) => {
            const userData = doc.data();
            console.log(`Utilisateur (sans tri): ${userData.displayName || "Sans nom"}, Score: ${userData.score || 0}`);
            
            leaderboardData.push({
              id: doc.id,
              displayName: userData.displayName || "Utilisateur",
              score: userData.score || 0,
              isCurrentUser: currentUser ? doc.id === currentUser.uid : false
            });
          });
        }
        
        setLeaderboard(leaderboardData);
        console.log(`Classement final: ${leaderboardData.length} joueurs`);
      } catch (error) {
        console.error("Erreur lors de la récupération du classement:", error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [currentUser]); // Recharger quand l'utilisateur change

  const handleButtonClick = (length) => {
    console.log(`${length} lettres choisi`);
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

  if (currentPage === "game" && selectedLength) {
    return (
      <GamePage 
        wordLength={selectedLength} 
        onBack={handleBackToHome}
        onOpenDictionary={handleNavigateToDictionary} // Passer la fonction de navigation
      />
    );
  }

  if (currentPage === "dictionary") {
    return <DictionaryPage onBack={handleBackToGame} />;
  }

  // Sinon, afficher la page d'accueil
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center drop-shadow-lg relative">
      {/* Bouton de connexion/déconnexion en haut à droite */}
      <div className="absolute top-4 right-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <button
              onClick={handleLogoutClick}
              className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="font-medium text-gray-700">Deconnexion</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLoginClick}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
            <span className="font-medium text-gray-700">Se connecter</span>
          </button>
        )}
      </div>

      {/* Bouton du dictionnaire en haut à gauche */}
      <div className="absolute top-4 left-4">
        <button
          onClick={handleNavigateToDictionary}
          className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <BookOpenIcon className="h-5 w-5 mr-2 text-blue-600" />
          <span className="font-medium text-blue-700">Dictionnaire</span>
        </button>
      </div>

      {/* Carte principale centrée */}
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          WORDLE
        </h1>
        <div className="h-1 w-40 bg-gray-400 mx-auto mb-8"></div>
        
        <p className="text-gray-700 text-center mb-10">
          Devinez le mot en un minimum d'essais. Choisissez la longueur du mot
          pour commencer.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8" id="length-buttons">
          {wordleLengths.map((length) => (
            <button
              key={length}
              className="py-3 px-4 rounded-md text-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => handleButtonClick(length)}
            >
              {length} lettres
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-gray-700 font-semibold mb-2 text-center">
            Comment jouer
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Devinez le mot en 7 essais. Après chaque essai, les couleurs des
            lettres changeront pour montrer à quel point votre proposition était
            proche du mot.
          </p>  
        </div>
      </div>

      {/* Tableau des meilleurs scores */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 max-w-xs w-72 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-2">
          <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Classement
          </h2>
        </div>
        <div className="h-1 w-32 bg-gray-400 mx-auto mb-6"></div>
        
        {isLoadingLeaderboard ? (
          <div className="text-center py-4">
            <svg className="animate-spin h-8 w-8 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-gray-500 italic">
            Aucun score disponible pour le moment.
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joueur</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((player, index) => (
                  <tr 
                    key={player.id}
                    className={`
                      ${player.isCurrentUser ? 'bg-black-800' : ''}
                      hover:bg-gray-50 transition-colors
                    `}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className={`${player.isCurrentUser ? 'font-bold text-black' : ''}`}>
                        {player.displayName}
                        {player.isCurrentUser && (
                          <span className="ml-2 text-xs font-medium text-black">(vous)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-right font-medium">
                      <span className={`${player.isCurrentUser ? 'font-bold text-black' : 'text-gray-900'}`}>
                        {player.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'authentification */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;