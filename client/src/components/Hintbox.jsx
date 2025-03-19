import React, { useState, useEffect } from "react";
import { LightBulbIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const HintBox = ({ targetWord, onHintUsed }) => {
  const [hintsRevealed, setHintsRevealed] = useState([false, false, false]);
  const [hints, setHints] = useState(["", "", ""]);
  const [hintUsed, setHintUsed] = useState(false);
  const [previousWord, setPreviousWord] = useState("");

  useEffect(() => {
    if (targetWord !== previousWord) {
      console.log("Mot changé, réinitialisation des indices");
      setPreviousWord(targetWord);
      setHintsRevealed([false, false, false]);
      setHintUsed(false);

      if (onHintUsed) {
        onHintUsed(0);
      }

      if (targetWord) {
        const availableHints = generateAllHints(targetWord);
        
        const selectedHints = [];
        while (selectedHints.length < 3 && availableHints.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableHints.length);
          selectedHints.push(availableHints[randomIndex]);
          availableHints.splice(randomIndex, 1);
        }
        
        setHints(selectedHints);
      }
    }
  }, [targetWord, previousWord, onHintUsed]);

  // Générer tous les indices possibles
  const generateAllHints = (word) => {
    if (!word || typeof word !== 'string' || word.length === 0) {
      return ["Chargement des indices...", "Chargement des indices...", "Chargement des indices..."];
    }
    
    const allHints = [
      // Indice sur la première lettre
      `Ce mot commence par la lettre "${word[0]}"`,
      
      // Indice sur la dernière lettre
      `Ce mot se termine par la lettre "${word[word.length-1]}"`,
      
      // Voyelles dans le mot
      (() => {
        const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
        const vowelsInWord = word.split('')
          .filter(letter => vowels.includes(letter))
          .filter((v, i, a) => a.indexOf(v) === i); // Unique vowels
        
        if (vowelsInWord.length > 0) {
          return `Ce mot contient les voyelles: ${vowelsInWord.join(', ')}`;
        } else {
          return "Ce mot ne contient aucune voyelle";
        }
      })(),
      
      // Consonnes fréquentes
      (() => {
        const commonConsonants = ['R', 'S', 'T', 'L', 'N'];
        const consonantsInWord = word.split('')
          .filter(letter => commonConsonants.includes(letter))
          .filter((v, i, a) => a.indexOf(v) === i);
        
        if (consonantsInWord.length > 0) {
          return `Ce mot contient les consonnes: ${consonantsInWord.join(', ')}`;
        } else {
          return "Ce mot ne contient pas les consonnes R, S, T, L ou N";
        }
      })(),
      
      // Position d'une lettre
      (() => {
        const middleIndex = Math.floor(word.length / 2);
        return `La lettre "${word[middleIndex]}" est au milieu du mot`;
      })(),
      
      // Lettres répétées
      (() => {
        const letterCount = {};
        for (const letter of word) {
          letterCount[letter] = (letterCount[letter] || 0) + 1;
        }
        
        const repeatedLetters = Object.entries(letterCount)
          .filter(([_, count]) => count > 1)
          .map(([letter, count]) => `"${letter}" (${count}x)`);
        
        if (repeatedLetters.length > 0) {
          return `Lettres répétées: ${repeatedLetters.join(', ')}`;
        } else {
          return "Aucune lettre n'est répétée dans ce mot";
        }
      })(),
      
      // Nombre de syllabes (approximatif)
      (() => {
        const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
        let syllables = 0;
        let prevWasVowel = false;
        
        for (const letter of word) {
          const isVowel = vowels.includes(letter);
          if (isVowel && !prevWasVowel) {
            syllables++;
          }
          prevWasVowel = isVowel;
        }
        
        return `Ce mot contient environ ${syllables} syllabe${syllables > 1 ? 's' : ''}`;
      })()
    ];
    
    return allHints;
  };

  // Révéler un indice spécifique
  const revealHint = (index) => {
    if (!hintsRevealed[index]) {
      const newHintsRevealed = [...hintsRevealed];
      newHintsRevealed[index] = true;
      setHintsRevealed(newHintsRevealed);
      setHintUsed(true);
      
      // Compter combien d'indices sont révélés
      const hintCount = newHintsRevealed.filter(Boolean).length;
      
      // Notifier le composant parent
      if (onHintUsed) {
        onHintUsed(hintCount);
      }
    }
  };

  return (
    <div className="fixed left-4 top-1/3 z-40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-72 border-l-4 border-green-500 animate-fadeIn">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-green-700 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2" />
            Indices disponibles
          </h3>
        </div>
        
        <div className="space-y-3">
          {hints.map((hint, index) => (
            <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between items-center">
                <div className="font-medium text-gray-700">
                  Indice {index + 1}
                </div>
                <button 
                  onClick={() => revealHint(index)}
                  disabled={hintsRevealed[index]}
                  className={`text-sm px-2 py-1 rounded flex items-center ${
                    hintsRevealed[index] 
                      ? 'bg-gray-100 text-gray-500 cursor-default' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {hintsRevealed[index] ? (
                    <EyeIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4 mr-1" />
                  )}
                  <span>{hintsRevealed[index] ? 'Révélé' : 'Révéler'}</span>
                </button>
              </div>
              
              {hintsRevealed[index] ? (
                <p className="text-sm text-gray-700 mt-1">{hint}</p>
              ) : (
                <p className="text-sm text-gray-400 italic mt-1">Cliquez pour révéler cet indice</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 italic mt-3">
          Note: Chaque indice utilisé réduit votre score final.
        </div>
      </div>
    </div>
  );
};

export default HintBox;