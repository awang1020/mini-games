import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const SnakeIcon: FC<GameIconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Snake icon"
  >
    <defs>
      <linearGradient id="snakeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#99f6e4" />
        <stop offset="100%" stopColor="#7dd3fc" />
      </linearGradient>
    </defs>
    <rect x="6" y="48" width="52" height="8" rx="2" fill="#fecdd3" />
    <path
      d="M10 40c8 0 8-8 16-8s8 8 16 8 8-8 16-8"
      stroke="url(#snakeGrad)"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="50" cy="32" r="4" fill="#0f172a" />
  </svg>
);

export default SnakeIcon;

