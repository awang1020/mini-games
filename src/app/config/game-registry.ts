import type { GameConfig, GameId, GameMetadata } from '@/types/game';

import FlappyBird from '../components/FlappyBird';
import Game2048 from '../components/Game2048';
import Hangman from '../components/Hangman';
import MemoryGame from '../components/MemoryGame';
import RockPaperScissors from '../components/RockPaperScissors';
import Sudoku from '../components/Sudoku';
import TicTacToe from '../components/TicTacToe';
import FlappyBirdIcon from '../components/icons/FlappyBirdIcon';
import Game2048Icon from '../components/icons/Game2048Icon';
import HangmanIcon from '../components/icons/HangmanIcon';
import MemoryGameIcon from '../components/icons/MemoryGameIcon';
import RockPaperScissorsIcon from '../components/icons/RockPaperScissorsIcon';
import SudokuIcon from '../components/icons/SudokuIcon';
import TicTacToeIcon from '../components/icons/TicTacToeIcon';

export const gameRegistry: Record<GameId, GameConfig> = {
  'tic-tac-toe': {
    metadata: {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: "The classic game of X's and O's.",
      icon: TicTacToeIcon,
    },
    component: TicTacToe,
    rules: {
      title: 'Tic Tac Toe',
      rules: [
        "The game is played on a grid that's 3 squares by 3 squares.",
        'Players alternate placing their mark in an empty square.',
        'The first player to align three marks horizontally, vertically, or diagonally wins.',
        'If all squares are filled without a winner, the game ends in a draw.',
      ],
    },
  },
  'rock-paper-scissors': {
    metadata: {
      id: 'rock-paper-scissors',
      title: 'Rock, Paper, Scissors',
      description: 'Make your choice and challenge the computer.',
      icon: RockPaperScissorsIcon,
    },
    component: RockPaperScissors,
    rules: {
      title: 'Rock, Paper, Scissors',
      rules: [
        'Select either Rock, Paper, or Scissors each round.',
        'Rock beats Scissors, Scissors beats Paper, and Paper beats Rock.',
        "If both players choose the same option, the round ends in a draw.",
      ],
    },
  },
  'memory-game': {
    metadata: {
      id: 'memory-game',
      title: 'Memory Game',
      description: 'Test your short-term memory with paired cards.',
      icon: MemoryGameIcon,
    },
    component: MemoryGame,
    rules: {
      title: 'Memory Game',
      rules: [
        'Flip two cards on each turn to find matching pairs.',
        'Matched cards remain face-up while mismatched cards are flipped back.',
        'Find all pairs with as few moves as possible to win.',
      ],
    },
  },
  '2048': {
    metadata: {
      id: '2048',
      title: '2048',
      description: 'Merge numbered tiles to reach 2048.',
      icon: Game2048Icon,
    },
    component: Game2048,
    rules: {
      title: '2048',
      rules: [
        'Use the arrow keys or on-screen controls to slide all tiles in a direction.',
        'Tiles with matching numbers merge into one and increase your score.',
        'Create a tile with the number 2048 to win. No moves left? The game ends.',
      ],
    },
  },
  sudoku: {
    metadata: {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'Fill the grid while respecting Sudoku rules.',
      icon: SudokuIcon,
    },
    component: Sudoku,
    rules: {
      title: 'Sudoku',
      rules: [
        'Each row, column, and 3x3 box must contain the digits 1 through 9 without repetition.',
        'Use logic to determine where numbers belong—guessing increases your error count.',
        'Complete the grid without conflicts to win the puzzle.',
      ],
    },
  },
  hangman: {
    metadata: {
      id: 'hangman',
      title: 'Hangman',
      description: 'Guess the hidden word before the hangman is complete.',
      icon: HangmanIcon,
    },
    component: Hangman,
    rules: {
      title: 'Hangman',
      rules: [
        'Guess one letter at a time to reveal the hidden word.',
        'Six incorrect guesses will complete the hangman—choose carefully.',
        'Reveal the full word before running out of attempts to win.',
      ],
    },
  },
  'flappy-bird': {
    metadata: {
      id: 'flappy-bird',
      title: 'Flappy Bird',
      description: 'Tap to flap through the pipes without touching them.',
      icon: FlappyBirdIcon,
    },
    component: FlappyBird,
    rules: {
      title: 'Flappy Bird',
      rules: [
        'Tap, click, or press Space to make the bird flap upward.',
        'Navigate through the gaps between the pipes—touching them ends the run.',
        'Each pair of pipes you pass earns one point. Try to beat your best score!',
      ],
    },
  },
};

export const gameMetadataList: GameMetadata[] = Object.values(gameRegistry).map(
  (game) => game.metadata,
);
