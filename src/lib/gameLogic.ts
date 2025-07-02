import { CardType, Player } from '../types';

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
    readonly originalPlayer: number;
    readonly target: number;
    readonly flipsRemaining: number;
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
  return { ...player, busted: true, numberCards: [...player.numberCards, card] };
}

export function flipCard(state: GameState): GameState {
  if (state.gameOver || (state.currentAction && state.currentAction.pendingAction)) return state;
  const ctx = state.currentAction ?? {};
  const actingPlayer = ctx && ctx.flipThreeState ? ctx.flipThreeState.target : state.currentPlayer;
  const [card, newDeck] = drawCard(state.deck);
  if (!card) {
    return { ...state, status: 'Deck is empty!' };
  }
  // Use ReadonlyArray for all player card arrays to match Player type
  const players = state.players.map((p) => ({
    ...p,
    numberCards: [...p.numberCards] as ReadonlyArray<CardType>,
    modifiers: [...p.modifiers] as ReadonlyArray<CardType>,
    actionCards: [...p.actionCards] as ReadonlyArray<CardType>,
  }));
  let player = { ...players[actingPlayer] };
  if (card.type === 'number') {
    if (player.numberCards.some((c) => c.value === card.value)) {
      // Busted: create new player object and clear numberCards
      const bustedPlayer = bustPlayer(player, card);
      const discard = [...state.discard, ...bustedPlayer.numberCards];
      const updatedPlayers = players.map((p, i) =>
        i === actingPlayer ? { ...bustedPlayer, numberCards: [] } : p,
      );
      if (ctx && ctx.flipThreeState) {
        const newState = popActionContext({
          ...state,
          deck: newDeck,
          players: updatedPlayers,
          discard,
        });
        return {
          ...newState,
          status: `${player.name} busted during Flip Three! Returning to previous action.`,
        };
      }
      return {
        ...state,
        deck: newDeck,
        players: updatedPlayers,
        discard,
        status: `Busted! Drew another ${card.value}`,
      };
    }
    player = addCardToHand(player, card);
  } else if (card.type === 'modifier') {
    player = addModifier(player, card);
  } else if (card.type === 'action') {
    return resolveAction({ ...state, deck: newDeck, players }, card, actingPlayer, ctx);
  }
  const updatedPlayers = players.map((p, i) => (i === actingPlayer ? player : p));
  if (ctx && ctx.flipThreeState) {
    if (ctx.flipThreeState.flipsRemaining > 1) {
      const updatedCtx: ActionContext = {
        ...ctx,
        flipThreeState: {
          ...ctx.flipThreeState,
          flipsRemaining: ctx.flipThreeState.flipsRemaining - 1,
        },
      };
      return {
        ...state,
        deck: newDeck,
        players: updatedPlayers,
        currentAction: updatedCtx,
        actionStack: [updatedCtx, ...state.actionStack.slice(1)],
        status: `Flipped: ${card.label || card.value}`,
      };
    }
    // Pop context and, if parent is a Flip Three, decrement its flipsRemaining
    const prevStack = state.actionStack.slice(1);
    let newActionStack = prevStack;
    let newCurrentAction = prevStack[0];
    let newPlayers = updatedPlayers;
    if (prevStack[0] && prevStack[0].flipThreeState) {
      const parentCtx = prevStack[0];
      const updatedParentCtx: ActionContext = {
        ...parentCtx,
        flipThreeState: {
          ...parentCtx.flipThreeState!,
          flipsRemaining: parentCtx.flipThreeState!.flipsRemaining - 1,
        },
      };
      newActionStack = [updatedParentCtx, ...prevStack.slice(1)];
      newCurrentAction = updatedParentCtx;
      // Ensure the player's hand is preserved when returning to parent Flip Three
      newPlayers = newPlayers.map((p, i) =>
        i === actingPlayer ? { ...p, numberCards: [...player.numberCards] } : p,
      );
    }
    return {
      ...state,
      deck: newDeck,
      players: newPlayers,
      actionStack: newActionStack,
      currentAction: newCurrentAction,
      status: `${player.name} completed Flip Three! Returning to previous action.`,
    };
  }
  return {
    ...state,
    deck: newDeck,
    players: updatedPlayers,
    status: `Flipped: ${card.label || card.value}`,
  };
}

export function resolveAction(
  state: GameState,
  card: CardType,
  actingPlayer: number,
  ctx: ActionContext,
): GameState {
  if (card.value === 'Freeze' || card.value === 'Flip Three') {
    // Push current context and start new action
    const newCtx: ActionContext = {
      pendingAction: {
        type: card.value === 'Freeze' ? 'freeze' : 'flip-three',
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
      status: 'Second Chance acquired!',
    };
  }
  return state;
}

export function handleActionTarget(state: GameState, targetIdx: number): GameState {
  if (!state.currentAction || !state.currentAction.pendingAction) return state;
  const { type, card, actingPlayer } = state.currentAction.pendingAction;
  const players = state.players.map((p) => ({ ...p }));
  if (type === 'freeze') {
    const roundScore =
      players[targetIdx].numberCards.reduce((sum, c) => sum + Number(c.value), 0) +
      players[targetIdx].modifiers.reduce(
        (sum, mod) => (typeof mod.value === 'number' ? sum + mod.value : sum),
        0,
      );
    const updatedPlayer = {
      ...players[targetIdx],
      score: players[targetIdx].score + roundScore,
      numberCards: [],
      modifiers: [],
      banked: true,
      busted: false,
    };
    const updatedPlayers = players.map((p, i) => (i === targetIdx ? updatedPlayer : p));
    const newState = popActionContext({
      ...state,
      players: updatedPlayers,
      discard: [...state.discard, card],
    });
    return {
      ...newState,
      status: `${updatedPlayer.name} was frozen and banked ${roundScore} points!`,
    };
  } else if (type === 'flip-three') {
    // Push a new Flip Three context for the target
    const newCtx: ActionContext = {
      flipThreeState: {
        originalPlayer: actingPlayer,
        target: targetIdx,
        flipsRemaining: 3,
      },
      parent: state.currentAction,
    };
    return pushActionContext({ ...state, discard: [...state.discard, card] }, newCtx);
  }
  return state;
}

export function bankScore(state: GameState, playerIdx: number): GameState {
  const players = state.players.map((p) => ({ ...p }));
  const player = { ...players[playerIdx] };
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
  return {
    ...state,
    players: updatedPlayers,
    status: `${player.name} banked ${roundScore} points!`,
  };
}
