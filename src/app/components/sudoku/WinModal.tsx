'use client';

import type { FC, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  PLAYER_NAME_STORAGE_KEY,
  SCOREBOARD_LIMIT,
  type AddScoreResult,
} from '../../../lib/sudokuScoreboard';
import type { Difficulty } from '../../../types/sudoku';

interface WinModalProps {
  time: string;
  difficulty: Difficulty;
  errors: number;
  hintsUsed: number;
  onNewGame: () => void;
  onSubmitScore: (playerName: string) => AddScoreResult;
  onViewScoreboard: () => void;
}

const WinModal: FC<WinModalProps> = ({
  time,
  difficulty,
  errors,
  hintsUsed,
  onNewGame,
  onSubmitScore,
  onViewScoreboard,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [submissionState, setSubmissionState] = useState<'idle' | 'saved' | 'skipped'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  const difficultyLabel = useMemo(() => difficulty.charAt(0).toUpperCase() + difficulty.slice(1), [difficulty]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedName = window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionState !== 'idle') {
      return;
    }

    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setFeedback('Add a display name to save your score to the leaderboard.');
      return;
    }

    const result = onSubmitScore(trimmedName);

    if (result.wasInserted && result.entry) {
      setSubmissionState('saved');
      setFeedback(
        `Saved! You made the top ${SCOREBOARD_LIMIT.toLocaleString()} for ${difficultyLabel.toLowerCase()} puzzles. View the scoreboard to see your ranking.`,
      );
    } else {
      setSubmissionState('skipped');
      setFeedback('Great work! Keep refining your strategy to break into the scoreboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sudoku-win-title"
        className="w-full max-w-xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-8 text-slate-100 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Puzzle Complete</p>
        <h2 id="sudoku-win-title" className="mt-3 text-3xl font-bold tracking-tight">
          Brilliant job!
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          You conquered the {difficultyLabel.toLowerCase()} board. Log your accomplishment and challenge yourself to climb the
          leaderboard.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/70 p-4 text-center shadow-inner">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time</span>
            <div className="mt-2 text-3xl font-bold text-emerald-300">{time}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 text-center shadow-inner">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Errors</span>
            <div className="mt-2 text-2xl font-semibold text-rose-200">{errors}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 text-center shadow-inner">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hints used</span>
            <div className="mt-2 text-2xl font-semibold text-amber-200">{hintsUsed}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="text-left">
            <label htmlFor="sudoku-player-name" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Display name
            </label>
            <input
              id="sudoku-player-name"
              type="text"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Add your name"
              maxLength={32}
              disabled={submissionState !== 'idle'}
              className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-inner transition focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Scores are sorted by time, then by errors and hint usage. Only the top {SCOREBOARD_LIMIT.toLocaleString()} entries are
              stored per difficulty.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submissionState !== 'idle'}
              className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200 ${
                submissionState === 'idle'
                  ? 'bg-emerald-500/90 text-emerald-950 hover:bg-emerald-400'
                  : submissionState === 'saved'
                    ? 'bg-emerald-500/60 text-emerald-900'
                    : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              {submissionState === 'saved'
                ? 'Score saved'
                : submissionState === 'skipped'
                  ? 'Score not saved'
                  : 'Save to scoreboard'}
            </button>
            <button
              type="button"
              onClick={onViewScoreboard}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500/80 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-sky-950 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200"
            >
              View scoreboard
            </button>
          </div>
        </form>

        {feedback && (
          <p className="mt-4 rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200" role="status">
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onNewGame}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-800/80 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-200"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinModal;
