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

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_ATTEMPTS = 6;

const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae');

const Hangman: FC = () => {
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [normalizedWord, setNormalizedWord] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [hasRecordedResult, setHasRecordedResult] = useState(false);

  const startNewGame = useCallback(() => {
    const word = getRandomWord();
    setSelectedWord(word);
    setNormalizedWord(normalizeText(word.toLowerCase()));
    setGuessedLetters([]);
    setIncorrectGuesses(0);
    setHasRecordedResult(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleGuess = useCallback(
    (letter: string) => {
      if (!selectedWord) {
        return;
      }

      const normalizedLetter = normalizeText(letter.toLowerCase());

      if (guessedLetters.includes(normalizedLetter)) {
        return;
      }

      if (!normalizedWord.includes(normalizedLetter)) {
        setIncorrectGuesses((previous) => previous + 1);
      }

      setGuessedLetters((previousGuesses) => [...previousGuesses, normalizedLetter]);
    },
    [selectedWord, normalizedWord, guessedLetters],
  );

  const isGameOver = incorrectGuesses >= MAX_ATTEMPTS;
  const isWinner = useMemo(() => {
    if (!normalizedWord) {
      return false;
    }

    return normalizedWord
      .split('')
      .every((letter) => letter === '' || guessedLetters.includes(letter));
  }, [normalizedWord, guessedLetters]);

  useEffect(() => {
    if (hasRecordedResult) {
      return;
    }

    if (isWinner) {
      setWins((previousWins) => previousWins + 1);
      setHasRecordedResult(true);
    } else if (isGameOver) {
      setLosses((previousLosses) => previousLosses + 1);
      setHasRecordedResult(true);
    }
  }, [isWinner, isGameOver, hasRecordedResult]);

  const displayWord = useMemo(() => {
    if (!selectedWord) {
      return '';
    }

    return selectedWord
      .split('')
      .map((letter) => {
        const normalizedLetter = normalizeText(letter.toLowerCase());
        const normalizedParts = normalizedLetter.split('');

        const isRevealed =
          isGameOver || normalizedParts.every((part) => guessedLetters.includes(part));

        return isRevealed ? letter : '_';
      })
      .join(' ');
  }, [selectedWord, guessedLetters, isGameOver]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hangman</h1>
      <div className={styles.scoreboard} aria-live="polite">
        <span className={styles.score}>Wins: {wins}</span>
        <span className={styles.score}>Losses: {losses}</span>
      </div>
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
