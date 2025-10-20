import type { FC } from 'react';

interface BoardBubbleProps {
  x: number;
  y: number;
  color: string;
  size: number;
  isGhost?: boolean;
}

const BoardBubble: FC<BoardBubbleProps> = ({ x, y, color, size, isGhost = false }) => {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        borderRadius: '9999px',
        border: '2px solid rgba(255,255,255,0.18)',
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${color})`,
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
        opacity: isGhost ? 0.7 : 1,
        transition: 'opacity 150ms ease-in-out',
      }}
    />
  );
};

export default BoardBubble;
