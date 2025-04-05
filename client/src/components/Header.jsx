import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  UserIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Header = ({
  isAuthenticated,
  currentUser,
  onLogin,
  onLogout,
  onNavigateHome,
  onNavigateToDictionary,
}) => {
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    score: 0,
    loading: true,
  });
  const [statsOpen, setStatsOpen] = useState(false);

  // Récupérer les statistiques de l'utilisateur au chargement
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) {
        setUserStats((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserStats({
            gamesPlayed: userData.gamesPlayed || 0,
            gamesWon: userData.gamesWon || 0,
            score: userData.score || 0,
            loading: false,
          });
        } else {
          setUserStats((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
        setUserStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchUserStats();
  }, [currentUser]);

  // Calculer le taux de victoire
  const winRate =
    userStats.gamesPlayed > 0
      ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)
      : 0;

  // Formater le score avec séparateurs de milliers
  const formattedScore = new Intl.NumberFormat("fr-FR").format(userStats.score);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-r from-indigo-300/95 via-indigo-200/95 to-indigo-300/95 backdrop-blur-md shadow-lg px-4 py-3 border-b border-indigo-200/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Section gauche: Dictionnaire et statistiques */}
        <div className="flex items-center space-x-4 w-1/3">
          <button
            onClick={onNavigateToDictionary}
            className="flex items-center px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-indigo-200 shadow-sm transition-colors text-sm"
          >
            <BookOpenIcon className="h-4 w-4 mr-1 text-indigo-700" />
            <span className="text-indigo-800">Dictionnaire</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setStatsOpen(!statsOpen)}
              className={`px-3 py-1.5 rounded-lg shadow-sm text-sm transition-colors ${
                statsOpen
                  ? "bg-indigo-200 text-indigo-800 border border-indigo-300"
                  : "bg-white/80 text-indigo-800 border border-indigo-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                <span>Statistiques</span>
              </div>
            </button>
          )}

          {/* Panneau des statistiques */}
          {statsOpen && (
            <div className="absolute top-full left-4 mt-1 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-xl border border-indigo-100 p-4 w-64 animate-fadeIn">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-100">
                <h3 className="font-medium text-indigo-700">
                  Vos statistiques
                </h3>
                <TrophyIcon className="h-5 w-5 text-amber-500" />
              </div>

              {userStats.loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between px-1">
                    <span className="text-sm text-gray-600">
                      Parties jouées
                    </span>
                    <span className="font-medium">{userStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-sm text-gray-600">
                      Parties gagnées
                    </span>
                    <span className="font-medium">{userStats.gamesWon}</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-sm text-gray-600">
                      Taux de victoire
                    </span>
                    <span className="font-medium">{winRate}%</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Score total
                      </span>
                      <span
                        className={`font-bold text-lg ${
                          userStats.score < 0
                            ? "text-red-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {formattedScore}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section centrale: Logo WORDLE */}
        <div className="flex justify-center items-center w-1/3">
          <button
            onClick={onNavigateHome}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 text-transparent bg-clip-text flex items-center"
          >
            <HomeIcon className="h-6 w-6 text-indigo-700 mr-2" />
            WORDLE
          </button>
        </div>

        {/* Section droite: Connexion/utilisateur */}
        <div className="flex items-center justify-end space-x-3 w-1/3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center rounded-lg bg-gradient-to-r from-white/90 to-indigo-50/90 px-3 py-1.5 border border-indigo-100">
                <span className="text-sm text-gray-700 mr-2 truncate max-w-[120px]">
                  {currentUser?.displayName || currentUser?.email}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-600 border border-red-100"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <UserIcon className="h-4 w-4 mr-1.5" />
              <span>Se connecter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
