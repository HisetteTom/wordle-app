import React from "react";
import { keyboardRows } from "../GameLogic";
import { BackspaceIcon } from "@heroicons/react/24/outline";

function Keyboard({ handleInput, keyboardStatus }) {
  return (
    <div className="mt-8 bg-white backdrop-blur-sm p-4 rounded-lg shadow-lg border border-indigo-100">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-3">
          {row.map((key) => {
            const isSpecialKey = key === "ENTER" || key === "BACK";
            
            // Déterminer le style de la touche selon son statut
            let buttonStyle = "";
            
            switch(keyboardStatus[key]) {
              case "correct":
                buttonStyle = "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-400 shadow-md hover:from-green-600 hover:to-green-700";
                break;
              case "present":
                buttonStyle = "bg-gradient-to-b from-yellow-400 to-yellow-500 text-white border-yellow-400 shadow-md hover:from-yellow-500 hover:to-yellow-600";
                break;
              case "absent":
                buttonStyle = "bg-gradient-to-b from-gray-500 to-gray-600 text-white border-gray-400 shadow-md hover:from-gray-600 hover:to-gray-700";
                break;
              default:
                buttonStyle = "bg-gradient-to-b from-gray-100 to-white text-gray-800 border-gray-200 hover:from-gray-200 hover:to-gray-50 active:from-gray-300 active:to-gray-200";
            }
            
            return (
              <button
                key={key}
                onClick={() => handleInput(key)}
                className={`
                  ${isSpecialKey ? "px-4 w-auto" : "w-11"} 
                  h-14 mx-1.5 rounded-md font-medium text-sm border
                  ${buttonStyle}
                  transition-all duration-150 transform hover:scale-105 active:scale-95
                  shadow hover:shadow-md
                `}
              >
                {key === "BACK" ? <BackspaceIcon className="h-5 w-5 mx-auto" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;