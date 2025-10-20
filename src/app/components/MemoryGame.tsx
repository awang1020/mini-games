'use client';

import React, { useState, useEffect } from 'react';

const cardImages = [
  '/memory-game/angular.png',
  '/memory-game/aurelia.png',
  '/memory-game/backbone.png',
  '/memory-game/ember.png',
  '/memory-game/react.png',
  '/memory-game/vue.png',
];

interface Card {
  id: number;
  type: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const createShuffledBoard = (): Card[] => {
  const duplicatedCards = [...cardImages, ...cardImages];
  const shuffled = duplicatedCards.sort(() => 0.5 - Math.random());
  return shuffled.map((type, index) => ({
    id: index,
    type,
    isFlipped: false,
    isMatched: false,
  }));
};

const MemoryGame = () => {
  const [board, setBoard] = useState<Card[]>(createShuffledBoard());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = board.find(c => c.id === firstCardId);
      const secondCard = board.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.type === secondCard.type) {
        setBoard(prevBoard =>
          prevBoard.map(card =>
            card.type === firstCard.type ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setBoard(prevBoard =>
            prevBoard.map(card =>
              flippedCards.includes(card.id) ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const handleCardClick = (id: number) => {
    const card = board.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    setFlippedCards([...flippedCards, id]);
    setBoard(prevBoard =>
      prevBoard.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    if(flippedCards.length === 1) {
      setMoves(moves + 1);
    }
  };

  const handleReset = () => {
    setBoard(createShuffledBoard());
    setFlippedCards([]);
    setMoves(0);
  };

  const allMatched = board.every(card => card.isMatched);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Memory Game</h1>
      <div className="mb-4 text-xl font-semibold">Moves: {moves}</div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {board.map(card => (
          <div key={card.id} onClick={() => handleCardClick(card.id)} className="w-24 h-24 perspective-1000">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full bg-indigo-500 rounded-lg flex items-center justify-center backface-hidden">
                {/* Card Back */}
              </div>
              <div className="absolute w-full h-full bg-white rounded-lg flex items-center justify-center rotate-y-180 backface-hidden">
                <img src={card.type} alt="card" className="w-16 h-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {allMatched && (
        <div className="text-2xl font-bold text-green-500 mb-4">You won in {moves} moves!</div>
      )}
      <button
        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleReset}
      >
        Reset Game
      </button>
    </div>
  );
};

export default MemoryGame;
