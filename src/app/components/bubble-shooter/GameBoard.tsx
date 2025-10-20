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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/70 px-6 text-center text-white">
            <h2 className="text-3xl font-bold">Game Over</h2>
            <p className="mt-2 text-sm text-gray-200">Bubbles have reached the bottom.</p>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Try Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GameBoard;
