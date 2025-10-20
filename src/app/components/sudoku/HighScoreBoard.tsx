'use client';

import { useEffect, useState } from 'react';

interface HighScores {
  easy: number[];
  medium: number[];
  hard: number[];
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const difficultyMeta: { key: keyof HighScores; label: string; accent: string }[] = [
  { key: 'easy', label: 'Easy', accent: 'text-emerald-300' },
  { key: 'medium', label: 'Medium', accent: 'text-amber-300' },
  { key: 'hard', label: 'Hard', accent: 'text-rose-300' },
];

const HighScoreBoard = ({ onClose }: { onClose: () => void }) => {
  const [highScores, setHighScores] = useState<HighScores>({ easy: [], medium: [], hard: [] });

  useEffect(() => {
    const savedScores = localStorage.getItem('sudokuHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  const hasAnyScore = difficultyMeta.some(({ key }) => highScores[key]?.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sudoku-highscores-title"
        className="w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-8 text-slate-100 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">Leaderboard</p>
            <h2 id="sudoku-highscores-title" className="mt-2 text-3xl font-bold tracking-tight">
              Fastest completion times
            </h2>
            <p className="mt-2 text-sm text-slate-300">Keep errors low and finish quickly to etch your score onto the board.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700/80"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {difficultyMeta.map(({ key, label, accent }) => {
            const scores = highScores[key]?.slice(0, 5) ?? [];
            return (
              <div key={key} className="rounded-2xl bg-slate-900/70 p-4 shadow-inner">
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>{label}</h3>
                {scores.length > 0 ? (
                  <ol className="mt-3 space-y-2 text-sm text-slate-200">
                    {scores.map((score, index) => (
                      <li key={index} className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                        <span className="font-semibold text-slate-300">#{index + 1}</span>
                        <span className="text-lg font-bold text-slate-100">{formatTime(score)}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No scores yet—be the first!</p>
                )}
              </div>
            );
          })}
        </div>

        {!hasAnyScore && (
          <p className="mt-6 rounded-2xl bg-slate-900/70 p-4 text-center text-sm text-slate-300">
            Your best times will appear here after you finish a game without mistakes.
          </p>
        )}
      </div>
    </div>
  );
};

export default HighScoreBoard;
