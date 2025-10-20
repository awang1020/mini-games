'use client';

import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import GameMenu from './components/GameMenu';
import GameRules from './components/GameRules';
import { gameMetadataList, gameRegistry } from './config/game-registry';
import type { GameId } from '@/types/game';

const Home: FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const handleSelectGame = useCallback((gameId: GameId) => {
    setSelectedGame(gameId);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setSelectedGame(null);
  }, []);

  const selectedGameConfig = useMemo(
    () => (selectedGame ? gameRegistry[selectedGame] : null),
    [selectedGame],
  );

  const GameComponent = selectedGameConfig?.component ?? null;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {selectedGameConfig && GameComponent ? (
        <div className="flex h-screen flex-col md:flex-row">
          <div className="relative flex-1 p-4">
            <button
              type="button"
              className="absolute left-4 top-4 z-10 rounded-md bg-gray-700 px-4 py-2 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              onClick={handleBackToMenu}
            >
              Back to Menu
            </button>
            <div className="flex h-full items-center justify-center">
              <GameComponent />
            </div>
          </div>
          <aside className="w-full max-w-md bg-gray-800 p-4 md:w-1/3">
            <GameRules ruleSet={selectedGameConfig.rules} />
          </aside>
        </div>
      ) : (
        <GameMenu games={gameMetadataList} onSelectGame={handleSelectGame} />
      )}
    </main>
  );
};

export default Home;
