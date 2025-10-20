'use client';

import type { FC } from 'react';

interface ControlsProps {
  onNumberClick: (num: number) => void;
  onClearClick: () => void;
  onNewGameClick: () => void;
  onHintClick: () => void;
  onCheckBoardClick: () => void;
  onShowHighScores: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleNotesMode: () => void;
  numberPadDisabled: boolean;
  isNotesMode: boolean;
  hintsRemaining: number;
  canUndo: boolean;
  canRedo: boolean;
}

const Controls: FC<ControlsProps> = ({
  onNumberClick,
  onClearClick,
  onNewGameClick,
  onHintClick,
  onCheckBoardClick,
  onShowHighScores,
  onUndo,
  onRedo,
  onToggleNotesMode,
  numberPadDisabled,
  isNotesMode,
  hintsRemaining,
  canUndo,
  canRedo,
}) => {
  const numbers = Array.from({ length: 9 }, (_, index) => index + 1);

  return (
    <aside className="w-full max-w-sm rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Number Pad</h2>
          <p className="mt-1 text-xs text-slate-400">Tap or press 1–9. Toggle notes with the N key.</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {numbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onNumberClick(num)}
                disabled={numberPadDisabled}
                className={`flex h-16 items-center justify-center rounded-2xl text-2xl font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  numberPadDisabled
                    ? 'cursor-not-allowed bg-slate-800/60 text-slate-500'
                    : 'bg-slate-800/90 text-slate-100 shadow hover:-translate-y-0.5 hover:bg-slate-700/90 hover:shadow-lg'
                }`}
                aria-label={`Insert number ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onToggleNotesMode}
            aria-pressed={isNotesMode}
            className={`flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
              isNotesMode
                ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80'
            }`}
          >
            Notes Mode
          </button>
          <button
            type="button"
            onClick={onClearClick}
            className="flex items-center justify-center rounded-2xl bg-rose-600/90 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-rose-50 transition hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-200"
          >
            Clear Cell
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onHintClick}
            disabled={hintsRemaining <= 0}
            className={`flex flex-col items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${
              hintsRemaining <= 0
                ? 'cursor-not-allowed bg-slate-800/60 text-slate-500'
                : 'bg-amber-400/90 text-amber-950 hover:bg-amber-300'
            }`}
            aria-label={hintsRemaining <= 0 ? 'No hints remaining' : `Use hint, ${hintsRemaining} remaining`}
          >
            <span>Hint</span>
            <span className="text-xs font-medium">{hintsRemaining} left</span>
          </button>
          <button
            type="button"
            onClick={onCheckBoardClick}
            className="flex items-center justify-center rounded-2xl bg-sky-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-sky-950 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200"
          >
            Check Board
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-200 ${
              canUndo
                ? 'bg-slate-800/80 text-slate-100 hover:bg-slate-700/80'
                : 'cursor-not-allowed bg-slate-800/50 text-slate-500'
            }`}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-200 ${
              canRedo
                ? 'bg-slate-800/80 text-slate-100 hover:bg-slate-700/80'
                : 'cursor-not-allowed bg-slate-800/50 text-slate-500'
            }`}
          >
            Redo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onNewGameClick}
            className="flex items-center justify-center rounded-2xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"
          >
            New Game
          </button>
          <button
            type="button"
            onClick={onShowHighScores}
            className="flex items-center justify-center rounded-2xl bg-purple-500/90 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-purple-50 transition hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-200"
          >
            High Scores
          </button>
        </div>

        <p className="rounded-2xl bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
          Tip: Navigate with the arrow keys, press <span className="font-semibold text-slate-200">0</span> or Backspace to clear, and use
          <span className="font-semibold text-slate-200"> Ctrl/⌘ + Z</span> or <span className="font-semibold text-slate-200">Ctrl/⌘ + Y</span> for undo and redo.
        </p>
      </div>
    </aside>
  );
};

export default Controls;