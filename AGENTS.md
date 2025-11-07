# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` — Next.js App Router pages, layouts, and route groups. Example: `src/app/(site)/page.tsx`, game routes under `src/app/<game>/page.tsx`.
- `src/app/components/` — Reusable React components (PascalCase files), with feature folders (e.g., `sudoku/`, `icons/`).
- `src/lib/` — Game logic and utilities (e.g., `game-2048.ts`, `sudoku.ts`). Keep UI-free, testable code here.
- `src/types/` — Shared TypeScript types.
- `public/` — Static assets (e.g., `public/memory-game/*.png`).
- Config: `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`.

## Build, Test, and Development Commands
- `npm ci` — Install exact dependencies from `package-lock.json`.
- `npm run dev` — Start local dev server with hot reload.
- `npm run build` — Production build (type check + optimize).
- `npm run start` — Run the built app locally.
- `npm run lint` — Lint using Next.js/ESLint config.

## Coding Style & Naming Conventions
- TypeScript, 2-space indentation. Prefer functional React with hooks.
- Files: React components in `PascalCase.tsx`; utility modules `kebab-case.ts`.
- Routes: use `kebab-case` folder names (e.g., `flappy-bird`).
- CSS: Prefer Tailwind classes in JSX; use `*.module.css` only when necessary.
- Keep game logic in `src/lib/`; keep components presentational and small.

## Testing Guidelines
- No test runner is configured yet. When adding tests, prefer Jest + React Testing Library.
- Place unit tests in `src/__tests__/` or alongside files as `*.test.ts(x)`.
- Prioritize pure logic in `src/lib/` for high coverage; mock browser APIs in component tests.

## Commit & Pull Request Guidelines
- Commits: clear, imperative subject lines (max ~72 chars). Example: “Align Connect Four scoreboard controls vertically”.
- PRs: small, focused, with description, linked issues, and screenshots/GIFs for UI changes.
- Ensure `npm run lint` and `npm run build` pass locally before requesting review.

## Security & Configuration Tips
- Secrets: use `.env.local` (never commit). Access via `process.env` only on the server or behind API routes.
- Avoid heavy logic in server components; keep client-only APIs guarded with `"use client"` where needed.
- Static assets belong in `public/`; prefer imports/URLs over inline base64 for large files.
