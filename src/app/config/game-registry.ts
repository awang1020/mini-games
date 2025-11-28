import type { GameConfig, GameId, GameMetadata } from '@/types/game';

import ConnectFour from '@/app/components/ConnectFour';
import FlappyBird from '@/app/components/FlappyBird';
import Game2048 from '@/app/components/Game2048';
import Hangman from '@/app/components/Hangman';
import MemoryGame from '@/app/components/MemoryGame';
import RockPaperScissors from '@/app/components/RockPaperScissors';
import Sudoku from '@/app/components/Sudoku';
import TicTacToe from '@/app/components/TicTacToe';
import Tetris from '@/app/components/Tetris';
import SnakeRelax from '@/app/components/SnakeRelax';
import TypingSpeed from '@/app/components/TypingSpeed';
import MentalCalcChill from '@/app/components/MentalCalcChill';
import ConnectFourIcon from '@/app/components/icons/ConnectFourIcon';
import FlappyBirdIcon from '@/app/components/icons/FlappyBirdIcon';
import Game2048Icon from '@/app/components/icons/Game2048Icon';
import HangmanIcon from '@/app/components/icons/HangmanIcon';
import MemoryGameIcon from '@/app/components/icons/MemoryGameIcon';
import RockPaperScissorsIcon from '@/app/components/icons/RockPaperScissorsIcon';
import SudokuIcon from '@/app/components/icons/SudokuIcon';
import TicTacToeIcon from '@/app/components/icons/TicTacToeIcon';
import TetrisIcon from '@/app/components/icons/TetrisIcon';
import SnakeIcon from '@/app/components/icons/SnakeIcon';
import TypingIcon from '@/app/components/icons/TypingIcon';
import CalcChillIcon from '@/app/components/icons/CalcChillIcon';

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
  'connect-four': {
    metadata: {
      id: 'connect-four',
      title: 'Connect Four',
      description: 'Drop tokens into a 7×6 grid and connect four in any direction.',
      icon: ConnectFourIcon,
    },
    component: ConnectFour,
    rules: {
      title: 'Connect Four',
      rules: [
        'Players take turns dropping a token into one of seven columns. Tokens fall to the lowest available slot.',
        'Connect four of your tokens horizontally, vertically, or diagonally to win the game.',
        'If the board fills up with no winning connection, the game ends in a draw.',
        'Use the undo button to revert the last move or restart to play a fresh match.',
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
  tetris: {
    metadata: {
      id: 'tetris',
      title: 'Tetris',
      description: 'Stack and clear lines with classic tetrominoes.',
      icon: TetrisIcon,
    },
    component: Tetris,
    rules: {
      title: 'Tetris',
      rules: [
        'Move and rotate falling pieces to complete full horizontal lines.',
        'Clearing multiple lines at once yields higher scores.',
        'Speed increases with level; the game ends when pieces reach the top.',
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
  'snake-relax': {
    metadata: {
      id: 'snake-relax',
      title: 'Snake Relax',
      description: 'Serpent zen: wrap-around, pommes, transitions pastel.',
      icon: SnakeIcon,
    },
    component: SnakeRelax,
    rules: {
      title: 'Snake Relax',
      rules: [
        'Le serpent se déplace automatiquement toutes les 120 ms.',
        'Les bords sont en wrap-around: tu traverses et reviens de l’autre côté.',
        'Mange des pommes pour grandir et augmenter le score.',
        'Collision avec soi-même = redémarrage doux (pas de game over agressif).',
        'Contrôles: flèches/WASD et swipe sur mobile.',
      ],
    },
  },
  'typing-speed': {
    metadata: {
      id: 'typing-speed',
      title: 'Typing Speed',
      description: 'Type words fast and accurately before time runs out.',
      icon: TypingIcon,
    },
    component: TypingSpeed,
    rules: {
      title: 'Typing Speed',
      rules: [
        'Press Start to begin; type the current word then Space/Enter to submit.',
        'Live WPM and accuracy appear in the top bar; input stays focused.',
        'Words must match exactly to count as correct; backspace is not penalized before submit.',
        'Pick duration in the dropdown; results show chart + CSV export at the end.',
      ],
    },
  },
  'mental-calc-chill': {
    metadata: {
      id: 'mental-calc-chill',
      title: 'Mental Calculation Chill',
      description: 'Soft pastel arithmetic with a gentle timer.',
      icon: CalcChillIcon,
    },
    component: MentalCalcChill,
    rules: {
      title: 'Mental Calculation • Chill Mode',
      rules: [
        'A small arithmetic appears with a slow, relaxing timer.',
        'Type your answer and press Enter or Submit.',
        'Correct answers increase your score; timeouts move on softly.',
        'After each answer or when time ends, a new calculation appears.',
      ],
    },
  },
};

export const gameMetadataList: GameMetadata[] = Object.values(gameRegistry).map(
  (game) => game.metadata,
);
