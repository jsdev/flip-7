# Flip 7 Web Game (Preact + Tailwind Modular)

## Accessibility & CI
- [ ] Axe Linter GitHub Action
- [ ] Lighthouse CI GitHub Action
- [ ] ESLint + Prettier + Husky pre-commit

## Project Structure
- [x] Preact + Vite + Tailwind scaffold
- [x] Modular Deck logic in `src/lib/deck.js`
- [x] Main GameBoard component in `src/components/GameBoard.jsx`
- [x] Card component in `src/components/Card.jsx`
- [ ] InfoPanel, Controls, and PlayerHand components
- [ ] Game state and turn management for 4 players (no accounts)
- [ ] Responsive, accessible UI

## Game Logic
- [ ] Support for 4 players, rotating turns
- [ ] Each player has their own hand and score
- [ ] Game ends after all players finish
- [ ] Show winner and allow new game

## UI/UX
- [x] Card rendering with ARIA/semantic markup
- [ ] Info panel for current player, scores, and turn
- [ ] Controls: Flip, Bank, New Game
- [ ] Animations and polish
- [ ] Instructions/how to play section

## Testing & Deployment
- [ ] Manual and automated tests
- [ ] Deploy to GitHub Pages/Netlify
