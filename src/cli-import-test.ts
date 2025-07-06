/* eslint-disable no-undef, no-console */
import * as readline from 'readline';

console.log('Testing imports one by one...');

async function testImports() {
  try {
    console.log('✓ readline imported successfully');
  } catch (err) {
    console.error('✗ readline failed:', err);
  }

  try {
    console.log('2. Testing deck...');
    const { generateDeck, shuffleDeck } = await import('./lib/deck.js');
    console.log('✓ deck imported successfully');
  } catch (err) {
    console.error('✗ deck failed:', err);
  }

  try {
    console.log('3. Testing gameLogic...');
    const { flipCard, bankScore, handleActionTarget } = await import('./lib/gameLogic.js');
    console.log('✓ gameLogic imported successfully');
  } catch (err) {
    console.error('✗ gameLogic failed:', err);
  }

  try {
    console.log('4. Testing player...');
    const { createPlayer } = await import('./lib/player.js');
    console.log('✓ player imported successfully');
  } catch (err) {
    console.error('✗ player failed:', err);
  }

  console.log('All import tests completed');
}

testImports().catch(console.error);
