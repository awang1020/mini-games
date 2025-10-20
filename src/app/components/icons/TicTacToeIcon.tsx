'use client';

import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const TicTacToeIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="4" x2="20" y2="20" />
    <line x1="20" y1="4" x2="4" y2="20" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default TicTacToeIcon;
