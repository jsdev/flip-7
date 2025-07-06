import { flipCard } from './src/lib/gameLogic.js';
import { createGameState } from './src/lib/gameState.js';
import { createPlayer } from './src/lib/player.js';

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
console.log('Deck remaining:', s1.deck.length);
console.log('Discard:', s1.discard.length);

// Second flip (should bust)
const s2 = flipCard({ ...s1, deck: s1.deck });
console.log('\nAfter second flip (should bust):');
console.log('Player 0 cards:', s2.players[0].numberCards.length);
console.log('Player 0 secondChance:', s2.players[0].secondChance);
console.log('Player 0 busted:', s2.players[0].busted);
console.log('Deck remaining:', s2.deck.length);
console.log('Discard:', s2.discard.length);
console.log('Status:', s2.status);
console.log('Discard contains 5:', s2.discard.some(c => c.value === 5));
