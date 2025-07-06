/* eslint-disable functional/no-let, functional/immutable-data */
import { GameState, ActionContext, GameStatus } from '../lib/gameLogic';

/**
 * Handles a single flip in a Flip Three context, updating the player's hand and context stack.
 * Returns the new GameState after the flip.
 */
export function flipThreeStep(state: GameState): GameState {
  const ctx = state.currentAction ?? {};
  if (!ctx.flipThreeState) return state;
  const actingPlayer = ctx.flipThreeState.target;
  const [card, newDeck] = [state.deck[0], state.deck.slice(1)];
  if (!card) return { ...state, status: GameStatus.DeckEmpty };
  let players = state.players.map((p) => ({ ...p }));
  let player = { ...players[actingPlayer] };
  if (card.type === 'number') {
    if (player.numberCards.some((c) => c.value === card.value)) {
      // Bust
      player = { ...player, busted: true, numberCards: [...player.numberCards, card] };
      players[actingPlayer] = { ...player, numberCards: [] };
      return {
        ...state,
        deck: newDeck,
        players,
        discard: [...state.discard, ...player.numberCards],
        status: GameStatus.Busted,
      };
    }
    player = { ...player, numberCards: [...player.numberCards, card] };
  } else if (card.type === 'modifier') {
    player = { ...player, modifiers: [...player.modifiers, card] };
  } else if (card.type === 'action') {
    // For simplicity, just discard action card
    return {
      ...state,
      deck: newDeck,
      players,
      discard: [...state.discard, card],
      status: GameStatus.Flipped,
    };
  }
  players[actingPlayer] = player;
  // Decrement flipsRemaining or pop context
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
      players,
      currentAction: updatedCtx,
      actionStack: [updatedCtx, ...state.actionStack.slice(1)],
      status: GameStatus.Flipped,
    };
  }
  // Last flip: pop context
  const prevStack = state.actionStack.slice(1);
  return {
    ...state,
    deck: newDeck,
    players,
    actionStack: prevStack,
    currentAction: prevStack[0],
    status: GameStatus.FlipThreeComplete,
  };
}
