import React from "react";

function UserStats({ userStats }) {
  return (
    <div className="absolute top-4 right-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Profil</h3>
        {userStats.isGuest ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Joueur:</span> {userStats.displayName}
            </p>
            <p className="text-sm text-red-600">
              Connectez-vous pour enregistrer <br></br> vos stats !
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Joueur:</span> {userStats.displayName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Parties jouées:</span> {userStats.gamesPlayed}
            </p>
            <p className="text-sm">
              <span className="font-medium">Parties gagnées:</span> {userStats.gamesWon}
            </p>
            <p className="text-sm">
              <span className="font-medium">Score:</span> {userStats.score}
            </p>
            <p className="text-sm">
              <span className="font-medium">Taux de victoire:</span>{" "}
              {userStats.gamesPlayed > 0
                ? `${Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)}%`
                : "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserStats;