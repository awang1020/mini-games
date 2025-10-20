'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Pipe = {
  id: number;
  x: number;
  gapTop: number;
  passed: boolean;
};

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;
const BIRD_X = 80;
const BIRD_SIZE = 44;
const PIPE_WIDTH = 70;
const PIPE_GAP = 190;
const PIPE_SPACING = 260;
const PIPE_SPEED = 190; // pixels per second
const GRAVITY = 1800; // pixels per second^2
const JUMP_VELOCITY = -520; // pixels per second

const PIPE_INTERVAL = PIPE_SPACING / PIPE_SPEED;
const MIN_GAP_TOP = 80;
const MAX_GAP_TOP = GAME_HEIGHT - PIPE_GAP - 120;

const createPipe = (id: number, offset = 0): Pipe => ({
  id,
  x: GAME_WIDTH + offset,
  gapTop: Math.min(
    MAX_GAP_TOP,
    Math.max(MIN_GAP_TOP, MIN_GAP_TOP + Math.random() * (MAX_GAP_TOP - MIN_GAP_TOP)),
  ),
  passed: false,
});

type GameState = {
  birdY: number;
  birdVelocity: number;
  pipes: Pipe[];
  score: number;
};

const FlappyBird = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const pipeIdRef = useRef(0);
  const [gameState, setGameState] = useState<GameState>(() => ({
    birdY: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
    birdVelocity: 0,
    pipes: [createPipe(pipeIdRef.current++, PIPE_SPACING)],
    score: 0,
  }));

  const gameStateRef = useRef(gameState);
  const lastTimestampRef = useRef<number | null>(null);
  const spawnTimerRef = useRef(0);
  const pendingJumpRef = useRef(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const resetGameState = useCallback(() => {
    pipeIdRef.current = 0;
    const initialState: GameState = {
      birdY: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
      birdVelocity: 0,
      pipes: [createPipe(pipeIdRef.current++, PIPE_SPACING)],
      score: 0,
    };
    gameStateRef.current = initialState;
    setGameState(initialState);
    lastTimestampRef.current = null;
    spawnTimerRef.current = 0;
    pendingJumpRef.current = false;
  }, []);

  const startGame = useCallback(() => {
    resetGameState();
    setIsGameOver(false);
    setIsRunning(true);
  }, [resetGameState]);

  const handleUserAction = useCallback(() => {
    if (!isRunning) {
      startGame();
      return;
    }
    pendingJumpRef.current = true;
  }, [isRunning, startGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        handleUserAction();
      } else if (!isRunning && (event.code === 'Enter' || event.code === 'KeyR')) {
        event.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUserAction, isRunning, startGame]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!isRunning) {
        return;
      }

      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
      lastTimestampRef.current = timestamp;

      let { birdY, birdVelocity, pipes, score } = gameStateRef.current;

      if (pendingJumpRef.current) {
        birdVelocity = JUMP_VELOCITY;
        pendingJumpRef.current = false;
      }

      birdVelocity += GRAVITY * delta;
      birdY += birdVelocity * delta;

      let hitObstacle = false;

      if (birdY <= 0) {
        birdY = 0;
        hitObstacle = true;
      }

      if (birdY + BIRD_SIZE >= GAME_HEIGHT) {
        birdY = GAME_HEIGHT - BIRD_SIZE;
        hitObstacle = true;
      }

      const updatedPipes: Pipe[] = [];
      pipes.forEach((pipe) => {
        const newX = pipe.x - PIPE_SPEED * delta;
        const pipePassed = pipe.passed || newX + PIPE_WIDTH < BIRD_X;

        if (!pipe.passed && pipePassed) {
          score += 1;
        }

        const newPipe = {
          id: pipe.id,
          x: newX,
          gapTop: pipe.gapTop,
          passed: pipePassed,
        };

        if (newPipe.x + PIPE_WIDTH > 0) {
          updatedPipes.push(newPipe);
        }

        const birdRight = BIRD_X + BIRD_SIZE;
        const pipeRight = newPipe.x + PIPE_WIDTH;

        if (birdRight > newPipe.x && BIRD_X < pipeRight) {
          const gapBottom = newPipe.gapTop + PIPE_GAP;
          if (birdY < newPipe.gapTop || birdY + BIRD_SIZE > gapBottom) {
            hitObstacle = true;
          }
        }
      });

      spawnTimerRef.current += delta;
      while (spawnTimerRef.current >= PIPE_INTERVAL) {
        spawnTimerRef.current -= PIPE_INTERVAL;

        const rightmostPipeX = updatedPipes.reduce<number | null>((max, pipe) => {
          if (max === null || pipe.x > max) {
            return pipe.x;
          }
          return max;
        }, null);

        const spawnOffset =
          rightmostPipeX === null
            ? PIPE_SPACING
            : Math.max(PIPE_SPACING, rightmostPipeX + PIPE_SPACING - GAME_WIDTH);

        updatedPipes.push(createPipe(pipeIdRef.current++, spawnOffset));
      }

      const nextState: GameState = {
        birdY,
        birdVelocity,
        pipes: updatedPipes,
        score,
      };

      gameStateRef.current = nextState;
      setGameState(nextState);

      if (hitObstacle) {
        setBestScore((prev) => Math.max(prev, score));
        setIsGameOver(true);
        setIsRunning(false);
        return;
      }

      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);

  const gameStatusMessage = useMemo(() => {
    if (isRunning) {
      return null;
    }

    if (isGameOver) {
      return 'Game Over! Tap or press Space to try again.';
    }

    return 'Tap, click, or press Space to start.';
  }, [isGameOver, isRunning]);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-gray-100">
      <h2 className="text-3xl font-bold">Flappy Bird</h2>
      <div className="text-sm text-gray-300">
        Score: <span className="font-semibold text-white">{gameState.score}</span> • Best:{' '}
        <span className="font-semibold text-white">{Math.max(bestScore, gameState.score)}</span>
      </div>
      <div
        className="relative h-[640px] w-[360px] overflow-hidden rounded-2xl border border-sky-700 bg-gradient-to-b from-sky-400 to-sky-600 shadow-xl"
        role="button"
        tabIndex={0}
        onClick={handleUserAction}
        onKeyDown={(event) => {
          if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            handleUserAction();
          }
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300" />
        <div
          className="absolute h-11 w-11 -translate-x-1/2 rounded-full bg-yellow-300 shadow-md ring-4 ring-yellow-200 transition-transform"
          style={{ left: `${BIRD_X}px`, top: `${gameState.birdY}px` }}
        >
          <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-orange-400" />
        </div>
        {gameState.pipes.map((pipe) => (
          <div key={pipe.id}>
            <div
              className="absolute w-[70px] bg-green-600 shadow-md"
              style={{
                left: `${pipe.x}px`,
                top: 0,
                height: `${pipe.gapTop}px`,
              }}
            >
              <div className="h-4 w-full bg-green-700" />
            </div>
            <div
              className="absolute w-[70px] bg-green-600 shadow-md"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.gapTop + PIPE_GAP}px`,
                height: `${GAME_HEIGHT - (pipe.gapTop + PIPE_GAP)}px`,
              }}
            >
              <div className="h-4 w-full bg-green-700" />
            </div>
          </div>
        ))}
        {!isRunning && gameStatusMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 p-6 text-center text-lg font-semibold">
            <span>{gameStatusMessage}</span>
          </div>
        )}
      </div>
      <button
        type="button"
        className="rounded-full bg-sky-600 px-6 py-2 font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-700"
        onClick={isRunning ? () => (pendingJumpRef.current = true) : startGame}
      >
        {isRunning ? 'Flap!' : isGameOver ? 'Play Again' : 'Start Game'}
      </button>
      <p className="max-w-md text-center text-sm text-gray-300">
        Stay airborne by timing your flaps to slip through the pipe gaps. Colliding with the pipes or the ground ends the
        game. Keep practicing to beat your best score!
      </p>
    </div>
  );
};

export default FlappyBird;
