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

const MemoryGame: FC = () => {
  const [board, setBoard] = useState<Card[]>(() => createShuffledBoard());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

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

      setBoard((previousBoard) =>
        previousBoard.map((card) =>
          card.id === id ? { ...card, isFlipped: true } : card,
        ),
      );

      const nextFlipped = [...previousFlipped, id];
      if (nextFlipped.length === 2) {
        setMoves((previousMoves) => previousMoves + 1);
      }
      return nextFlipped;
    });
  }, []);

  const handleReset = useCallback(() => {
    setBoard(createShuffledBoard());
    setFlippedCards([]);
    setMoves(0);
  }, []);

  const allMatched = useMemo(() => board.every((card) => card.isMatched), [board]);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-white">
      <h1 className="text-4xl font-bold">Memory Game</h1>
      <div className="text-xl font-semibold" aria-live="polite">
        Moves: {moves}
      </div>
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
