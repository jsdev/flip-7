# Flip 7 Game Logic Testing Doctrine

## Immutable State, Pure Functions, and Test Chaining

### 1. Always Thread the Full State

- Every game logic function (e.g., `flipCard`, `handleActionTarget`, `bankScore`) must take the entire game state as input and return a new, updated state.
- In tests, always use the returned state from the previous call as the input to the next call.

**Example:**

```ts
state = flipCard(state);
state = handleActionTarget(state, 0);
state = flipCard(state);
```

### 2. Never Manually Patch State Between Steps

- Do not manually set properties like `deck`, `players`, or `currentAction` between function calls in tests.
- Let your pure functions manage all state transitions, including context/stack.

### 3. Model Context/Stack as Part of State

- Use an explicit stack or context object in your state to track nested actions.
- Always update and return the new context/stack in your pure functions.

### 4. Test the Full Chain

- Write tests that simulate the entire chain of actions, always threading the state.
- Assert after each step that the state is as expected.

### 5. UI Should Only Call Logic Functions

- UI components should only call these pure functions and update local state with the returned value.
- This keeps UI and logic decoupled and makes both easier to test and maintain.

---

**Summary:**

> Treat your game state as immutable and always pass the full, updated state between every function call—both in your logic and your tests. This guarantees correctness, makes debugging easier, and ensures your tests reflect real game flows.

All contributors and reviewers should ensure new tests and logic follow this doctrine.
