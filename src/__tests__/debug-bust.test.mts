import { flipCard } from '../lib/gameLogic.js';
import { createGameState } from '../lib/gameState.js';
import { createPlayer } from '../lib/player.js';
import { describe, it, expect } from 'vitest';

describe('Debug bust test', () => {
  it('debugs the exact scenario', () => {
    // Recreate the exact test scenario
    const state = createGameState({
      deck: [
        { type: 'number', value: 5 },
        { type: 'number', value: 5 },
      ],
    });

    console.log('Initial state:');
    console.log('Player 0 cards:', state.players[0].numberCards.length);
    console.log('Player 0 secondChance:', state.players[0].secondChance);
    console.log('Deck:', state.deck);

    // First flip
    const s1 = flipCard(state);
    console.log('\nAfter first flip:');
    console.log('Player 0 cards:', s1.players[0].numberCards.length);
    console.log('Player 0 secondChance:', s1.players[0].secondChance);
    console.log('Player 0 busted:', s1.players[0].busted);
    console.log('Player 0 numberCards:', s1.players[0].numberCards);
    console.log('Deck remaining:', s1.deck.length);
    console.log('Discard:', s1.discard.length);

    // Second flip (should bust)
    const s2 = flipCard({ ...s1, deck: s1.deck });
    console.log('\nAfter second flip (should bust):');
    console.log('Player 0 cards:', s2.players[0].numberCards.length);
    console.log('Player 0 secondChance:', s2.players[0].secondChance);
    console.log('Player 0 busted:', s2.players[0].busted);
    console.log('Player 0 numberCards:', s2.players[0].numberCards);
    console.log('Deck remaining:', s2.deck.length);
    console.log('Discard:', s2.discard.length);
    console.log('Status:', s2.status);
    console.log('Discard contains 5:', s2.discard.some(c => c.value === 5));

    expect(s2.players[0].numberCards.length).toBe(0);
  });
});
