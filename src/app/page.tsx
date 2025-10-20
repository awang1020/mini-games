'use client';

import React, { useState } from 'react';
import GameMenu from './components/GameMenu';
import TicTacToe from './components/TicTacToe';
import RockPaperScissors from './components/RockPaperScissors';
import MemoryGame from './components/MemoryGame';
import Game2048 from './components/Game2048';
import Sudoku from './components/Sudoku';
import TicTacToeIcon from './components/icons/TicTacToeIcon';
import RockPaperScissorsIcon from './components/icons/RockPaperScissorsIcon';
import MemoryGameIcon from './components/icons/MemoryGameIcon';
import Game2048Icon from './components/icons/Game2048Icon';
import SudokuIcon from './components/icons/SudokuIcon';
import GameRules from './components/GameRules';
import Hangman from './components/Hangman';
import HangmanIcon from './components/icons/HangmanIcon';

const games = [
  { id: 'tic-tac-toe', title: 'Tic Tac Toe', description: "The classic game of X's and O's.", icon: <TicTacToeIcon /> },
  { id: 'rock-paper-scissors', title: 'Rock, Paper, Scissors', description: 'The classic game of choices.', icon: <RockPaperScissorsIcon /> },
  { id: 'memory-game', title: 'Memory Game', description: 'Test your memory with this classic card game.', icon: <MemoryGameIcon /> },
  { id: '2048', title: '2048', description: 'Join the numbers and get to the 2048 tile!', icon: <Game2048Icon /> },
  { id: 'sudoku', title: 'Sudoku', description: 'The classic logic-based number-placement puzzle.', icon: <SudokuIcon /> },
  { id: 'hangman', title: 'Hangman', description: 'Guess the word before the man is hanged.', icon: <HangmanIcon /> },
];

const gameRules = {
  'tic-tac-toe': {
    title: 'Tic Tac Toe',
    rules: [
      'The game is played on a grid that\'s 3 squares by 3 squares.',
      'You are X, your friend is O. Players take turns putting their marks in empty squares.',
      'The first player to get 3 of her marks in a row (up, down, across, or diagonally) is the winner.',
      'When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie.',
    ],
  },
  'rock-paper-scissors': {
    title: 'Rock, Paper, Scissors',
    rules: [
        'Rock beats Scissors.',
        'Scissors beats Paper.',
        'Paper beats Rock.',
        'Make your choice and see if you can beat the computer!',
    ],
  },
  'memory-game': {
    title: 'Memory Game',
    rules: [
        'The game consists of a set of cards. Each card has a picture on one side.',
        'The cards are laid down in a grid, face down.',
        'On each turn, you flip over two cards.',
        'If the two cards have the same picture, they remain face up. If they don\'t, they are turned back over.',
        'The goal is to find all the matching pairs of cards.',
    ],
  },
  '2048': {
    title: '2048',
    rules: [
        'Use your arrow keys to move the tiles.',
        'When two tiles with the same number touch, they merge into one!',
        'The goal is to create a tile with the number 2048.',
        'The game is over when there are no more empty tiles and no more moves can be made.',
    ],
  },
  'sudoku': {
    title: 'Sudoku',
    rules: [
        'The classic logic-based number-placement puzzle.',
        'The objective is to fill a 9x9 grid with digits so that each column, each row, and each of the nine 3x3 subgrids that compose the grid contain all of the digits from 1 to 9.',
    ],
  },
  'hangman': {
    title: 'Hangman',
    rules: [
        'Guess the word one letter at a time.',
        'You can make 6 incorrect guesses.',
        'If you guess the word before you make 6 incorrect guesses, you win!',
    ],
  },
};

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const currentGame = games.find(g => g.id === selectedGame);
  const currentRules = selectedGame ? gameRules[selectedGame] : null;

  return (
    <main className="bg-gray-900 min-h-screen text-white">
      {selectedGame && currentGame && currentRules ? (
        <div className="flex h-screen">
          <div className="w-3/4 p-4">
            <button
              className="absolute top-4 left-4 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 z-10"
              onClick={handleBackToMenu}
            >
              Back to Menu
            </button>
            {selectedGame === 'tic-tac-toe' && <TicTacToe />}
            {selectedGame === 'rock-paper-scissors' && <RockPaperScissors />}
            {selectedGame === 'memory-game' && <MemoryGame />}
            {selectedGame === '2048' && <Game2048 />}
            {selectedGame === 'sudoku' && <Sudoku />}
            {selectedGame === 'hangman' && <Hangman />}
          </div>
          <div className="w-1/4 p-4 bg-gray-800">
            <GameRules title={currentRules.title} rules={currentRules.rules} />
          </div>
        </div>
      ) : (
        <GameMenu games={games} onSelectGame={handleSelectGame} />
      )}
    </main>
  );
}