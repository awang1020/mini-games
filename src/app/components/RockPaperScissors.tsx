'use client';

import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

type Choice = 'Rock' | 'Paper' | 'Scissors';

const CHOICES: Choice[] = ['Rock', 'Paper', 'Scissors'];

const getRandomChoice = (): Choice => CHOICES[Math.floor(Math.random() * CHOICES.length)];

const determineWinner = (player: Choice, computer: Choice): string => {
  if (player === computer) {
    return 'It’s a draw!';
  }

  const winningPairs: Record<Choice, Choice> = {
    Rock: 'Scissors',
    Paper: 'Rock',
    Scissors: 'Paper',
  };

  return winningPairs[player] === computer ? 'You win!' : 'You lose!';
};

const RockPaperScissors: FC = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handlePlayerChoice = useCallback((choice: Choice) => {
    const computerSelection = getRandomChoice();
    setPlayerChoice(choice);
    setComputerChoice(computerSelection);
    setResult(determineWinner(choice, computerSelection));
  }, []);

  const handleReset = useCallback(() => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  }, []);

  const gameSummary = useMemo(() => {
    if (!playerChoice || !computerChoice || !result) {
      return null;
    }
    return {
      playerChoice,
      computerChoice,
      result,
    };
  }, [playerChoice, computerChoice, result]);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 text-white">
      <h1 className="text-4xl font-bold">Rock, Paper, Scissors</h1>
      <div className="flex flex-wrap justify-center gap-4">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            onClick={() => handlePlayerChoice(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
      {gameSummary && (
        <div className="w-full rounded-lg bg-gray-800 p-6 text-center shadow-lg" aria-live="polite">
          <p className="text-lg">Your choice: {gameSummary.playerChoice}</p>
          <p className="mt-2 text-lg">Computer’s choice: {gameSummary.computerChoice}</p>
          <p className="mt-4 text-3xl font-bold">{gameSummary.result}</p>
        </div>
      )}
      <button
        type="button"
        className="rounded-md bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        onClick={handleReset}
      >
        Play Again
      </button>
    </div>
  );
};

export default RockPaperScissors;
