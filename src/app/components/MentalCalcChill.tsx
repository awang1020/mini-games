"use client";

import type { FC, KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Op = '+' | '-' | 'x' | '/';

type Problem = {
  a: number;
  b: number;
  op: Op;
  text: string;
  answer: number; // integer
};

type LevelId = 1 | 2 | 3 | 4;

type LevelConfig = {
  id: LevelId;
  name: string;
  ops: Op[];
  timerSeconds: number;
  xpGoal: number; // Level 4 (endless) uses this only for the ring
  endless?: boolean;
};

// Visual/style is unchanged (pastel, rounded, minimal). Difficulty scales per level.
const LEVELS: Record<LevelId, LevelConfig> = {
  1: { id: 1, name: 'Level 1', ops: ['+'], timerSeconds: 15, xpGoal: 10 },
  2: { id: 2, name: 'Level 2', ops: ['+', '-'], timerSeconds: 12, xpGoal: 15 },
  3: { id: 3, name: 'Level 3', ops: ['+', '-', 'x'], timerSeconds: 10, xpGoal: 20 },
  4: { id: 4, name: 'Level 4 Expert', ops: ['+', '-', 'x', '/'], timerSeconds: 8, xpGoal: 30, endless: true },
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Level-based generator (bigger numbers and more ops as levels increase)
const generateProblemForLevel = (level: LevelConfig): Problem => {
  const op = level.ops[randInt(0, level.ops.length - 1)];
  // Bigger ranges by level (gentle but ramping)
  const maxAddSub = level.id === 1 ? 10 : level.id === 2 ? 15 : level.id === 3 ? 30 : 50;
  const multMax = level.id >= 4 ? 15 : 12; // tougher tables on expert
  const divMax = level.id >= 4 ? 15 : 12; // integer-only division window

  if (op === '+') {
    const a = randInt(1, maxAddSub);
    const b = randInt(1, maxAddSub);
    return { a, b, op, text: `${a} + ${b}`, answer: a + b };
  }
  if (op === '-') {
    const x = randInt(1, maxAddSub);
    const y = randInt(1, maxAddSub);
    const a = Math.max(x, y);
    const b = Math.min(x, y);
    return { a, b, op, text: `${a} - ${b}`, answer: a - b };
  }
  if (op === 'x') {
    const a = randInt(1, multMax);
    const b = randInt(1, multMax);
    return { a, b, op, text: `${a} x ${b}`, answer: a * b };
  }
  // integer-only division
  const divisor = randInt(2, divMax);
  const quotient = randInt(1, divMax);
  const dividend = divisor * quotient;
  return { a: dividend, b: divisor, op, text: `${dividend} / ${divisor}`, answer: quotient };
};

const nextGoldenSpacing = () => randInt(10, 20);

const MentalCalcChill: FC = () => {
  // Progression
  const [level, setLevel] = useState<LevelId>(1);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Question flow
  const [problem, setProblem] = useState<Problem>(() => generateProblemForLevel(LEVELS[1]));
  const [golden, setGolden] = useState(false);
  const [nextGoldenIn, setNextGoldenIn] = useState(nextGoldenSpacing());
  const [input, setInput] = useState('');

  // Timer
  const [remainingMs, setRemainingMs] = useState(LEVELS[1].timerSeconds * 1000);
  const [running, setRunning] = useState(true);
  const startedAtRef = useRef<number>(Date.now());
  const endAtRef = useRef<number>(startedAtRef.current + LEVELS[1].timerSeconds * 1000);

  // Feedback, level up popup, encouragement, per-answer points popup
  const [feedback, setFeedback] = useState<null | 'correct' | 'incorrect' | 'timeout'>(null);
  const [showLevelUp, setShowLevelUp] = useState<null | LevelId>(null);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [recentPoints, setRecentPoints] = useState<number | null>(null);

  const currentCfg = LEVELS[level];

  const startRound = (secs: number) => {
    startedAtRef.current = Date.now();
    endAtRef.current = startedAtRef.current + secs * 1000;
    setRemainingMs(secs * 1000);
    setRunning(true);
  };
  const stopRound = () => setRunning(false);

  const encouragementForStreak = (n: number): string | null => {
    if (n >= 10) return 'Amazing streak!';
    if (n >= 7) return 'You’re in the zone!';
    if (n >= 5) return 'Great flow!';
    if (n >= 3) return 'Nice rhythm!';
    return null;
  };

  const scheduleNext = (wasCorrect: boolean) => {
    // XP/level advance preview
    const gain = wasCorrect ? 1 + (golden ? 2 : 0) : 0;
    const willAdvance = wasCorrect && !currentCfg.endless && xp + gain >= currentCfg.xpGoal;
    const targetLevel: LevelId = willAdvance ? Math.min((level + 1) as LevelId, 4 as LevelId) : level;

    if (wasCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((b) => (nextStreak > b ? nextStreak : b));
      // Optimized score calc: add nextStreak
      setScore((prev) => prev + nextStreak);
      // per-answer bonus popup: +1, +2, +3, ...
      setRecentPoints(nextStreak);
      window.setTimeout(() => setRecentPoints(null), 900);
      // encouragement message for streaks (soft, ephemeral) — no +N suffix
      const msg = encouragementForStreak(nextStreak);
      if (msg) {
        setEncouragement(msg);
        window.setTimeout(() => setEncouragement(null), 1200);
      }
      // XP update + level up
      setXp((prev) => (willAdvance ? 0 : prev + gain));
      if (willAdvance) {
        setLevel(targetLevel);
        setShowLevelUp(targetLevel);
        setTimeout(() => setShowLevelUp(null), 1400);
      }
    } else {
      setStreak(0);
      setErrors((e) => e + 1);
    }

    // Golden spacing and next problem
    const nextCount = nextGoldenIn - 1;
    const willBeGolden = nextCount <= 0;
    setGolden(willBeGolden);
    setNextGoldenIn(willBeGolden ? nextGoldenSpacing() : nextCount);

    const cfg = LEVELS[targetLevel];
    setProblem(generateProblemForLevel(cfg));
    setInput('');

    setTimeout(() => {
      startRound(cfg.timerSeconds);
      setFeedback(null);
    }, 450);
  };

  const submit = () => {
    if (!running) return;
    stopRound();
    const val = Number(input.replace(/,/g, '.'));
    const ok = Number.isFinite(val) && Math.abs(val - problem.answer) < 1e-9;
    setFeedback(ok ? 'correct' : 'incorrect');
    scheduleNext(ok);
  };

  // Timer tick (smooth & calm)
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, endAtRef.current - now);
      setRemainingMs(left);
      if (left === 0) {
        stopRound();
        setFeedback('timeout');
        setStreak(0);
        setErrors((e) => e + 1);
        scheduleNext(false);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, problem, level]);

  // Apply new timer when level changes
  useEffect(() => {
    stopRound();
    startRound(currentCfg.timerSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const remainingPct = useMemo(() => {
    const total = currentCfg.timerSeconds * 1000;
    return Math.max(0, Math.min(100, (remainingMs / total) * 100));
  }, [remainingMs, currentCfg]);

  const xpPct = useMemo(() => {
    const goal = currentCfg.xpGoal || 1;
    return Math.max(0, Math.min(100, (xp / goal) * 100));
  }, [xp, currentCfg]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  // Circular timer
  const TimerRing = () => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(1, remainingPct / 100));
    const offset = circumference * (1 - progress);
    return (
      <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="50%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>
        <circle cx={60} cy={60} r={radius} fill="none" stroke="#0ea5e9" strokeOpacity={0.2} strokeWidth={8} />
        <circle
          cx={60}
          cy={60}
          r={radius}
          fill="none"
          stroke="url(#timerGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s linear' }}
        />
      </svg>
    );
  };

  // Circular XP ring
  const XPRing = () => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(1, xpPct / 100));
    const offset = circumference * (1 - progress);
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="xpGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
        </defs>
        <circle cx={24} cy={24} r={radius} fill="none" stroke="#22c55e" strokeOpacity={0.2} strokeWidth={6} />
        <circle
          cx={24}
          cy={24}
          r={radius}
          fill="none"
          stroke="url(#xpGrad)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s linear' }}
        />
      </svg>
    );
  };

  const goldenGlow = 'ring-4 ring-amber-200/40 shadow-[0_0_0.5rem_rgba(251,191,36,0.35)] rounded-2xl';

  return (
    <div className="min-h-screen w-full bg-slate-900 px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-xl items-center justify-center">
        <div className="relative w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          {/* Level + XP + Streak + Level chooser */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-200/20 px-3 py-1 text-xs font-semibold text-sky-100">
                {LEVELS[level].name}
              </span>
              {streak >= 2 ? (
                <span className="rounded-full bg-emerald-200/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">
                  Streak x{streak}
                </span>
              ) : (
                <span className="h-6 w-0 opacity-0" />
              )}
              <div className="ml-2 hidden gap-1 sm:flex">
                {[1, 2, 3, 4].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === level) return;
                      setLevel(k as LevelId);
                      setXp(0);
                      setStreak(0);
                      setGolden(false);
                      setNextGoldenIn(nextGoldenSpacing());
                      const cfg = LEVELS[k as LevelId];
                      setProblem(generateProblemForLevel(cfg));
                      setInput('');
                      setFeedback(null);
                      startedAtRef.current = Date.now();
                      endAtRef.current = startedAtRef.current + cfg.timerSeconds * 1000;
                      setRemainingMs(cfg.timerSeconds * 1000);
                      setRunning(true);
                    }}
                    className={`rounded-full px-2.5 py-0.5 text-xs ring-1 transition ${
                      level === k
                        ? 'bg-sky-300/30 text-sky-100 ring-sky-200/50'
                        : 'bg-white/5 text-slate-200 ring-white/10 hover:bg-white/10'
                    }`}
                    aria-pressed={level === k}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XPRing />
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-emerald-200/80">XP</div>
                <div className="text-xs text-emerald-100">
                  {LEVELS[level].endless ? `${Math.min(100, Math.round(xpPct))}%` : `${xp}/${LEVELS[level].xpGoal}`}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-2xl font-semibold tracking-tight text-sky-100">
            Mental Calculation <span className="text-sky-200">Chill Mode</span>
          </h1>

          {/* Score & Errors */}
          <div className="mt-3 text-center">
            <span className="text-xs uppercase tracking-wide text-sky-200/80">Current score</span>
            <div className="text-3xl font-bold text-emerald-200">{score}</div>
            <div className="mt-1 text-xs text-rose-200/90">Errors: {errors}</div>
          </div>

          {/* Calculation (timer moved to bottom) */}
          <div className={`mt-4 grid grid-cols-1 items-center gap-4 ${golden ? goldenGlow : ''} p-3`}>
            <div className="text-center">
              {/* Encouragement banner above the calculation (non-blocking, fixed height) */}
              <div className="mb-2 flex h-6 items-center justify-center md:h-7" aria-live="polite">
                <span
                  className={`text-sm font-semibold text-emerald-200 transition-all duration-400 md:text-base ${
                    encouragement ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                  }`}
                >
                  {encouragement || ''}
                </span>
              </div>
              <div className={`text-6xl font-semibold text-white drop-shadow-sm md:text-7xl ${golden ? 'text-amber-100' : ''}`}>
                {problem.text}
              </div>
              {golden && (
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                  Golden Question • +2 XP
                </div>
              )}
            </div>
          </div>

          {/* (Per-answer +N popup removed to keep exercise static and focus on small encouragement) */}

          {/* Input */}
          <div className="mt-6 flex items-center justify-center">
            <input
              inputMode="numeric"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^0-9\-]/g, ''))}
              onKeyDown={onKeyDown}
              placeholder="Your answer"
              className={`w-48 rounded-2xl border px-4 py-2 text-center text-2xl text-slate-900 outline-none backdrop-blur-md focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                feedback === 'correct'
                  ? 'border-emerald-300 bg-emerald-100/85'
                  : feedback === 'incorrect' || feedback === 'timeout'
                  ? 'border-rose-300 bg-rose-100/85'
                  : 'border-sky-200/60 bg-white/85'
              }`}
            />
          </div>

          {/* Feedback */}
          <div className="mt-4 h-6 text-center text-sm font-semibold">
            <span
              className={`inline-block transform rounded-full px-2 py-0.5 transition-all duration-500 ${
                feedback === 'correct'
                  ? 'scale-100 bg-emerald-200/30 text-emerald-100 opacity-100'
                  : 'scale-95 opacity-0'
              }`}
            >
              Correct
            </span>
            <span
              className={`inline-block transform rounded-full px-2 py-0.5 transition-all duration-500 ${
                feedback === 'incorrect'
                  ? 'scale-100 bg-rose-200/30 text-rose-100 opacity-100'
                  : 'scale-95 opacity-0'
              }`}
            >
              Incorrect
            </span>
            <span
              className={`inline-block transform rounded-full px-2 py-0.5 transition-all duration-500 ${
                feedback === 'timeout'
                  ? 'scale-100 bg-rose-200/30 text-rose-100 opacity-100'
                  : 'scale-95 opacity-0'
              }`}
            >
              Time’s up
            </span>
          </div>

          {/* Timer at bottom */}
          <div className="mt-6 flex w-full items-center justify-center">
            <TimerRing />
          </div>

          {/* Restart */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setScore(0);
                setXp(0);
                setStreak(0);
                setBestStreak(0);
                setErrors(0);
                setLevel(1);
                setGolden(false);
                setNextGoldenIn(nextGoldenSpacing());
                const first = generateProblemForLevel(LEVELS[1]);
                setProblem(first);
                setInput('');
                setFeedback(null);
                startedAtRef.current = Date.now();
                endAtRef.current = startedAtRef.current + LEVELS[1].timerSeconds * 1000;
                setRemainingMs(LEVELS[1].timerSeconds * 1000);
                setRunning(true);
              }}
              className="rounded-2xl border border-white/10 bg-amber-200/20 px-5 py-2 text-sm font-semibold text-amber-100 backdrop-blur transition-colors hover:bg-amber-200/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Restart Game
            </button>
          </div>

          {/* Level Up Popup */}
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              showLevelUp ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="rounded-2xl border border-emerald-200/30 bg-emerald-200/20 px-6 py-4 text-center text-emerald-100 shadow-lg backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-wide">Level Up</div>
              <div className="mt-1 text-lg font-bold">You unlocked {showLevelUp ? LEVELS[showLevelUp].name : ''}</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MentalCalcChill;
