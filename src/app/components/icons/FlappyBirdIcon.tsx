import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const FlappyBirdIcon: FC<GameIconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Flappy Bird icon"
  >
    <rect x="4" y="28" width="12" height="24" rx="2" fill="#16a34a" />
    <rect x="48" y="16" width="12" height="28" rx="2" fill="#16a34a" />
    <rect x="4" y="48" width="56" height="8" rx="2" fill="#f59e0b" />
    <circle cx="30" cy="28" r="14" fill="#fcd34d" />
    <circle cx="28" cy="26" r="4" fill="#1f2937" />
    <path d="M44 28c0 8.284-6.716 15-15 15-4.3 0-8.164-1.825-10.889-4.745L44 28Z" fill="#f97316" />
    <path d="M24 16l10 4-10 4v-8Z" fill="#fb923c" />
  </svg>
);

export default FlappyBirdIcon;
