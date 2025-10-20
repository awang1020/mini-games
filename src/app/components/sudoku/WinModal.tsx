'use client';

import type { FC } from 'react';

interface WinModalProps {
  time: string;
  onNewGame: () => void;
}

const WinModal: FC<WinModalProps> = ({ time, onNewGame }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sudoku-win-title"
      className="w-full max-w-lg rounded-3xl border border-slate-800/70 bg-slate-950/90 p-8 text-center text-slate-100 shadow-2xl"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Puzzle Complete</p>
      <h2 id="sudoku-win-title" className="mt-3 text-3xl font-bold tracking-tight">Brilliant job!</h2>
      <p className="mt-2 text-sm text-slate-300">You solved the puzzle with precision. Ready for another challenge?</p>

      <div className="mt-6 rounded-2xl bg-slate-900/70 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completion Time</span>
        <div className="mt-2 text-4xl font-bold text-emerald-300">{time}</div>
      </div>

      <button
        type="button"
        onClick={onNewGame}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-emerald-500/90 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"
      >
        Play Again
      </button>
    </div>
  </div>
);

export default WinModal;
