'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Card = {
  id: number;
  type: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const CARD_IMAGES = [
  '/memory-game/angular.png',
  '/memory-game/aurelia.png',
  '/memory-game/backbone.png',
  '/memory-game/ember.png',
  '/memory-game/react.png',
  '/memory-game/vue.png',
] as const;

const getCardAltText = (type: string): string => {
  const fileName = type.split('/').pop()?.replace('.png', '') ?? 'card';
  const label = fileName.replace(/[-_]/g, ' ').trim();
  return `${label} card`;
};

const createShuffledBoard = (): Card[] => {
  const duplicatedCards = [...CARD_IMAGES, ...CARD_IMAGES];
  const shuffled = duplicatedCards
    .map((type) => ({ type, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry, index) => ({
      id: index,
      type: entry.type,
      isFlipped: false,
      isMatched: false,
    }));

  return shuffled;
};

const SCOREBOARD_STORAGE_KEY = 'memory-game-scores';

const MemoryGame: FC = () => {
  const [board, setBoard] = useState<Card[]>(() => createShuffledBoard());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedScores = window.localStorage.getItem(SCOREBOARD_STORAGE_KEY);
      if (!storedScores) {
        return;
      }

      const parsedScores = JSON.parse(storedScores) as unknown;
      if (!Array.isArray(parsedScores)) {
        return;
      }

      const validScores = parsedScores
        .map((score) => (typeof score === 'number' && Number.isFinite(score) ? score : null))
        .filter((score): score is number => score !== null)
        .sort((first, second) => first - second)
        .slice(0, 5);

      setScores(validScores);
    } catch (error) {
      console.error('Failed to load memory game scores', error);
    }
  }, []);

  useEffect(() => {
    if (flippedCards.length !== 2) {
      return undefined;
    }

    const [firstCardId, secondCardId] = flippedCards;
    const firstCard = board.find((card) => card.id === firstCardId);
    const secondCard = board.find((card) => card.id === secondCardId);

    if (!firstCard || !secondCard) {
      setFlippedCards([]);
      return undefined;
    }

    if (firstCard.type === secondCard.type) {
      setBoard((previousBoard) =>
        previousBoard.map((card) =>
          card.type === firstCard.type ? { ...card, isMatched: true } : card,
        ),
      );
      setFlippedCards([]);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setBoard((previousBoard) =>
        previousBoard.map((card) =>
          card.id === firstCardId || card.id === secondCardId
            ? { ...card, isFlipped: false }
            : card,
        ),
      );
      setFlippedCards([]);
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [board, flippedCards]);

  const handleCardClick = useCallback((id: number) => {
    setFlippedCards((previousFlipped) => {
      if (previousFlipped.length === 2 || previousFlipped.includes(id)) {
        return previousFlipped;
      }

      let shouldFlipCard = false;

      setBoard((previousBoard) => {
        const cardToFlip = previousBoard.find((card) => card.id === id);

        if (!cardToFlip || cardToFlip.isMatched || cardToFlip.isFlipped) {
          return previousBoard;
        }

        shouldFlipCard = true;

        return previousBoard.map((card) =>
          card.id === id ? { ...card, isFlipped: true } : card,
        );
      });

      if (!shouldFlipCard) {
        return previousFlipped;
      }

      const nextFlipped = [...previousFlipped, id];

      setMoves((previousMoves) => previousMoves + 1);

      return nextFlipped;
    });
  }, []);

  const handleReset = useCallback(() => {
    setBoard(createShuffledBoard());
    setFlippedCards([]);
    setMoves(0);
  }, []);

  const allMatched = useMemo(() => board.every((card) => card.isMatched), [board]);

  useEffect(() => {
    if (!allMatched || moves === 0) {
      return;
    }

    setScores((previousScores) => {
      const updatedScores = [...previousScores, moves].sort((first, second) => first - second).slice(0, 5);
      return updatedScores;
    });
  }, [allMatched, moves]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const hasScores = scores.length > 0;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-white">
      <h1 className="text-4xl font-bold">Memory Game</h1>
      <div className="text-xl font-semibold" aria-live="polite">
        Moves: {moves}
      </div>
      <section className="w-full max-w-sm rounded-lg bg-indigo-900/60 p-4">
        <h2 className="text-lg font-semibold">Score Board</h2>
        {hasScores ? (
          <ol className="mt-2 list-decimal pl-5">
            {scores.map((score, index) => (
              <li key={`${score}-${index}`} className="py-1">
                {score} move{score === 1 ? '' : 's'}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-indigo-200">No scores yet. Finish a game to record your best moves!</p>
        )}
      </section>
      <div className="grid grid-cols-4 gap-4">
        {board.map((card) => {
          const isFaceUp = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              className="h-24 w-24 perspective-1000 focus:outline-none"
              aria-label={isFaceUp ? 'Card revealed' : 'Hidden card'}
            >
              <div
                className={`relative h-full w-full transform transition-transform duration-500 transform-style-preserve-3d ${
                  isFaceUp ? 'rotate-y-180' : ''
                }`}
              >
                <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-indigo-500 backface-hidden" />
                <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-white backface-hidden rotate-y-180">
                  <Image
                    src={card.type}
                    alt={getCardAltText(card.type)}
                    width={64}
                    height={64}
                    className="h-16 w-16"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {allMatched && (
        <div className="text-2xl font-bold text-green-400" aria-live="polite">
          You won in {moves} moves!
        </div>
      )}
      <button
        type="button"
        className="rounded-md bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        onClick={handleReset}
      >
        Reset Game
      </button>
    </div>
  );
};

export default MemoryGame;
