# Mini Games Arcade

A polished collection of classic browser games built with Next.js 14, TypeScript, and Tailwind CSS. The arcade demonstrates component‑driven design, accessible interactions, and clean separation of game logic from UI.

## Features

- Multiple games: Tic-Tac-Toe (PvP + AI), Connect Four (PvP + AI), Rock-Paper-Scissors, Memory, 2048, Sudoku, Hangman, Tetris, Flappy Bird, Snake Relax, and Mental Calculation Chill Mode.
- Single‑page arcade with a reusable game registry that drives icons, rules, and component loading.
- TypeScript‑first with strict types across metadata, rules, and shared UI primitives.
- Accessible controls (keyboard focus, aria labels) and responsive Tailwind styling.

## Games Overview

| Game | Highlights |
| --- | --- |
| Tic-Tac-Toe | PvP or VS AI with Easy/Medium/Hard/Expert levels, alternating starter, "AI thinking" indicator. |
| Connect Four | PvP or VS AI with Easy/Medium/Hard/Expert levels, keyboard support, Undo, and a scoreboard. |
| Snake Relax | 20×20 pastel grid, wrap‑around edges, soft collision reset, score + high score, keyboard + swipe. |
| 2048 | Keyboard/on‑screen controls, score tracking, win/lose overlays. |
| Sudoku | Difficulty settings, hints, and persistent state. |
| Memory Game | Flip‑and‑match cards with move counter. |
| Rock-Paper-Scissors | Instant computer opponent with result display. |
| Mental Calculation • Chill | Pastel arithmetic with circular timer; Levels 1–4 progression, XP ring, streaks, golden questions. |
| Hangman | Accessible on‑screen keyboard with improved typography. |
| Tetris | Classic line clears with level progression. |
| Flappy Bird | Tap/flap to navigate obstacles. |

## Architecture Highlights

- `src/app/config/game-registry.ts` centralizes game metadata, rule sets, and component registration.
- Shared models live in `src/types/`; UI components in `src/app/components/` grouped by feature.
- Pure game logic in `src/lib/` (e.g., 2048, Sudoku, Tetris) for reuse and testability.
- Shared hook `useInterval` in `src/lib/hooks.ts` to avoid duplication.
- Connect Four AI utilities in `src/lib/connect-four-ai.ts` (minimax + heuristics, tunable difficulty).

## Tech Stack

- Next.js 14 (App Router), React 18
- TypeScript, Tailwind CSS
- ESLint with `eslint-config-next`

## Getting Started

Prerequisites: Node.js 18+, npm 8+

Install dependencies:

```bash
npm ci
```

Run locally:

```bash
npm run dev
```

Visit `http://localhost:3000`.

Lint:

```bash
npm run lint
```

Build + start production:

```bash
npm run build
npm run start
```

## Project Structure

```
src/
  app/
    components/        # Reusable UI and game implementations
    config/            # Game registry and shared app config
    globals.css        # Tailwind layers and global styles
    page.tsx           # Arcade entry (menu + game/rules)
  lib/                 # Game algorithms, shared hooks
  types/               # Shared TypeScript contracts
public/                # Static assets (icons, images, etc.)
```

## Development Guidelines

- Add new games via `src/app/config/game-registry.ts` (metadata, rules, component).
- Keep game logic in `src/lib/` and UI in `src/app/components/`.
- Prefer alias imports `@/...` for clarity and safer refactors.
- Maintain accessibility: keyboard navigation, focus rings, meaningful `aria-*`.

## GitHub: Push Safely

The repository includes a `.gitignore` configured for Node/Next.js. It prevents committing heavy or sensitive files:

- Ignored: `node_modules/`, `.next/`, `out/`, `dist/`, `logs/`, `*.log`, `.DS_Store`, `.vscode/`, `*.tsbuildinfo`, `.env*.local`.
- Keep secrets in `.env.local` (never commit env files).

Typical push flow:

```bash
# Review changes
git status

# Stage and commit
git add -A
git commit -m "feat: add Snake Relax + Tic-Tac-Toe AI levels"

# Set main branch (first time)
git branch -M main

# Add remote (first time)
git remote add origin https://github.com/<your-username>/<your-repo>.git

# Or update remote URL if it already exists
# git remote set-url origin https://github.com/<your-username>/<your-repo>.git

# Push
git push -u origin main
```

For large media, consider Git LFS. Keep private keys/secrets out of the repo.

## Contributing

Issues and PRs are welcome. Please run `npm run lint` and `npm run build` before opening a PR.

Enjoy the games and feel free to extend the arcade with new ideas!

