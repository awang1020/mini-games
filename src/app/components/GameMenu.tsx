'use client';

import React from 'react';
import TicTacToeIcon from './icons/TicTacToeIcon';
import RockPaperScissorsIcon from './icons/RockPaperScissorsIcon';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface GameMenuProps {
  games: Game[];
  onSelectGame: (gameId: string) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ games, onSelectGame }) => {
  return (
    <div className="p-8 bg-gray-800 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center">Choose a Game</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gray-700 rounded-lg shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-transform duration-300"
            onClick={() => onSelectGame(game.id)}
          >
            {game.icon}
            <h3 className="text-2xl font-bold mb-2 text-center">{game.title}</h3>
            <p className="text-gray-400 text-center">{game.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameMenu;