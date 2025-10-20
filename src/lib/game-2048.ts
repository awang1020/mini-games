export const BOARD_SIZE = 4;
export const WINNING_TILE = 2048;

export type BoardMatrix = number[][];

export interface MoveResult {
  board: BoardMatrix;
  score: number;
  moved: boolean;
}

export const createEmptyBoard = (): BoardMatrix =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));

export const moveLeft = (board: BoardMatrix): MoveResult => {
  const newBoard = board.map((row) => [...row]);
  let score = 0;
  let moved = false;

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    const row = newBoard[y];
    const filteredRow = row.filter((tile) => tile !== 0);

    for (let i = 0; i < filteredRow.length - 1; i += 1) {
      if (filteredRow[i] === filteredRow[i + 1]) {
        filteredRow[i] *= 2;
        score += filteredRow[i];
        filteredRow.splice(i + 1, 1);
      }
    }

    while (filteredRow.length < BOARD_SIZE) {
      filteredRow.push(0);
    }

    if (filteredRow.some((value, index) => value !== row[index])) {
      moved = true;
    }

    newBoard[y] = filteredRow;
  }

  return { board: newBoard, score, moved };
};

export const moveRight = (board: BoardMatrix): MoveResult => {
  const reversedBoard = board.map((row) => [...row].reverse());
  const { board: movedBoard, score, moved } = moveLeft(reversedBoard);
  const restoredBoard = movedBoard.map((row) => [...row].reverse());
  return { board: restoredBoard, score, moved };
};

export const moveUp = (board: BoardMatrix): MoveResult => {
  const rotatedBoard = rotateLeft(board);
  const result = moveLeft(rotatedBoard);
  return { board: rotateRight(result.board), score: result.score, moved: result.moved };
};

export const moveDown = (board: BoardMatrix): MoveResult => {
  const rotatedBoard = rotateLeft(board);
  const result = moveRight(rotatedBoard);
  return { board: rotateRight(result.board), score: result.score, moved: result.moved };
};

const rotateLeft = (board: BoardMatrix): BoardMatrix => {
  const rotated = createEmptyBoard();
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      rotated[y][x] = board[x][BOARD_SIZE - 1 - y];
    }
  }
  return rotated;
};

const rotateRight = (board: BoardMatrix): BoardMatrix => {
  const rotated = createEmptyBoard();
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      rotated[y][x] = board[BOARD_SIZE - 1 - x][y];
    }
  }
  return rotated;
};

export const isGameOver = (board: BoardMatrix): boolean => {
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const currentTile = board[y][x];
      if (currentTile === 0) {
        return false;
      }
      if (y < BOARD_SIZE - 1 && currentTile === board[y + 1][x]) {
        return false;
      }
      if (x < BOARD_SIZE - 1 && currentTile === board[y][x + 1]) {
        return false;
      }
    }
  }
  return true;
};
