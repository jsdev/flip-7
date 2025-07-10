/* eslint-disable no-undef, no-console */
import * as readline from 'readline';
import { generateDeck, shuffleDeck } from './lib/deck.js';
import {
  flipCard,
  bankScore,
  handleActionTarget,
  passPlayerTurn,
  DEFAULT_GAME_OPTIONS,
} from './lib/gameLogic.js';
import { getBustOddsDisplay } from './lib/gameLogic.helpers.js';
// import { createPlayer } from './lib/player.js'; // Unused
import type { Player, CardType, GameState } from './types.js';

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
      bustedRoundPoints: 0,
    }),
  );
}

function printState(state: GameState) {
  console.log('\n--- Game State ---');
  state.players.forEach((p: Player, i: number) => {
    const bustOdds = getBustOddsDisplay(p, state.deck, state.options.showOddsOfBust);
    console.log(
      `${p.name}: score=${p.score} hand=[${p.numberCards.map((c: CardType) => c.value).join(', ')}]` +
        (p.busted ? ' (BUSTED)' : '') +
        (p.banked ? ' (BANKED)' : '') +
        (p.flipThree > 0 ? ` (FlipThree:${p.flipThree})` : '') +
        (i === state.currentPlayer ? bustOdds : ''), // Only show odds for current player
    );
  });
  console.log(`Deck: ${state.deck.length} | Discard: ${state.discard.length}`);
  console.log(
    `Current: ${state.players[state.currentPlayer].name} | Flips remaining: ${state.flipCount}`,
  );
  console.log(`Status: ${state.status}`);
  console.log(
    `Options: Passing ${state.options.passingEnabled ? 'ON' : 'OFF'} | Flip count: ${state.options.defaultFlipCount} | Bust odds: ${state.options.showOddsOfBust ? 'ON' : 'OFF'}`,
  );
  console.log('-------------------\n');
}

function printRoundHistory(
  roundHistory: ReadonlyArray<
    ReadonlyArray<{
      readonly name: string;
      readonly pointsBanked: number;
      readonly pointsLost: number;
    }>
  >,
) {
  if (roundHistory.length === 0) {
    console.log('\n=== Round History ===');
    console.log('No rounds completed yet.');
    console.log('======================\n');
    return;
  }

  console.log('\n=== Round History ===');
  roundHistory.forEach((round, roundIndex) => {
    console.log(`Round ${roundIndex + 1}:`);
    round.forEach((playerData) => {
      if (playerData.pointsBanked > 0) {
        console.log(`  ${playerData.name}: +${playerData.pointsBanked} points (banked)`);
      } else if (playerData.pointsLost > 0) {
        console.log(`  ${playerData.name}: -${playerData.pointsLost} points (lost on bust)`);
      } else {
        console.log(`  ${playerData.name}: 0 points`);
      }
    });
  });
  console.log('======================\n');
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
    deck: shuffleDeck(generateDeck(), Math.random),
    discard: [],
    players: createPlayers(numPlayers),
    currentPlayer: 0,
    round: 1,
    status: 'init',
    actionStack: [],
    currentAction: undefined,
    gameOver: false,
    roundHistory: [],
    options: DEFAULT_GAME_OPTIONS,
    flipCount: DEFAULT_GAME_OPTIONS.defaultFlipCount,
  };

  let lastCard: CardType | null = null;
  let keepPlaying = true;
  while (keepPlaying) {
    while (!state.gameOver) {
      printState(state);
      // End game if all players are busted or banked
      if (state.players.every((p) => p.busted || p.banked)) {
        console.log('All players are busted or banked. Round over!');
        printRoundHistory(state.roundHistory);
        break;
      }
      // If there is a pending action, force resolution
      if (state.currentAction?.pendingAction) {
        const { type, actingPlayer } = state.currentAction.pendingAction;
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
        state = handleActionTarget(state, targetIdx);
        continue;
      }
      const player = state.players[state.currentPlayer];
      if (player.busted || player.banked) {
        // Let game logic handle advancement - for now just skip to next
        state = { ...state, currentPlayer: (state.currentPlayer + 1) % numPlayers };
        continue;
      }

      // Determine available actions based on game rules
      const canBank = player.flipThree === 0 && !player.busted;
      const canPass = player.flipThree === 0 && !player.busted && state.options.passingEnabled;

      // Always allow flip attempt - let game logic decide if valid
      const actions = ['(f)lip', canBank ? '(b)ank' : null, canPass ? '(p)ass' : null, '(q)uit']
        .filter(Boolean)
        .join(', ');

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
        state = passPlayerTurn(state);
        continue;
      } else {
        console.log('Unknown or unavailable action.');
      }
      // The game logic handles player advancement automatically
    }
    printState(state);
    printTally(state.players);
    printRoundHistory(state.roundHistory);

    // Show eliminated players if any were eliminated by Flip 7
    if (state.eliminatedByFlip7 && state.eliminatedByFlip7.length > 0) {
      console.log('\n=== Eliminated by Flip 7 ===');
      console.log('These players had cards but were eliminated when someone achieved Flip 7:');
      state.eliminatedByFlip7.forEach((eliminated) => {
        console.log(
          `❌ ${eliminated.playerName}: Would have scored ${eliminated.potentialScore} points (lesson: bank earlier!)`,
        );
      });
      console.log('============================\n');
    }

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
      deck: shuffleDeck(generateDeck(), Math.random),
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
        bustedRoundPoints: 0,
      })),
      currentPlayer: nextStart,
      round: nextRound,
      status: 'init',
      actionStack: [],
      currentAction: undefined,
      gameOver: false,
      roundHistory: state.roundHistory, // Preserve round history
      options: state.options, // Preserve game options
      flipCount: state.options.defaultFlipCount, // Reset flip count
    };
    console.log(`\n--- New Round ${nextRound}! ${state.players[nextStart].name} starts. ---\n`);
  }
  console.log('Game over!');
  printRoundHistory(state.roundHistory);
  printTally(state.players);
  rl.close();
}

main();
