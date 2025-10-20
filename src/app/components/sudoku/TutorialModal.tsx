'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: FC<TutorialModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sudoku-tutorial-title"
        className="w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-8 text-slate-100 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">Welcome</p>
            <h2 id="sudoku-tutorial-title" className="mt-2 text-3xl font-bold tracking-tight">
              How to play Sudoku
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Fill every row, column, and 3×3 box with numbers 1–9 without repeating any digits. Use notes to jot down
              possibilities as you work.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700/80"
            aria-label="Close tutorial"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow-inner">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-300">Controls</h3>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>
                <span className="font-semibold text-slate-100">Tap</span> a cell and press 1–9 or use the keypad.
              </li>
              <li>
                Toggle <span className="font-semibold text-slate-100">Notes</span> with the N key to add pencil marks.
              </li>
              <li>
                Move with <span className="font-semibold text-slate-100">arrow keys</span> and clear with 0 or Backspace.
              </li>
              <li>
                Undo / Redo with <span className="font-semibold text-slate-100">Ctrl/⌘ + Z</span> and <span className="font-semibold text-slate-100">Ctrl/⌘ + Y</span>.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-900/70 p-4 shadow-inner">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Tips</h3>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>
                Use <span className="font-semibold text-emerald-200">notes</span> to track candidates in empty cells.
              </li>
              <li>
                Press the <span className="font-semibold text-emerald-200">Hint</span> button sparingly—you only get a few.
              </li>
              <li>
                The <span className="font-semibold text-emerald-200">Check Board</span> button highlights incorrect entries.
              </li>
              <li>
                Aim for the fastest time and keep errors low for the high score board!
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-200">Ready to play?</p>
            <p>Choose a difficulty, then tap any empty cell to begin.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-950 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200"
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
