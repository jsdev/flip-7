/* eslint-disable functional/no-let, functional/immutable-data, sonarjs/cognitive-complexity, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { CardType, Player, GameState, ActionContext, GameOptions } from '../types.js';
import {
  isGameOver,
  bustPlayer,
  addCardToHand,
  addModifier,
  decrementFlipThree,
  copyPlayers,
  hasFlip7Bonus,
  bankPlayer,
  applyFlip7Bonus,
  getFinalScore,
  getGameWinners, // <-- import the new helper
  getOddsOfBusting,
  celebrateFlip7,
  discardRemainingCards,
  captureRoundData,
} from './gameLogic.helpers.js';
import { maybeReshuffleDeck } from './deck.js';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  passingEnabled: true, // Players can pass when they have a choice
  defaultFlipCount: 1, // Default number of flips per turn
  showOddsOfBust: true, // Show bust probability to help players learn
};

// Helper to push a new action context
function pushActionContext(state: GameState, ctx: ActionContext): GameState {
  return {
    ...state,
    actionStack: [ctx, ...state.actionStack],
    currentAction: ctx,
  };
}
// Helper to pop and resume previous context
function popActionContext(state: GameState): GameState {
  const [, ...rest] = state.actionStack;
  return {
    ...state,
    actionStack: rest,
    currentAction: rest[0],
  };
}

// Pure helper: get next card and rest of deck immutably
function drawCard(
  deck: ReadonlyArray<CardType>,
): readonly [CardType | undefined, ReadonlyArray<CardType>] {
  return [deck[0], deck.slice(1)];
}

// Helper: is player at a choice point (can flip, bank, or pass)?
function isChoicePoint(state: GameState, player: Player): boolean {
  // Not at choice point if forced to flip (flipThree > 0), busted, banked, or pending action
  if (player.busted || player.banked) return false;
  if (player.flipThree > 0) return false;
  if (state.currentAction && state.currentAction.pendingAction) return false;
  return true;
}

export function flipCard(state: GameState): GameState {
  // Block all actions except handleActionTarget if pendingAction exists
  if (state.currentAction && state.currentAction.pendingAction) return state;
  if (state.gameOver) return state;

  // Check if player has remaining flips (unless forced by flipThree)
  if (state.flipCount <= 0 && state.players[state.currentPlayer].flipThree === 0) {
    return { ...state, status: GameStatus.NoFlipsRemaining };
  }

  // Always reshuffle if deck is empty before drawing
  const { deck, discard } = maybeReshuffleDeck(state.deck, state.discard);

  const ctx = state.currentAction ?? {};
  const actingPlayer = state.currentPlayer;
  const [card, newDeck] = drawCard(deck);

  if (!card) {
    return { ...state, deck, discard, status: GameStatus.DeckEmpty };
  }

  const players = copyPlayers(state.players);
  let player = { ...players[actingPlayer] };

  // Store original flipThree before decrementing
  const originalFlipThree = player.flipThree;

  // Common logic: decrement flipThree if active
  player = decrementFlipThree(player);

  // Decrement flip count (unless forced by flipThree)
  const newFlipCount = player.flipThree > 0 ? state.flipCount : Math.max(0, state.flipCount - 1);

  if (card.type === 'number') {
    return handleNumberCard(
      { ...state, deck, discard, flipCount: newFlipCount },
      player,
      players,
      actingPlayer,
      card,
      newDeck,
      originalFlipThree,
    );
  } else if (card.type === 'modifier') {
    return handleModifierCard(
      { ...state, deck, discard, flipCount: newFlipCount },
      player,
      players,
      actingPlayer,
      card,
      newDeck,
    );
  } else if (card.type === 'action') {
    players[actingPlayer] = player;
    return resolveAction(
      { ...state, deck: newDeck, discard, players, flipCount: newFlipCount },
      card,
      actingPlayer,
      ctx,
    );
  }

  return state;
}

function handleNumberCard(
  state: GameState,
  player: Player,
  players: readonly Player[],
  actingPlayer: number,
  card: CardType,
  newDeck: ReadonlyArray<CardType>,
  originalFlipThree: number,
): GameState {
  // Check for bust BEFORE adding card
  if (player.numberCards.some((c) => c.value === card.value)) {
    if (player.secondChance) {
      return handleSecondChance(
        state,
        player,
        players,
        actingPlayer,
        card,
        newDeck,
        originalFlipThree,
      );
    }
    return handleBust(state, player, players, actingPlayer, card, newDeck);
  }

  // Safe: add card to hand
  player = addCardToHand(player, card);
  players[actingPlayer] = player;
  const newHand = player.numberCards;

  // Check for Flip 7 bonus
  if (hasFlip7Bonus(newHand)) {
    return handleFlip7Bonus(state, players, actingPlayer, newDeck, newHand as readonly CardType[]);
  }

  const status = isChoicePoint(state, player) ? GameStatus.ChoicePoint : GameStatus.Flipped;

  return {
    ...state,
    deck: newDeck,
    players,
    status,
  };
}

function handleModifierCard(
  state: GameState,
  player: Player,
  players: readonly Player[],
  actingPlayer: number,
  card: CardType,
  newDeck: ReadonlyArray<CardType>,
): GameState {
  player = addModifier(player, card);
  players[actingPlayer] = player;

  const status = isChoicePoint(state, player) ? GameStatus.ChoicePoint : GameStatus.Flipped;

  return {
    ...state,
    deck: newDeck,
    players,
    status,
  };
}

// PATCH handleSecondChance to set correct status
function handleSecondChance(
  state,
  player,
  players,
  actingPlayer,
  card,
  newDeck,
  originalFlipThree,
) {
  const discard = [
    ...state.discard,
    { type: 'number', value: card.value },
    { type: 'action', value: 'Second Chance' },
  ];
  // Second Chance "undoes" the flip, so restore flipThree to its original value
  const restoredFlipThree = originalFlipThree;
  const updatedPlayer = {
    ...player,
    secondChance: false,
    busted: false,
    flipThree: restoredFlipThree,
  };
  players[actingPlayer] = updatedPlayer;
  const atChoice = isChoicePoint(state, updatedPlayer);
  return {
    ...state,
    deck: newDeck,
    players,
    discard,
    status: atChoice ? GameStatus.ChoicePoint : GameStatus.Flipped,
    message: atChoice
      ? 'You survived your Second Chance! Choose your next move.'
      : 'You survived your Second Chance! Continue playing.',
  };
}

function handleBust(
  state: GameState,
  player: Player,
  players: readonly Player[],
  actingPlayer: number,
  card: CardType,
  newDeck: ReadonlyArray<CardType>,
): GameState {
  const bustedPlayer = bustPlayer(player, card);
  // Discard all the player's number cards (which includes the bust-causing card)
  const discard = [...state.discard, ...bustedPlayer.numberCards];

  const newPlayers = [...players];
  newPlayers[actingPlayer] = { ...bustedPlayer, numberCards: [] };

  return {
    ...state,
    deck: newDeck,
    players: newPlayers,
    discard,
    status: GameStatus.Busted,
  };
}

function handleFlip7Bonus(
  state: GameState,
  players: readonly Player[],
  actingPlayer: number,
  newDeck: ReadonlyArray<CardType>,
  newHand: readonly CardType[],
): GameState {
  const player = players[actingPlayer];
  const roundScore = getFinalScore(player, GameConstants.Flip7Bonus);

  // Bank the player and apply score
  const newPlayers = [...players];
  newPlayers[actingPlayer] = {
    ...player,
    score: player.score + roundScore,
    numberCards: [],
    modifiers: [],
    banked: true,
    busted: false,
  };

  // Track eliminated players (those who had cards but weren't banked/busted)
  const eliminatedByFlip7 = players
    .filter(
      (p, idx) =>
        idx !== actingPlayer &&
        !p.banked &&
        !p.busted &&
        (p.numberCards.length > 0 || p.modifiers.length > 0),
    )
    .map((p) => ({
      playerName: p.name,
      potentialScore: getFinalScore(p, 0), // What they would have scored
    }));

  // Forfeit all other unbanked players' cards to discard
  const finalDiscard = discardRemainingCards(newPlayers, state.discard);

  // Trigger confetti celebration for Flip 7
  try {
    celebrateFlip7();
  } catch (e) {
    // Ignore confetti errors (e.g., in CLI/server environments)
  }

  // Capture round data for tally
  const currentRoundData = captureRoundData(newPlayers, eliminatedByFlip7);

  return {
    ...state,
    deck: newDeck,
    players: newPlayers,
    discard: finalDiscard,
    status: GameStatus.Flip7BonusAwarded,
    gameOver: true,
    eliminatedByFlip7,
    roundHistory: [...state.roundHistory, currentRoundData],
    message: `🎉 ${player.name} achieved FLIP 7! Round over!`,
  };
}

export function resolveAction(
  state: GameState,
  card: CardType,
  actingPlayer: number,
  ctx: ActionContext,
): GameState {
  if (card.value === 'Freeze') {
    // Push current context and start new action
    const newCtx: ActionContext = {
      pendingAction: {
        type: 'freeze',
        card,
        actingPlayer,
      },
      parent: ctx,
    };
    return pushActionContext({ ...state, discard: [...state.discard, card] }, newCtx);
  }
  if (card.value === 'Flip Three') {
    // Prompt for target, then set flipThree=3 for that player in handleActionTarget
    const newCtx: ActionContext = {
      pendingAction: {
        type: 'flip-three',
        card,
        actingPlayer,
      },
      parent: ctx,
    };
    return pushActionContext({ ...state, discard: [...state.discard, card] }, newCtx);
  }
  if (card.value === 'Second Chance') {
    const players = state.players.map((p, i) =>
      i === actingPlayer ? { ...p, secondChance: true } : { ...p },
    );
    return {
      ...state,
      players,
      discard: [...state.discard, card],
      status: GameStatus.SecondChanceAcquired,
    };
  }
  return state;
}

export function handleActionTarget(state: GameState, targetIdx: number): GameState {
  if (!state.currentAction || !state.currentAction.pendingAction) return state;

  // Validate target index
  if (targetIdx < 0 || targetIdx >= state.players.length) return state;

  const { type, card, actingPlayer } = state.currentAction.pendingAction;
  const players = copyPlayers(state.players);

  if (type === 'freeze') {
    return handleFreezeTarget(state, players, targetIdx);
  } else if (type === 'flip-three') {
    return handleFlipThreeTarget(state, players, targetIdx);
  }

  return state;
}

function handleFreezeTarget(
  state: GameState,
  players: readonly Player[],
  targetIdx: number,
): GameState {
  players[targetIdx] = bankPlayer(players[targetIdx]);

  const newState = popActionContext({
    ...state,
    players,
  });

  const gameOver = isGameOver(players);

  return {
    ...newState,
    status: GameStatus.FreezeBanked,
    gameOver,
  };
}

function handleFlipThreeTarget(
  state: GameState,
  players: readonly Player[],
  targetIdx: number,
): GameState {
  players[targetIdx] = { ...players[targetIdx], flipThree: 3 };

  const newState = popActionContext({
    ...state,
    players,
  });

  return {
    ...newState,
    status: GameStatus.FlipThreeComplete,
  };
}

export function bankScore(state: GameState, playerIdx: number): GameState {
  // Block all actions except handleActionTarget if pendingAction exists
  if (state.currentAction && state.currentAction.pendingAction) return state;

  const players = copyPlayers(state.players);
  const player = players[playerIdx];

  // Validation checks
  if (player.busted) {
    return { ...state, status: GameStatus.CannotBankBusted };
  }

  if (player.flipThree > 0) {
    return { ...state, status: GameStatus.CannotBankDuringFlipThree };
  }

  // Handle empty hand case (e.g., after Second Chance)
  if (player.numberCards.length === 0) {
    players[playerIdx] = {
      ...player,
      score: 0,
      numberCards: [],
      modifiers: [],
      banked: true,
      busted: false,
    };
    return { ...state, players, status: GameStatus.Banked };
  }

  // Normal banking with bonus card support (multipliers, then Flip 7 bonus if present, then additions)
  const hasFlip7 = hasFlip7Bonus(player.numberCards);
  const flip7 = hasFlip7 ? GameConstants.Flip7Bonus : 0;
  const roundScore = getFinalScore(player, flip7);
  players[playerIdx] = {
    ...player,
    score: player.score + roundScore,
    numberCards: [],
    modifiers: [],
    bonusMultiplierCards: [],
    bonusAdditionCards: [],
    banked: true,
    busted: false,
  };

  // If player achieved Flip 7, end the game immediately
  if (hasFlip7) {
    // Track eliminated players (those who had cards but weren't banked/busted)
    const eliminatedByFlip7 = players
      .filter(
        (p, idx) =>
          idx !== playerIdx &&
          !p.banked &&
          !p.busted &&
          (p.numberCards.length > 0 || p.modifiers.length > 0),
      )
      .map((p) => ({
        playerName: p.name,
        potentialScore: getFinalScore(p, 0), // What they would have scored
      }));

    // Forfeit all unbanked players' cards to discard
    const finalDiscard = discardRemainingCards(players, state.discard);

    // Trigger confetti celebration for Flip 7
    try {
      celebrateFlip7();
    } catch (e) {
      // Ignore confetti errors (e.g., in CLI/server environments)
    }

    // Capture round data for tally
    const currentRoundData = captureRoundData(players, eliminatedByFlip7);

    return {
      ...state,
      players,
      discard: finalDiscard,
      status: GameStatus.Flip7BonusAwarded,
      gameOver: true,
      eliminatedByFlip7,
      roundHistory: [...state.roundHistory, currentRoundData],
      message: `🎉 ${player.name} achieved FLIP 7! Game over!`,
    };
  }
  // Advance to next player if current player just banked, and reset flip count
  let nextState = { ...state, players };
  if (state.currentPlayer === playerIdx) {
    nextState = advanceToNextPlayer(nextState);
  }

  // At the end of a round, check for game over
  const allBankedOrBusted = players.every((p) => p.banked || p.busted);
  let gameOver = false;
  let winners: readonly string[] = [];
  let roundOver = false;
  let finalDiscard = nextState.discard;

  if (allBankedOrBusted) {
    roundOver = true;
    // Move all remaining cards to discard at round end
    finalDiscard = discardRemainingCards(players, nextState.discard);
    winners = getGameWinners(players, GameConstants.GAME_TARGET_SCORE);
    if (winners.length > 0) gameOver = true;
  }

  // Capture round data if round is over
  let updatedRoundHistory = nextState.roundHistory;
  if (roundOver) {
    const currentRoundData = captureRoundData(players);
    updatedRoundHistory = [...nextState.roundHistory, currentRoundData];
  }

  return {
    ...nextState,
    discard: finalDiscard,
    status: GameStatus.Banked,
    roundOver,
    gameOver,
    winners: gameOver ? winners : undefined,
    roundHistory: updatedRoundHistory,
  };
}

function handleBankFlip7Bonus(
  state: GameState,
  players: readonly Player[],
  playerIdx: number,
): GameState {
  // Use getFinalScore: sum, multipliers, Flip 7 bonus, then additions
  const player = players[playerIdx];
  const roundScore = getFinalScore(player, GameConstants.Flip7Bonus);
  const newPlayers = players.map((p, i) =>
    i === playerIdx
      ? {
          ...p,
          score: p.score + roundScore,
          numberCards: [],
          modifiers: [],
          bonusMultiplierCards: [],
          bonusAdditionCards: [],
          banked: true,
        }
      : !p.banked
        ? {
            ...p,
            numberCards: [],
            modifiers: [],
            bonusMultiplierCards: [],
            bonusAdditionCards: [],
            score: 0,
          }
        : {
            ...p,
            numberCards: [],
            modifiers: [],
            bonusMultiplierCards: [],
            bonusAdditionCards: [],
          },
  );
  return {
    ...state,
    players: newPlayers,
    gameOver: true,
    status: GameStatus.Flip7BonusAwarded,
  };
}

export enum GameStatus {
  DeckEmpty = 'deck-empty',
  SecondChanceSurvived = 'second-chance-survived',
  Busted = 'busted',
  Flip7 = 'flip-7',
  FlipThreeComplete = 'flip-three-complete',
  FreezeBanked = 'freeze-banked',
  SecondChanceAcquired = 'second-chance-acquired',
  Banked = 'banked',
  CannotBankBusted = 'cannot-bank-busted',
  CannotBankDuringFlipThree = 'cannot-bank-during-flip-three',
  Flipped = 'flipped',
  Flip7BonusAwarded = 'flip-7-bonus-awarded',
  ChoicePoint = 'choice-point',
  NoFlipsRemaining = 'no-flips-remaining',
  CannotPassDuringFlipThree = 'cannot-pass-during-flip-three',
  PassingDisabled = 'passing-disabled',
  PlayerPassed = 'player-passed',
}

export enum GameConstants {
  Flip7Bonus = 15,
  GAME_TARGET_SCORE = 200,
}

// Helper to reset flip count at start of player's turn
function resetFlipCountForPlayer(state: GameState): GameState {
  return {
    ...state,
    flipCount: state.options.defaultFlipCount,
  };
}

// Helper to advance to next player and reset their flip count
function advanceToNextPlayer(state: GameState): GameState {
  const nextPlayer = (state.currentPlayer + 1) % state.players.length;
  return resetFlipCountForPlayer({
    ...state,
    currentPlayer: nextPlayer,
  });
}

// Export function for passing a player's turn
export function passPlayerTurn(state: GameState): GameState {
  // Block all actions except handleActionTarget if pendingAction exists
  if (state.currentAction && state.currentAction.pendingAction) return state;
  if (state.gameOver) return state;

  const player = state.players[state.currentPlayer];

  // Can only pass if not forced to flip and passing is enabled
  if (player.flipThree > 0) {
    return { ...state, status: GameStatus.CannotPassDuringFlipThree };
  }

  if (!state.options.passingEnabled) {
    return { ...state, status: GameStatus.PassingDisabled };
  }

  // Advance to next player and reset their flip count
  return advanceToNextPlayer({
    ...state,
    status: GameStatus.PlayerPassed,
  });
}
