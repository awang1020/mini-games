'use client';

import React, { useEffect, useState } from 'react';

interface HighScores {
  easy: number[];
  medium: number[];
  hard: number[];
}

const HighScoreBoard = ({ onClose }: { onClose: () => void }) => {
  const [highScores, setHighScores] = useState<HighScores>({ easy: [], medium: [], hard: [] });

  useEffect(() => {
    const savedScores = localStorage.getItem('sudokuHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-white w-full max-w-md mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-center">High Scores</h2>
        <div className="flex justify-around mb-6">
          <div>
            <h3 className="text-2xl font-semibold mb-2 text-blue-400">Easy</h3>
            <ol className="list-decimal list-inside text-lg">
              {highScores.easy.slice(0, 5).map((score, i) => <li key={i}>{score}s</li>)}
            </ol>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2 text-yellow-400">Medium</h3>
            <ol className="list-decimal list-inside text-lg">
              {highScores.medium.slice(0, 5).map((score, i) => <li key={i}>{score}s</li>)}
            </ol>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2 text-red-400">Hard</h3>
            <ol className="list-decimal list-inside text-lg">
              {highScores.hard.slice(0, 5).map((score, i) => <li key={i}>{score}s</li>)}
            </ol>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HighScoreBoard;
