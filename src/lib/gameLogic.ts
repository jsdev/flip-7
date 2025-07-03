import { Player } from '../types';
import { flipThreeStep } from './flipThree';

export type CardType = {
  type: 'number' | 'modifier' | 'action';
  value: number | string;
  label?: string;
};

export interface GameState {
  readonly deck: ReadonlyArray<CardType>;
  readonly discard: ReadonlyArray<CardType>;
  readonly players: ReadonlyArray<Player>;
  readonly currentPlayer: number;
  readonly round: number;
  readonly status: string;
  readonly actionStack: ReadonlyArray<ActionContext>;
  readonly currentAction: ActionContext | undefined;
  readonly gameOver: boolean;
}

// Explicit ActionContext type
export type ActionContext = {
  readonly pendingAction?: {
    readonly type: 'freeze' | 'flip-three';
    readonly card: CardType;
    readonly actingPlayer: number;
  };
  readonly flipThreeState?: {
    target: number;
    flipsRemaining: number;
  };
  readonly parent?: ActionContext;
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

// Pure helper: add card to player's hand immutably
function addCardToHand(player: Player, card: CardType): Player {
  return { ...player, numberCards: [...player.numberCards, card] };
}

// Pure helper: add modifier to player's modifiers immutably
function addModifier(player: Player, card: CardType): Player {
  return { ...player, modifiers: [...player.modifiers, card] };
}

// Pure helper: mark player as busted and clear hand
function bustPlayer(player: Player, card: CardType): Player {
  return { ...player, busted: true, numberCards: [...player.numberCards, card], flipThree: 0 };
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
  const ctx = state.currentAction ?? {};
  const actingPlayer = state.currentPlayer;
  const [card, newDeck] = drawCard(state.deck);
  if (!card) {
    return { ...state, status: GameStatus.DeckEmpty };
  }

  const players = state.players.map((p) => ({ ...p }));
  let player = { ...players[actingPlayer] };

  if (card.type === 'number') {
    // Check for bust BEFORE adding card
    if (player.numberCards.some((c) => c.value === card.value)) {
      if (player.secondChance) {
        // Only discard the drawn card and Second Chance, keep the hand unchanged
        const discard = [
          ...state.discard,
          { type: 'number', value: card.value } as CardType,
          { type: 'action', value: 'Second Chance' } as CardType,
        ];
        const newPlayers = players.map((p, i) =>
          i === actingPlayer
            ? { ...player, secondChance: false, busted: false } // hand unchanged
            : p,
        );
        const status = isChoicePoint(state, newPlayers[actingPlayer])
          ? GameStatus.ChoicePoint
          : GameStatus.SecondChanceSurvived;
        return {
          ...state,
          deck: newDeck,
          players: newPlayers,
          discard,
          status,
        };
      } else {
        // Bust: discard all number cards
        const bustedPlayer = bustPlayer(player, card);
        const discard = [...state.discard, ...bustedPlayer.numberCards];
        const newPlayers = players.map((p, i) =>
          i === actingPlayer ? { ...bustedPlayer, numberCards: [], flipThree: 0 } : p,
        );
        return {
          ...state,
          deck: newDeck,
          players: newPlayers,
          discard,
          status: GameStatus.Busted,
        };
      }
    }
    // Safe: decrement flipThree if active, then add card to hand
    let newFlipThree = player.flipThree > 0 ? player.flipThree - 1 : 0;
    const newHand = [...player.numberCards, card];
    // Check for Flip 7 bonus BEFORE updating player
    const uniqueNumbers = new Set(newHand.map((c) => c.value));
    if (newHand.length === 7 && uniqueNumbers.size === 7) {
      // Award Flip 7 bonus, clear hand, bank, end round
      const bonusScore =
        newHand.reduce((sum, c) => sum + Number(c.value), 0) + GameConstants.Flip7Bonus;
      // Clear unbanked players' hands and scores, preserve banked players
      const newPlayers = players.map((p, i) => {
        if (i === actingPlayer) {
          return {
            ...player,
            score: player.score + bonusScore,
            numberCards: [],
            modifiers: [],
            banked: true,
          };
        } else if (!p.banked) {
          return { ...p, numberCards: [], modifiers: [], score: 0 };
        } else {
          // Banked players keep their score, but hand and modifiers are cleared
          return { ...p, numberCards: [], modifiers: [] };
        }
      });
      return {
        ...state,
        deck: newDeck,
        players: newPlayers,
        status: GameStatus.Flip7BonusAwarded,
        gameOver: true,
      };
    }
    player = { ...player, flipThree: newFlipThree };
    player = addCardToHand(player, card);
    const newPlayers = players.map((p, i) => (i === actingPlayer ? player : p));
    const status = isChoicePoint(state, player) ? GameStatus.ChoicePoint : GameStatus.Flipped;
    return {
      ...state,
      deck: newDeck,
      players: newPlayers,
      status,
    };
  } else if (card.type === 'modifier') {
    let newFlipThree = player.flipThree > 0 ? player.flipThree - 1 : 0;
    let newModifiers = [...player.modifiers, card];
    const newPlayers = players.map((p, i) =>
      i === actingPlayer ? { ...player, flipThree: newFlipThree, modifiers: newModifiers } : p,
    );
    const status = isChoicePoint(state, newPlayers[actingPlayer])
      ? GameStatus.ChoicePoint
      : GameStatus.Flipped;
    return {
      ...state,
      deck: newDeck,
      players: newPlayers,
      status,
    };
  } else if (card.type === 'action') {
    let newFlipThree = player.flipThree > 0 ? player.flipThree - 1 : 0;
    player = { ...player, flipThree: newFlipThree };
    const newPlayers = players.map((p, i) => (i === actingPlayer ? player : p));
    return resolveAction({ ...state, deck: newDeck, players: newPlayers }, card, actingPlayer, ctx);
  }
  return state;
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
  const { type, card, actingPlayer } = state.currentAction.pendingAction;
  const players = state.players.map((p) => ({ ...p }));
  if (type === 'freeze') {
    // Use bankScore to DRY banking logic for Freeze
    const newState = popActionContext({
      ...bankScore(state, targetIdx),
      discard: [...state.discard, card],
    });
    return {
      ...newState,
      status: GameStatus.FreezeBanked,
    };
  } else if (type === 'flip-three') {
    // Set flipThree=3 for the target player
    players[targetIdx] = { ...players[targetIdx], flipThree: 3 };
    const newState = popActionContext({
      ...state,
      players,
      discard: [...state.discard, card],
    });
    return {
      ...newState,
      status: GameStatus.FlipThreeComplete,
    };
  }
  return state;
}

export function bankScore(state: GameState, playerIdx: number): GameState {
  // Block all actions except handleActionTarget if pendingAction exists
  if (state.currentAction && state.currentAction.pendingAction) return state;
  const players = state.players.map((p) => ({ ...p }));
  let player = { ...players[playerIdx] };
  // If player used Second Chance and has no cards, ensure hand is empty and score is 0
  if (player.numberCards.length === 0) {
    player = { ...player, score: 0, numberCards: [], modifiers: [], banked: true, busted: false };
    const updatedPlayers = players.map((p, i) => (i === playerIdx ? player : p));
    return {
      ...state,
      players: updatedPlayers,
      status: GameStatus.Banked,
    };
  }
  if (player.busted) {
    return {
      ...state,
      status: GameStatus.CannotBankBusted,
    };
  }
  if (player.flipThree > 0) {
    return {
      ...state,
      status: GameStatus.CannotBankDuringFlipThree,
    };
  }
  const roundScore =
    player.numberCards.reduce((sum, c) => sum + Number(c.value), 0) +
    player.modifiers.reduce(
      (sum, mod) => (typeof mod.value === 'number' ? sum + mod.value : sum),
      0,
    );
  const updatedPlayer = {
    ...player,
    score: player.score + roundScore,
    numberCards: [],
    modifiers: [],
    banked: true,
    busted: false,
  };
  const updatedPlayers = players.map((p, i) => (i === playerIdx ? updatedPlayer : p));
  // Flip 7 bonus: if player has 7 unique number cards, award bonus and clear hand
  const uniqueNumbers = new Set(player.numberCards.map((c) => c.value));
  if (player.numberCards.length === 7 && uniqueNumbers.size === 7) {
    const bonusScore =
      player.numberCards.reduce((sum, c) => sum + Number(c.value), 0) + GameConstants.Flip7Bonus;
    const updatedPlayers = players.map((p, i) => {
      if (i === playerIdx) {
        return { ...player, score: player.score + bonusScore, numberCards: [], banked: true };
      } else if (!p.banked) {
        return { ...p, numberCards: [], modifiers: [], score: 0 };
      } else {
        // Banked players keep their score, but hand and modifiers are cleared
        return { ...p, numberCards: [], modifiers: [] };
      }
    });
    return {
      ...state,
      players: updatedPlayers,
      gameOver: true,
      status: GameStatus.Flip7BonusAwarded,
    };
  }
  if (state.currentPlayer === playerIdx) {
    // Advance to next player if current player just banked
    const nextPlayerIdx = (playerIdx + 1) % players.length;
    return {
      ...state,
      players: updatedPlayers,
      currentPlayer: nextPlayerIdx,
      status: GameStatus.Banked,
    };
  }
  return {
    ...state,
    players: updatedPlayers,
    status: GameStatus.Banked,
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
}

export enum GameConstants {
  Flip7Bonus = 15,
}
