import {
  isGameOver,
  getRoundScore,
  bustPlayer,
  addCardToHand,
  addModifier,
} from '../lib/gameLogic.helpers.js';
import { createPlayer } from '../lib/player.js';
import { describe, it, expect } from 'vitest';

describe('gameLogic.helpers', () => {
  function makePlayer(overrides = {}) {
    return { ...createPlayer('P'), ...overrides };
  }

  it('isGameOver returns true only if all players are banked or busted', () => {
    expect(
      isGameOver([
        { ...makePlayer({ banked: true }) },
        { ...makePlayer({ busted: true }) },
      ]),
    ).toBe(true);
    expect(
      isGameOver([
        { ...makePlayer({ banked: true }) },
        { ...makePlayer({ busted: false }) },
      ]),
    ).toBe(false);
  });

  it('getRoundScore sums number and modifier cards', () => {
    const player = makePlayer({
      numberCards: [
        { type: 'number', value: 3 },
        { type: 'number', value: 4 },
      ],
      modifiers: [
        { type: 'modifier', value: 2 },
        { type: 'modifier', value: 5 },
      ],
    });
    expect(getRoundScore(player)).toBe(14);
  });

  it('bustPlayer marks busted and adds card to hand', () => {
    const player = makePlayer({});
    const card = { type: 'number', value: 7 };
    const busted = bustPlayer(player, card);
    expect(busted.busted).toBe(true);
    expect(busted.numberCards).toContain(card);
  });

  it('addCardToHand adds a card to the player hand', () => {
    const player = makePlayer({});
    const card = { type: 'number', value: 2 };
    const updated = addCardToHand(player, card);
    expect(updated.numberCards).toContain(card);
  });

  it('addModifier adds a modifier card to the player', () => {
    const player = makePlayer({});
    const card = { type: 'modifier', value: 2 };
    const updated = addModifier(player, card);
    expect(updated.modifiers).toContain(card);
  });
});
