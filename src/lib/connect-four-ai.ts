// Connect Four AI utilities and difficulty levels
// Board is 6 rows x 7 columns; cells: 0 empty, 1 human, 2 AI (by convention)

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

const ROWS = 6;
const COLS = 7;

type Player = 1 | 2;

const cloneBoard = (board: number[][]): number[][] => board.map((r) => r.slice());

export const getAvailableColumns = (board: number[][]): number[] => {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c += 1) {
    if (board[0][c] === 0) cols.push(c);
  }
  return cols;
};

export const findAvailableRow = (board: number[][], column: number): number | null => {
  for (let r = ROWS - 1; r >= 0; r -= 1) {
    if (board[r][column] === 0) return r;
  }
  return null;
};

export const dropInColumn = (board: number[][], column: number, player: Player): number[][] | null => {
  const row = findAvailableRow(board, column);
  if (row === null) return null;
  const next = cloneBoard(board);
  next[row][column] = player;
  return next;
};

const checkDirection = (
  board: number[][],
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: Player,
): boolean => {
  for (let k = 0; k < 4; k += 1) {
    const r = row + dr * k;
    const c = col + dc * k;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) return false;
  }
  return true;
};

export const hasWin = (board: number[][], player: Player): boolean => {
  // Horizontal, vertical, diag down-right, diag up-right
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (
        checkDirection(board, r, c, 0, 1, player) ||
        checkDirection(board, r, c, 1, 0, player) ||
        checkDirection(board, r, c, 1, 1, player) ||
        checkDirection(board, r, c, -1, 1, player)
      ) {
        return true;
      }
    }
  }
  return false;
};

const isBoardFull = (board: number[][]): boolean => board[0].every((v) => v !== 0);

const winnerAny = (board: number[][]): Player | null => {
  if (hasWin(board, 1)) return 1;
  if (hasWin(board, 2)) return 2;
  return null;
};

// Heuristic evaluation for non-terminal boards.
// Inspired by standard Connect Four heuristics using 4-length windows.
const scoreWindow = (window: number[], me: Player): number => {
  const opponent: Player = me === 1 ? 2 : 1;
  const countMe = window.filter((x) => x === me).length;
  const countOpp = window.filter((x) => x === opponent).length;
  const countEmpty = window.filter((x) => x === 0).length;

  if (countMe === 4) return 100_000;
  if (countOpp === 4) return -100_000;
  if (countMe === 3 && countEmpty === 1) return 120;
  if (countMe === 2 && countEmpty === 2) return 15;
  if (countOpp === 3 && countEmpty === 1) return -110;
  if (countOpp === 2 && countEmpty === 2) return -10;
  return 0;
};

const evaluateBoard = (board: number[][], me: Player): number => {
  const opponent: Player = me === 1 ? 2 : 1;
  // Center column preference
  let score = 0;
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r += 1) if (board[r][centerCol] === me) centerCount += 1;
  score += centerCount * 6; // prefer central stacking

  // Horizontal windows
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c <= COLS - 4; c += 1) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += scoreWindow(window, me);
    }
  }
  // Vertical windows
  for (let c = 0; c < COLS; c += 1) {
    for (let r = 0; r <= ROWS - 4; r += 1) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += scoreWindow(window, me);
    }
  }
  // Diagonal down-right
  for (let r = 0; r <= ROWS - 4; r += 1) {
    for (let c = 0; c <= COLS - 4; c += 1) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += scoreWindow(window, me);
    }
  }
  // Diagonal up-right
  for (let r = 3; r < ROWS; r += 1) {
    for (let c = 0; c <= COLS - 4; c += 1) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += scoreWindow(window, me);
    }
  }

  // small penalty if opponent has immediate win next (soft lookahead)
  const avail = getAvailableColumns(board);
  for (const col of avail) {
    const nb = dropInColumn(board, col, opponent);
    if (nb && hasWin(nb, opponent)) score -= 80;
  }

  return score;
};

const orderedColumns = [3, 4, 2, 5, 1, 6, 0];

const minimax = (
  board: number[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  me: Player,
): { score: number; column: number | null } => {
  const opponent: Player = me === 1 ? 2 : 1;
  const winner = winnerAny(board);
  if (winner === me) return { score: 1_000_000 + depth, column: null }; // prefer faster wins
  if (winner === opponent) return { score: -1_000_000 - depth, column: null };
  if (depth === 0 || isBoardFull(board)) return { score: evaluateBoard(board, me), column: null };

  const columns = orderedColumns.filter((c) => board[0][c] === 0);
  // If no columns available
  if (columns.length === 0) return { score: 0, column: null };

  if (maximizing) {
    let bestScore = -Infinity;
    let bestCol: number | null = columns[0] ?? null;
    for (const col of columns) {
      const next = dropInColumn(board, col, me);
      if (!next) continue;
      const res = minimax(next, depth - 1, alpha, beta, false, me);
      if (res.score > bestScore) {
        bestScore = res.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break; // beta cut-off
    }
    return { score: bestScore, column: bestCol };
  }

  // minimizing: opponent moves
  let bestScore = Infinity;
  let bestCol: number | null = columns[0] ?? null;
  for (const col of columns) {
    const next = dropInColumn(board, col, opponent);
    if (!next) continue;
    const res = minimax(next, depth - 1, alpha, beta, true, me);
    if (res.score < bestScore) {
      bestScore = res.score;
      bestCol = col;
    }
    beta = Math.min(beta, bestScore);
    if (alpha >= beta) break; // alpha cut-off
  }
  return { score: bestScore, column: bestCol };
};

export const pickAIMove = (board: number[][], level: AIDifficulty, me: Player = 2): number => {
  const available = getAvailableColumns(board);
  const opponent: Player = me === 1 ? 2 : 1;
  const rand = () => available[Math.floor(Math.random() * available.length)];
  if (available.length === 0) return 0;

  // Easy: mostly random, occasional block
  if (level === 'EASY') {
    // 20% chance to block immediate opponent win if found
    if (Math.random() < 0.2) {
      for (const c of available) {
        const nb = dropInColumn(board, c, opponent);
        if (nb && hasWin(nb, opponent)) return c; // block by playing there next turn if possible
      }
    }
    return rand();
  }

  // Medium: win-now, else block, else prefer center columns
  if (level === 'MEDIUM') {
    for (const c of available) {
      const nb = dropInColumn(board, c, me);
      if (nb && hasWin(nb, me)) return c;
    }
    for (const c of available) {
      const nb = dropInColumn(board, c, opponent);
      if (nb && hasWin(nb, opponent)) return c;
    }
    for (const c of orderedColumns) if (available.includes(c)) return c;
    return rand();
  }

  // Hard/Expert: minimax with increasing depth
  const depth = level === 'HARD' ? 4 : 6;
  const { column } = minimax(board, depth, -Infinity, Infinity, true, me);
  if (column != null) return column;
  // fallback to medium heuristics
  for (const c of available) {
    const nb = dropInColumn(board, c, me);
    if (nb && hasWin(nb, me)) return c;
  }
  for (const c of orderedColumns) if (available.includes(c)) return c;
  return rand();
};

