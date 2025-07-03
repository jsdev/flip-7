import {
  generateDeck as _generateDeck,
  shuffleDeck as _shuffleDeck,
  dealCard as _dealCard,
} from '../lib/deck';
import { CardType } from '../types';
import { describe, it, expect } from '@jest/globals';

describe('Deck (pure functional)', () => {
  function generateDeck() {
    return _generateDeck(undefined);
  }
  function shuffleDeck(deck: ReadonlyArray<CardType>, rng?: () => number) {
    return _shuffleDeck(deck, rng || (() => 0.5), undefined);
  }
  function dealCard(deck: ReadonlyArray<CardType>) {
    return _dealCard(deck, undefined);
  }

  it('generates the correct number of cards', () => {
    const deck = generateDeck();
    // 1+2+...+13 = 91 number cards, 7 modifiers, 9 actions
    expect(deck.length).toBe(91 + 7 + 9);
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
    expect(deck.length).toBe(107); // original deck size
  });

  it('deals undefined from empty deck', () => {
    const [card, rest] = dealCard([]);
    expect(card).toBeUndefined();
    expect(rest).toEqual([]);
  });
});
