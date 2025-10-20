export const moveLeft = (board: number[][]) => {
  let newBoard = board.map(row => row.slice());
  let score = 0;
  let moved = false;

  for (let y = 0; y < 4; y++) {
    let row = newBoard[y];
    let newRow = row.filter(tile => tile !== 0);

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        score += newRow[i];
        newRow.splice(i + 1, 1);
      }
    }

    while (newRow.length < 4) {
      newRow.push(0);
    }

    if (newRow.join(',') !== row.join(',')) {
      moved = true;
    }

    newBoard[y] = newRow;
  }

  return { board: newBoard, score, moved };
};

export const moveRight = (board: number[][]) => {
  let newBoard = board.map(row => row.slice());
  let score = 0;
  let moved = false;

  for (let y = 0; y < 4; y++) {
    let row = newBoard[y];
    let newRow = row.filter(tile => tile !== 0);

    for (let i = newRow.length - 1; i > 0; i--) {
      if (newRow[i] === newRow[i - 1]) {
        newRow[i] *= 2;
        score += newRow[i];
        newRow.splice(i - 1, 1);
      }
    }

    while (newRow.length < 4) {
      newRow.unshift(0);
    }

    if (newRow.join(',') !== row.join(',')) {
      moved = true;
    }

    newBoard[y] = newRow;
  }

  return { board: newBoard, score, moved };
};

export const moveUp = (board: number[][]) => {
  let newBoard = rotateLeft(board);
  const { board: movedBoard, score, moved } = moveLeft(newBoard);
  return { board: rotateRight(movedBoard), score, moved };
};

export const moveDown = (board: number[][]) => {
  let newBoard = rotateLeft(board);
  const { board: movedBoard, score, moved } = moveRight(newBoard);
  return { board: rotateRight(movedBoard), score, moved };
};

const rotateLeft = (board: number[][]) => {
  const newBoard = createEmptyBoard();
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      newBoard[y][x] = board[x][3 - y];
    }
  }
  return newBoard;
};

const rotateRight = (board: number[][]) => {
  const newBoard = createEmptyBoard();
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      newBoard[y][x] = board[3 - x][y];
    }
  }
  return newBoard;
};

const createEmptyBoard = () => Array(4).fill(null).map(() => Array(4).fill(0));

export const isGameOver = (board: number[][]): boolean => {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (board[y][x] === 0) {
                return false; // There is an empty tile, so the game is not over
            }
            if (y < 3 && board[y][x] === board[y + 1][x]) {
                return false; // There are vertically adjacent tiles with the same value
            }
            if (x < 3 && board[y][x] === board[y][x + 1]) {
                return false; // There are horizontally adjacent tiles with the same value
            }
        }
    }
    return true; // No empty tiles and no possible moves
};