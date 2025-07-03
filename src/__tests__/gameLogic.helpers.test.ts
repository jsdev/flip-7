import {
  isGameOver,
  getRoundScore,
  bustPlayer,
  addCardToHand,
  addModifier,
} from '../lib/gameLogic.helpers';
import { CardType, Player } from '../types';

describe('gameLogic.helpers', () => {
  const makePlayer = (overrides: Partial<Player> = {}): Player => ({
    name: 'P',
    score: 0,
    numberCards: [],
    modifiers: [],
    actionCards: [],
    secondChance: false,
    busted: false,
    banked: false,
    isDealer: false,
    isActive: true,
    ...overrides,
    flipThree: typeof overrides.flipThree === 'number' ? overrides.flipThree : 0,
  });

  it('isGameOver returns true only if all players are banked or busted', () => {
    expect(
      isGameOver([
        { ...makePlayer(), banked: true },
        { ...makePlayer(), busted: true },
      ]),
    ).toBe(true);
    expect(
      isGameOver([
        { ...makePlayer(), banked: true },
        { ...makePlayer(), busted: false },
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
    const player = makePlayer();
    const card: CardType = { type: 'number', value: 7 };
    const busted = bustPlayer(player, card);
    expect(busted.busted).toBe(true);
    expect(busted.numberCards).toContain(card);
  });

  it('addCardToHand adds card to numberCards', () => {
    const player = makePlayer();
    const card: CardType = { type: 'number', value: 2 };
    const updated = addCardToHand(player, card);
    expect(updated.numberCards).toContain(card);
  });

  it('addModifier adds card to modifiers', () => {
    const player = makePlayer();
    const card: CardType = { type: 'modifier', value: 4 };
    const updated = addModifier(player, card);
    expect(updated.modifiers).toContain(card);
  });
});
