'use client';

import React from 'react';

interface WinModalProps {
  time: number;
  onNewGame: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ time, onNewGame }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-4xl font-bold text-white mb-4">You Won!</h2>
        <p className="text-lg text-gray-300 mb-6">Your time: {time} seconds</p>
        <button
          onClick={onNewGame}
          className="px-6 py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default WinModal;
