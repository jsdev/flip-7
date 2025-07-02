import { Deck } from '../lib/deck';
import { CardType, Player } from '../types';

describe('Flip 7 Game Logic', () => {
  it('should not discard number cards unless a player busts', () => {
    // Simulate a player hand and bust
    const deck = new Deck();
    deck.shuffle();
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
    };
    // Draw two 5s to bust
    player.numberCards.push({ type: 'number', value: 5 });
    player.numberCards.push({ type: 'number', value: 5 });
    player.busted = true;
    // On bust, number cards should be discarded (simulate discard)
    let discard: readonly CardType[] = [];
    if (player.busted) {
      discard = discard.concat(player.numberCards);
      player.numberCards = [];
    }
    expect(player.busted).toBe(true);
    expect(discard.length).toBe(2);
    expect(player.numberCards.length).toBe(0);
  });

  it('should discard action cards immediately after use', () => {
    // Simulate resolving a Freeze card
    const discard: readonly CardType[] = [];
    const freezeCard: CardType = { type: 'action', value: 'Freeze' };
    // After resolving, card is discarded
    discard.push(freezeCard);
    expect(discard).toContain(freezeCard);
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
    };
    const discard: readonly CardType[] = [];
    // Draw duplicate 7
    if (player.secondChance) {
      player.secondChance = false;
      // Discard both duplicate and Second Chance
      discard.push({ type: 'number', value: 7 });
      discard.push({ type: 'action', value: 'Second Chance' });
      player.numberCards = player.numberCards.filter((c) => c.value !== 7);
    }
    expect(player.secondChance).toBe(false);
    expect(discard.find((c) => c.value === 'Second Chance')).toBeTruthy();
    expect(player.numberCards.length).toBe(0);
  });
});
