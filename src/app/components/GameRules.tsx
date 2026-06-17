'use client';

import type { FC } from 'react';

import type { GameMetadata, GameRuleSet } from '@/types/game';

interface GameRulesProps {
  ruleSet: GameRuleSet;
  metadata?: GameMetadata;
}

const GameRules: FC<GameRulesProps> = ({ ruleSet, metadata }) => {
  const Icon = metadata?.icon;
  const accent = metadata?.accent ?? 'from-indigo-400 to-violet-600';

  return (
    <section
      aria-labelledby="game-rules-title"
      className="glass h-full rounded-3xl p-6 shadow-card"
    >
      <header className="flex items-center gap-4">
        {Icon ? (
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg ring-1 ring-white/25`}
          >
            <Icon className="h-7 w-7 text-white" />
          </span>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
            How to play
          </p>
          <h2 id="game-rules-title" className="text-xl font-bold text-white">
            {ruleSet.title}
          </h2>
        </div>
      </header>

      <ol className="mt-6 space-y-3">
        {ruleSet.rules.map((rule, index) => (
          <li key={rule} className="flex gap-3">
            <span
              aria-hidden
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br ${accent} text-xs font-bold text-white`}
            >
              {index + 1}
            </span>
            <span className="text-sm leading-relaxed text-white/70">{rule}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default GameRules;
