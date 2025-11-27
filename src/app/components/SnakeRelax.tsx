"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInterval } from "@/lib/hooks";

type Point = { x: number; y: number };
type Dir = { x: number; y: number };

const GRID = 20;            // 20x20 grid
const STEP_MS = 120;        // tick speed (ms)

// Keyboard directions
const DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function eq(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}
function wrapPoint(p: Point): Point {
  // exact 0..GRID-1 indexing with modulo wrap
  return { x: (p.x + GRID) % GRID, y: (p.y + GRID) % GRID };
}
function isOpp(a: Dir, b: Dir) {
  return a.x === -b.x && a.y === -b.y;
}
function randomFreeCell(occupied: Point[]): Point {
  while (true) {
    const p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!occupied.some((q) => eq(p, q))) return p;
  }
}
// useInterval now shared from @/lib/hooks

export default function SnakeRelax() {
  // Coordinate system: x = column (left→right), y = row (top→bottom), both 0..19
  const initialSnake = useMemo<Point[]>(
    () => [
      { x: Math.floor(GRID / 2) + 1, y: Math.floor(GRID / 2) },
      { x: Math.floor(GRID / 2), y: Math.floor(GRID / 2) },
      { x: Math.floor(GRID / 2) - 1, y: Math.floor(GRID / 2) },
    ],
    [],
  );

  const [snake, setSnake] = useState<Point[]>(initialSnake);
  const [apple, setApple] = useState<Point>(() => randomFreeCell(initialSnake));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [softReset, setSoftReset] = useState(false); // soft reset on self-collision (no hard game over)

  // Refs to avoid stale values inside interval
  const appleRef = useRef<Point>(apple);
  useEffect(() => {
    appleRef.current = apple;
  }, [apple]);

  const dirRef = useRef<Dir>({ x: 1, y: 0 });
  const queuedDirRef = useRef<Dir | null>(null);

  const queueDir = (next: Dir) => {
    const cur = queuedDirRef.current ?? dirRef.current;
    if (!isOpp(cur, next)) queuedDirRef.current = next;
  };

  // Keyboard controls: arrows/WASD for direction, Space toggles pause/resume, R restarts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k in DIRS) {
        e.preventDefault?.();
        queueDir(DIRS[k]);
      } else if (k === " " || k === "Spacebar") {
        e.preventDefault?.();
        setPaused((p) => !p);
      } else if (k === "r" || k === "R") {
        e.preventDefault?.();
        restart();
      }
    };
    window.addEventListener("keydown", onKey as any, { passive: false } as any);
    return () => window.removeEventListener("keydown", onKey as any);
  }, []);

  // Touch swipe controls
  useEffect(() => {
    let sx = 0,
      sy = 0,
      active = false;
    const start = (e: TouchEvent) => {
      if (!e.touches?.[0]) return;
      active = true;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const end = (e: TouchEvent) => {
      if (!active) return;
      active = false;
      const t = e.changedTouches?.[0];
      if (!t) return;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        queueDir(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        queueDir(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchend", end, { passive: true });
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, []);

  // High score
  useEffect(() => {
    try {
      const v = localStorage.getItem("snakeRelaxHighScore");
      if (v) setHighScore(Number.parseInt(v) || 0);
    } catch {}
  }, []);
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem("snakeRelaxHighScore", String(score));
      } catch {}
    }
  }, [score, highScore]);

  // Game loop — functional state, exact wrap, tail-aware collision
  useInterval(
    () => {
      if (softReset) return;

      if (queuedDirRef.current) {
        dirRef.current = queuedDirRef.current;
        queuedDirRef.current = null;
      }

      setSnake((prev) => {
        const cur = dirRef.current;
        const head = prev[0];
        if (!head) {
          // Safety recovery if ever desynced
          setApple(randomFreeCell(initialSnake));
          return initialSnake;
        }

        const next = wrapPoint({ x: head.x + cur.x, y: head.y + cur.y });
        const ate = eq(next, appleRef.current);

        // If not eating, tail vacates this tick: ignore it in collision check
        const bodyToCheck = ate ? prev : prev.slice(0, -1);
        const hitSelf = bodyToCheck.some((s) => eq(s, next));

        if (hitSelf) {
          // Soft restart (keep score)
          setSoftReset(true);
          setTimeout(() => {
            setSnake(initialSnake);
            setApple(randomFreeCell(initialSnake));
            dirRef.current = { x: 1, y: 0 };
            queuedDirRef.current = null;
            setSoftReset(false);
          }, 260);
          return prev;
        }

        const newSnake = ate ? [next, ...prev] : [next, ...prev.slice(0, -1)];
        if (ate) {
          setScore((s) => s + 1);
          setApple(randomFreeCell(newSnake));
        }
        return newSnake;
      });
    },
    paused ? null : softReset ? null : STEP_MS,
  );

  // UI
  const cellPct = 100 / GRID;
  const boardStyle: React.CSSProperties = {
    // Premium glassmorphism background
    background:
      "linear-gradient(160deg, rgba(186,230,253,0.7) 0%, rgba(254,205,211,0.7) 100%)",
    // Soft checker + crisp grid lines to align visual cells
    backgroundImage: `
      conic-gradient(rgba(255,255,255,0.55) 25%, rgba(255,255,255,0.35) 0 50%, rgba(255,255,255,0.55) 0 75%, rgba(255,255,255,0.35) 0),
      linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)
    `,
    backgroundSize: `calc((100% / ${GRID}) * 2) calc((100% / ${GRID}) * 2), calc(100% / ${GRID}) calc(100% / ${GRID}), calc(100% / ${GRID}) calc(100% / ${GRID})`,
    backgroundBlendMode: "soft-light, normal, normal",
    borderRadius: 20,
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
    backdropFilter: "saturate(1.2) blur(16px)",
    WebkitBackdropFilter: "saturate(1.2) blur(16px)",
    filter: softReset ? "saturate(0.85) brightness(0.98)" : "none",
    transition: "filter 200ms ease",
  };

  function restart() {
    setScore(0);
    setSnake(initialSnake);
    setApple(randomFreeCell(initialSnake));
    setPaused(false);
    setSoftReset(false);
    dirRef.current = { x: 1, y: 0 };
    queuedDirRef.current = null;
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 select-none">
      {/* Scoreboard (Current + High Score) */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-white/50 backdrop-blur">
            Score: <span className="font-semibold">{score}</span>
          </div>
          <div className="rounded-full bg-white/60 px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-white/40 backdrop-blur">
            High: <span className="font-semibold">{highScore}</span>
          </div>
        </div>
        <div className="text-xs text-slate-400">Arrows/WASD • Swipe • Space = Pause/Resume</div>
      </div>

      {/* Game Board */}
      <div
        className="relative w-full aspect-square rounded-[20px] overflow-hidden shadow-2xl ring-1 ring-white/30 isolate"
        style={boardStyle}
      >
        {/* Ambient glow layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 500px at 15% 15%, rgba(125,211,252,0.22), transparent 60%), radial-gradient(800px 450px at 85% 85%, rgba(252,165,165,0.22), transparent 60%)",
          }}
        />

        {/* Apple */}
        <Cell
          x={apple.x}
          y={apple.y}
          cellPct={cellPct}
          radius="40%"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ffd4c2 0%, #fda4af 70%)",
            boxShadow: "0 6px 16px rgba(253,164,175,0.4)",
            left: `${(apple.x * cellPct).toFixed(4)}%`,
            top: `${(apple.y * cellPct).toFixed(4)}%`,
            transition: "top 95ms linear, left 95ms linear",
          }}
        />

        {/* Snake (blue, glow, rounded) */}
        {snake.map((p, i) => {
          const isHead = i === 0;
          const t = i / Math.max(1, snake.length - 1);
          const c1 = `hsl(${205 - 5 * t} 92% ${74 - 10 * t}%)`;
          const c2 = `hsl(${217 - 3 * t} 91% ${60 - 8 * t}%)`;
          const bg = isHead
            ? "linear-gradient(135deg, #60a5fa, #3b82f6)"
            : `linear-gradient(135deg, ${c1}, ${c2})`;
          const glow = isHead
            ? "0 14px 28px rgba(59,130,246,0.45), 0 4px 10px rgba(59,130,246,0.25)"
            : "0 10px 20px rgba(59,130,246,0.22)";
          return (
            <Cell
              key={`${p.x}-${p.y}-${i}`}
              x={p.x}
              y={p.y}
              cellPct={cellPct}
              radius={isHead ? "32%" : "26%"}
              style={{
                background: bg,
                boxShadow: glow,
                left: `${(p.x * cellPct).toFixed(4)}%`,
                top: `${(p.y * cellPct).toFixed(4)}%`,
                transition: "top 95ms linear, left 95ms linear, filter 140ms ease",
                outline: isHead ? "2px solid rgba(255,255,255,0.6)" : undefined,
                outlineOffset: isHead ? "-2px" : undefined,
                filter: isHead ? "brightness(1.04)" : "brightness(1.0)",
              }}
            />
          );
        })}

        {/* Paused overlay (subtle) */}
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
            <div className="rounded-full bg-white/80 px-4 py-2 text-slate-700 shadow">
              Paused
            </div>
          </div>
        )}
      </div>

      {/* Controls: single toggle + restart */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="rounded-xl bg-sky-100 px-4 py-2 text-sky-800 shadow-sm ring-1 ring-sky-200 transition-all duration-150 hover:bg-sky-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          onClick={restart}
          className="rounded-xl bg-rose-100 px-4 py-2 text-rose-800 shadow-sm ring-1 ring-rose-200 transition-all duration-150 hover:bg-rose-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          aria-label="Restart"
        >
          Restart
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        Space toggles pause/resume. Calm wrap-around. Pastel, glassy UI.
      </p>
    </div>
  );
}

function Cell({
  x,
  y,
  cellPct,
  radius = "28%",
  style,
}: {
  x: number;
  y: number;
  cellPct: number;
  radius?: string;
  style?: React.CSSProperties;
}) {
  const size = `${cellPct}%`;
  return (
    <div
      className="absolute"
      style={{
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: radius,
        willChange: "top, left",
        ...style,
      }}
      aria-hidden
    />
  );
}

