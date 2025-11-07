'use client';

import type { FC } from 'react';
import type { GameIconProps } from '@/types/game';

const TetrisIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="6" height="6" fill="#38bdf8" stroke="#7dd3fc" />
    <rect x="9" y="3" width="6" height="6" fill="#f59e0b" stroke="#fbbf24" />
    <rect x="15" y="3" width="6" height="6" fill="#22c55e" stroke="#4ade80" />
    <rect x="3" y="9" width="6" height="6" fill="#a855f7" stroke="#c084fc" />
    <rect x="9" y="9" width="6" height="6" fill="#ef4444" stroke="#f87171" />
    <rect x="15" y="9" width="6" height="6" fill="#3b82f6" stroke="#60a5fa" />
  </svg>
);

export default TetrisIcon;

