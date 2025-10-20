'use client';

import React, { useState } from 'react';

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const choices = ['Rock', 'Paper', 'Scissors'];

  const handlePlayerChoice = (choice: string) => {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(choice);
    setComputerChoice(computerChoice);
    calculateResult(choice, computerChoice);
  };

  const calculateResult = (player: string, computer: string) => {
    if (player === computer) {
      setResult("It's a draw!");
    } else if (
      (player === 'Rock' && computer === 'Scissors') ||
      (player === 'Paper' && computer === 'Rock') ||
      (player === 'Scissors' && computer === 'Paper')
    ) {
      setResult('You win!');
    } else {
      setResult('You lose!');
    }
  };

  const handleReset = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Rock, Paper, Scissors</h1>
      <div className="flex space-x-4 mb-8">
        {choices.map((choice) => (
          <button
            key={choice}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => handlePlayerChoice(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
      {playerChoice && computerChoice && (
        <div className="text-center">
          <p className="text-xl mb-2">Your choice: {playerChoice}</p>
          <p className="text-xl mb-4">Computer's choice: {computerChoice}</p>
          <p className="text-3xl font-bold">{result}</p>
        </div>
      )}
      <button
        className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleReset}
      >
        Play Again
      </button>
    </div>
  );
};

export default RockPaperScissors;
