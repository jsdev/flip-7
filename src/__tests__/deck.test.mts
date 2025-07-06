import { describe, it, expect } from 'vitest';
import {
  generateDeck as _generateDeck,
  shuffleDeck as _shuffleDeck,
  dealCard as _dealCard,
} from '../lib/deck.js';

describe('Deck (pure functional)', () => {
  // Use function declarations instead of arrow functions for compatibility
  function generateDeck() {
    return _generateDeck(undefined);
  }
  function shuffleDeck(deck, rng) {
    return _shuffleDeck(deck, rng ?? (() => 0.5), undefined);
  }
  function dealCard(deck) {
    return _dealCard(deck, undefined);
  }

  it('generates the correct number of cards', () => {
    const deck = generateDeck();
    // 1+2+...+13 = 91 number cards, 6 modifiers, 9 actions (no bonus cards)
    expect(deck.length).toBe(91 + 6 + 9);
  });

  it('shuffles the deck without mutation', () => {
    const deck = generateDeck();
    const shuffled = shuffleDeck(deck, () => 0.5); // deterministic
    expect(shuffled.length).toBe(deck.length);
    expect(shuffled).not.toEqual(deck); // Should be different order
    expect(deck).toEqual(generateDeck()); // Original deck unchanged
  });

  it('deals a card immutably', () => {
    const deck = generateDeck();
    const [card, rest] = dealCard(deck);
    expect(card).toBeDefined();
    expect(rest.length).toBe(deck.length - 1);
    expect(deck.length).toBe(106); // original deck size
  });

  it('deals undefined from empty deck', () => {
    const [card, rest] = dealCard([]);
    expect(card).toBeUndefined();
    expect(rest).toEqual([]);
  });
});
