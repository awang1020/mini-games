export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ScoreEntry {
  id: string;
  player: string;
  time: number;
  errors: number;
  hintsUsed: number;
  completedAt: string;
}

export type Scoreboard = Record<Difficulty, ScoreEntry[]>;
