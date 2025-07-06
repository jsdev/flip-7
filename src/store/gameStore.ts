import { create } from 'zustand';
import { flipCard, bankScore, handleActionTarget } from '../lib/gameLogic.js';
import type { GameState } from '../lib/gameLogic.js';

interface GameStore {
  state: GameState;
  setState: (newState: GameState) => void;
  flipCard: () => void;
  bankScore: (playerIdx: number) => void;
  handleActionTarget: (targetIdx: number) => void;
  reset: (initialState: GameState) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: {} as GameState, // Initialize with a real initial state when used
  setState: (newState) => set({ state: newState }),
  flipCard: () => set((store) => ({ state: flipCard(store.state) })),
  bankScore: (playerIdx) => set((store) => ({ state: bankScore(store.state, playerIdx) })),
  handleActionTarget: (targetIdx) =>
    set((store) => ({ state: handleActionTarget(store.state, targetIdx) })),
  reset: (initialState) => set({ state: initialState }),
}));

// Usage in a component:
// const { state, flipCard, bankScore, reset } = useGameStore();
// All updates are pure and testable, and you can snapshot/reset state in tests.
