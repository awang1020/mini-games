import type { FC } from 'react';

interface ScoreBoardProps {
  score: number;
  level: number;
  remainingBubbles: number;
  nextBubbleColor: string;
  currentBubbleColor: string;
  onRestart: () => void;
  isGameOver: boolean;
}

const BubblePreview: FC<{ color: string; size?: number }> = ({ color, size = 44 }) => {
  return (
    <div
      className="rounded-full border border-white/10 shadow-lg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), ${color})`,
      }}
    />
  );
};

const ScoreBoard: FC<ScoreBoardProps> = ({
  score,
  level,
  remainingBubbles,
  nextBubbleColor,
  currentBubbleColor,
  onRestart,
  isGameOver,
}) => {
  return (
    <aside className="w-full max-w-xs space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur">
      <div>
        <h2 className="text-2xl font-bold text-white">Bubble Shooter</h2>
        <p className="mt-2 text-sm text-slate-300">
          Aim with your mouse or arrow keys. Fire bubbles with a click or the space bar.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-center text-sm">
        <div className="rounded-2xl bg-slate-800/70 p-4">
          <dt className="text-xs uppercase tracking-wider text-slate-300">Score</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{score}</dd>
        </div>
        <div className="rounded-2xl bg-slate-800/70 p-4">
          <dt className="text-xs uppercase tracking-wider text-slate-300">Level</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{level}</dd>
        </div>
        <div className="rounded-2xl bg-slate-800/70 p-4">
          <dt className="text-xs uppercase tracking-wider text-slate-300">Remaining</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{remainingBubbles}</dd>
        </div>
        <div className="rounded-2xl bg-slate-800/70 p-4">
          <dt className="text-xs uppercase tracking-wider text-slate-300">Status</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{isGameOver ? 'Game Over' : 'In Play'}</dd>
        </div>
      </dl>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-800/70 p-4">
          <span className="text-xs uppercase tracking-wider text-slate-300">Current</span>
          <BubblePreview color={currentBubbleColor} size={40} />
        </div>
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-800/70 p-4">
          <span className="text-xs uppercase tracking-wider text-slate-300">Next</span>
          <BubblePreview color={nextBubbleColor} size={40} />
        </div>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {isGameOver ? 'Play Again' : 'Restart'}
      </button>
    </aside>
  );
};

export default ScoreBoard;
