'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { GameBadge, GameCategory, GameMetadata } from '@/types/game';

interface GameMenuProps {
  games: GameMetadata[];
  onSelectGame: (gameId: GameMetadata['id']) => void;
}

type CategoryFilter = 'All' | GameCategory;

const badgeStyles: Record<GameBadge, string> = {
  New: 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30',
  Popular: 'bg-amber-400/15 text-amber-200 ring-amber-400/30',
  Zen: 'bg-sky-400/15 text-sky-200 ring-sky-400/30',
};

const stats = [
  { value: 'Free', label: 'Forever' },
  { value: '0', label: 'Ads' },
  { value: 'No', label: 'Sign-up' },
  { value: 'Any', label: 'Device' },
] as const;

const SearchIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ArrowIcon: FC<{ className?: string }> = ({ className }) => (
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
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const GameMenu: FC<GameMenuProps> = ({ games, onSelectGame }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const categories = useMemo<CategoryFilter[]>(() => {
    const seen: GameCategory[] = [];
    for (const game of games) {
      if (!seen.includes(game.category)) seen.push(game.category);
    }
    return ['All', ...seen];
  }, [games]);

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((game) => {
      if (activeCategory !== 'All' && game.category !== activeCategory) return false;
      if (!q) return true;
      return (
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.category.toLowerCase().includes(q)
      );
    });
  }, [games, query, activeCategory]);

  const resetFilters = () => {
    setQuery('');
    setActiveCategory('All');
  };

  return (
    <section className="relative min-h-dvh overflow-hidden bg-slate-950">
      {/* Ambient aurora background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-[120px] animate-aurora-slow" />
        <div className="absolute -left-32 top-1/3 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/20 blur-[120px] animate-aurora-slower" />
        <div className="absolute -right-24 top-1/4 h-[30rem] w-[30rem] rounded-full bg-sky-500/20 blur-[120px] animate-aurora-slow" />
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {games.length} handcrafted games · No download · Free forever
          </span>
          <h1 className="mt-6 animate-fade-in-up text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Little games. <span className="text-gradient">Big delight.</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-pretty text-lg text-white/60 sm:text-xl"
            style={{ animationDelay: '80ms' }}
          >
            A beautifully crafted arcade of timeless classics — from Tetris to Sudoku. Pick one up
            in a tap. No sign-up, no clutter. Just play.
          </p>

          {/* Stats */}
          <dl
            className="mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '160ms' }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-[5.5rem] flex-col-reverse rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center backdrop-blur"
              >
                <dt className="text-xs uppercase tracking-wide text-white/45">{stat.label}</dt>
                <dd className="text-xl font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* Search + filters */}
        <div
          className="mx-auto mt-12 max-w-3xl animate-fade-in-up"
          style={{ animationDelay: '220ms' }}
        >
          <div role="search" className="relative">
            <label htmlFor="game-search" className="sr-only">
              Search games
            </label>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              id="game-search"
              type="search"
              inputMode="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games…"
              autoComplete="off"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white outline-none backdrop-blur transition placeholder:text-white/40 focus:border-white/25 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
            />
          </div>

          <div
            role="group"
            aria-label="Filter games by category"
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    active
                      ? 'bg-white text-slate-900 shadow'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} shown
        </p>

        {/* Game grid */}
        {filteredGames.length > 0 ? (
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game, index) => {
              const Icon = game.icon;
              return (
                <li
                  key={game.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectGame(game.id)}
                    aria-label={`Play ${game.title}`}
                    className="group relative flex h-full w-full flex-col items-start gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-card backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {/* hover sheen */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                    />

                    {game.badge ? (
                      <span
                        className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${badgeStyles[game.badge]}`}
                      >
                        {game.badge}
                      </span>
                    ) : null}

                    {/* App-style icon tile */}
                    <div className="relative">
                      <span
                        aria-hidden
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${game.accent} opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-80`}
                      />
                      <span
                        className={`relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${game.accent} text-white shadow-lg ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105`}
                      >
                        <Icon className="h-9 w-9 text-white" />
                      </span>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white">{game.title}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                        {game.description}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
                        {game.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 transition-colors group-hover:text-white">
                        Play
                        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mx-auto mt-16 max-w-md animate-fade-in text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <SearchIcon className="h-6 w-6 text-white/50" />
            </div>
            <p className="mt-5 text-lg font-semibold text-white">No games found</p>
            <p className="mt-1.5 text-sm text-white/55">
              We couldn&apos;t match your search. Try another keyword or category.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/45">
            Crafted with care · Built with Next.js &amp; TypeScript · Plays great on every screen
          </p>
        </footer>
      </div>
    </section>
  );
};

export default GameMenu;
