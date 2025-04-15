# Wordle - Jeu de mots en français

## Jouer en ligne

Vous pouvez jouer directement en ligne sans installation sur notre site:
**[https://wordle-game-822bb.web.app](https://wordle-game-822bb.web.app)**

Le site hébergé propose toutes les fonctionnalités, y compris l'authentification et le classement. (Cependant le server si non utilisé est inactif. Donc lors de la premiere partie il y a une attente significative ~30s avant de pouvoir valider le premier mot. Mais le gameplay devrait etre très fluide durant le reste de l'utilisation. Cela provient du fait que le backend est hébergé sur un site gratuit)

## Description du projet

Wordle est une application web de jeu de devinettes de mots en français, inspirée du célèbre jeu Wordle. Le but est de deviner un mot en un minimum d'essais avec comme seuls indices la présence et position des lettres. Cette application offre une expérience de jeu complète avec un mode solo, un dictionnaire intégré, et un système de classement.

Le jeu propose plusieurs niveaux de difficulté en fonction de la longueur du mot à deviner (de 4 à 9 lettres), un système d'authentification pour enregistrer vos progrès, et des indications visuelles pour vous aider dans votre progression.

## Fonctionnalités principales

- **Jeu Wordle complet et personnalisable**
  - Choix de la longueur du mot (4 à 9 lettres)
  - 7 essais maximum pour trouver le mot
  - Indications visuelles (lettres vertes, jaunes, grises)
  - Animations et feedback utilisateur

- **Système d'indices**
  - Indices de différents types (première/dernière lettre, syllabes, etc.)
  - Pénalité de score lors de l'utilisation d'indices

- **Dictionnaire intégré**
  - Recherche de définitions de mots
  - Affichage des définitions des mots à la fin d'une partie
  - Historique des recherches récentes

- **Système d'authentification**
  - Création de compte avec email/mot de passe
  - Connexion/déconnexion
  - Profil utilisateur avec statistiques

- **Statistiques et classement**
  - Suivi des parties jouées/gagnées
  - Calcul de score basé sur la difficulté et les performances
  - Classement des 10 meilleurs joueurs
  - Animation de score en fin de partie

- **Interface utilisateur soignée**
  - Design responsive
  - Animations fluides
  - Arrière-plan animé avec réseau de mots
  - Mode jour exclusivement

## Technologies utilisées

- **Frontend**:
  - React.js avec Vite
  - Tailwind CSS pour le style
  - Heroicons pour les icônes
  - Firebase pour l'authentification côté client

- **Backend**:
  - Node.js avec Express
  - Dictionnaires français personnalisés
  - API de définition de mots

- **Base de données**:
  - Firebase Firestore pour les données utilisateurs
  - Stockage de fichiers pour les dictionnaires

## Instructions pour jouer localement

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

### Installation rapide

> [!CAUTION]
> Si vous utiliser un CPU ARM: Si vous avez des erreurs lors des `npm install`, supprimer le fichier `package-lock.json` et retaper la commande `npm install`

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/HisetteTom/wordle-app.git
   cd wordle-app
   ```

2. **Démarrer le client et le serveur**

   Dans un premier terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```

   Dans un second terminal:
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Jouer au jeu**
   - Ouvrir un navigateur et aller à `http://localhost:5173`
   - Vous pouvez maintenant jouer au jeu localement

### Remarque sur l'authentification

Pour jouer localement, **l'authentification Firebase n'est pas nécessaire à configurer**. Le jeu est entièrement fonctionnel sans cela:
- ✅ Toutes les fonctionnalités de base du jeu fonctionnent (tous les niveaux de difficulté, indices, etc.)
- ✅ Le dictionnaire intégré est pleinement fonctionnel
- ❌ La création de compte/connexion ne fonctionnera pas
- ❌ Les scores ne seront pas sauvegardés entre les sessions
- ❌ Le classement n'affichera pas de données réelles

## Configuration de Firebase (optionnel)

Si vous souhaitez activer l'authentification et les fonctionnalités en ligne pour votre instance locale, suivez ces étapes:

1. **Créer un projet Firebase**
   - Allez sur **[Firebase Console](https://console.firebase.google.com/)**
   - Cliquez sur "Ajouter un projet" et suivez les instructions
   
2. **Configurer l'authentification**
   - Dans votre projet Firebase, allez dans "Authentication" dans le menu **Créer** à gauche
   - Cliquez sur "Commencer" puis activez seulement la méthode "Adresse e-mail/Mot de passe". N'activez pas l'option supplémentaire pour se connecter sans mot de passe avec un email.
   
3. **Créer une base de données Firestore**
   - Dans le menu **Créer** de gauche, allez dans "Firestore Database"
   - Cliquez sur "Créer une base de données"
   - - Sélectionnez la région la plus proche de vous (si disponible sinon laisser vide)
   - Choisissez le mode "production" ou "test"
   
4. **Obtenez les informations de configuration**
   - Allez dans les paramètres du projet, via l'icone à côté de l'onglet vue d'ensemble du projet
   - Sélectionnez "Paramètres du projet"
   - Faites défiler jusqu'à "Vos applications" et cliquez sur l'icône Web
   - Enregistrez les informations de configuration Firebase

5. **Mettez à jour les fichier de configuration**
   - Modifiez le fichier `client/src/firebase.js` avec vos informations:
   ```javascript
   const firebaseConfig = {
     apiKey: "VOTRE_API_KEY",
     authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
     projectId: "VOTRE_PROJECT_ID",
     storageBucket: "VOTRE_PROJECT_ID.appspot.com",
     messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
     appId: "VOTRE_APP_ID"
   };
   ```

   - Modifiez le fichier `client/.firebaserc` avec vos informations : 

    ```javascript
    {
        "projects": {
            "default": "VOTRE_NOM_DE_PROJET"
        }
    }
    ```
    > [!NOTE]  
    > Le nom du projet est directement disponible dans la barre de recherche. Par exemple le mien est wordle-game-822bb

6. **Configuration des règles Firestore**
   - Dans "Firestore Database" > "Règles"
   - Mettez à jour les règles pour autoriser l'authentification:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       match /users/{userId} {
         allow read;
         allow write: if request.auth != null;
       }
     }
   }
   ```

7. **Redémarrez le client**
   ```bash
   cd client
   npm run dev
   ```

## Membres

- Delasalle Tom
- Forest--Lecigne Eliot
- Hisette Tom
