import React from "react";
import { keyboardRows } from "../GameLogic";
import { BackspaceIcon } from "@heroicons/react/24/outline";

function Keyboard({ handleInput, keyboardStatus }) {
  return (
    <div className="mt-8 bg-white p-3 rounded-lg shadow-md">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2">
          {row.map((key) => {
            const isSpecialKey = key === "ENTER" || key === "BACK";
            return (
              <button
                key={key}
                onClick={() => handleInput(key)}
                className={`
                  ${isSpecialKey ? "px-3 w-auto" : "w-10"} 
                  h-12 m-1 rounded font-medium text-sm
                  bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                  transition-colors duration-150
                  ${keyboardStatus[key] === "correct" ? "bg-green-500 text-white hover:bg-green-600" : ""}
                  ${keyboardStatus[key] === "present" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""}
                  ${keyboardStatus[key] === "absent" ? "bg-gray-500 text-white hover:bg-gray-600" : ""}
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