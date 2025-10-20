'use client';

import React from 'react';

interface GameRulesProps {
  title: string;
  rules: string[];
}

const GameRules: React.FC<GameRulesProps> = ({ title, rules }) => {
  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg h-full">
      <h3 className="text-2xl font-bold mb-4 text-center">{title} Rules</h3>
      <ul className="space-y-4">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start">
            <span className="text-lg mr-2">-</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameRules;
