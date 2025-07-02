# Flip 7 Web Game (Preact + Tailwind Modular)

## Accessibility & CI

- [x] Axe Linter GitHub Action (Vite/Preact)
- [x] Lighthouse CI GitHub Action (Vite/Preact)
- [x] ESLint + Prettier + Husky pre-commit (Vite/Preact)

## Project Structure

- [x] Preact + Vite + Tailwind scaffold (modern, modular setup)
- [x] Modular Deck logic in `src/lib/deck.ts` (dumb, data-only, Flip 7 rules)
- [x] Main GameBoard component in `src/components/GameBoard.tsx` (handles state, turn, log)
- [x] Card component in `src/components/Card.tsx` (dumb, accessible, styled)
- [x] PlayerHand, ActionQueue, InfoPanel components (modular, UI-focused)
- [x] Controls component (Flip, Bank, New Game)
- [ ] TallyBoard component (end-of-game stats, superlatives)
- [x] Design and instructions markdown files
- [x] Settings file for configuration
- [ ] Responsive, accessible UI polish

## Game Logic

- [x] Support for 4 players, rotating turns
- [x] Each player has their own hand and score
- [x] Game state, round, and turn management
- [x] Action log for superlatives and stats
- [ ] Full action card resolution:
  - [x] Freeze
  - [ ] Flip Three
  - [ ] Second Chance
- [ ] Game ends after all players finish
- [ ] Show winner and allow new game
- [x] Controls: Flip, Bank, New Game (see below for rules)

### Flipping & Banking Rules

- Players may FLIP to draw a card on their turn.
- Players may BANK their round score at the start of their turn, before flipping a new card.
- Banking does NOT require a Freeze card; it is a strategic choice.
- If a player flips and busts, they lose their unbanked points for the round.
- Players are tempted to keep flipping for more points, but must bank before flipping to secure their score.

## UI/UX

- [x] Card rendering with ARIA/semantic markup
- [x] Info panel for current player, scores, and turn
- [x] Controls: Flip, Bank, New Game
- [ ] Animations and polish
- [x] Instructions/how to play section

## Testing & Deployment

- [ ] Manual and automated tests
- [ ] Deploy to GitHub Pages/Netlify

## Strict Functional Linting

This project enforces pure, immutable, and functional game logic using ESLint with:

- `eslint-plugin-functional`
- `eslint-plugin-sonarjs`
- `eslint-plugin-unicorn`

See `strict-functional.eslint.config.js` for the strict rules applied to all core logic and tests. All contributors must follow the doctrine in `DOCTRINE.md` and pass linting before merging.

For rationale and details, see `FLIP7_PURE_LOGIC_LINT_BLOG.md`.
