'use client';

import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const HangmanIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
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
    <path d="M12 2L12 8" />
    <path d="M6 8L18 8" />
    <path d="M12 14L12 22" />
    <path d="M9 22L15 22" />
    <path d="M9 14L6 11" />
    <path d="M15 14L18 11" />
    <circle cx="12" cy="5" r="3" />
  </svg>
);

export default HangmanIcon;
