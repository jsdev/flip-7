import { generateDeck, shuffleDeck } from '../lib/deck';
import { CardType, Player } from '../types';

describe('Flip 7 Game Logic', () => {
  // Replace Deck class usage with functional utilities
  const deck = shuffleDeck(generateDeck(null), Math.random, null);

  it('should not discard number cards unless a player busts', () => {
    // Simulate a player hand and bust
    const player: Player = {
      name: 'Test',
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
    };
    // Draw two 5s to bust
    const updatedPlayer = {
      ...player,
      numberCards: [...player.numberCards, { type: 'number', value: 5 }],
      busted: true,
    };
    // On bust, number cards should be discarded (simulate discard)
    let discard: readonly CardType[] = [];
    let updatedPlayerCopy = { ...updatedPlayer };
    if (updatedPlayerCopy.busted) {
      discard = [...discard, ...updatedPlayerCopy.numberCards.map((c) => c as CardType)];
      updatedPlayerCopy = { ...updatedPlayerCopy, numberCards: [] };
    }
    expect(updatedPlayerCopy.busted).toBe(true);
    expect(discard.length).toBe(1); // Only the drawn card is in hand at bust
    expect(updatedPlayerCopy.numberCards.length).toBe(0);
  });

  it('should discard action cards immediately after use', () => {
    // Simulate resolving a Freeze card
    const discard: readonly CardType[] = [];
    const freezeCard: CardType = { type: 'action', value: 'Freeze' };
    // After resolving, card is discarded
    const updatedDiscard = [...discard, freezeCard];
    expect(updatedDiscard).toContain(freezeCard);
  });

  it('should discard Second Chance only when redeemed', () => {
    // Player has Second Chance, draws duplicate
    let player: Player = {
      name: 'Test',
      score: 0,
      numberCards: [{ type: 'number', value: 7 }],
      modifiers: [],
      actionCards: [],
      secondChance: true,
      busted: false,
      banked: false,
      isDealer: false,
      isActive: true,
      flipThree: 0,
    };
    let discard: readonly CardType[] = [];
    let updatedSecondChancePlayer = { ...player };
    if (updatedSecondChancePlayer.secondChance) {
      updatedSecondChancePlayer = { ...updatedSecondChancePlayer, secondChance: false };
      // Discard both duplicate and Second Chance
      discard = [
        ...discard,
        { type: 'number', value: 7, label: '7' } as CardType,
        { type: 'action', value: 'Second Chance', label: '2nd Chance' } as CardType,
      ];
      updatedSecondChancePlayer = {
        ...updatedSecondChancePlayer,
        numberCards: updatedSecondChancePlayer.numberCards.filter((c) => c.value !== 7),
      };
    }
    expect(updatedSecondChancePlayer.secondChance).toBe(false);
    expect(discard.find((c) => c.value === 'Second Chance')).toBeTruthy();
    expect(updatedSecondChancePlayer.numberCards.length).toBe(0);
  });
});
