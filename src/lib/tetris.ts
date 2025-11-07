export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type Cell = null | TetrominoType;
export type Board = Cell[][];

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position { x: number; y: number }

// 4x4 matrices for each rotation state
const SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
  ],
  O: [
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  T: [
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
};

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array<Cell>(BOARD_WIDTH).fill(null));

export const getRandomTetromino = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

export const getShape = (type: TetrominoType, rotation: number): number[][] => {
  const rotations = SHAPES[type];
  return rotations[rotation % rotations.length];
};

export const canPlace = (board: Board, type: TetrominoType, rotation: number, pos: Position): boolean => {
  const shape = getShape(type, rotation);
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      if (!shape[r][c]) continue;
      const x = pos.x + c;
      const y = pos.y + r;
      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false;
      if (y >= 0 && board[y][x]) return false;
    }
  }
  return true;
};

export const mergePiece = (board: Board, type: TetrominoType, rotation: number, pos: Position): Board => {
  const shape = getShape(type, rotation);
  const next = board.map((row) => [...row]);
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      if (!shape[r][c]) continue;
      const x = pos.x + c;
      const y = pos.y + r;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        next[y][x] = type;
      }
    }
  }
  return next;
};

export const clearLines = (board: Board) => {
  const remaining: Board = [];
  let cleared = 0;
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    if (board[y].every((cell) => cell)) {
      cleared += 1;
    } else {
      remaining.push(board[y]);
    }
  }
  while (remaining.length < BOARD_HEIGHT) {
    remaining.unshift(Array<Cell>(BOARD_WIDTH).fill(null));
  }
  return { board: remaining, cleared } as const;
};

export const rotate = (board: Board, type: TetrominoType, rotation: number, pos: Position): { rotation: number; pos: Position } => {
  const rotations = SHAPES[type].length;
  const nextRotation = (rotation + 1) % rotations;
  // Basic wall kick attempts
  const kicks = [0, -1, 1, -2, 2];
  for (const dx of kicks) {
    const testPos = { x: pos.x + dx, y: pos.y };
    if (canPlace(board, type, nextRotation, testPos)) {
      return { rotation: nextRotation, pos: testPos };
    }
  }
  return { rotation, pos };
};

export const scoreForClears = (count: number, level: number) => {
  const base = [0, 40, 100, 300, 1200][count] ?? 0;
  return base * (level + 1);
};

