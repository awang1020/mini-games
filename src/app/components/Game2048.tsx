'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BOARD_SIZE,
  WINNING_TILE,
  createEmptyBoard,
  isGameOver,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  type BoardMatrix,
} from '@/lib/game-2048';

import ArrowButton from './ArrowButton';

type MoveDirection = 'up' | 'down' | 'left' | 'right';

type MoveHandler = (board: BoardMatrix) => ReturnType<typeof moveLeft>;

const addNewTile = (board: BoardMatrix): BoardMatrix => {
  const newBoard = board.map((row) => [...row]);
  const emptyTiles: Array<{ x: number; y: number }> = [];

  newBoard.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === 0) {
        emptyTiles.push({ x, y });
      }
    });
  });

  if (emptyTiles.length === 0) {
    return newBoard;
  }

  const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  newBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const initializeBoard = (): BoardMatrix => addNewTile(addNewTile(createEmptyBoard()));

const MOVE_HANDLERS: Record<MoveDirection, MoveHandler> = {
  up: moveUp,
  down: moveDown,
  left: moveLeft,
  right: moveRight,
};

const getTileColor = (value: number) => {
  switch (value) {
    case 2:
      return 'bg-gray-200 text-gray-800';
    case 4:
      return 'bg-gray-300 text-gray-800';
    case 8:
      return 'bg-orange-300 text-white';
    case 16:
      return 'bg-orange-400 text-white';
    case 32:
      return 'bg-orange-500 text-white';
    case 64:
      return 'bg-orange-600 text-white';
    case 128:
      return 'bg-yellow-400 text-white';
    case 256:
      return 'bg-yellow-500 text-white';
    case 512:
      return 'bg-yellow-600 text-white';
    case 1024:
      return 'bg-green-400 text-white';
    case 2048:
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-700 text-white';
  }
};

const Game2048: FC = () => {
  const [board, setBoard] = useState<BoardMatrix>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const handleMove = useCallback(
    (direction: MoveDirection) => {
      if (gameOver) {
        return;
      }

      setBoard((currentBoard) => {
        const { board: movedBoard, score: gainedScore, moved } = MOVE_HANDLERS[direction](currentBoard);

        if (!moved) {
          return currentBoard;
        }

        const boardWithNewTile = addNewTile(movedBoard);

        if (gainedScore > 0) {
          setScore((previousScore) => previousScore + gainedScore);
        }

        if (boardWithNewTile.flat().includes(WINNING_TILE)) {
          setWin(true);
          setGameOver(true);
        } else if (isGameOver(boardWithNewTile)) {
          setGameOver(true);
        }

        return boardWithNewTile;
      });
    },
    [gameOver],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const directionMap: Record<string, MoveDirection | undefined> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const direction = directionMap[event.key];
      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    },
    [handleMove],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleReset = useCallback(() => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setWin(false);
  }, []);

  const statusMessage = useMemo(() => {
    if (win) {
      return 'You Win!';
    }
    if (gameOver) {
      return 'Game Over';
    }
    return null;
  }, [gameOver, win]);

  return (
    <div className="relative flex w-full max-w-3xl flex-col items-center gap-6 text-white">
      {statusMessage && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/70">
          <div className="text-5xl font-bold">{statusMessage}</div>
          <div className="mt-4 text-2xl">Final Score: {score}</div>
          <button
            type="button"
            className="mt-6 rounded-md bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            onClick={handleReset}
          >
            Play Again
          </button>
        </div>
      )}
      <h1 className="text-4xl font-bold">2048</h1>
      <div className="flex items-center gap-4">
        <div className="rounded-md bg-gray-800 px-4 py-2 text-lg font-semibold">Score: {score}</div>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          onClick={handleReset}
        >
          Reset Game
        </button>
      </div>
      <div className="rounded-xl bg-gray-800 p-4 shadow-lg">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
          {board.map((row, y) =>
            row.map((tile, x) => (
              <div
                key={`${y}-${x}`}
                className={`flex h-24 w-24 items-center justify-center rounded-lg text-4xl font-bold ${getTileColor(tile)}`}
              >
                {tile > 0 ? tile : ''}
              </div>
            )),
          )}
        </div>
      </div>
      <div className="mt-4 grid w-48 grid-cols-3 gap-2">
        <div />
        <div className="flex justify-center">
          <ArrowButton direction="up" onClick={() => handleMove('up')} />
        </div>
        <div />
        <div className="flex justify-center">
          <ArrowButton direction="left" onClick={() => handleMove('left')} />
        </div>
        <div className="flex justify-center">
          <ArrowButton direction="down" onClick={() => handleMove('down')} />
        </div>
        <div className="flex justify-center">
          <ArrowButton direction="right" onClick={() => handleMove('right')} />
        </div>
      </div>
    </div>
  );
};

export default Game2048;
