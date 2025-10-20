'use client';

import React, { useState, useEffect } from 'react';
import { generateSudoku } from '../../lib/sudoku';
import Board from './sudoku/Board';
import Controls from './sudoku/Controls';
import WinModal from './sudoku/WinModal';
import HighScoreBoard from './sudoku/HighScoreBoard';

const Sudoku = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [conflicts, setConflicts] = useState<boolean[][]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [showHighScores, setShowHighScores] = useState(false);

  // Load game from localStorage on initial render
  useEffect(() => {
    try {
      const savedGame = localStorage.getItem('sudokuGame');
      if (savedGame) {
        const { savedBoard, savedInitialBoard, savedSolution, savedDifficulty, savedTime, savedErrorCount, savedHintCount } = JSON.parse(savedGame);
        // Basic validation to prevent loading broken data
        if (savedBoard && savedSolution) {
          setBoard(savedBoard);
          setInitialBoard(savedInitialBoard);
          setSolution(savedSolution);
          setDifficulty(savedDifficulty);
          setTime(savedTime);
          setErrorCount(savedErrorCount);
          setHintCount(savedHintCount);
          setIsRunning(true);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load saved game:", error);
    }
    // If no valid saved game, start a new one
    newGame();
  }, []);

  // Save game to localStorage
  useEffect(() => {
    if (board.length > 0 && isRunning) {
      const gameState = {
        savedBoard: board,
        savedInitialBoard: initialBoard,
        savedSolution: solution,
        savedDifficulty: difficulty,
        savedTime: time,
        savedErrorCount: errorCount,
        savedHintCount: hintCount,
      };
      localStorage.setItem('sudokuGame', JSON.stringify(gameState));
    }
  }, [board, time, isRunning, errorCount, hintCount]);

  const newGame = () => {
    const { puzzle, solution } = generateSudoku(difficulty);
    setBoard(puzzle);
    setInitialBoard(puzzle);
    setSolution(solution);
    setConflicts(Array(9).fill(Array(9).fill(false)));
    setTime(0);
    setErrorCount(0);
    setHintCount(0);
    setIsRunning(true);
    setIsWon(false);
    localStorage.removeItem('sudokuGame');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (board.length > 0) {
      checkForConflicts();
      checkWin();
    }
  }, [board]);

  const checkWin = () => {
    if (board.length > 0 && board.every(row => row.every(cell => cell !== 0)) && conflicts.every(row => row.every(cell => !cell))) {
      setIsRunning(false);
      setIsWon(true);
      updateHighScores(time, difficulty);
      localStorage.removeItem('sudokuGame');
    }
  };

  const updateHighScores = (newScore: number, difficulty: 'easy' | 'medium' | 'hard') => {
    const savedScores = localStorage.getItem('sudokuHighScores');
    const highScores = savedScores ? JSON.parse(savedScores) : { easy: [], medium: [], hard: [] };
    const scores = highScores[difficulty];
    scores.push(newScore);
    scores.sort((a: number, b: number) => a - b);
    highScores[difficulty] = scores.slice(0, 5);
    localStorage.setItem('sudokuHighScores', JSON.stringify(highScores));
  };

  const checkForConflicts = () => {
    const newConflicts = Array(9).fill(null).map(() => Array(9).fill(false));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== 0) {
          if (!isValid(i, j, board[i][j], board)) {
            newConflicts[i][j] = true;
          }
        }
      }
    }
    setConflicts(newConflicts);
  };

  const isValid = (row: number, col: number, val: number, currentBoard: number[][]) => {
    for (let i = 0; i < 9; i++) {
      if (i !== row && currentBoard[i][col] === val) return false;
      if (i !== col && currentBoard[row][i] === val) return false;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if ((startRow + i !== row || startCol + j !== col) && currentBoard[startRow + i][startCol + j] === val) {
          return false;
        }
      }
    }

    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberClick = (num: number) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (board[row][col] !== num) {
        if (solution[row][col] !== num) {
          setErrorCount(prev => prev + 1);
        }
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = num;
        setBoard(newBoard);
      }
    }
  };

  const handleClearClick = () => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 0;
      setBoard(newBoard);
    }
  };

  const handleHintClick = () => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (board[row][col] === 0) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = solution[row][col];
        setBoard(newBoard);
        setHintCount(prev => prev + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedCell) {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClearClick();
      }
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
