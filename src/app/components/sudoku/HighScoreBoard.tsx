'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  SCOREBOARD_LIMIT,
  SCOREBOARD_STORAGE_KEY,
  clearScoreboard,
  createEmptyScoreboard,
  loadScoreboard,
  persistScoreboard,
} from '../../../lib/sudokuScoreboard';
import type { Difficulty, Scoreboard } from '../../../types/sudoku';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const formatCompletedAt = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    console.warn('[sudoku] Failed to format completion date', error);
    return date.toLocaleString();
  }
};

const difficultyMeta: { key: Difficulty; label: string; badge: string }[] = [
  { key: 'easy', label: 'Easy', badge: 'bg-emerald-500/20 text-emerald-200' },
  { key: 'medium', label: 'Medium', badge: 'bg-amber-500/20 text-amber-200' },
  { key: 'hard', label: 'Hard', badge: 'bg-rose-500/20 text-rose-200' },
];

interface HighScoreBoardProps {
  onClose: () => void;
  highlightScoreId?: string | null;
}

const HighScoreBoard = ({ onClose, highlightScoreId }: HighScoreBoardProps) => {
  const [scoreboard, setScoreboard] = useState<Scoreboard>(createEmptyScoreboard());
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('easy');

  const entries = useMemo(() => scoreboard[activeDifficulty] ?? [], [activeDifficulty, scoreboard]);
  const hasAnyScore = useMemo(
    () => (['easy', 'medium', 'hard'] as Difficulty[]).some((difficulty) => scoreboard[difficulty]?.length),
    [scoreboard],
  );
  const highlightedIndex = useMemo(
    () => entries.findIndex((entry) => entry.id === highlightScoreId),
    [entries, highlightScoreId],
  );
  const activeDifficultyLabel = useMemo(
    () => difficultyMeta.find((meta) => meta.key === activeDifficulty)?.label ?? activeDifficulty,
    [activeDifficulty],
  );

  useEffect(() => {
    setScoreboard(loadScoreboard());
  }, []);

  useEffect(() => {
    if (!highlightScoreId) {
      return;
    }

    const difficultyWithHighlight = (['easy', 'medium', 'hard'] as Difficulty[]).find((difficulty) =>
      scoreboard[difficulty]?.some((entry) => entry.id === highlightScoreId),
    );

    if (difficultyWithHighlight) {
      setActiveDifficulty(difficultyWithHighlight);
    }
  }, [highlightScoreId, scoreboard]);

  useEffect(() => {
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === SCOREBOARD_STORAGE_KEY) {
        setScoreboard(loadScoreboard());
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleReset = () => {
    const confirmed = window.confirm('Clear all saved Sudoku scores? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    clearScoreboard();
    const empty = createEmptyScoreboard();
    persistScoreboard(empty);
    setScoreboard(empty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sudoku-highscores-title"
        className="w-full max-w-3xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-8 text-slate-100 shadow-2xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">Scoreboard</p>
            <h2 id="sudoku-highscores-title" className="mt-2 text-3xl font-bold tracking-tight">
              Track your fastest solves
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Times are sorted first by speed, then by accuracy and hint usage. Only the top {SCOREBOARD_LIMIT} scores per
              difficulty are kept.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-start">
            {hasAnyScore && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full bg-rose-600/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-50 transition hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-200"
              >
                Clear scores
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700/80"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {difficultyMeta.map(({ key, label, badge }) => {
            const isActive = key === activeDifficulty;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDifficulty(key)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isActive ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/30' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span>{label}</span>
                {isActive && <span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${badge}`}>{entries.length}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/50 shadow-inner">
          <table className="min-w-full divide-y divide-slate-800/70 text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-300">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-xs">
                  Rank
                </th>
                <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-xs">
                  Player
                </th>
                <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-xs">
                  Time
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold uppercase tracking-wide text-xs sm:table-cell">
                  Errors
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold uppercase tracking-wide text-xs sm:table-cell">
                  Hints used
                </th>
                <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-xs">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.length > 0 ? (
                entries.map((entry, index) => {
                  const isHighlighted = entry.id === highlightScoreId;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-sky-500/10 text-slate-100 ring-1 ring-inset ring-sky-400/60'
                          : 'bg-transparent text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">#{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{entry.player}</td>
                      <td className="px-4 py-3 text-lg font-bold text-slate-100">{formatTime(entry.time)}</td>
                      <td className="hidden px-4 py-3 font-medium text-slate-300 sm:table-cell">{entry.errors}</td>
                      <td className="hidden px-4 py-3 font-medium text-slate-300 sm:table-cell">{entry.hintsUsed}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-400">{formatCompletedAt(entry.completedAt)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                    No scores recorded for this difficulty yet. Finish a puzzle to see your time here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {highlightedIndex >= 0 && (
          <p className="mt-4 rounded-2xl bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-200">
            New entry unlocked! You placed #{highlightedIndex + 1} on the {activeDifficultyLabel} board.
          </p>
        )}

        {!hasAnyScore && (
          <p className="mt-6 rounded-2xl bg-slate-900/70 p-4 text-center text-sm text-slate-300">
            Your best times will appear here once you save a score from the victory screen.
          </p>
        )}
      </div>
    </div>
  );
};

export default HighScoreBoard;
