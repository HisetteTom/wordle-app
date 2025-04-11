import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { registerUser, loginUser } from "./firebase";

function AuthModal({ onClose }) {
  // États du formulaire
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pour éviter les fuites mémoire avec le portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Traitement du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = isLogin
        ? await loginUser(email, password)
        : await registerUser(email, password, displayName);

      if (result.error) {
        let errorMessage = "Une erreur s'est produite.";

        // Messages d'erreur personnalisés
        switch (result.error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Cet email est déjà utilisé.";
            break;
          case "auth/invalid-email":
            errorMessage = "Email invalide.";
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Email ou mot de passe incorrect.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Le mot de passe doit contenir au moins 6 caractères.";
            break;
          default:
            errorMessage = `Erreur: ${result.error.message}`;
        }

        setError(errorMessage);
        setLoading(false);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  };

  // Structure de la modale
  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl"
        style={{
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          transform: "scale(1)",
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? "Connexion" : "Inscription"}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ nom seulement pour l'inscription */}
          {!isLogin && (
            <div>
              <label htmlFor="displayName" className="block text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading
              ? "Chargement..."
              : isLogin
              ? "Se connecter"
              : "S'inscrire"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-700 hover:text-gray-900 underline"
          >
            {isLogin
              ? "Pas de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  // Rendu via portal pour afficher au-dessus de tout
  return mounted ? ReactDOM.createPortal(modalContent, document.body) : null;
}

// Animation de la modale
const globalStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
`;

// Injection des styles
const injectGlobalStyles = () => {
  const styleElement = document.createElement("style");
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
  return () => {
    document.head.removeChild(styleElement);
  };
};

// Composant final avec styles
function EnhancedAuthModal(props) {
  useEffect(() => {
    return injectGlobalStyles();
  }, []);

  return <AuthModal {...props} />;
}

export default EnhancedAuthModal;
