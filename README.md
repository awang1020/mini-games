# Mini Games Arcade

A polished collection of classic browser games built with Next.js 14, TypeScript, and Tailwind CSS. This project demonstrates component-driven architecture, accessible game interfaces, and modern frontend tooling—perfect for showcasing engineering craftsmanship to recruiters or contributors.

## ✨ Features

- **Six playable games** including Tic Tac Toe, Rock Paper Scissors, Memory, 2048, Sudoku, and Hangman.
- **Single-page arcade experience** with a reusable game registry that drives routing, icons, rules, and component loading.
- **TypeScript-first codebase** with strict typing for game metadata, rule sets, and shared UI primitives.
- **Accessible controls** (keyboard support, focus states, aria labels) to ensure a broad audience can enjoy the games.
- **Responsive Tailwind styling** and dedicated CSS modules where bespoke visuals are required.

## 🕹 Available Games

| Game | Highlights |
| --- | --- |
| Tic Tac Toe | Classic 3x3 grid with win/draw detection and quick reset. |
| Rock, Paper, Scissors | Instant computer opponent with animated result card. |
| Memory Game | Flip-and-match cards with move counter and animated tiles. |
| 2048 | Keyboard and on-screen controls, score tracking, and win/lose overlays. |
| Sudoku | Timed puzzles with difficulty settings, hints, and persistent state. |
| Hangman | Animated scaffold with improved typography and accessible keyboard. |

## 🧱 Architecture Highlights

- `src/app/config/game-registry.ts` centralizes game metadata, rule sets, and component registration for maintainable scalability.
- Shared TypeScript models live in `src/types`, making it simple to add new games without duplicating types.
- Feature components reside in `src/app/components`, grouped by domain (e.g., `sudoku/`, `icons/`) to encourage cohesion.
- Utility logic such as the 2048 board math and Sudoku generation is isolated in `src/lib` for reuse and focused testing.

## 🛠 Tech Stack

- [Next.js 14](https://nextjs.org/) with the App Router
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- ESLint with `eslint-config-next`

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 8+

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` to launch the arcade UI.

### Quality Checks

```bash
npm run lint
```

### Production Build

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
├── src
│   ├── app
│   │   ├── components          # Reusable UI and game implementations
│   │   ├── config              # Game registry and shared app configuration
│   │   ├── globals.css         # Tailwind layers and global styles
│   │   └── page.tsx            # Arcade entry point with dynamic rendering
│   ├── lib                     # Game algorithms and data helpers
│   └── types                   # Shared TypeScript contracts
├── public                      # Static assets (memory cards, icons, etc.)
├── package.json                # Scripts and dependency definitions
└── README.md                   # Project overview and contributor guide
```

## 🧑‍💻 Development Guidelines

- Add new games by extending the registry in `src/app/config/game-registry.ts`—define metadata, rules, and the component entry point.
- Keep game logic pure and colocated in `src/lib` to enable future testing or reuse.
- Use Tailwind utility classes for layout and typography; reserve CSS modules for complex, game-specific styling.
- Maintain accessibility with keyboard interactions, focus management, and `aria-*` attributes.

## 🙌 Contributing

Issues and pull requests are welcome. Please run `npm run lint` before submitting changes to ensure code quality and consistency.

Enjoy the games and feel free to extend the arcade with new ideas!
