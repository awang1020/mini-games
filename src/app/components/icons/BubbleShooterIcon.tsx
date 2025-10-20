import type { FC } from 'react';

import type { GameIconProps } from '@/types/game';

const BubbleShooterIcon: FC<GameIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bubbleGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="14" fill="url(#bubbleGradient)" opacity="0.9" />
      <circle cx="44" cy="18" r="11" fill="url(#bubbleGradient)" opacity="0.75" />
      <circle cx="42" cy="42" r="16" fill="url(#bubbleGradient)" opacity="0.85" />
      <rect
        x="26"
        y="46"
        width="12"
        height="14"
        rx="6"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="29"
        y="24"
        width="6"
        height="24"
        rx="3"
        fill="currentColor"
        opacity="0.9"
        transform="rotate(10 32 24)"
      />
    </svg>
  );
};

export default BubbleShooterIcon;
