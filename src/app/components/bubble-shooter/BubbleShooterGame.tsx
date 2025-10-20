'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import type { ActiveBubble, BoardState } from './types';

const COLORS = ['#f97316', '#38bdf8', '#a855f7', '#facc15', '#f472b6', '#22c55e'];
const BOARD_COLS = 10;
const INITIAL_ROWS = 5;
const BUBBLE_SIZE = 36;
const ROW_HEIGHT = BUBBLE_SIZE * 0.8660254;
const VISIBLE_ROWS = 14;
const BOARD_WIDTH = BUBBLE_SIZE * BOARD_COLS + BUBBLE_SIZE;
const BOARD_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS + BUBBLE_SIZE;
const BUBBLE_SPEED = 460;
const ANGLE_LIMIT = Math.PI / 3;
const MATCH_THRESHOLD = 3;
const ROW_DROP_BASE = 14000;
const ROW_DROP_MIN = 5500;
const LAUNCH_Y = BOARD_HEIGHT - 126;

interface CollisionResult {
  row: number;
  col: number;
  x: number;
  y: number;
}

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const createEmptyRow = (): (string | null)[] => Array.from({ length: BOARD_COLS }, () => null);

const createInitialBoard = (): BoardState => {
  const rows: BoardState = [];
  for (let row = 0; row < INITIAL_ROWS; row += 1) {
    rows.push(Array.from({ length: BOARD_COLS }, () => randomColor()));
  }
  return rows;
};

const getBubblePosition = (row: number, col: number) => {
  const offset = row % 2 === 0 ? 0 : BUBBLE_SIZE / 2;
  const x = offset + col * BUBBLE_SIZE + BUBBLE_SIZE / 2;
  const y = row * ROW_HEIGHT + BUBBLE_SIZE / 2;
  return { x, y };
};

const getNeighborOffsets = (row: number) =>
  row % 2 === 0
    ? [
        [-1, 0],
        [-1, -1],
        [0, -1],
        [0, 1],
        [1, 0],
        [1, -1],
      ]
    : [
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, 0],
        [1, 1],
      ];

const getNeighborCoords = (row: number, col: number) =>
  getNeighborOffsets(row).map(([dr, dc]) => [row + dr, col + dc] as const);

const cloneBoard = (board: BoardState): BoardState => board.map((row) => [...row]);

const ensureRows = (board: BoardState, targetRow: number) => {
  while (board.length <= targetRow) {
    board.push(createEmptyRow());
  }
};

const trimEmptyRows = (board: BoardState) => {
  const trimmed = [...board];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1].every((cell) => cell === null)) {
    trimmed.pop();
  }
  return trimmed;
};

const floodFillMatches = (board: BoardState, row: number, col: number, color: string) => {
  const stack: Array<[number, number]> = [[row, col]];
  const visited = new Set<string>();
  const cluster: Array<[number, number]> = [];

  while (stack.length > 0) {
    const [currentRow, currentCol] = stack.pop()!;
    const key = `${currentRow}-${currentCol}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    if (currentRow < 0 || currentCol < 0 || currentCol >= BOARD_COLS) {
      continue;
    }
    if (!board[currentRow] || board[currentRow][currentCol] !== color) {
      continue;
    }
    cluster.push([currentRow, currentCol]);
    for (const [nextRow, nextCol] of getNeighborCoords(currentRow, currentCol)) {
      stack.push([nextRow, nextCol]);
    }
  }

  return cluster;
};

const dropFloatingBubbles = (board: BoardState) => {
  const reachable = board.map((row) => row.map(() => false));
  const queue: Array<[number, number]> = [];

  for (let col = 0; col < BOARD_COLS; col += 1) {
    if (board[0]?.[col]) {
      reachable[0][col] = true;
      queue.push([0, col]);
    }
  }

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    for (const [nextRow, nextCol] of getNeighborCoords(row, col)) {
      if (nextRow < 0 || nextCol < 0 || nextCol >= BOARD_COLS) {
        continue;
      }
      if (!board[nextRow]?.[nextCol]) {
        continue;
      }
      if (reachable[nextRow]?.[nextCol]) {
        continue;
      }
      reachable[nextRow][nextCol] = true;
      queue.push([nextRow, nextCol]);
    }
  }

  let fallen = 0;
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      if (board[row]?.[col] && !reachable[row]?.[col]) {
        board[row][col] = null;
        fallen += 1;
      }
    }
  }

  return { board, fallen };
};

const resolveMatches = (board: BoardState, row: number, col: number, color: string) => {
  const cluster = floodFillMatches(board, row, col, color);
  let popped = 0;

  if (cluster.length >= MATCH_THRESHOLD) {
    cluster.forEach(([clusterRow, clusterCol]) => {
      board[clusterRow][clusterCol] = null;
      popped += 1;
    });
    const dropResult = dropFloatingBubbles(board);
    board = dropResult.board;
    popped += dropResult.fallen;
  }

  return { board: trimEmptyRows(board), popped };
};

const snapToGrid = (x: number, y: number) => {
  const radius = BUBBLE_SIZE / 2;
  let row = Math.round((y - radius) / ROW_HEIGHT);
  if (row < 0) {
    row = 0;
  }
  const offset = row % 2 === 0 ? 0 : BUBBLE_SIZE / 2;
  let col = Math.round((x - offset - radius) / BUBBLE_SIZE);
  if (col < 0) {
    col = 0;
  }
  if (col >= BOARD_COLS) {
    col = BOARD_COLS - 1;
  }
  return { row, col };
};

const determinePlacement = (
  board: BoardState,
  x: number,
  y: number,
  collided: CollisionResult | null,
) => {
  const candidates: Array<{ row: number; col: number }> = [];

  if (collided) {
    candidates.push(...getNeighborCoords(collided.row, collided.col).map(([row, col]) => ({ row, col })));
  }

  const snapped = snapToGrid(x, y);
  candidates.push(snapped);
  candidates.push(...getNeighborCoords(snapped.row, snapped.col).map(([row, col]) => ({ row, col })));

  let best: { row: number; col: number; distance: number } | null = null;

  const consider = (row: number, col: number) => {
    if (row < 0 || col < 0 || col >= BOARD_COLS) {
      return;
    }
    ensureRows(board, row);
    if (board[row]?.[col]) {
      return;
    }
    const position = getBubblePosition(row, col);
    const distance = Math.hypot(position.x - x, position.y - y);
    if (!best || distance < best.distance) {
      best = { row, col, distance };
    }
  };

  candidates.forEach(({ row, col }) => consider(row, col));

  if (!best) {
    for (let row = 0; row < board.length + 2; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        consider(row, col);
      }
    }
  }

  return best ? { row: best.row, col: best.col } : snapped;
};

const hasReachedBottom = (board: BoardState) => {
  const radius = BUBBLE_SIZE / 2;
  return board.some((row, rowIndex) =>
    row.some((cell, colIndex) => {
      if (!cell) {
        return false;
      }
      const { y } = getBubblePosition(rowIndex, colIndex);
      return y + radius >= BOARD_HEIGHT - 8;
    }),
  );
};

const countBubbles = (board: BoardState) =>
  board.reduce(
    (total, row) => total + row.reduce((rowCount, cell) => rowCount + (cell ? 1 : 0), 0),
    0,
  );

const getRowDropInterval = (level: number) => Math.max(ROW_DROP_MIN, ROW_DROP_BASE - (level - 1) * 1200);

const BubbleShooterGame = () => {
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard());
  const [activeBubble, setActiveBubble] = useState<ActiveBubble | null>(null);
  const [aimAngle, setAimAngle] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [currentBubbleColor, setCurrentBubbleColor] = useState(randomColor);
  const [nextBubbleColor, setNextBubbleColor] = useState(randomColor);
  const [scale, setScale] = useState(1);
  const [poppedCount, setPoppedCount] = useState(0);

  const router = useRouter();

  const boardRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);

  const boardStateRef = useRef<BoardState>(board);
  const activeBubbleRef = useRef<ActiveBubble | null>(activeBubble);
  const angleRef = useRef(aimAngle);
  const gameOverRef = useRef(gameOver);
  const levelRef = useRef(level);
  const poppedRef = useRef(0);
  const currentColorRef = useRef(currentBubbleColor);
  const nextColorRef = useRef(nextBubbleColor);
  const lastRowDropRef = useRef<number>(performance.now());
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    boardStateRef.current = board;
  }, [board]);

  useEffect(() => {
    activeBubbleRef.current = activeBubble;
  }, [activeBubble]);

  useEffect(() => {
    angleRef.current = aimAngle;
  }, [aimAngle]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    currentColorRef.current = currentBubbleColor;
  }, [currentBubbleColor]);

  useEffect(() => {
    nextColorRef.current = nextBubbleColor;
  }, [nextBubbleColor]);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (!boardWrapperRef.current) {
        return;
      }
      const width = boardWrapperRef.current.clientWidth;
      const nextScale = Math.min(1, width / BOARD_WIDTH);
      setScale(nextScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const triggerGameOver = useCallback(() => {
    setGameOver(true);
    gameOverRef.current = true;
    activeBubbleRef.current = null;
    setActiveBubble(null);
  }, []);

  const placeBubble = useCallback(
    (bubble: { x: number; y: number; color: string }, collided: CollisionResult | null) => {
      let triggeredGameOver = false;

      setBoard((previous) => {
        const working = cloneBoard(previous);
        const placement = determinePlacement(working, bubble.x, bubble.y, collided);
        ensureRows(working, placement.row);
        working[placement.row][placement.col] = bubble.color;

        const { board: resolvedBoard, popped } = resolveMatches(working, placement.row, placement.col, bubble.color);

        if (popped > 0) {
          setScore((currentScore) => currentScore + popped * 10);
          const updatedTotal = poppedRef.current + popped;
          poppedRef.current = updatedTotal;
          setPoppedCount(updatedTotal);
          const nextLevel = Math.max(1, 1 + Math.floor(updatedTotal / 20));
          setLevel((currentLevel) => (nextLevel > currentLevel ? nextLevel : currentLevel));
        }

        const trimmed = trimEmptyRows(resolvedBoard);

        if (hasReachedBottom(trimmed)) {
          triggeredGameOver = true;
        }

        return trimmed;
      });

      activeBubbleRef.current = null;
      setActiveBubble(null);

      if (triggeredGameOver) {
        triggerGameOver();
      }
    },
    [triggerGameOver],
  );

  const findCollision = useCallback((x: number, y: number): CollisionResult | null => {
    const boardState = boardStateRef.current;
    for (let row = 0; row < boardState.length; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const cell = boardState[row]?.[col];
        if (!cell) {
          continue;
        }
        const position = getBubblePosition(row, col);
        const distance = Math.hypot(position.x - x, position.y - y);
        if (distance <= BUBBLE_SIZE - 2) {
          return { row, col, ...position };
        }
      }
    }
    return null;
  }, []);

  const updateActiveBubble = useCallback(
    (delta: number) => {
      const bubble = activeBubbleRef.current;
      if (!bubble) {
        return;
      }

      let { x, y, vx, vy, color } = bubble;
      const radius = BUBBLE_SIZE / 2;
      x += vx * delta;
      y += vy * delta;

      if (x <= radius) {
        x = radius;
        vx = Math.abs(vx);
      } else if (x >= BOARD_WIDTH - radius) {
        x = BOARD_WIDTH - radius;
        vx = -Math.abs(vx);
      }

      if (y <= radius) {
        placeBubble({ x, y: radius, color }, null);
        return;
      }

      const collision = findCollision(x, y);
      if (collision) {
        placeBubble({ x, y, color }, collision);
        return;
      }

      if (y >= BOARD_HEIGHT - radius) {
        triggerGameOver();
        return;
      }

      const nextBubble: ActiveBubble = { x, y, vx, vy, color };
      activeBubbleRef.current = nextBubble;
      setActiveBubble(nextBubble);
    },
    [findCollision, placeBubble, triggerGameOver],
  );

  const dropRow = useCallback(() => {
    if (gameOverRef.current) {
      return;
    }

    let triggeredGameOver = false;

    setBoard((previous) => {
      const newRow = Array.from({ length: BOARD_COLS }, () => randomColor());
      const shifted = [newRow, ...previous.map((row) => [...row])];
      const trimmed = trimEmptyRows(shifted);
      if (hasReachedBottom(trimmed)) {
        triggeredGameOver = true;
      }
      return trimmed;
    });

    if (!triggeredGameOver) {
      const bubble = activeBubbleRef.current;
      if (bubble) {
        const radius = BUBBLE_SIZE / 2;
        const adjustedBubble: ActiveBubble = {
          ...bubble,
          y: Math.max(radius, bubble.y - ROW_HEIGHT),
        };
        activeBubbleRef.current = adjustedBubble;
        setActiveBubble(adjustedBubble);
      }
    }

    if (triggeredGameOver) {
      triggerGameOver();
    }
  }, [triggerGameOver]);

  useEffect(() => {
    let frameId: number;

    const step = (timestamp: number) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }
      const delta = (timestamp - (lastFrameRef.current ?? timestamp)) / 1000;
      lastFrameRef.current = timestamp;

      if (!gameOverRef.current) {
        updateActiveBubble(delta);
        const interval = getRowDropInterval(levelRef.current);
        if (timestamp - lastRowDropRef.current >= interval) {
          lastRowDropRef.current = timestamp;
          dropRow();
        }
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [dropRow, updateActiveBubble]);

  const updateAim = useCallback((x: number, y: number) => {
    const originX = BOARD_WIDTH / 2;
    const originY = LAUNCH_Y;
    const dx = x - originX;
    const dy = originY - y;
    let angle = Math.atan2(dx, dy);
    if (!Number.isFinite(angle)) {
      angle = 0;
    }
    if (dy <= 0) {
      angle = dx >= 0 ? ANGLE_LIMIT : -ANGLE_LIMIT;
    }
    angle = Math.max(-ANGLE_LIMIT, Math.min(ANGLE_LIMIT, angle));
    setAimAngle(angle);
    angleRef.current = angle;
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!boardRef.current) {
        return;
      }
      const rect = boardRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      const scaleX = BOARD_WIDTH / rect.width;
      const scaleY = BOARD_HEIGHT / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      updateAim(x, y);
    },
    [updateAim],
  );

  const shoot = useCallback(() => {
    if (gameOverRef.current || activeBubbleRef.current) {
      return;
    }

    const angle = angleRef.current;
    const color = currentColorRef.current;
    const vx = Math.sin(angle) * BUBBLE_SPEED;
    const vy = -Math.cos(angle) * BUBBLE_SPEED;

    const bubble: ActiveBubble = {
      x: BOARD_WIDTH / 2,
      y: LAUNCH_Y,
      vx,
      vy,
      color,
    };

    activeBubbleRef.current = bubble;
    setActiveBubble(bubble);

    const upcomingColor = nextColorRef.current;
    setCurrentBubbleColor(upcomingColor);
    currentColorRef.current = upcomingColor;

    const newNext = randomColor();
    setNextBubbleColor(newNext);
    nextColorRef.current = newNext;
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      handlePointerMove(event);
      shoot();
    },
    [handlePointerMove, shoot],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        shoot();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        let angle = angleRef.current - 0.08;
        if (angle < -ANGLE_LIMIT) {
          angle = -ANGLE_LIMIT;
        }
        angleRef.current = angle;
        setAimAngle(angle);
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        let angle = angleRef.current + 0.08;
        if (angle > ANGLE_LIMIT) {
          angle = ANGLE_LIMIT;
        }
        angleRef.current = angle;
        setAimAngle(angle);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shoot]);

  const restartGame = useCallback(() => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    boardStateRef.current = initialBoard;
    setScore(0);
    setLevel(1);
    setGameOver(false);
    gameOverRef.current = false;
    poppedRef.current = 0;
    setPoppedCount(0);
    lastRowDropRef.current = performance.now();
    lastFrameRef.current = null;
    setActiveBubble(null);
    activeBubbleRef.current = null;
    setAimAngle(0);
    angleRef.current = 0;
    const freshCurrent = randomColor();
    const freshNext = randomColor();
    setCurrentBubbleColor(freshCurrent);
    currentColorRef.current = freshCurrent;
    setNextBubbleColor(freshNext);
    nextColorRef.current = freshNext;
  }, []);

  const remainingBubbles = useMemo(() => countBubbles(board), [board]);

  const handleBackToMenu = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
      <GameBoard
        board={board}
        activeBubble={activeBubble}
        aimAngle={aimAngle}
        currentBubbleColor={currentBubbleColor}
        bubbleSize={BUBBLE_SIZE}
        boardWidth={BOARD_WIDTH}
        boardHeight={BOARD_HEIGHT}
        scale={scale}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        boardWrapperRef={boardWrapperRef}
        boardRef={boardRef}
        getBubblePosition={getBubblePosition}
        gameOver={gameOver}
        onRestart={restartGame}
        score={score}
        level={level}
        poppedCount={poppedCount}
        onBackToMenu={handleBackToMenu}
      />
      <ScoreBoard
        score={score}
        level={level}
        remainingBubbles={remainingBubbles}
        nextBubbleColor={nextBubbleColor}
        currentBubbleColor={currentBubbleColor}
        onRestart={restartGame}
        isGameOver={gameOver}
        poppedCount={poppedCount}
      />
    </div>
  );
};

export default BubbleShooterGame;
