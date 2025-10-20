'use client';

import type { FC, KeyboardEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { generateSudoku } from '../../lib/sudoku';
import Board from './sudoku/Board';
import Controls from './sudoku/Controls';
import HighScoreBoard from './sudoku/HighScoreBoard';
import TutorialModal from './sudoku/TutorialModal';
import WinModal from './sudoku/WinModal';

const BOARD_SIZE = 9;
const SUBGRID_SIZE = 3;
const MAX_HINTS = 3;
const HISTORY_LIMIT = 50;
const DEFAULT_DIFFICULTY: Difficulty = 'easy';

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
  savedNotes?: number[][][];
};

type HistoryEntry = {
  board: number[][];
  notes: number[][][];
  selectedCell: CellPosition | null;
};

const createEmptyConflictGrid = (): boolean[][] =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));

const createEmptyNotesGrid = (): number[][][] =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => [])
  );

const cloneBoard = (value: number[][]): number[][] => value.map((row) => [...row]);

const cloneNotes = (value: number[][][]): number[][][] =>
  value.map((row) => row.map((cell) => [...cell]));

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
  const [notes, setNotes] = useState<number[][][]>(createEmptyNotesGrid);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [conflicts, setConflicts] = useState<boolean[][]>(createEmptyConflictGrid);
  const [mismatches, setMismatches] = useState<boolean[][]>(createEmptyConflictGrid);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [boardMessage, setBoardMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{
    row: number;
    col: number;
    type: 'correct' | 'incorrect' | 'hint' | 'clear';
  } | null>(null);

  const hintsRemaining = Math.max(0, MAX_HINTS - hintCount);
  const hasBoard = board.length > 0;
  const selectedIsEditable =
    selectedCell !== null && initialBoard[selectedCell.row]?.[selectedCell.col] === 0;

  const getSnapshot = useCallback((): HistoryEntry => ({
    board: cloneBoard(board),
    notes: cloneNotes(notes),
    selectedCell: selectedCell ? { ...selectedCell } : null,
  }), [board, notes, selectedCell]);

  const initializeGame = useCallback((level: Difficulty) => {
    const { puzzle, solution: generatedSolution } = generateSudoku(level);
    const puzzleBoard = puzzle.map((row) => [...row]);
    const initialBoardCopy = puzzleBoard.map((row) => [...row]);

    setBoard(puzzleBoard);
    setInitialBoard(initialBoardCopy);
    setSolution(generatedSolution.map((row) => [...row]));
    setNotes(createEmptyNotesGrid());
    setConflicts(createEmptyConflictGrid());
    setMismatches(createEmptyConflictGrid());
    setSelectedCell(null);
    setTime(0);
    setErrorCount(0);
    setHintCount(0);
    setIsRunning(true);
    setIsWon(false);
    setIsNotesMode(false);
    setUndoStack([]);
    setRedoStack([]);
    setBoardMessage(null);
    setLastAction(null);
    setDifficulty(level);
    localStorage.removeItem('sudokuGame');
  }, []);

  const pushHistory = useCallback(() => {
    if (!hasBoard) {
      return;
    }

    const snapshot = getSnapshot();
    setUndoStack((previous) => {
      const next = [...previous, snapshot];
      if (next.length > HISTORY_LIMIT) {
        return next.slice(next.length - HISTORY_LIMIT);
      }
      return next;
    });
    setRedoStack([]);
  }, [getSnapshot, hasBoard]);

  const updateHighScores = useCallback((newScore: number, level: Difficulty) => {
    const savedScores = localStorage.getItem('sudokuHighScores');
    const highScores = savedScores ? JSON.parse(savedScores) : { easy: [], medium: [], hard: [] };
    const scores: number[] = highScores[level] ?? [];
    scores.push(newScore);
    scores.sort((a, b) => a - b);
    highScores[level] = scores.slice(0, 5);
    localStorage.setItem('sudokuHighScores', JSON.stringify(highScores));
  }, []);

  const newGame = useCallback((level?: Difficulty) => {
    initializeGame(level ?? difficulty);
  }, [difficulty, initializeGame]);

  useEffect(() => {
    if (hasBoard) {
      return;
    }

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
          savedNotes,
        } = JSON.parse(savedGame) as SerializedGame;

        if (savedBoard && savedSolution) {
          setBoard(savedBoard.map((row) => [...row]));
          setInitialBoard(savedInitialBoard.map((row) => [...row]));
          setSolution(savedSolution.map((row) => [...row]));
          setDifficulty(savedDifficulty);
          setTime(savedTime);
          setErrorCount(savedErrorCount);
          setHintCount(savedHintCount);
          setNotes(savedNotes ? cloneNotes(savedNotes) : createEmptyNotesGrid());
          setConflicts(calculateConflicts(savedBoard));
          setIsRunning(true);
          setSelectedCell(null);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
    }

    initializeGame(difficulty);
  }, [difficulty, hasBoard, initializeGame]);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('sudokuTutorialSeen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

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
      savedNotes: notes,
    };

    localStorage.setItem('sudokuGame', JSON.stringify(gameState));
  }, [board, difficulty, errorCount, hintCount, initialBoard, isRunning, notes, solution, time]);

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
    if (!hasBoard) {
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
  }, [board, difficulty, hasBoard, isWon, time, updateHighScores]);

  useEffect(() => {
    if (!lastAction) {
      return;
    }

    const timeout = setTimeout(() => setLastAction(null), 600);
    return () => clearTimeout(timeout);
  }, [lastAction]);

  useEffect(() => {
    if (!boardMessage) {
      return;
    }

    const timeout = setTimeout(() => setBoardMessage(null), 3200);
    return () => clearTimeout(timeout);
  }, [boardMessage]);

  const moveSelection = useCallback((deltaRow: number, deltaCol: number) => {
    setSelectedCell((previous) => {
      if (previous === null) {
        return { row: 0, col: 0 };
      }

      const nextRow = (previous.row + deltaRow + BOARD_SIZE) % BOARD_SIZE;
      const nextCol = (previous.col + deltaCol + BOARD_SIZE) % BOARD_SIZE;
      return { row: nextRow, col: nextCol };
    });
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!hasBoard) {
      return;
    }
    setSelectedCell({ row, col });
  };

  const clearChecks = () => {
    setMismatches(createEmptyConflictGrid());
    setBoardMessage(null);
  };

  const handleNumberClick = (num: number) => {
    if (!hasBoard || !selectedCell) {
      return;
    }

    const { row, col } = selectedCell;
    if (initialBoard[row]?.[col] !== 0) {
      return;
    }

    clearChecks();

    if (isNotesMode) {
      pushHistory();
      setNotes((previousNotes) =>
        previousNotes.map((rowNotes, rowIndex) =>
          rowNotes.map((cellNotes, colIndex) => {
            if (rowIndex !== row || colIndex !== col) {
              return cellNotes;
            }

            const nextNotes = new Set(cellNotes);
            if (nextNotes.has(num)) {
              nextNotes.delete(num);
            } else {
              nextNotes.add(num);
            }

            return Array.from(nextNotes).sort((a, b) => a - b);
          })
        )
      );
      return;
    }

    if (board[row][col] === num) {
      return;
    }

    pushHistory();

    setNotes((previousNotes) =>
      previousNotes.map((rowNotes, rowIndex) =>
        rowNotes.map((cellNotes, colIndex) =>
          rowIndex === row && colIndex === col ? [] : cellNotes
        )
      )
    );

    const updatedBoard = board.map((rowValues, rowIndex) =>
      rowValues.map((cellValue, colIndex) =>
        rowIndex === row && colIndex === col ? num : cellValue
      )
    );
    setBoard(updatedBoard);

    const isCorrect = solution[row]?.[col] === num;
    if (!isCorrect) {
      setErrorCount((previous) => previous + 1);
    }
    setLastAction({ row, col, type: isCorrect ? 'correct' : 'incorrect' });
  };

  const handleClearClick = () => {
    if (!hasBoard || !selectedCell) {
      return;
    }

    const { row, col } = selectedCell;
    if (initialBoard[row]?.[col] !== 0) {
      return;
    }

    if (board[row][col] === 0 && notes[row][col].length === 0) {
      return;
    }

    clearChecks();
    pushHistory();

    setBoard((previous) =>
      previous.map((rowValues, rowIndex) =>
        rowValues.map((cellValue, colIndex) =>
          rowIndex === row && colIndex === col ? 0 : cellValue
        )
      )
    );

    setNotes((previous) =>
      previous.map((rowNotes, rowIndex) =>
        rowNotes.map((cellNotes, colIndex) =>
          rowIndex === row && colIndex === col ? [] : cellNotes
        )
      )
    );

    setLastAction({ row, col, type: 'clear' });
  };

  const handleHintClick = () => {
    if (!hasBoard || !selectedCell || hintsRemaining <= 0) {
      return;
    }

    const { row, col } = selectedCell;
    if (initialBoard[row]?.[col] !== 0 || board[row][col] === solution[row]?.[col]) {
      return;
    }

    clearChecks();
    pushHistory();

    setBoard((previous) =>
      previous.map((rowValues, rowIndex) =>
        rowValues.map((cellValue, colIndex) =>
          rowIndex === row && colIndex === col ? solution[row][col] : cellValue
        )
      )
    );

    setNotes((previous) =>
      previous.map((rowNotes, rowIndex) =>
        rowNotes.map((cellNotes, colIndex) =>
          rowIndex === row && colIndex === col ? [] : cellNotes
        )
      )
    );

    setHintCount((previous) => previous + 1);
    setLastAction({ row, col, type: 'hint' });
  };

  const handleCheckBoard = () => {
    if (!hasBoard) {
      return;
    }

    const evaluated = createEmptyConflictGrid();
    let hasMistake = false;

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const value = board[row]?.[col];
        if (value !== 0 && value !== solution[row]?.[col]) {
          evaluated[row][col] = true;
          hasMistake = true;
        }
      }
    }

    setMismatches(evaluated);
    setBoardMessage(hasMistake ? 'There are some mistakes highlighted in red.' : 'Everything looks good so far!');
  };

  const handleUndo = () => {
    if (undoStack.length === 0) {
      return;
    }

    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, getSnapshot()]);

    setBoard(cloneBoard(previousState.board));
    setNotes(cloneNotes(previousState.notes));
    setSelectedCell(previousState.selectedCell ? { ...previousState.selectedCell } : null);
    clearChecks();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) {
      return;
    }

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, getSnapshot()]);

    setBoard(cloneBoard(nextState.board));
    setNotes(cloneNotes(nextState.notes));
    setSelectedCell(nextState.selectedCell ? { ...nextState.selectedCell } : null);
    clearChecks();
  };

  const handleDifficultyChange = (level: Difficulty) => {
    newGame(level);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!hasBoard) {
      return;
    }

    if (event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      handleNumberClick(parseInt(event.key, 10));
      return;
    }

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
      case '0':
        event.preventDefault();
        handleClearClick();
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveSelection(-1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveSelection(1, 0);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveSelection(0, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveSelection(0, 1);
        break;
      default:
        break;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      handleRedo();
    }

    if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setIsNotesMode((previous) => !previous);
    }

    if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      handleHintClick();
    }
  };

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [time]);

  return (
    <div
      className="relative flex w-full max-w-6xl flex-1 flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-slate-950/60 p-6 text-slate-100 shadow-2xl backdrop-blur"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex w-full flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Sudoku</h1>
          <p className="mt-1 text-sm text-slate-300 md:text-base">
            Sharpen your logic with an elegant, responsive board built for keyboard and touch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700/80"
            onClick={() => setShowTutorial(true)}
          >
            How to play
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-2xl bg-slate-900/60 p-4 shadow-inner md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-center gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                difficulty === level
                  ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/30'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="grid w-full grid-cols-3 gap-3 text-center text-sm font-semibold uppercase tracking-wide text-slate-300 md:w-auto">
          <div className="rounded-xl bg-slate-800/70 px-3 py-2">
            <span className="block text-[0.65rem] font-medium text-slate-400">Time</span>
            <span className="text-lg font-bold text-slate-100">{formattedTime}</span>
          </div>
          <div className="rounded-xl bg-slate-800/70 px-3 py-2">
            <span className="block text-[0.65rem] font-medium text-slate-400">Errors</span>
            <span className="text-lg font-bold text-rose-300">{errorCount}</span>
          </div>
          <div className="rounded-xl bg-slate-800/70 px-3 py-2">
            <span className="block text-[0.65rem] font-medium text-slate-400">Hints Left</span>
            <span className="text-lg font-bold text-emerald-300">{hintsRemaining}</span>
          </div>
        </div>
      </div>

      {boardMessage && (
        <div className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-center text-sm text-slate-200 shadow">
          {boardMessage}
        </div>
      )}

      <div className="flex w-full flex-col-reverse items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <Board
          board={board}
          initialBoard={initialBoard}
          selectedCell={selectedCell}
          conflicts={conflicts}
          mismatches={mismatches}
          notes={notes}
          recentAction={lastAction}
          onCellClick={handleCellClick}
        />
        <Controls
          canRedo={redoStack.length > 0}
          canUndo={undoStack.length > 0}
          hintsRemaining={hintsRemaining}
          isNotesMode={isNotesMode}
          numberPadDisabled={!selectedIsEditable}
          onCheckBoardClick={handleCheckBoard}
          onClearClick={handleClearClick}
          onHintClick={handleHintClick}
          onNewGameClick={() => newGame(difficulty)}
          onNumberClick={handleNumberClick}
          onRedo={handleRedo}
          onShowHighScores={() => setShowHighScores(true)}
          onToggleNotesMode={() => setIsNotesMode((previous) => !previous)}
          onUndo={handleUndo}
        />
      </div>

      {isWon && <WinModal time={formattedTime} onNewGame={() => newGame(difficulty)} />}
      {showHighScores && <HighScoreBoard onClose={() => setShowHighScores(false)} />}
      {showTutorial && <TutorialModal onClose={() => {
        setShowTutorial(false);
        localStorage.setItem('sudokuTutorialSeen', 'true');
      }} />}
    </div>
  );
};

export default Sudoku;
