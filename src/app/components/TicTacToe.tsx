'use client';

import React, { useState, useEffect } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const handleClick = (index: number) => {
    if (winner || board[index]) {
      return;
    }

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(square => square !== null)) {
        return 'Draw';
    }
    return null;
  };

  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result);
    }
  }, [board]);

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    const colorClass = value === 'X' ? 'text-blue-500' : 'text-red-500';
    return (
      <button
        className={`w-24 h-24 border-2 border-gray-400 flex items-center justify-center text-4xl font-bold ${colorClass}`}
        onClick={() => handleClick(index)}
      >
        {value}
      </button>
    );
  };

  let status;
    if (winner) {
        status = winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`;
    } else {
        status = `Next player: ${isXNext ? 'X' : 'O'}`;
    }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8">Tic Tac Toe</h1>
        <div className="mb-4 text-2xl font-semibold">{status}</div>
        <div className="grid grid-cols-3">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
        </div>
        <button
            className="mt-8 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleReset}
        >
            Reset Game
        </button>
    </div>
  );
};

export default TicTacToe;
