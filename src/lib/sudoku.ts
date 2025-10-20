export const generateSudoku = (difficulty: 'easy' | 'medium' | 'hard') => {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));
  solveSudoku(board);

  // Keep a copy of the full solution
  const solution = board.map(row => [...row]);

  let holes = 0;
  if (difficulty === 'easy') {
    holes = 40;
  } else if (difficulty === 'medium') {
    holes = 50;
  } else {
    holes = 60;
  }

  // Poke holes in the board to create the puzzle
  for (let i = 0; i < holes; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (board[row][col] === 0);
    board[row][col] = 0;
  }

  return { puzzle: board, solution };
};

const solveSudoku = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffle(nums);
        for (const num of nums) {
          if (isValid(row, col, num, board)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            } else {
              board[row][col] = 0;
            }
          }
        }
        return false;
      }
    }
  }
  return true;
};

const isValid = (row: number, col: number, val: number, board: number[][]) => {
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === val) return false;
    if (board[row][i] === val) return false;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === val) {
        return false;
      }
    }
  }

  return true;
};

const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};