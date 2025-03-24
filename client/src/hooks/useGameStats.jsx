import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

export function useGameStats(currentUser, onStatsUpdated, wordLength, hintsUsed) {
  const updateUserStats = async (isWin, attemptNumber) => {
    if (!currentUser) return;

    try {
      console.log("Mise à jour des stats...");
      const userRef = doc(db, "users", currentUser.uid);

      if (isWin) {
        // Calcul du score: longueur du mot * 10 / nombre d'essais (arrondi au supérieur)
        let scoreToAdd = Math.ceil((wordLength * 10) / attemptNumber);

        // Appliquer la pénalité pour les indices utilisés: -5 points par indice
        const hintPenalty = hintsUsed * 5;
        scoreToAdd = Math.max(0, scoreToAdd - hintPenalty);

        console.log(
          `Indices utilisés: ${hintsUsed}, pénalité: -${hintPenalty} points`
        );

        await updateDoc(userRef, {
          gamesPlayed: increment(1),
          gamesWon: increment(1),
          score: increment(scoreToAdd),
        });

        console.log(`Partie gagnée! +${scoreToAdd} points (indices)`);

        // Propager les nouvelles statistiques au composant parent
        if (onStatsUpdated) {
          onStatsUpdated({
            gamesPlayed: 1,
            gamesWon: 1,
            score: scoreToAdd,
          });
        }
      } else {
        // Si le joueur perd, on incrémente seulement le nombre de parties jouées
        await updateDoc(userRef, {
          gamesPlayed: increment(1),
        });

        console.log(`Looser.`);

        // Propager les nouvelles statistiques au composant parent
        if (onStatsUpdated) {
          onStatsUpdated({
            gamesPlayed: 1,
            gamesWon: 0,
            score: 0,
          });
        }
      }
    } catch (error) {
      console.error("Erreur maj stat:", error);
    }
  };

  return { updateUserStats };
}