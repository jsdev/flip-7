# Enforcing Pure, Immutable Game Logic in Flip 7 with ESLint

## Why Lint for Pure Functions and Immutability?

In Flip 7, all core game logic is written as pure functions with immutable state. This means:

- **No mutation**: Game state is never changed in-place. Instead, new state objects are returned.
- **No side effects**: Pure functions do not read from or write to anything outside their arguments.
- **Testability**: Every state transition is predictable and easy to test in isolation.
- **Action chaining**: Complex actions (like Flip Three, Freeze, Second Chance) are handled by explicit action stacks, not by hidden state or callbacks.

This approach guarantees:

- **No hidden bugs** from accidental mutation or side effects.
- **Easy undo/redo** and time-travel debugging.
- **Deterministic tests**: The same input always yields the same output.
- **Safe refactoring**: You can change UI or logic structure without breaking core rules.

## How We Enforce This with ESLint

We use a strict ESLint config with these plugins:

- [`eslint-plugin-functional`](https://github.com/eslint-functional/eslint-plugin-functional): Forbids mutation, `let`, classes, and impure patterns.
- [`eslint-plugin-sonarjs`](https://github.com/SonarSource/eslint-plugin-sonarjs): Detects code smells and complexity.
- [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn): Enforces modern, functional JS/TS best practices.

### Key Rules

- `functional/immutable-data`: No mutation of objects/arrays.
- `functional/no-let`: No `let` (use `const` and new objects).
- `functional/no-class`: No classes (favor pure functions and types).
- `functional/prefer-readonly-type`: Prefer `readonly` types for all data.
- `unicorn/no-for-loop`: Use array methods instead of loops.
- `sonarjs/cognitive-complexity`: Warn on overly complex functions.

## What This Solves

- **Prevents accidental state bugs** in game logic.
- **Forces contributors to write pure, testable code**.
- **Keeps UI and logic decoupled** for maintainability.
- **Ensures all new logic and tests follow the doctrine** in `DOCTRINE.md`.

## How to Use

- Run `npm run lint` before every commit.
- Fix all errors before merging.
- See `DOCTRINE.md` for philosophy and examples.

---

This setup makes Flip 7 robust, maintainable, and a model for functional game logic in modern web apps.
