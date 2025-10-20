'use client';

import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const MemoryGameIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
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
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default MemoryGameIcon;
