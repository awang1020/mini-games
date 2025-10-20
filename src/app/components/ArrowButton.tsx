'use client';

import React from 'react';

interface ArrowButtonProps {
  direction: 'up' | 'down' | 'left' | 'right';
  onClick: () => void;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, onClick }) => {
  const getRotation = () => {
    switch (direction) {
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      case 'left': return 'rotate-180';
      case 'right': return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-4 rounded-lg transition-colors duration-200"
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
