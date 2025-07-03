import * as readline from 'readline';
import { generateDeck, shuffleDeck } from './lib/deck';
import { flipCard, bankScore, GameState } from './lib/gameLogic';
import type { Player, CardType } from './types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function createPlayers(num: number): Player[] {
  return Array.from(
    { length: num },
    (_, i): Player => ({
      name: `Player ${i + 1}`,
      score: 0,
      numberCards: [],
      modifiers: [],
      actionCards: [],
      secondChance: false,
      busted: false,
      banked: false,
      isDealer: i === 0,
      isActive: true,
      flipThree: 0,
    }),
  );
}

function printState(state: GameState) {
  console.log('\n--- Game State ---');
  state.players.forEach((p: Player, i: number) => {
    console.log(
      `${p.name}: score=${p.score} hand=[${p.numberCards.map((c: CardType) => c.value).join(', ')}]` +
        (p.busted ? ' (BUSTED)' : '') +
        (p.banked ? ' (BANKED)' : '') +
        (p.flipThree > 0 ? ` (FlipThree:${p.flipThree})` : ''),
    );
  });
  console.log(`Deck: ${state.deck.length} | Discard: ${state.discard.length}`);
  console.log(`Current: ${state.players[state.currentPlayer].name}`);
  console.log(`Status: ${state.status}`);
  console.log('-------------------\n');
}

function printTally(players: ReadonlyArray<Player>) {
  console.log('\n=== Tally: Running Totals ===');
  players.forEach((p) => {
    console.log(`${p.name}: ${p.score} point${p.score === 1 ? '' : 's'}`);
  });
  console.log('============================\n');
}

async function main() {
  const numPlayers = 4;
  let state: GameState = {
    deck: shuffleDeck(generateDeck(null), Math.random, null),
    discard: [],
    players: createPlayers(numPlayers),
    currentPlayer: 0,
    round: 1,
    status: 'init',
    actionStack: [],
    currentAction: undefined,
    gameOver: false,
  };

  let lastCard: CardType | null = null;
  let keepPlaying = true;
  while (keepPlaying) {
    while (!state.gameOver) {
      printState(state);
      // End game if all players are busted or banked
      if (state.players.every((p) => p.busted || p.banked)) {
        console.log('All players are busted or banked. Round over!');
        break;
      }
      // If there is a pending action, force resolution
      if (state.currentAction?.pendingAction) {
        const { type, card, actingPlayer } = state.currentAction.pendingAction;
        const validTargets = state.players
          .map((p, idx) => idx)
          .filter(
            (idx) =>
              idx !== actingPlayer && !state.players[idx].banked && !state.players[idx].busted,
          );
        if (validTargets.length === 0) {
          console.log(`No valid targets for ${type}. Action discarded.`);
          // Simulate discarding action and pop context
          // (This should be handled in game logic, but for CLI, just pop context)
          state = { ...state, currentAction: undefined, actionStack: state.actionStack.slice(1) };
          continue;
        }
        console.log(`Pending action: ${type.toUpperCase()}! Choose a target:`);
        validTargets.forEach((idx) => {
          console.log(`  (${idx}) ${state.players[idx].name}`);
        });
        let targetStr = await prompt('Enter target player number: ');
        let targetIdx = parseInt(targetStr, 10);
        if (!validTargets.includes(targetIdx)) {
          console.log('Invalid target. Try again.');
          continue;
        }
        state = require('./lib/gameLogic').handleActionTarget(state, targetIdx);
        continue;
      }
      const player = state.players[state.currentPlayer];
      if (player.busted || player.banked) {
        state = { ...state, currentPlayer: (state.currentPlayer + 1) % numPlayers };
        continue;
      }
      // Determine available actions
      const canBank = player.flipThree === 0 && !player.busted;
      const canPass = player.flipThree === 0 && !player.busted;
      let actions = '(f)lip';
      if (canBank) actions += ', (b)ank';
      if (canPass) actions += ', (p)ass';
      actions += ', (q)uit';
      let promptMsg = `${player.name}'s turn. Actions: ${actions}`;
      if (lastCard) {
        console.log(`Last card drawn: [${lastCard.type} ${lastCard.value}]`);
        lastCard = null;
      }
      let action = await prompt(promptMsg + ': ');
      if (action === 'q') break;
      if (action === 'f') {
        const prevDeck = state.deck;
        const nextState = flipCard(state);
        if (prevDeck.length > nextState.deck.length) {
          lastCard = prevDeck[0];
        }
        state = nextState;
        if (state.status === 'SecondChanceSurvived') {
          console.log(
            'You survived with Second Chance! Your hand is cleared. Choose to (f)lip again, (b)ank, or (p)ass.',
          );
        }
        if (state.status === 'Flip7BonusAwarded') {
          console.log('Flip 7 Bonus! You scored a bonus and ended the round.');
        }
        if (state.status === 'Busted') {
          console.log('BUSTED! Your hand is discarded.');
        }
      } else if (action === 'b' && canBank) {
        state = bankScore(state, state.currentPlayer);
        if (state.status === 'CannotBankDuringFlipThree') {
          console.log('You cannot bank during Flip Three!');
        } else if (state.status === 'CannotBankBusted') {
          console.log('You cannot bank if busted!');
        } else if (state.status === 'Flip7BonusAwarded') {
          console.log('Flip 7 Bonus! You scored a bonus and ended the round.');
        } else if (state.status === 'Banked') {
          console.log('You banked your score.');
        }
      } else if (action === 'p' && canPass) {
        console.log(`${player.name} passes.`);
        state = { ...state, currentPlayer: (state.currentPlayer + 1) % numPlayers };
        continue;
      } else {
        console.log('Unknown or unavailable action.');
      }
      // Next player if busted or banked
      if (state.players[state.currentPlayer].busted || state.players[state.currentPlayer].banked) {
        state = { ...state, currentPlayer: (state.currentPlayer + 1) % numPlayers };
      }
    }
    printState(state);
    printTally(state.players);
    // Ask if user wants to play another round
    let playAgain = await prompt('Play another round? (y/n): ');
    if (playAgain.trim().toLowerCase() !== 'y') {
      keepPlaying = false;
      break;
    }
    // Rotate starting player for next round
    const nextRound = state.round + 1;
    const nextStart = nextRound % numPlayers;
    state = {
      deck: shuffleDeck(generateDeck(null), Math.random, null),
      discard: [],
      players: state.players.map((p) => ({
        ...p,
        numberCards: [],
        modifiers: [],
        actionCards: [],
        secondChance: false,
        busted: false,
        banked: false,
        flipThree: 0,
      })),
      currentPlayer: nextStart,
      round: nextRound,
      status: 'init',
      actionStack: [],
      currentAction: undefined,
      gameOver: false,
    };
    console.log(`\n--- New Round ${nextRound}! ${state.players[nextStart].name} starts. ---\n`);
  }
  console.log('Game over!');
  rl.close();
}

main();
