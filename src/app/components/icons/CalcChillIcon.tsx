import type { FC } from 'react';
import type { GameIconProps } from '@/types/game';

const CalcChillIcon: FC<GameIconProps> = ({ className = 'h-16 w-16 text-white' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a5b4fc" />
        <stop offset="100%" stopColor="#fbcfe8" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="48" height="48" rx="10" fill="url(#g)" opacity="0.9" />
    <g fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" opacity="0.85">
      <line x1="20" y1="24" x2="44" y2="24" />
      <line x1="20" y1="32" x2="32" y2="32" />
      <line x1="36" y1="32" x2="44" y2="32" />
      <circle cx="24" cy="42" r="3" />
      <circle cx="40" cy="42" r="3" />
    </g>
  </svg>
);

export default CalcChillIcon;

