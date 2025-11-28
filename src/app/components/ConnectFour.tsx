'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { AIDifficulty } from '@/lib/connect-four-ai';
import { pickAIMove, getAvailableColumns } from '@/lib/connect-four-ai';

const ROW_COUNT = 6;
const COLUMN_COUNT = 7;

type Player = 1 | 2;
type CellValue = 0 | Player;
type Board = CellValue[][];

interface Move {
  row: number;
  column: number;
  player: Player;
  id: number;
}

interface WinnerState {
  player: Player;
  cells: Array<[number, number]>;
}

interface Scoreboard {
  player1: number;
  player2: number;
  draws: number;
}

const createEmptyBoard = (): Board =>
  Array.from({ length: ROW_COUNT }, () => Array<CellValue>(COLUMN_COUNT).fill(0));

const playerColorClasses: Record<Player, string> = {
  1: 'bg-red-500 shadow-red-500/40',
  2: 'bg-yellow-400 shadow-yellow-400/40',
};

const playerTextColor: Record<Player, string> = {
  1: 'text-red-400',
  2: 'text-yellow-300',
};

const findAvailableRow = (board: Board, column: number): number | null => {
  for (let row = ROW_COUNT - 1; row >= 0; row -= 1) {
    if (board[row][column] === 0) {
      return row;
    }
  }
  return null;
};

const detectWin = (
  board: Board,
  row: number,
  column: number,
  player: Player,
): Array<[number, number]> | null => {
  const directions: Array<[number, number]> = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dr, dc] of directions) {
    const cells: Array<[number, number]> = [[row, column]];

    for (let step = 1; step < 4; step += 1) {
      const nextRow = row + dr * step;
      const nextCol = column + dc * step;
      if (
        nextRow < 0 ||
        nextRow >= ROW_COUNT ||
        nextCol < 0 ||
        nextCol >= COLUMN_COUNT ||
        board[nextRow][nextCol] !== player
      ) {
        break;
      }
      cells.push([nextRow, nextCol]);
    }

    for (let step = 1; step < 4; step += 1) {
      const nextRow = row - dr * step;
      const nextCol = column - dc * step;
      if (
        nextRow < 0 ||
        nextRow >= ROW_COUNT ||
        nextCol < 0 ||
        nextCol >= COLUMN_COUNT ||
        board[nextRow][nextCol] !== player
      ) {
        break;
      }
      cells.unshift([nextRow, nextCol]);
    }

    if (cells.length >= 4) {
      for (let index = 0; index <= cells.length - 4; index += 1) {
        const window = cells.slice(index, index + 4);
        if (window.some(([cellRow, cellColumn]) => cellRow === row && cellColumn === column)) {
          return window;
        }
      }
      return cells.slice(0, 4);
    }
  }

  return null;
};

const controlButtonBase =
  'inline-flex h-11 w-full max-w-[16rem] items-center justify-center rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900';

const ConnectFour = () => {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<WinnerState | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [boardHasFocus, setBoardHasFocus] = useState(false);
  const [focusColumn, setFocusColumn] = useState(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [scoreboard, setScoreboard] = useState<Scoreboard>({
    player1: 0,
    player2: 0,
    draws: 0,
  });
  // VS AI controls
  type Difficulty = 'OFF' | AIDifficulty;
  const [botDifficulty, setBotDifficulty] = useState<Difficulty>('OFF');
  const [lastBotLevel, setLastBotLevel] = useState<AIDifficulty>('MEDIUM');
  const [aiThinking, setAiThinking] = useState(false);
  // Human/AI sides and starter
  const [humanPlayer, setHumanPlayer] = useState<Player>(1);
  const aiPlayer: Player = humanPlayer === 1 ? 2 : 1;
  const [starterIsHuman, setStarterIsHuman] = useState(true);

  const instructionsId = useId();

  const highlightedColumn = hoveredColumn ?? (boardHasFocus ? focusColumn : null);

  const winningCellKeys = useMemo(() => {
    if (!winner) {
      return new Set<string>();
    }
    return new Set(winner.cells.map(([row, column]) => `${row}-${column}`));
  }, [winner]);

  const previewRow = useMemo(() => {
    if (highlightedColumn === null || winner || isDraw) {
      return null;
    }
    return findAvailableRow(board, highlightedColumn);
  }, [board, highlightedColumn, isDraw, winner]);

  const statusMessage = useMemo(() => {
    if (winner) {
      return `Player ${winner.player} wins!`;
    }
    if (isDraw) {
      return 'Draw game—board is full.';
    }
    const playerDescriptor = currentPlayer === 1 ? 'Red' : 'Yellow';
    return `Player ${currentPlayer} (${playerDescriptor}) — select a column to drop your token.`;
  }, [currentPlayer, isDraw, winner]);

  const statusColorClass = useMemo(() => {
    if (winner) {
      return playerTextColor[winner.player];
    }
    if (isDraw) {
      return 'text-gray-200';
    }
    return playerTextColor[currentPlayer];
  }, [currentPlayer, isDraw, winner]);

  const handleDrop = useCallback(
    (column: number) => {
      const botActive = botDifficulty !== 'OFF';
      if (winner || isDraw) {
        return;
      }
      // In VS AI mode, block human input on AI's turn or while AI is thinking
      if (botActive && (currentPlayer !== humanPlayer || aiThinking)) {
        return;
      }

      const player = currentPlayer;
      const targetRow = findAvailableRow(board, column);
      if (targetRow === null) {
        return;
      }

      const nextBoard = board.map((row) => [...row]);
      nextBoard[targetRow][column] = player;

      const move: Move = {
        row: targetRow,
        column,
        player,
        id: Date.now(),
      };

      const winningCells = detectWin(nextBoard, targetRow, column, player);
      const boardFull = nextBoard.every((row) => row.every((cell) => cell !== 0));

      setBoard(nextBoard);
      setMoveHistory((history) => [...history, move]);
      setLastMove(move);

      if (winningCells) {
        setWinner({ player, cells: winningCells });
        setIsDraw(false);
        setScoreboard((scores) => ({
          ...scores,
          player1: scores.player1 + (player === 1 ? 1 : 0),
          player2: scores.player2 + (player === 2 ? 1 : 0),
        }));
        return;
      }

      setIsDraw(boardFull);
      if (boardFull) {
        setScoreboard((scores) => ({
          ...scores,
          draws: scores.draws + 1,
        }));
      }
      if (!boardFull) {
        setCurrentPlayer(player === 1 ? 2 : 1);
      }
    },
    [aiThinking, board, botDifficulty, currentPlayer, humanPlayer, isDraw, winner],
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(starterIsHuman ? humanPlayer : aiPlayer);
    setWinner(null);
    setIsDraw(false);
    setHoveredColumn(null);
    setBoardHasFocus(false);
    setFocusColumn(0);
    setMoveHistory([]);
    setLastMove(null);
    setAiThinking(false);
  }, [aiPlayer, humanPlayer, starterIsHuman]);

  const handleRestart = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleResetScoreboard = useCallback(() => {
    setScoreboard({ player1: 0, player2: 0, draws: 0 });
  }, []);

  const handleUndo = useCallback(() => {
    setMoveHistory((history) => {
      if (history.length === 0) {
        return history;
      }

      const last = history[history.length - 1];
      const updatedHistory = history.slice(0, -1);

      setBoard((previousBoard) => {
        const nextBoard = previousBoard.map((row) => [...row]);
        nextBoard[last.row][last.column] = 0;
        return nextBoard;
      });

      setWinner(null);
      setIsDraw(false);
      setLastMove(updatedHistory[updatedHistory.length - 1] ?? null);
      setCurrentPlayer(last.player);

      return updatedHistory;
    });
  }, []);

  // AI turn when VS AI is active
  useEffect(() => {
    const botActive = botDifficulty !== 'OFF';
    if (!botActive) return;
    if (winner || isDraw) return;
    if (currentPlayer !== aiPlayer) return;
    if (aiThinking) return;

    const available = getAvailableColumns(board as unknown as number[][]);
    if (available.length === 0) return;

    setAiThinking(true);
    const delay = botDifficulty === 'EXPERT' ? 0 : 150;
    const t = setTimeout(() => {
      const level = botDifficulty === 'OFF' ? 'MEDIUM' : botDifficulty;
      const move = pickAIMove(board as unknown as number[][], level, aiPlayer);
      const playCol = available.includes(move) ? move : available[0];

      const targetRow = findAvailableRow(board, playCol);
      if (targetRow !== null) {
        const nextBoard = board.map((row) => [...row]);
        nextBoard[targetRow][playCol] = aiPlayer;

        const moveRec: Move = { row: targetRow, column: playCol, player: aiPlayer, id: Date.now() };
        const winningCells = detectWin(nextBoard, targetRow, playCol, aiPlayer);
        const boardFull = nextBoard.every((row) => row.every((cell) => cell !== 0));

        setBoard(nextBoard);
        setMoveHistory((history) => [...history, moveRec]);
        setLastMove(moveRec);

        if (winningCells) {
          setWinner({ player: aiPlayer, cells: winningCells });
          setIsDraw(false);
          setScoreboard((scores) => ({
            ...scores,
            player1: scores.player1 + (aiPlayer === 1 ? 1 : 0),
            player2: scores.player2 + (aiPlayer === 2 ? 1 : 0),
          }));
        } else {
          setIsDraw(boardFull);
          if (boardFull) {
            setScoreboard((scores) => ({ ...scores, draws: scores.draws + 1 }));
          } else {
            setCurrentPlayer(aiPlayer === 1 ? 2 : 1);
          }
        }
      }
      setAiThinking(false);
    }, delay);
    return () => clearTimeout(t);
  }, [board, currentPlayer, winner, isDraw, botDifficulty, aiPlayer]);

  // If user turns bot ON while it's already AI's turn, trigger AI immediately
  useEffect(() => {
    if (botDifficulty === 'OFF') return;
    if (winner || isDraw) return;
    if (currentPlayer !== aiPlayer) return;
    if (aiThinking) return;

    setAiThinking(true);
    const t = setTimeout(() => {
      const available = getAvailableColumns(board as unknown as number[][]);
      if (available.length === 0) {
        setAiThinking(false);
        return;
      }
      const move = pickAIMove(board as unknown as number[][], botDifficulty, aiPlayer);
      const playCol = available.includes(move) ? move : available[0];
      const targetRow = findAvailableRow(board, playCol);
      if (targetRow !== null) {
        const nextBoard = board.map((row) => [...row]);
        nextBoard[targetRow][playCol] = aiPlayer;

        const moveRec: Move = { row: targetRow, column: playCol, player: aiPlayer, id: Date.now() };
        const winningCells = detectWin(nextBoard, targetRow, playCol, aiPlayer);
        const boardFull = nextBoard.every((row) => row.every((cell) => cell !== 0));

        setBoard(nextBoard);
        setMoveHistory((history) => [...history, moveRec]);
        setLastMove(moveRec);

        if (winningCells) {
          setWinner({ player: aiPlayer, cells: winningCells });
          setIsDraw(false);
          setScoreboard((scores) => ({
            ...scores,
            player1: scores.player1 + (aiPlayer === 1 ? 1 : 0),
            player2: scores.player2 + (aiPlayer === 2 ? 1 : 0),
          }));
        } else {
          setIsDraw(boardFull);
          if (boardFull) {
            setScoreboard((scores) => ({ ...scores, draws: scores.draws + 1 }));
          } else {
            setCurrentPlayer(aiPlayer === 1 ? 2 : 1);
          }
        }
      }
      setAiThinking(false);
    }, 0);
    return () => clearTimeout(t);
  }, [botDifficulty, aiPlayer]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setFocusColumn((column) => (column - 1 + COLUMN_COUNT) % COLUMN_COUNT);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setFocusColumn((column) => (column + 1) % COLUMN_COUNT);
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const columnToDrop = highlightedColumn ?? focusColumn;
        handleDrop(columnToDrop);
      }
    },
    [focusColumn, handleDrop, highlightedColumn],
  );

  const canUndo = moveHistory.length > 0 && !winner && !isDraw;

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-10 pt-6 text-white sm:px-6">
      <header className="sticky top-0 z-20 -mx-4 -mt-6 flex flex-col gap-4 bg-gray-900/95 px-4 pb-4 pt-3 shadow-lg backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Connect Four</h1>
            <p className="mt-1 text-sm text-gray-300" id={instructionsId}>
              Use Left and Right arrows to choose a column, then press Enter to drop a token. Undo to take back the
              previous move.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(230px,1fr)] lg:items-start lg:gap-8">
        <section className="flex flex-col gap-6">
          <div
            className="rounded-lg border border-gray-700 bg-gray-900/80 p-4 shadow-lg"
            aria-live="polite"
            role="status"
          >
            <p className={`text-lg font-semibold ${statusColorClass}`}>{statusMessage}</p>
            <div className="mt-1 flex min-h-[1.25rem] items-center gap-2 text-sm text-gray-300" aria-live="polite">
              {botDifficulty !== 'OFF' && aiThinking && !winner ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-gray-300" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>AI thinking.</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-3xl lg:mx-0">
            <div className="relative aspect-[7/6]" style={{ maxHeight: 'min(65dvh, 32rem)' }}>
              <div
                role="grid"
                aria-label="Connect Four board"
                aria-rowcount={ROW_COUNT}
                aria-colcount={COLUMN_COUNT}
                aria-describedby={instructionsId}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onFocus={() => setBoardHasFocus(true)}
                onBlur={() => setBoardHasFocus(false)}
                onMouseLeave={() => setHoveredColumn(null)}
                className="relative z-10 grid h-full w-full grid-cols-7 grid-rows-6 gap-2 rounded-3xl bg-blue-950/80 p-3 outline-none focus-visible:ring-4 focus-visible:ring-amber-300/80"
              >
                {board.map((row, rowIndex) =>
                  row.map((cell, columnIndex) => {
                    const key = `${rowIndex}-${columnIndex}`;
                    const cellIsWinning = winningCellKeys.has(key);
                    const isHighlighted = highlightedColumn === columnIndex;
                    const isPreviewCell =
                      previewRow !== null && previewRow === rowIndex && highlightedColumn === columnIndex;
                    const isLastMoveCell =
                      lastMove !== null && lastMove.row === rowIndex && lastMove.column === columnIndex;

                    const cellBackground = [
                      'relative flex items-center justify-center rounded-full border-2 border-blue-500/50 bg-blue-900/70 transition-colors duration-200',
                      isHighlighted && !winner && !isDraw ? 'bg-blue-800' : null,
                      cellIsWinning ? 'ring-4 ring-amber-300/80' : null,
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <div
                        key={key}
                        role="gridcell"
                        aria-colindex={columnIndex + 1}
                        aria-rowindex={rowIndex + 1}
                        className={cellBackground}
                        onMouseEnter={() => setHoveredColumn(columnIndex)}
                        onClick={() => handleDrop(columnIndex)}
                      >
                        <div className="relative flex h-[80%] w-[80%] items-center justify-center">
                          {cell !== 0 ? (
                            <div
                              className={`h-full w-full rounded-full shadow-lg transition-transform duration-200 ${
                                playerColorClasses[cell]
                              } ${isLastMoveCell ? 'animate-token-drop' : ''}`}
                            />
                          ) : null}
                          {cell === 0 && isPreviewCell ? (
                            <div
                              className={`h-full w-full rounded-full border-2 border-dashed opacity-70 ${
                                playerColorClasses[currentPlayer]
                              }`}
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>

              {(winner || isDraw) && (
                <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
                  <div className="rounded-full bg-gray-900/90 px-6 py-3 text-lg font-semibold text-amber-300 shadow-lg">
                    {winner ? `Game Over — Player ${winner.player} wins!` : 'Game Over — Draw!'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 text-sm text-gray-300 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-gray-900">
                1
              </span>
              <span>Player 1 — Red tokens</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
                2
              </span>
              <span>Player 2 — Yellow tokens</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-gray-400 text-xs font-bold text-gray-200">
                •
              </span>
              <span>Preview shows the next drop position</span>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-gray-700 bg-gray-900/80 p-4 shadow-lg lg:sticky lg:top-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-amber-300">Scoreboard</h2>
              <p className="text-sm text-gray-400">Track wins, losses, and draws at a glance.</p>
            </div>
            {/* Mode & AI Level controls */}
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-center">
                <div className="inline-flex rounded-full bg-gray-800/60 p-1 ring-1 ring-gray-700 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBotDifficulty('OFF')}
                    className={`${
                      botDifficulty === 'OFF'
                        ? 'bg-indigo-500 text-white shadow hover:bg-indigo-500'
                        : 'text-gray-200 hover:bg-gray-700'
                    } rounded-full px-4 py-1.5 text-sm transition`}
                  >
                    Player vs Player
                  </button>
                  <button
                    type="button"
                    onClick={() => (botDifficulty === 'OFF' ? setBotDifficulty(lastBotLevel) : null)}
                    className={`${
                      botDifficulty !== 'OFF'
                        ? 'bg-indigo-500 text-white shadow hover:bg-indigo-500'
                        : 'text-gray-200 hover:bg-gray-700'
                    } rounded-full px-4 py-1.5 text-sm transition`}
                  >
                    VS AI
                  </button>
                </div>
              </div>

              {botDifficulty !== 'OFF' && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setLastBotLevel(lvl);
                        setBotDifficulty(lvl);
                      }}
                      className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${
                        botDifficulty === lvl
                          ? 'bg-indigo-500 text-white ring-indigo-400 shadow'
                          : 'bg-gray-800/60 text-gray-200 ring-gray-700 hover:bg-gray-700'
                      }`}
                      aria-pressed={botDifficulty === lvl}
                    >
                      {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}

              {botDifficulty !== 'OFF' && (
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Human Color</span>
                    <div className="inline-flex rounded-full bg-gray-800/60 p-1 ring-1 ring-gray-700 shadow-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setHumanPlayer(1);
                          resetGame();
                        }}
                        className={`${
                          humanPlayer === 1
                            ? 'bg-indigo-500 text-white shadow hover:bg-indigo-500'
                            : 'text-gray-200 hover:bg-gray-700'
                        } rounded-full px-3 py-1.5 text-sm transition`}
                        aria-pressed={humanPlayer === 1}
                      >
                        Red
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHumanPlayer(2);
                          resetGame();
                        }}
                        className={`${
                          humanPlayer === 2
                            ? 'bg-indigo-500 text-white shadow hover:bg-indigo-500'
                            : 'text-gray-200 hover:bg-gray-700'
                        } rounded-full px-3 py-1.5 text-sm transition`}
                        aria-pressed={humanPlayer === 2}
                      >
                        Yellow
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Who Starts</span>
                    <div className="inline-flex rounded-full bg-gray-800/60 p-1 ring-1 ring-gray-700 shadow-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setStarterIsHuman(true);
                          resetGame();
                        }}
                        className={`${
                          starterIsHuman
                            ? 'bg-indigo-500 text-white shadow hover:bg-indigo-500'
                            : 'text-gray-200 hover:bg-gray-700'
                        } rounded-full px-3 py-1.5 text-sm transition`}
                        aria-pressed={starterIsHuman}
                      >
                        Human
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStarterIsHuman(false);
                          resetGame();
                        }}
                        className={`${
                          !starterIsHuman
                            ? 'bg-indigo-500 text-white shadow hover:bg-indigo-500'
                            : 'text-gray-200 hover:bg-gray-700'
                        } rounded-full px-3 py-1.5 text-sm transition`}
                        aria-pressed={!starterIsHuman}
                      >
                        AI
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className={`${controlButtonBase} border-amber-500 bg-amber-500 text-gray-900 hover:bg-amber-400`}
                >
                  Restart
                </button>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={`${controlButtonBase} border-gray-600 ${
                    canUndo
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'cursor-not-allowed bg-gray-800/50 text-gray-500'
                  }`}
                >
                  Undo
                </button>
              </div>
              <button
                type="button"
                onClick={handleResetScoreboard}
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 sm:w-auto sm:self-center"
              >
                Reset Scoreboard
              </button>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-200 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-md border border-gray-700 bg-gray-800/70 p-3 text-center shadow-inner">
              <dt className="text-xs uppercase tracking-wide text-gray-400">Player 1</dt>
              <dd className="mt-1 text-2xl font-bold text-red-400">{scoreboard.player1}</dd>
            </div>
            <div className="rounded-md border border-gray-700 bg-gray-800/70 p-3 text-center shadow-inner">
              <dt className="text-xs uppercase tracking-wide text-gray-400">Player 2</dt>
              <dd className="mt-1 text-2xl font-bold text-yellow-300">{scoreboard.player2}</dd>
            </div>
            <div className="rounded-md border border-gray-700 bg-gray-800/70 p-3 text-center shadow-inner">
              <dt className="text-xs uppercase tracking-wide text-gray-400">Draws</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-200">{scoreboard.draws}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
};

export default ConnectFour;
