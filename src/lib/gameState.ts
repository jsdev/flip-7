// Game state creation helper for Flip 7
import type { GameState } from '../types.js';
import { DEFAULT_GAME_OPTIONS } from './gameLogic.js';
import { createPlayer } from './player.js';

export function createGameState(overrides: Partial<GameState> = {}): GameState {
  const options = overrides.options || DEFAULT_GAME_OPTIONS;

  return {
    deck: [],
    discard: [],
    players: [createPlayer('A'), createPlayer('B'), createPlayer('C'), createPlayer('D')],
    currentPlayer: 0,
    round: 1,
    status: '',
    actionStack: [],
    currentAction: undefined,
    roundHistory: [],
    options,
    flipCount: overrides.flipCount !== undefined ? overrides.flipCount : options.defaultFlipCount,
    ...overrides,
  };
}
