'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styles from './Hangman.module.css';

const WORDS = [
  'amitié',
  'arbre',
  'avion',
  'bateau',
  'bonjour',
  'café',
  'chanson',
  'château',
  'chouette',
  'citrouille',
  'clé',
  'cœur',
  'croissant',
  'école',
  'étoile',
  'fleur',
  'forêt',
  'fromage',
  'garçon',
  'hirondelle',
  'hiver',
  'jouet',
  'lumière',
  'maison',
  'montagne',
  'musique',
  'nuage',
  'papillon',
  'parapluie',
  'patience',
  'plage',
  'poisson',
  'porte',
  'printemps',
  'renard',
  'soleil',
  'sourire',
  'téléphone',
  'tranquille',
  'univers',
  'voiture',
] as const;

const ALPHABET = [
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  'à',
  'â',
  'æ',
  'ç',
  'é',
  'è',
  'ê',
  'ë',
  'î',
  'ï',
  'ô',
  'œ',
  'ù',
  'û',
  'ü',
  'ÿ',
];
const MAX_ATTEMPTS = 6;

const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const Hangman: FC = () => {
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);

  const startNewGame = useCallback(() => {
    setSelectedWord(getRandomWord());
    setGuessedLetters([]);
    setIncorrectGuesses(0);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleGuess = useCallback(
    (letter: string) => {
      if (!selectedWord || guessedLetters.includes(letter)) {
        return;
      }

      if (!selectedWord.includes(letter)) {
        setIncorrectGuesses((previous) => previous + 1);
      }

      setGuessedLetters((previousGuesses) => [...previousGuesses, letter]);
    },
    [selectedWord, guessedLetters],
  );

  const isGameOver = incorrectGuesses >= MAX_ATTEMPTS;
  const isWinner = useMemo(() => {
    if (!selectedWord) {
      return false;
    }
    return selectedWord.split('').every((letter) => guessedLetters.includes(letter));
  }, [selectedWord, guessedLetters]);

  const displayWord = useMemo(() => {
    if (!selectedWord) {
      return '';
    }

    return selectedWord
      .split('')
      .map((letter) => (guessedLetters.includes(letter) || isGameOver ? letter : '_'))
      .join(' ');
  }, [selectedWord, guessedLetters, isGameOver]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hangman</h1>
      <div className={styles.gameContainer}>
        <div className={styles.hangman} aria-hidden="true">
          <div className={styles.scaffold} />
          <div className={`${styles.head} ${incorrectGuesses > 0 ? styles.visible : ''}`} />
          <div className={`${styles.body} ${incorrectGuesses > 1 ? styles.visible : ''}`} />
          <div className={`${styles.leftArm} ${incorrectGuesses > 2 ? styles.visible : ''}`} />
          <div className={`${styles.rightArm} ${incorrectGuesses > 3 ? styles.visible : ''}`} />
          <div className={`${styles.leftLeg} ${incorrectGuesses > 4 ? styles.visible : ''}`} />
          <div className={`${styles.rightLeg} ${incorrectGuesses > 5 ? styles.visible : ''}`} />
        </div>
        <div className={styles.errorCounter} aria-live="polite">
          Incorrect Guesses: {incorrectGuesses} / {MAX_ATTEMPTS}
        </div>
      </div>
      <p className={styles.word} aria-live="polite">
        {displayWord}
      </p>
      <div className={styles.alphabet}>
        {ALPHABET.map((letter) => {
          const isDisabled = guessedLetters.includes(letter) || isGameOver || isWinner;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => handleGuess(letter)}
              disabled={isDisabled}
              aria-pressed={guessedLetters.includes(letter)}
              className={styles.letterButton}
            >
              {letter}
            </button>
          );
        })}
      </div>
      {isGameOver && !isWinner && (
        <p className={styles.message} role="alert">
          You lost! The word was: {selectedWord}
        </p>
      )}
      {isWinner && (
        <p className={styles.message} role="status">
          You won!
        </p>
      )}
      <button
        type="button"
        className={styles.newGameButton}
        onClick={startNewGame}
        aria-label="Start a new game"
      >
        New Game
      </button>
    </div>
  );
};

export default Hangman;
