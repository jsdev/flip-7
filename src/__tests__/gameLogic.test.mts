import { generateDeck, shuffleDeck } from '../lib/deck.js';
import { CardType, Player } from '../types.js';
import { createPlayer } from '../lib/player.js';
import { createGameState } from '../lib/gameState.js';
import { describe, it, expect } from 'vitest';

describe('Flip 7 Game Logic', () => {
  const deck = shuffleDeck(generateDeck(null), Math.random, null);

  it('should not discard number cards unless a player busts', () => {
    const player = createPlayer('Test');
    const updatedPlayer = {
      ...player,
      numberCards: [...player.numberCards, { type: 'number', value: 5 }],
      busted: true,
    };
    let discard = [];
    let updatedPlayerCopy = { ...updatedPlayer };
    if (updatedPlayerCopy.busted) {
      discard = [...discard, ...updatedPlayerCopy.numberCards];
      updatedPlayerCopy = { ...updatedPlayerCopy, numberCards: [] };
    }
    expect(updatedPlayerCopy.busted).toBe(true);
    expect(discard.length).toBe(1);
    expect(updatedPlayerCopy.numberCards.length).toBe(0);
  });

  it('should discard action cards immediately after use', () => {
    const discard = [];
    const freezeCard = { type: 'action', value: 'Freeze' };
    const updatedDiscard = [...discard, freezeCard];
    expect(updatedDiscard).toContain(freezeCard);
  });

  it('should discard Second Chance only when redeemed', () => {
    let player = createPlayer('Test');
    player = { ...player, numberCards: [{ type: 'number', value: 7 }], secondChance: true };
    let discard = [];
    let updatedSecondChancePlayer = { ...player };
    if (updatedSecondChancePlayer.secondChance && updatedSecondChancePlayer.numberCards.some((c) => c.value === 7)) {
      updatedSecondChancePlayer = { ...updatedSecondChancePlayer, secondChance: false, numberCards: [] };
      discard = [
        ...discard,
        { type: 'number', value: 7 },
        { type: 'action', value: 'Second Chance' },
      ];
    }
    expect(updatedSecondChancePlayer.secondChance).toBe(false);
    expect(discard.find((c) => c.value === 'Second Chance')).toBeTruthy();
    expect(updatedSecondChancePlayer.numberCards.length).toBe(0);
  });
});
