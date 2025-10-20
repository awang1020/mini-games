'use client';

import React from 'react';

interface ControlsProps {
  onNumberClick: (num: number) => void;
  onClearClick: () => void;
  onNewGameClick: () => void;
  onHintClick: () => void;
  onShowHighScores: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onNumberClick, onClearClick, onNewGameClick, onHintClick, onShowHighScores }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="w-12 h-12 md:w-14 md:h-14 bg-gray-700 rounded-md text-2xl text-white hover:bg-gray-600 transition-colors duration-200"
          >
            {num}
          </button>
        ))}
      </div>
      <button
        onClick={onClearClick}
        className="w-full py-3 bg-red-600 rounded-md text-white font-semibold hover:bg-red-700 transition-colors duration-200"
      >
        Clear
      </button>
      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={onNewGameClick}
          className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          New Game
        </button>
        <button
          onClick={onHintClick}
          className="w-full py-3 bg-yellow-600 rounded-md text-white font-semibold hover:bg-yellow-700 transition-colors duration-200"
        >
          Hint
        </button>
        <button
          onClick={onShowHighScores}
          className="w-full py-3 bg-purple-600 rounded-md text-white font-semibold hover:bg-purple-700 transition-colors duration-200"
        >
          High Scores
        </button>
      </div>
    </div>
  );
};

export default Controls;