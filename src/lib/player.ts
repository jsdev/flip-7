// Player creation helper for Flip 7
import { Player } from '../types.js';

export function createPlayer(name: string): Player {
  return {
    name,
    score: 0,
    numberCards: [],
    modifiers: [],
    actionCards: [],
    secondChance: false,
    busted: false,
    banked: false,
    isDealer: false,
    isActive: true,
    flipThree: 0,
    bustedRoundPoints: 0,
  };
}
