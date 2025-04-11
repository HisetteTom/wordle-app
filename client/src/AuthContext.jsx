import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Contexte pour gérer l'authentification dans toute l'application
export const AuthContext = createContext();

// Hook pour accéder facilement au contexte d'authentification
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Surveille les changements d'état de connexion Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Nettoyage lors du démontage du composant
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
