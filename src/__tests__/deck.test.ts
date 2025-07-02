import { generateDeck, shuffleDeck, dealCard } from '../lib/deck';
import { CardType } from '../types';
import { describe, it, expect } from '@jest/globals';

describe('Deck (pure functional)', () => {
  it('generates the correct number of cards', (_) => {
    const deck = generateDeck();
    // 1+2+...+13 = 91 number cards, 7 modifiers, 9 actions
    expect(deck.length).toBe(91 + 7 + 9);
    return undefined;
  });

  it('shuffles the deck without mutation', (_) => {
    const deck = generateDeck();
    const shuffled = shuffleDeck(deck, () => 0.5); // deterministic
    expect(shuffled.length).toBe(deck.length);
    expect(shuffled).not.toEqual(deck); // Should be different order
    expect(deck).toEqual(generateDeck()); // Original deck unchanged
    return undefined;
  });

  it('deals a card immutably', (_) => {
    const deck = generateDeck();
    const [card, rest] = dealCard(deck);
    expect(card).toBeDefined();
    expect(rest.length).toBe(deck.length - 1);
    expect(deck.length).toBe(107); // original deck size
    return undefined;
  });

  it('deals undefined from empty deck', (_) => {
    const [card, rest] = dealCard([]);
    expect(card).toBeUndefined();
    expect(rest).toEqual([]);
    return undefined;
  });
});
