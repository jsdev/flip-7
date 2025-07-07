# Flip 7 - Pure Functional Card Game

[![Tests](https://github.com/username/flip-7/actions/workflows/lint.yml/badge.svg)](https://github.com/username/flip-7/actions/workflows/lint.yml)
[![Visual Regression](https://github.com/username/flip-7/actions/workflows/visual-regression.yml/badge.svg)](https://github.com/username/flip-7/actions/workflows/visual-regression.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/username/flip-7/main/.github/badges/coverage.json)](./coverage)
[![CLI Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/username/flip-7/main/.github/badges/coverage-cli.json)](./coverage-cli)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A modern, accessible card game built with pure functional programming principles. Features both web UI (Preact + Tailwind) and CLI implementations powered by the same immutable game logic.

## 🎮 Game Overview

Flip 7 is a strategic card game where players draw number cards (0-12) and modifiers (+2, +4, +6, +8, +10, ×2) while managing risk vs reward. Players must bank their scores before busting (drawing a duplicate number) or lose their round points.

**Key Features:**
- **Pure Functional Logic:** Immutable game state, no side effects
- **Cross-Platform:** Same logic powers web UI and CLI
- **Accessibility:** ARIA-compliant, keyboard navigation
- **Visual Regression Testing:** Automated UI consistency checks
- **Round History:** Track performance across multiple rounds

## � Code Coverage

The project maintains comprehensive test coverage with separate tracking for different components:

- **Overall Coverage**: Full codebase including UI components, game logic, and utilities
- **CLI Coverage**: Core game logic and CLI-specific functionality (higher coverage expected)

Coverage badges automatically update with each commit to main branch. CLI coverage focuses on the pure functional game logic that powers both UI and CLI implementations.

## �🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Play in terminal
npm run cli

# Run tests
npm test

# Visual regression tests
npm run test:visual
```

## 🏗️ Architecture

### Core Philosophy
All game logic follows strict functional programming principles:
- **Immutable data structures** - No mutations, pure functions only
- **No side effects** - Predictable, testable logic
- **Separation of concerns** - Game logic independent of UI
- **Type safety** - Full TypeScript coverage

### Project Structure
```
src/
├── lib/              # Pure functional game logic
│   ├── gameLogic.ts  # Core game state management
│   ├── deck.ts       # Card generation and shuffling
│   └── helpers.ts    # Scoring and utility functions
├── components/       # Preact UI components
├── cli.ts           # Terminal interface
└── types.ts         # Shared type definitions
```

## ⚙️ Configuration

Game behavior can be customized via options. See [GameOptions.md](./GameOptions.md) for detailed configuration.

**Default Settings:**
- Passing enabled: `true`
- Flips per turn: `1`
- Show bust odds: `true`

## 🧪 Testing Strategy

- **Unit Tests:** Vitest for pure logic testing
- **Visual Regression:** Playwright + Pixelmatch for UI consistency
- **Pre-commit Hooks:** ESLint + Prettier + functional linting
- **CI/CD:** Automated testing on all PRs

```bash
# Run all tests
npm test

# Visual regression tests
npm run test:visual

# Update visual baselines
npm run test:visual:update

# Component isolation tests
npm run test:components
```

## 🎯 Game Rules

### Basic Gameplay
1. **Draw Phase:** Flip cards to build your hand
2. **Decision Points:** Bank to secure points or continue for more
3. **Bust Risk:** Drawing a duplicate number loses all round points
4. **Round End:** All players bank or bust
5. **Scoring:** Modifiers multiply/add to your number card total

### Card Types
- **Numbers (0-12):** Base scoring cards (0×1, 1×2, 2×3, ..., 12×13 copies each)
- **Modifiers:** +2, +4, +6, +8, +10 (add to total), ×2 (multiplies total)
- **Actions:** Freeze, Flip Three, Second Chance

### Scoring System
Final score = `((sum of numbers) × multiplier) + Flip 7 bonus + additive modifiers`

**Scoring Order:**
1. Sum all number cards (0-12)
2. Apply ×2 multiplier (if present) 
3. Add Flip 7 bonus (15 points if achieved)
4. Add additive modifiers (+2, +4, +6, +8, +10)

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm 8+

### Setup
```bash
git clone <repository>
cd flip-7
npm install
npm run prepare  # Install git hooks
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with auto-fix
- `npm run cli` - Play in terminal
- `npm test` - Run test suite with coverage
- `npm run test:ui` - Interactive test UI
- `npm run test:visual` - Visual regression tests

### Code Standards
- **Functional Programming:** Enforced via ESLint rules
- **Type Safety:** Full TypeScript coverage required
- **Accessibility:** WCAG 2.1 AA compliance
- **Testing:** All logic must have unit tests

## 📊 Code Coverage

Current coverage: **30%** (Core logic: **85%**)

Coverage focuses on the pure functional game logic in `src/lib/`. UI components are tested via visual regression and component isolation tests.

## 🚀 Deployment

The project is configured for deployment to:
- **GitHub Pages** (recommended)
- **Netlify**
- **Vercel**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Run visual regression tests: `npm run test:visual`
6. Submit a pull request

### Pre-commit Requirements
- ESLint passes with functional programming rules
- All unit tests pass
- Visual regression tests pass (or baselines updated)
- TypeScript compilation succeeds

## 📋 Roadmap

- [x] Pure functional game logic
- [x] Web UI with Preact + Tailwind
- [x] CLI interface
- [x] Visual regression testing
- [x] Round history tracking
- [ ] Mobile responsive design
- [ ] Multiplayer networking
- [ ] AI opponents
- [ ] Tournament mode
- [ ] Statistics dashboard

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Documentation

- [Game Options Configuration](./GameOptions.md)
- [Design Philosophy](./DOCTRINE.md)
- [Development Blog](./FLIP7_PURE_LOGIC_LINT_BLOG.md)
- [Visual Testing Guide](./VISUAL_TESTING_README.md)
