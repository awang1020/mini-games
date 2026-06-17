import type { ComponentType } from 'react';

export type GameId =
  | 'tic-tac-toe'
  | 'rock-paper-scissors'
  | 'memory-game'
  | '2048'
  | 'sudoku'
  | 'hangman'
  | 'flappy-bird'
  | 'connect-four'
  | 'tetris'
  | 'snake-relax'
  | 'typing-speed'
  | 'mental-calc-chill';

export interface GameIconProps {
  className?: string;
}

export type GameCategory =
  | 'Strategy'
  | 'Arcade'
  | 'Puzzle'
  | 'Brain'
  | 'Word'
  | 'Casual';

export type GameBadge = 'New' | 'Popular' | 'Zen';

export interface GameMetadata {
  id: GameId;
  title: string;
  description: string;
  icon: ComponentType<GameIconProps>;
  /** Category used for filtering and discovery on the home arcade. */
  category: GameCategory;
  /** Tailwind gradient color stops (e.g. "from-sky-400 to-indigo-600") for the app-icon tile. */
  accent: string;
  /** Optional marketing badge surfaced on the game card. */
  badge?: GameBadge;
}

export interface GameRuleSet {
  title: string;
  rules: string[];
}

export interface GameConfig {
  metadata: GameMetadata;
  rules: GameRuleSet;
  component: ComponentType<Record<string, never>>;
}
