
import React from 'react';
import styles from './Hangman.module.css';

const words = [
  'apple', 'banana', 'cat', 'dog', 'earth', 'friend', 'green', 'happy', 'island',
  'juice', 'key', 'lemon', 'money', 'music', 'nature', 'ocean', 'phone', 'pizza',
  'queen', 'river', 'soccer', 'sun', 'table', 'train', 'umbrella', 'violet',
  'water', 'yellow', 'zebra'
];

const Hangman = () => {
  const [selectedWord, setSelectedWord] = React.useState('');
  const [guessedLetters, setGuessedLetters] = React.useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = React.useState(0);

  React.useEffect(() => {
    setSelectedWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const handleGuess = (letter: string) => {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters([...guessedLetters, letter]);
      if (!selectedWord.includes(letter)) {
        setIncorrectGuesses(incorrectGuesses + 1);
      }
    }
  };

  const displayWord = selectedWord.split('').map(letter => (guessedLetters.includes(letter) ? letter : '_')).join(' ');

  const isGameOver = incorrectGuesses >= 6;
  const isWinner = !!(selectedWord && selectedWord.split('').every(letter => guessedLetters.includes(letter)));

  return (
    <div className={styles.container}>
      <h1>Hangman</h1>
      <div className={styles.gameContainer}>
        <div className={styles.hangman}>
          <div className={styles.scaffold} />
          <div className={styles.head} style={{ display: incorrectGuesses > 0 ? 'block' : 'none' }} />
          <div className={styles.body} style={{ display: incorrectGuesses > 1 ? 'block' : 'none' }} />
          <div className={styles.leftArm} style={{ display: incorrectGuesses > 2 ? 'block' : 'none' }} />
          <div className={styles.rightArm} style={{ display: incorrectGuesses > 3 ? 'block' : 'none' }} />
          <div className={styles.leftLeg} style={{ display: incorrectGuesses > 4 ? 'block' : 'none' }} />
          <div className={styles.rightLeg} style={{ display: incorrectGuesses > 5 ? 'block' : 'none' }} />
        </div>
        <div className={styles.errorCounter}>
          <p>Incorrect Guesses: {incorrectGuesses} / 6</p>
        </div>
      </div>
      <p className={styles.word}>{displayWord}</p>
      <div className={styles.alphabet}>
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
          <button
            key={letter}
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.includes(letter) || isGameOver || isWinner}
          >
            {letter}
          </button>
        ))}
      </div>
      {isGameOver && <p className={styles.message}>You lost! The word was: {selectedWord}</p>}
      {isWinner && <p className={styles.message}>You won!</p>}
      <button
        className={styles.newGameButton}
        onClick={() => {
          setSelectedWord(words[Math.floor(Math.random() * words.length)]);
          setGuessedLetters([]);
          setIncorrectGuesses(0);
        }}
        aria-label="Start a new game"
      >
        New Game
      </button>
    </div>
  );
};

export default Hangman;
