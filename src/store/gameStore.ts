import { create } from 'zustand';
import { GameState, ActionContext } from '../lib/gameLogic';
import { flipCard, bankScore, handleActionTarget, resolveAction } from '../lib/gameLogic';
import type { CardType } from '../types';

interface GameStore {
  state: GameState;
  setState: (s: GameState) => void;
  flipCard: () => void;
  bankScore: (playerIdx: number) => void;
  handleActionTarget: (targetIdx: number) => void;
  resolveAction: (
    card: CardType,
    actingPlayer: number,
    ctx: ActionContext,
    isFlipThree: boolean,
  ) => void;
  reset: (initial: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: {} as GameState, // You should initialize with a real initial state
  setState: (s) => set({ state: s }),
  flipCard: () => set((store) => ({ state: flipCard(store.state) })),
  bankScore: (playerIdx) => set((store) => ({ state: bankScore(store.state, playerIdx) })),
  handleActionTarget: (targetIdx) =>
    set((store) => ({ state: handleActionTarget(store.state, targetIdx) })),
  resolveAction: (card, actingPlayer, ctx) =>
    set((store) => ({ state: resolveAction(store.state, card, actingPlayer, ctx) })),
  reset: (initial) => set({ state: initial }),
}));

// Usage in a component:
// const { state, flipCard, bankScore, reset } = useGameStore();
// All updates are pure and testable, and you can snapshot/reset state in tests.
