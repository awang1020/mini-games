'use client';

import type { FC } from 'react';

interface ArrowButtonProps {
  direction: 'up' | 'down' | 'left' | 'right';
  onClick: () => void;
}

const ArrowButton: FC<ArrowButtonProps> = ({ direction, onClick }) => {
  const getRotation = () => {
    switch (direction) {
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      case 'left': return 'rotate-180';
      case 'right': return '';
    }
  };

  const labelMap: Record<ArrowButtonProps['direction'], string> = {
    up: 'Move tiles up',
    down: 'Move tiles down',
    left: 'Move tiles left',
    right: 'Move tiles right',
  };

  return (
    <button
      onClick={onClick}
      aria-label={labelMap[direction]}
      className="rounded-lg bg-gray-700 p-4 font-bold text-white transition-colors duration-200 hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-8 w-8 transform ${getRotation()}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  );
};

export default ArrowButton;
