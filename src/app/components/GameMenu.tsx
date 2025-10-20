'use client';

import type { FC } from 'react';

import type { GameMetadata } from '@/types/game';

interface GameMenuProps {
  games: GameMetadata[];
  onSelectGame: (gameId: GameMetadata['id']) => void;
}

const GameMenu: FC<GameMenuProps> = ({ games, onSelectGame }) => {
  return (
    <section className="min-h-screen bg-gray-900 px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Mini Games Arcade</h1>
          <p className="mt-3 text-lg text-gray-300">
            Choose a game to play and challenge yourself or your friends.
          </p>
        </header>
        <ul className="grid items-stretch gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <li key={game.id} className="flex">
                <button
                  type="button"
                  onClick={() => onSelectGame(game.id)}
                  className="flex h-full w-full flex-col items-center gap-4 rounded-2xl bg-gray-800 p-8 text-center shadow-lg transition-colors transition-transform duration-200 hover:-translate-y-1 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  <Icon className="mx-auto h-16 w-16 text-indigo-300" />
                  <div>
                    <h2 className="text-2xl font-semibold">{game.title}</h2>
                    <p className="mt-2 text-sm text-gray-300">{game.description}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default GameMenu;
