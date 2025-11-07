'use client';

import type { FC, KeyboardEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  type Board,
  type Position,
  type TetrominoType,
  canPlace,
  clearLines,
  createEmptyBoard,
  getRandomTetromino,
  getShape,
  mergePiece,
  rotate as rotatePiece,
  scoreForClears,
} from '@/lib/tetris';

const COLOR_CLASS: Record<TetrominoType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500',
};

const Tetris: FC = () => {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [current, setCurrent] = useState<TetrominoType>(() => getRandomTetromino());
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState<Position>({ x: 3, y: -1 });
  const [next, setNext] = useState<TetrominoType>(() => getRandomTetromino());
  const [hold, setHold] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const dropIntervalRef = useRef<number>(800);
  const loopRef = useRef<number | null>(null);

  const overlayCells = useMemo(() => {
    const cells = new Set<string>();
    const shape = getShape(current, rotation);
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        if (!shape[r][c]) continue;
        const x = pos.x + c;
        const y = pos.y + r;
        if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
          cells.add(`${y}:${x}`);
        }
      }
    }
    return cells;
  }, [current, pos, rotation]);

  const ghostCells = useMemo(() => {
    // Find landing position for ghost
    let gy = pos.y;
    while (canPlace(board, current, rotation, { x: pos.x, y: gy + 1 })) {
      gy += 1;
    }
    const cells = new Set<string>();
    const shape = getShape(current, rotation);
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        if (!shape[r][c]) continue;
        const x = pos.x + c;
        const y = gy + r;
        if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
          cells.add(`${y}:${x}`);
        }
      }
    }
    return cells;
  }, [board, current, pos, rotation]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrent(getRandomTetromino());
    setRotation(0);
    setPos({ x: 3, y: -1 });
    setNext(getRandomTetromino());
    setScore(0);
    setLines(0);
    setLevel(0);
    dropIntervalRef.current = 800;
    setGameOver(false);
    setRunning(true);
  }, []);

  const endGame = useCallback(() => {
    setRunning(false);
    setGameOver(true);
  }, []);

  const lockPiece = useCallback((overridePos?: Position) => {
    const placePos = overridePos ?? pos;
    setBoard((prev) => mergePiece(prev, current, rotation, placePos));
    setTimeout(() => {
      setBoard((prev) => {
        const { board: cleared, cleared: count } = clearLines(prev);
        if (count > 0) {
          setLines((l) => l + count);
          setScore((s) => s + scoreForClears(count, level));
          const nextLevel = Math.floor((lines + count) / 10);
          if (nextLevel !== level) {
            setLevel(nextLevel);
            dropIntervalRef.current = Math.max(120, 800 - nextLevel * 80);
          }
        }
        return cleared;
      });
      // Spawn next piece
      setCurrent((prev) => {
        const newCurrent = next;
        setNext(getRandomTetromino());
        setRotation(0);
        setPos({ x: 3, y: -1 });
        setCanHold(true);
        // If cannot place new piece -> game over
        setBoard((b) => {
          if (!canPlace(b, newCurrent, 0, { x: 3, y: -1 })) {
            endGame();
          }
          return b;
        });
        return newCurrent;
      });
    }, 0);
  }, [current, endGame, level, lines, next, pos, rotation]);

  const softDrop = useCallback(() => {
    const nextPos = { x: pos.x, y: pos.y + 1 };
    if (canPlace(board, current, rotation, nextPos)) {
      setPos(nextPos);
    } else {
      lockPiece(pos);
    }
  }, [board, current, lockPiece, pos, rotation]);

  const hardDrop = useCallback(() => {
    // Compute landing position and commit lock at that position to avoid mid-air locking
    let y = pos.y;
    let steps = 0;
    while (canPlace(board, current, rotation, { x: pos.x, y: y + 1 })) {
      y += 1;
      steps += 1;
    }
    if (steps > 0) {
      setScore((s) => s + steps * 2); // small reward per step
    }
    lockPiece({ x: pos.x, y });
  }, [board, current, lockPiece, pos.x, pos.y, rotation]);

  const move = useCallback(
    (dx: number) => {
      setPos((p) => {
        const nextPos = { x: p.x + dx, y: p.y };
        return canPlace(board, current, rotation, nextPos) ? nextPos : p;
      });
    },
    [board, current, rotation],
  );

  const rotateCurrent = useCallback(() => {
    const { rotation: nextRot, pos: nextPos } = rotatePiece(board, current, rotation, pos);
    setRotation(nextRot);
    setPos(nextPos);
  }, [board, current, pos, rotation]);

  const holdCurrent = useCallback(() => {
    if (!canHold || gameOver || !running) return;
    setCanHold(false);
    setRotation(0);
    setPos({ x: 3, y: -1 });
    setCurrent((curr) => {
      if (hold == null) {
        setHold(curr);
        const nxt = next;
        setNext(getRandomTetromino());
        return nxt;
      }
      const swap = hold;
      setHold(curr);
      return swap;
    });
  }, [canHold, gameOver, hold, next, running]);

  // Game loop using requestAnimationFrame with an interval
  useEffect(() => {
    if (!running || gameOver) return () => {};
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      acc += delta;
      if (acc >= dropIntervalRef.current) {
        acc = 0;
        softDrop();
      }
      loopRef.current = requestAnimationFrame(tick);
    };
    loopRef.current = requestAnimationFrame(tick);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    };
  }, [running, gameOver, softDrop]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (!running) return;
      const key = e.code;
      if (key === 'ArrowLeft') {
        e.preventDefault();
        move(-1);
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        move(1);
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        setScore((s) => s + 1);
        softDrop();
      } else if (key === 'ArrowUp' || key === 'KeyX') {
        e.preventDefault();
        rotateCurrent();
      } else if (key === 'KeyZ' || key === 'ControlLeft' || key === 'ControlRight') {
        e.preventDefault();
        // rotate counter-clockwise by 3 clockwise rotations
        rotateCurrent();
        rotateCurrent();
        rotateCurrent();
      } else if (key === 'Space') {
        e.preventDefault();
        hardDrop();
      } else if (key === 'ShiftLeft' || key === 'ShiftRight' || key === 'KeyC') {
        e.preventDefault();
        holdCurrent();
      } else if (key === 'Enter' && gameOver) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', onKey as unknown as EventListener);
    return () => window.removeEventListener('keydown', onKey as unknown as EventListener);
  }, [gameOver, hardDrop, holdCurrent, move, rotateCurrent, running, softDrop, startGame]);

  const boardWithOverlay = useMemo(() => {
    return board.map((row, y) =>
      row.map((cell, x) => {
        if (cell) return cell;
        if (overlayCells.has(`${y}:${x}`)) return current;
        return null;
      }),
    );
  }, [board, current, overlayCells]);

  const handleKeyDownContainer = (e: KeyboardEvent<HTMLDivElement>) => {
    // Prevent arrow keys from scrolling when container is focused
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-10 pt-6 text-white sm:px-6">
      <header className="-mx-4 -mt-6 flex flex-col gap-4 bg-gray-900/95 px-4 pb-2 pt-3 shadow-lg backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Tetris</h1>
            <p className="mt-1 text-sm text-gray-300">Rotate, move, and stack tetrominoes to clear lines.</p>
          </div>
          <div className="flex items-center gap-2">
            {running ? (
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                onClick={() => setRunning(false)}
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                onClick={() => (gameOver ? startGame() : setRunning(true))}
              >
                {gameOver ? 'Play Again' : board.flat().some(Boolean) ? 'Resume' : 'Start Game'}
              </button>
            )}
            <button
              type="button"
              className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              onClick={startGame}
            >
              Restart
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(360px,1.25fr)] lg:items-start lg:gap-8">
        <section className="flex flex-col gap-4" onKeyDown={handleKeyDownContainer} tabIndex={0}>
          <div className="rounded-lg border border-gray-700 bg-gray-900/80 p-4 shadow-lg">
            <p className="text-lg font-semibold text-indigo-300" aria-live="polite">
              {gameOver ? 'Game Over' : running ? 'Playing' : 'Paused'} — Score {score} · Lines {lines} · Level {level}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[22rem] sm:max-w-[26rem] md:max-w-[30rem] lg:mx-0">
            <div className="rounded-2xl border border-gray-700 bg-gray-950/60 p-3 shadow-lg">
              <div className="grid grid-cols-10 gap-0.5 rounded-lg bg-gray-900 p-1">
                {boardWithOverlay.map((row, y) =>
                  row.map((cell, x) => {
                    const isGhost = !cell && ghostCells.has(`${y}:${x}`) && !overlayCells.has(`${y}:${x}`);
                    const ghostRing = isGhost && COLOR_CLASS[current]
                      ? `ring-2 ring-offset-0 ring-opacity-40 ${
                          COLOR_CLASS[current]
                            .replace('bg-', 'ring-')
                            .replace('-500', '-300')
                            .replace('-400', '-300')
                        }`
                      : '';
                    return (
                      <div
                        key={`${y}-${x}`}
                        className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-[2px] ${
                          cell ? `${COLOR_CLASS[cell]} shadow-inner` : isGhost ? `bg-gray-800 ${ghostRing}` : 'bg-gray-800'
                        }`}
                      />
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="mt-2 grid grid-cols-6 items-center gap-2 sm:hidden">
            <button
              type="button"
              className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white active:bg-gray-600"
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white active:bg-gray-600"
              onClick={() => rotateCurrent()}
            >
              ⟳
            </button>
            <button
              type="button"
              className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white active:bg-gray-600"
              onClick={() => move(1)}
            >
              →
            </button>
            <button
              type="button"
              className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white active:bg-gray-600"
              onClick={() => softDrop()}
            >
              ↓
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white active:bg-indigo-700"
              onClick={() => hardDrop()}
            >
              Drop
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-semibold text-white ${
                canHold ? 'bg-gray-700 active:bg-gray-600' : 'bg-gray-700/60 cursor-not-allowed'
              }`}
              onClick={() => canHold && holdCurrent()}
              disabled={!canHold}
            >
              Hold
            </button>
          </div>
        </section>

        <aside className="rounded-lg border border-gray-700 bg-gray-900/90 p-6 shadow-xl lg:sticky lg:top-24 w-full">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-indigo-300">Hold</h2>
              <div className="mt-2 inline-block rounded-lg border border-gray-700 bg-gray-950/60 p-2">
                <div className="grid grid-cols-4 gap-0.5 bg-gray-900 p-1">
                  {Array.from({ length: 4 }).map((_, r) =>
                    Array.from({ length: 4 }).map((_, c) => {
                      const shape = hold ? getShape(hold, 0) : Array.from({ length: 4 }, () => [0, 0, 0, 0]);
                      const filled = !!(hold && (shape as number[][])[r][c]);
                      const colorClass = hold ? COLOR_CLASS[hold] : 'bg-gray-800';
                      return (
                        <div
                          key={`h-${r}-${c}`}
                          className={`h-4 w-4 sm:h-5 sm:w-5 rounded-[2px] ${filled ? `${colorClass} shadow-inner` : 'bg-gray-800'}`}
                        />
                      );
                    }),
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1 font-semibold text-white ${
                    canHold ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-700/60 cursor-not-allowed'
                  }`}
                  onClick={() => canHold && holdCurrent()}
                  disabled={!canHold}
                >
                  Hold (Shift/C)
                </button>
                <span className="opacity-80">{canHold ? 'ready' : 'used'}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-indigo-300">Next</h2>
              <div className="mt-2 inline-block rounded-lg border border-gray-700 bg-gray-950/60 p-2">
                <div className="grid grid-cols-4 gap-0.5 bg-gray-900 p-1">
                  {Array.from({ length: 4 }).map((_, r) =>
                    Array.from({ length: 4 }).map((_, c) => {
                      const shape = getShape(next, 0);
                      const filled = !!shape[r][c];
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`h-4 w-4 sm:h-5 sm:w-5 rounded-[2px] ${
                            filled ? `${COLOR_CLASS[next]} shadow-inner` : 'bg-gray-800'
                          }`}
                        />
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
            {/* Primary Stats vertically distributed: top, middle, bottom */}
            <div className="min-h-[20rem] lg:min-h-[26rem] flex flex-col justify-between">
              <div className="rounded-xl border border-gray-700 bg-gray-800/90 p-4 text-center shadow-inner">
                <div className="text-xs uppercase tracking-wide text-gray-300">Score</div>
                <div className="mt-1 px-2 py-0.5 text-3xl md:text-4xl font-extrabold text-white font-mono tabular-nums leading-none break-all">
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-800/90 p-4 text-center shadow-inner">
                <div className="text-xs uppercase tracking-wide text-gray-300">Lines</div>
                <div className="mt-1 px-2 py-0.5 text-3xl md:text-4xl font-extrabold text-white font-mono tabular-nums leading-none break-all">
                  {lines.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-800/90 p-4 text-center shadow-inner">
                <div className="text-xs uppercase tracking-wide text-gray-300">Level</div>
                <div className="mt-1 px-2 py-0.5 text-3xl md:text-4xl font-extrabold text-white font-mono tabular-nums leading-none break-all">
                  {level.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-400">
              <div>Controls: ← → to move, ↑/X rotate, Z to rotate CCW, ↓ soft drop, Space hard drop.</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Tetris;
