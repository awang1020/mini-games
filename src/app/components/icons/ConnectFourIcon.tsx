'use client';

import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const ConnectFourIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
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
    <rect x="2.75" y="3.5" width="18.5" height="17" rx="2.75" fill="currentColor" fillOpacity="0.12" />
    <circle cx="7" cy="8" r="1.7" fill="#f87171" stroke="#fca5a5" strokeWidth="0.6" />
    <circle cx="12" cy="8" r="1.7" fill="#facc15" stroke="#fde047" strokeWidth="0.6" />
    <circle cx="17" cy="8" r="1.7" fill="#f87171" stroke="#fca5a5" strokeWidth="0.6" />
    <circle cx="7" cy="13" r="1.7" fill="#facc15" stroke="#fde047" strokeWidth="0.6" />
    <circle cx="12" cy="13" r="1.7" fill="#f87171" stroke="#fca5a5" strokeWidth="0.6" />
    <circle cx="17" cy="13" r="1.7" fill="#facc15" stroke="#fde047" strokeWidth="0.6" />
  </svg>
);

export default ConnectFourIcon;
