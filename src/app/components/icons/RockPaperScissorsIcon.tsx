'use client';

import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const RockPaperScissorsIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
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
    <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z" />
    <path d="M12 12l-3 3 3 3" />
    <path d="M12 12l3-3-3-3" />
  </svg>
);

export default RockPaperScissorsIcon;
