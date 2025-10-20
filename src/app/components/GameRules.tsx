'use client';

import type { FC } from 'react';

import type { GameRuleSet } from '@/types/game';

interface GameRulesProps {
  ruleSet: GameRuleSet;
}

const GameRules: FC<GameRulesProps> = ({ ruleSet }) => {
  return (
    <section aria-labelledby="game-rules-title" className="h-full rounded-lg bg-gray-900 p-6 text-white shadow-lg">
      <h2 id="game-rules-title" className="mb-4 text-center text-2xl font-bold">
        {ruleSet.title} Rules
      </h2>
      <ol className="list-decimal space-y-4 pl-5 text-left text-sm leading-relaxed text-gray-200">
        {ruleSet.rules.map((rule) => (
          <li key={rule} className="marker:text-indigo-400">
            {rule}
          </li>
        ))}
      </ol>
    </section>
  );
};

export default GameRules;
