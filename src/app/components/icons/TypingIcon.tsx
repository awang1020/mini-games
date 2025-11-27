import type { FC } from 'react';
import type { GameIconProps } from '@/types/game';

const TypingIcon: FC<GameIconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Typing icon">
    <rect x="6" y="14" width="52" height="36" rx="6" fill="#0f172a" stroke="#64748b" />
    <rect x="12" y="20" width="40" height="6" rx="3" fill="#94a3b8" />
    <rect x="12" y="30" width="28" height="6" rx="3" fill="#60a5fa" />
    <rect x="12" y="40" width="18" height="6" rx="3" fill="#34d399" />
  </svg>
);

export default TypingIcon;

