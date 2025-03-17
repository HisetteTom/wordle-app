import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAwD-kXjbvDSZYPE11XpAbJ6sYVV1Ray2A",
    authDomain: "wordle-game-822bb.firebaseapp.com",
    projectId: "wordle-game-822bb",
    storageBucket: "wordle-game-822bb.firebasestorage.app",
    messagingSenderId: "918251894413",
    appId: "1:918251894413:web:7f29a25141ad16cc4054c4",
    measurementId: "G-9T7VN0HTJ9"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fonction pour l'inscription avec nom d'utilisateur
export const registerUser = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Ajouter le nom d'utilisateur au profil
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Créer un document utilisateur dans Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        displayName: displayName,
        createdAt: new Date(),
        gamesPlayed: 0,
        gamesWon: 0,
        score: 0
      });
      
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return { user: null, error };
    }
  };

// Fonction pour la connexion
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Fonction pour la déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

// Exporter les objets Firebase
export { app, auth, db };