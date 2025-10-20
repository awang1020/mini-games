'use client';

import React from 'react';

const Game2048Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-white mx-auto mb-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M7 12h4l4 4" />
    <path d="M7 8h4l4-4" />
    <path d="M17 8h-4l-4 4" />
    <path d="M17 16h-4l-4-4" />
  </svg>
);

export default Game2048Icon;
