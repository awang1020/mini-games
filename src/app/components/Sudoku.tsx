'use client';

import type { FC, KeyboardEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { generateSudoku } from '../../lib/sudoku';
import Board from './sudoku/Board';
import Controls from './sudoku/Controls';
import HighScoreBoard from './sudoku/HighScoreBoard';
import WinModal from './sudoku/WinModal';

const BOARD_SIZE = 9;
const SUBGRID_SIZE = 3;

type Difficulty = 'easy' | 'medium' | 'hard';

type CellPosition = { row: number; col: number };

type SerializedGame = {
  savedBoard: number[][];
  savedInitialBoard: number[][];
  savedSolution: number[][];
  savedDifficulty: Difficulty;
  savedTime: number;
  savedErrorCount: number;
  savedHintCount: number;
};

const createEmptyConflictGrid = (): boolean[][] =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));

const isValueValid = (row: number, col: number, value: number, currentBoard: number[][]): boolean => {
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (index !== row && currentBoard[index][col] === value) {
      return false;
    }
    if (index !== col && currentBoard[row][index] === value) {
      return false;
    }
  }

  const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
  const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;

  for (let offsetRow = 0; offsetRow < SUBGRID_SIZE; offsetRow += 1) {
    for (let offsetCol = 0; offsetCol < SUBGRID_SIZE; offsetCol += 1) {
      const currentRow = startRow + offsetRow;
      const currentCol = startCol + offsetCol;
      if ((currentRow !== row || currentCol !== col) && currentBoard[currentRow][currentCol] === value) {
        return false;
      }
    }
  }

  return true;
};

const calculateConflicts = (board: number[][]): boolean[][] => {
  const conflicts = createEmptyConflictGrid();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cellValue = board[row][col];
      if (cellValue !== 0 && !isValueValid(row, col, cellValue, board)) {
        conflicts[row][col] = true;
      }
    }
  }

  return conflicts;
};

const isBoardComplete = (board: number[][]): boolean =>
  board.every((row) => row.every((cell) => cell !== 0));

const Sudoku: FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [conflicts, setConflicts] = useState<boolean[][]>(createEmptyConflictGrid);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [showHighScores, setShowHighScores] = useState(false);

  const updateHighScores = useCallback((newScore: number, level: Difficulty) => {
    const savedScores = localStorage.getItem('sudokuHighScores');
    const highScores = savedScores ? JSON.parse(savedScores) : { easy: [], medium: [], hard: [] };
    const scores: number[] = highScores[level] ?? [];
    scores.push(newScore);
    scores.sort((a, b) => a - b);
    highScores[level] = scores.slice(0, 5);
    localStorage.setItem('sudokuHighScores', JSON.stringify(highScores));
  }, []);

  const newGame = useCallback(() => {
    const { puzzle, solution: generatedSolution } = generateSudoku(difficulty);
    const puzzleBoard = puzzle.map((row) => [...row]);
    const initialBoardCopy = puzzleBoard.map((row) => [...row]);

    setBoard(puzzleBoard);
    setInitialBoard(initialBoardCopy);
    setSolution(generatedSolution);
    setConflicts(createEmptyConflictGrid());
    setSelectedCell(null);
    setTime(0);
    setErrorCount(0);
    setHintCount(0);
    setIsRunning(true);
    setIsWon(false);
    localStorage.removeItem('sudokuGame');
  }, [difficulty]);

  useEffect(() => {
    try {
      const savedGame = localStorage.getItem('sudokuGame');
      if (savedGame) {
        const {
          savedBoard,
          savedInitialBoard,
          savedSolution,
          savedDifficulty,
          savedTime,
          savedErrorCount,
          savedHintCount,
        } = JSON.parse(savedGame) as SerializedGame;

        if (savedBoard && savedSolution) {
          setBoard(savedBoard);
          setInitialBoard(savedInitialBoard);
          setSolution(savedSolution);
          setDifficulty(savedDifficulty);
          setTime(savedTime);
          setErrorCount(savedErrorCount);
          setHintCount(savedHintCount);
          setConflicts(calculateConflicts(savedBoard));
          setIsRunning(true);
          setSelectedCell(null);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
    }

    newGame();
  }, [newGame]);

  useEffect(() => {
    if (board.length === 0 || !isRunning) {
      return;
    }

    const gameState: SerializedGame = {
      savedBoard: board,
      savedInitialBoard: initialBoard,
      savedSolution: solution,
      savedDifficulty: difficulty,
      savedTime: time,
      savedErrorCount: errorCount,
      savedHintCount: hintCount,
    };

    localStorage.setItem('sudokuGame', JSON.stringify(gameState));
  }, [board, difficulty, errorCount, hintCount, initialBoard, isRunning, solution, time]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((previousTime) => previousTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (board.length === 0) {
      return;
    }

    const updatedConflicts = calculateConflicts(board);
    setConflicts(updatedConflicts);

    const hasConflicts = updatedConflicts.some((row) => row.some(Boolean));

    if (!isWon && isBoardComplete(board) && !hasConflicts) {
      setIsRunning(false);
      setIsWon(true);
      setSelectedCell(null);
      updateHighScores(time, difficulty);
      localStorage.removeItem('sudokuGame');
    }
  }, [board, difficulty, isWon, time, updateHighScores]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberClick = (num: number) => {
    if (!selectedCell) {
      return;
    }

    const { row, col } = selectedCell;
    if (board[row][col] === num) {
      return;
    }

    if (solution[row][col] !== num) {
      setErrorCount((previous) => previous + 1);
    }

    const updatedBoard = board.map((r) => [...r]);
    updatedBoard[row][col] = num;
    setBoard(updatedBoard);
  };

  const handleClearClick = () => {
    if (!selectedCell) {
      return;
    }

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) {
      return;
    }

    const updatedBoard = board.map((r) => [...r]);
    updatedBoard[row][col] = 0;
    setBoard(updatedBoard);
  };

  const handleHintClick = () => {
    if (!selectedCell) {
      return;
    }

    const { row, col } = selectedCell;
    if (board[row][col] !== 0) {
      return;
    }

    const updatedBoard = board.map((r) => [...r]);
    updatedBoard[row][col] = solution[row][col];
    setBoard(updatedBoard);
    setHintCount((previous) => previous + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedCell) {
      return;
    }

    if (event.key >= '1' && event.key <= '9') {
      handleNumberClick(parseInt(event.key, 10));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      handleClearClick();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1 className="text-5xl font-bold mb-6 text-white tracking-wider">Sudoku</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setDifficulty('easy')} className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Easy</button>
        <button onClick={() => setDifficulty('medium')} className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Medium</button>
        <button onClick={() => setDifficulty('hard')} className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Hard</button>
      </div>
      <div className="flex gap-8 mb-4 text-lg">
        <div className="text-gray-300">Time: <span className="font-semibold text-white">{time}</span>s</div>
        <div className="text-gray-300">Errors: <span className="font-semibold text-white">{errorCount}</span></div>
        <div className="text-gray-300">Hints: <span className="font-semibold text-white">{hintCount}</span></div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <Board
          board={board}
          initialBoard={initialBoard}
          selectedCell={selectedCell}
          conflicts={conflicts}
          onCellClick={handleCellClick}
        />
        <Controls
          onNumberClick={handleNumberClick}
          onClearClick={handleClearClick}
          onNewGameClick={newGame}
          onHintClick={handleHintClick}
          onShowHighScores={() => setShowHighScores(true)}
        />
      </div>
      {isWon && <WinModal time={time} onNewGame={newGame} />}
      {showHighScores && <HighScoreBoard onClose={() => setShowHighScores(false)} />}
    </div>
  );
};

export default Sudoku;
