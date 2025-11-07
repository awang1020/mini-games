import type { ComponentType } from 'react';

export type GameId =
  | 'tic-tac-toe'
  | 'rock-paper-scissors'
  | 'memory-game'
  | '2048'
  | 'sudoku'
  | 'hangman'
  | 'flappy-bird'
  | 'connect-four';

export interface GameIconProps {
  className?: string;
}

export interface GameMetadata {
  id: GameId;
  title: string;
  description: string;
  icon: ComponentType<GameIconProps>;
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
