'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

type SquareValue = 'X' | 'O' | null;

const WINNING_LINES: Array<[number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const createInitialBoard = (): SquareValue[] => Array(9).fill(null);

const calculateWinner = (squares: SquareValue[]): SquareValue | 'Draw' | null => {
  for (const [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return squares.every((square) => square !== null) ? 'Draw' : null;
};

const TicTacToe: FC = () => {
  const [board, setBoard] = useState<SquareValue[]>(createInitialBoard);
  const [isXNext, setIsXNext] = useState(true);

  const winner = useMemo(() => calculateWinner(board), [board]);

  const handleClick = (index: number) => {
    if (winner || board[index]) {
      return;
    }

    setBoard((previousBoard) => {
      const nextBoard = [...previousBoard];
      nextBoard[index] = isXNext ? 'X' : 'O';
      return nextBoard;
    });
    setIsXNext((previous) => !previous);
  };

  const handleReset = () => {
    setBoard(createInitialBoard());
    setIsXNext(true);
  };

  const statusMessage = useMemo(() => {
    if (!winner) {
      return `Next player: ${isXNext ? 'X' : 'O'}`;
    }
    return winner === 'Draw' ? "It's a draw!" : `Winner: ${winner}`;
  }, [winner, isXNext]);

  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6 text-white">
      <h1 className="text-4xl font-bold">Tic Tac Toe</h1>
      <p className="text-xl font-semibold" aria-live="polite">
        {statusMessage}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {board.map((value, index) => {
          const colorClass = value === 'X' ? 'text-blue-400' : value === 'O' ? 'text-rose-400' : 'text-white';
          return (
            <button
              key={index}
              type="button"
              className={`flex h-24 w-24 items-center justify-center rounded-lg border-2 border-gray-400 text-4xl font-bold transition hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${colorClass}`}
              onClick={() => handleClick(index)}
              aria-label={value ? `Cell ${index + 1} containing ${value}` : `Select cell ${index + 1}`}
            >
              {value}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="rounded-md bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        onClick={handleReset}
      >
        Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;
