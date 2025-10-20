'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';

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
  'inline-flex h-11 min-w-[9rem] items-center justify-center rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 sm:w-auto sm:flex-1 lg:flex-none';

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

  const instructionsId = useId();
  const undoHelpTextId = useId();

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
      if (winner || isDraw) {
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
    [board, currentPlayer, isDraw, winner],
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setIsDraw(false);
    setHoveredColumn(null);
    setBoardHasFocus(false);
    setFocusColumn(0);
    setMoveHistory([]);
    setLastMove(null);
  }, []);

  const handleRestart = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleResetScoreboard = useCallback(() => {
    setScoreboard({ player1: 0, player2: 0, draws: 0 });
  }, []);

  const handleUndo = useCallback(() => {
    if (winner || isDraw) {
      return;
    }

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
  }, [isDraw, winner]);

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
      if ((event.key === 'z' || event.key === 'Z') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleUndo();
      }
    },
    [focusColumn, handleDrop, handleUndo, highlightedColumn],
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
            <p className={`text-lg font-semibold ${statusColorClass}`}>
              {statusMessage}
            </p>
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
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:items-stretch sm:justify-center">
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
                  aria-disabled={!canUndo}
                  aria-describedby={undoHelpTextId}
                  title={
                    canUndo
                      ? 'Undo the previous move (Ctrl+Z)'
                      : 'Make a move to enable undo'
                  }
                  className={`${controlButtonBase} w-full flex-col items-start gap-1 text-left sm:w-auto sm:flex-1 ${
                    canUndo
                      ? 'border-sky-500 bg-sky-500 text-gray-900 hover:bg-sky-400 focus-visible:ring-sky-300'
                      : 'cursor-not-allowed border-gray-600 bg-gray-800/60 text-gray-500'
                  }`}
                >
                  <span className="text-sm font-semibold">Undo Last Move</span>
                  <span className="text-xs text-gray-200">Shortcut: Ctrl+Z</span>
                </button>
              </div>
              <p
                id={undoHelpTextId}
                className="w-full text-center text-xs text-gray-400 sm:text-left"
              >
                Undo removes the last token placed so you can quickly correct mistakes. Try the Ctrl+Z shortcut for even
                faster access.
              </p>
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
