'use client';

import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import GameMenu from '@/app/components/GameMenu';
import GameRules from '@/app/components/GameRules';
import { gameMetadataList, gameRegistry } from '@/app/config/game-registry';
import type { GameId } from '@/types/game';

const BackArrowIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);

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
    <main id="main-content" className="min-h-screen bg-slate-950 text-white">
      {selectedGameConfig && GameComponent ? (
        <div className="flex min-h-dvh flex-col md:flex-row">
          <div className="relative flex-1 p-4 md:overflow-y-auto md:px-6">
            <button
              type="button"
              className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:border-white/20 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={handleBackToMenu}
            >
              <BackArrowIcon className="h-4 w-4" />
              Back to Menu
            </button>
            <div className="flex min-h-full items-start justify-center pb-10 pt-14 md:pb-12 md:pt-16">
              <GameComponent />
            </div>
          </div>
          <aside className="w-full border-t border-white/10 bg-white/[0.02] p-4 md:w-1/3 md:max-w-md md:border-l md:border-t-0 lg:p-6">
            <GameRules ruleSet={selectedGameConfig.rules} metadata={selectedGameConfig.metadata} />
          </aside>
        </div>
      ) : (
        <GameMenu games={gameMetadataList} onSelectGame={handleSelectGame} />
      )}
    </main>
  );
};

export default Home;
