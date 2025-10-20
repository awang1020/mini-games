'use client';

import React, { useState, useEffect } from 'react';
import { moveLeft, moveRight, moveUp, moveDown, isGameOver } from '../../lib/game-2048';
import ArrowButton from './ArrowButton';

const createEmptyBoard = () => Array(4).fill(null).map(() => Array(4).fill(0));

const addNewTile = (board: number[][]) => {
  const newBoard = board.map(row => row.slice());
  const emptyTiles: { x: number; y: number }[] = [];
  newBoard.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === 0) {
        emptyTiles.push({ x, y });
      }
    });
  });

  if (emptyTiles.length > 0) {
    const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    newBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
  }
  return newBoard;
};

const Game2048 = () => {
  const [board, setBoard] = useState(addNewTile(addNewTile(createEmptyBoard())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let result: { board: number[][]; score: number; moved: boolean } | null = null;

    switch (direction) {
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
    }

    if (result && result.moved) {
      const newBoard = addNewTile(result.board);
      setBoard(newBoard);
      setScore(score + result.score);

      if (newBoard.flat().includes(2048)) {
        setWin(true);
        setGameOver(true);
      } else if (isGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        handleMove('up');
        break;
      case 'ArrowDown':
        handleMove('down');
        break;
      case 'ArrowLeft':
        handleMove('left');
        break;
      case 'ArrowRight':
        handleMove('right');
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, score, gameOver]);

  const handleReset = () => {
    setBoard(addNewTile(addNewTile(createEmptyBoard())));
    setScore(0);
    setGameOver(false);
    setWin(false);
  };

  const getTileColor = (value: number) => {
    switch (value) {
      case 2: return 'bg-gray-200 text-gray-800';
      case 4: return 'bg-gray-300 text-gray-800';
      case 8: return 'bg-orange-300 text-white';
      case 16: return 'bg-orange-400 text-white';
      case 32: return 'bg-orange-500 text-white';
      case 64: return 'bg-orange-600 text-white';
      case 128: return 'bg-yellow-400 text-white';
      case 256: return 'bg-yellow-500 text-white';
      case 512: return 'bg-yellow-600 text-white';
      case 1024: return 'bg-green-400 text-white';
      case 2048: return 'bg-green-500 text-white';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10">
          <div className="text-6xl font-bold mb-4">{win ? 'You Win!' : 'Game Over'}</div>
          <div className="text-2xl mb-8">Final Score: {score}</div>
          <button
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleReset}
          >
            Play Again
          </button>
        </div>
      )}
      <h1 className="text-4xl font-bold mb-4">2048</h1>
      <div className="flex items-center mb-4">
        <div className="text-xl font-semibold mr-4">Score: {score}</div>
        <button
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleReset}
        >
          Reset Game
        </button>
      </div>
      <div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-4 gap-4">
            {board.map((row, y) =>
              row.map((tile, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`w-24 h-24 rounded-lg flex items-center justify-center text-4xl font-bold ${getTileColor(tile)}`}
                >
                  {tile > 0 ? tile : ''}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-48 mt-4 mx-auto">
            <div />
            <div className="col-start-2">
              <ArrowButton direction="up" onClick={() => handleMove('up')} />
            </div>
            <div />
            <div>
              <ArrowButton direction="left" onClick={() => handleMove('left')} />
            </div>
            <div>
              <ArrowButton direction="down" onClick={() => handleMove('down')} />
            </div>
            <div>
              <ArrowButton direction="right" onClick={() => handleMove('right')} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;