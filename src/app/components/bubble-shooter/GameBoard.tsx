import type { FC, PointerEvent, RefObject } from 'react';

import BoardBubble from './BoardBubble';
import Cannon from './Cannon';
import type { ActiveBubble } from './types';

interface GameBoardProps {
  board: (string | null)[][];
  activeBubble: ActiveBubble | null;
  aimAngle: number;
  currentBubbleColor: string;
  bubbleSize: number;
  boardWidth: number;
  boardHeight: number;
  scale: number;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  boardWrapperRef: RefObject<HTMLDivElement>;
  boardRef: RefObject<HTMLDivElement>;
  getBubblePosition: (row: number, col: number) => { x: number; y: number };
  gameOver: boolean;
  onRestart: () => void;
  score: number;
  level: number;
  poppedCount: number;
  onBackToMenu: () => void;
}

const GameBoard: FC<GameBoardProps> = ({
  board,
  activeBubble,
  aimAngle,
  currentBubbleColor,
  bubbleSize,
  boardWidth,
  boardHeight,
  scale,
  onPointerMove,
  onPointerDown,
  boardWrapperRef,
  boardRef,
  getBubblePosition,
  gameOver,
  onRestart,
  score,
  level,
  poppedCount,
  onBackToMenu,
}) => {
  return (
    <div
      ref={boardWrapperRef}
      className="relative mx-auto w-full"
      style={{
        height: `${boardHeight * scale}px`,
        maxWidth: `${boardWidth}px`,
      }}
    >
      <div
        ref={boardRef}
        className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          touchAction: 'none',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (!cell) {
              return null;
            }
            const { x, y } = getBubblePosition(rowIndex, colIndex);
            return <BoardBubble key={`${rowIndex}-${colIndex}-${cell}`} x={x} y={y} color={cell} size={bubbleSize} />;
          }),
        )}
        {activeBubble ? (
          <BoardBubble
            x={activeBubble.x}
            y={activeBubble.y}
            color={activeBubble.color}
            size={bubbleSize}
          />
        ) : null}
        <Cannon
          angle={aimAngle}
          bubbleColor={currentBubbleColor}
          bubbleSize={bubbleSize}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
        />
        {gameOver ? (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-8 text-center text-white shadow-2xl">
              <h2 className="text-3xl font-bold">Game Over — You lost!</h2>
              <p className="mt-3 text-sm text-slate-200">No more shots left or the bubbles reached the bottom.</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-left text-sm">
                <div className="rounded-2xl bg-slate-800/70 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">Final Score</dt>
                  <dd className="mt-1 text-lg font-semibold">{score}</dd>
                </div>
                <div className="rounded-2xl bg-slate-800/70 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">Level Reached</dt>
                  <dd className="mt-1 text-lg font-semibold">{level}</dd>
                </div>
                <div className="col-span-2 rounded-2xl bg-slate-800/70 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">Bubbles Popped</dt>
                  <dd className="mt-1 text-lg font-semibold">{poppedCount}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onRestart}
                  className="w-full rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="w-full rounded-full bg-slate-700 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GameBoard;
