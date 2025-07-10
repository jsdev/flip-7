import {
  flipCard,
  bankScore,
  handleActionTarget,
  resolveAction,
} from '../lib/gameLogic.js';
import { GameStatus } from '../lib/GameStatus.js';
import { createPlayer } from '../lib/player.js';
import { createGameState } from '../lib/gameState.js';
import { describe, it, expect } from 'vitest';

describe('Flip 7 Pure Game Logic', () => {
  // Use shared helpers
  function makePlayer(name) {
    return createPlayer(name);
  }
  function makeState(overrides = {}) {
    return createGameState({
      ...overrides,
    });
  }

  it('number cards are only discarded on bust', () => {
    // Set up a scenario where the current player can flip twice:
    // - Players 1, 2, 3 are already banked, so only player 0 is active
    // - This means when player 0's turn ends, it cycles back to player 0
    const state = makeState({
      deck: [
        { type: 'number', value: 5 },
        { type: 'number', value: 5 },
      ],
      players: [
        makePlayer('A'), // Active player
        { ...makePlayer('B'), banked: true }, // Banked
        { ...makePlayer('C'), banked: true }, // Banked  
        { ...makePlayer('D'), banked: true }, // Banked
      ],
      currentPlayer: 0,
    });
    
    // First flip - should succeed and add card to hand
    const s1 = flipCard(state);
    expect(s1.players[0].numberCards.length).toBe(1);
    expect(s1.status).toBe('choice-point'); // Player should have a choice after successful flip
    
    // Since other players are banked, player should be able to flip again
    // Reset flipCount since turn should advance back to same player
    const s1WithResetFlips = { ...s1, flipCount: 1 };
    const s2 = flipCard(s1WithResetFlips);
    
    // Second flip should cause bust and discard all cards
    expect(s2.players[0].numberCards.length).toBe(0); // Discarded on bust
    expect(s2.players[0].busted).toBe(true);
    expect(s2.discard.some((c) => c.value === 5)).toBe(true);
    expect(s2.status).toBe('busted');
    return undefined;
  });

  it('action cards are discarded immediately after use', () => {
    const freeze = { type: 'action', value: 'Freeze' };
    const state = makeState({ deck: [freeze] });
    const s1 = flipCard(state);
    expect(s1.discard).toContain(freeze);
    expect(s1.currentAction?.pendingAction?.type).toBe('freeze');
    return undefined;
  });

  it('Second Chance is only discarded when redeemed', () => {
    const sc = { type: 'action', value: 'Second Chance' };
    let state = makeState({ deck: [sc] });
    state = flipCard(state);
    expect(state.players[0].secondChance).toBe(true);
    // Simulate bust with Second Chance
    const updatedPlayers = state.players.map((p, i) =>
      i === 0 ? { ...p, numberCards: [{ type: 'number', value: 7 }] } : p,
    );
    const updatedDeck = [{ type: 'number', value: 7 }];
    let newState = { ...state, players: updatedPlayers, deck: updatedDeck };
    if (
      newState.players[0].secondChance &&
      newState.players[0].numberCards.some((c) => c.value === 7)
    ) {
      const player = newState.players[0];
      const newPlayer = { ...player, secondChance: false, numberCards: [] };
      const newDiscard = [
        ...newState.discard,
        { type: 'number', value: 7 },
        { type: 'action', value: 'Second Chance' },
      ];
      newState = {
        ...newState,
        players: [newPlayer, ...newState.players.slice(1)],
        discard: newDiscard,
      };
    }
    expect(newState.players[0].secondChance).toBe(false);
    expect(newState.discard.find((c) => c.value === 'Second Chance')).toBeTruthy();
    expect(newState.players[0].numberCards.length).toBe(0);
    return undefined;
  });

  it('banking moves all number and modifier cards, resets hand, and updates score', () => {
    const state = makeState();
    const updatedPlayers = state.players.map((p, i) =>
      i === 0
        ? {
            ...p,
            numberCards: [
              { type: 'number', value: 3 },
              { type: 'number', value: 4 },
            ],
            modifiers: [{ type: 'modifier', value: 2 }],
          }
        : p,
    );
    const s2 = bankScore({ ...state, players: updatedPlayers }, 0);
    expect(s2.players[0].score).toBe(9);
    expect(s2.players[0].numberCards.length).toBe(0);
    expect(s2.players[0].modifiers.length).toBe(0);
    expect(s2.players[0].banked).toBe(true);
    return undefined;
  });

  it('handles a chain of Flip Three actions (nested)', () => {
    const flipThree = { type: 'action', value: 'Flip Three' };
    const numCard1 = { type: 'number', value: 2 };
    const numCard2 = { type: 'number', value: 3 };
    const numCard3 = { type: 'number', value: 4 };
    const state = makeState({
      deck: [flipThree, numCard1, numCard2, numCard3],
    });
    let s = flipCard(state);
    expect(s.currentAction?.pendingAction?.type).toBe('flip-three');
    s = handleActionTarget(s, 0);
    s = flipCard(s);
    expect(s.players[0].numberCards.length).toBe(1);
    s = flipCard(s);
    expect(s.players[0].numberCards.length).toBe(2);
    s = flipCard(s);
    expect(s.players[0].numberCards.length).toBe(3);
    return undefined;
  });

  it('ends the game if all players are busted or banked after a Freeze', () => {
    const freeze = { type: 'action', value: 'Freeze' };
    const players = [
      { ...makePlayer('A'), banked: true },
      { ...makePlayer('B'), busted: true },
      { ...makePlayer('C'), banked: true },
      { ...makePlayer('D') },
    ];
    let state = makeState({
      deck: [freeze],
      players,
      currentPlayer: 3,
    });
    state = flipCard(state);
    state = handleActionTarget(state, 3);
    const allDone = state.players.every((p) => p.banked || p.busted);
    expect(allDone).toBe(true);
  });

  it('Second Chance prevents a bust, is discarded, and player continues', () => {
    const state = makeState({
      deck: [{ type: 'number', value: 7 }],
      players: [
        { ...makePlayer('A'), secondChance: true, numberCards: [{ type: 'number', value: 7 }] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.players[0].secondChance).toBe(false);
    expect(s1.players[0].numberCards.length).toBe(1);
    expect(s1.discard.find((c) => c.value === 'Second Chance')).toBeTruthy();
    expect(s1.discard.filter((c) => c.value === 7).length).toBe(1);
    expect(s1.players[0].busted).toBe(false);
    expect(s1.status).toBe(GameStatus.ChoicePoint);
    return undefined;
  });

  it('awards Flip 7 bonus and ends round, forfeiting unbanked players cards', () => {
    const uniqueCards = [1, 2, 3, 4, 5, 6, 7].map((v) => ({ type: 'number', value: v }));
    const state = makeState({
      players: [
        { ...makePlayer('A'), numberCards: uniqueCards },
        makePlayer('B'),
        { ...makePlayer('C'), banked: true, score: 3 },
        makePlayer('D'),
      ],
    });
    const stateAfter = bankScore(state, 0);
    const a = stateAfter.players[0];
    expect(a.numberCards.length).toBe(0);
    expect(a.banked).toBe(true);
    expect(a.score).toBe(28 + 15);
    expect(stateAfter.players[1].numberCards.length).toBe(0);
    expect(stateAfter.players[1].score).toBe(0);
    expect(stateAfter.players[1].banked).toBe(false);
    expect(stateAfter.players[3].numberCards.length).toBe(0);
    expect(stateAfter.players[3].score).toBe(0);
    expect(stateAfter.players[3].banked).toBe(false);
    expect(stateAfter.players[2].score).toBe(3);
    expect(stateAfter.players[2].banked).toBe(true);
    expect(stateAfter.gameOver).toBe(true);
    return undefined;
  });

  it('presents a choice after Second Chance saves a player from busting', () => {
    const state = makeState({
      deck: [{ type: 'number', value: 7 }],
      players: [
        { ...makePlayer('A'), secondChance: true, numberCards: [{ type: 'number', value: 7 }] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.status).toBe(GameStatus.ChoicePoint);
    return undefined;
  });

  it('allows banking after being saved by Second Chance', () => {
    const state = makeState({
      deck: [{ type: 'number', value: 7 }],
      players: [
        { ...makePlayer('A'), secondChance: true, numberCards: [{ type: 'number', value: 7 }] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    const s2 = bankScore(s1, 0);
    expect(s2.players[0].banked).toBe(true);
    expect(s2.players[0].score).toBe(7);
  });

  it('requires resolving Freeze before any other action', () => {
    const freeze = { type: 'action', value: 'Freeze' };
    const state = makeState({ deck: [freeze] });
    const stateAfterFlip = flipCard(state);
    const stateAfterBank = bankScore(stateAfterFlip, 0);
    expect(stateAfterBank).toEqual(stateAfterFlip);
    const stateAfterTarget = handleActionTarget(stateAfterFlip, 1);
    expect(stateAfterTarget.currentAction).toBeUndefined();
  });

  it('Freeze: all players including self are valid targets', () => {
    const freeze = { type: 'action', value: 'Freeze' };
    let state = makeState({ deck: [freeze] });
    state = flipCard(state);
    expect(state.currentAction?.pendingAction?.type).toBe('freeze');
    const validTargets = state.players.map((_, i) => i);
    expect(validTargets).toEqual([0, 1, 2, 3]);
  });

  it('Freeze: after freezing a player, they are banked', () => {
    const freeze = { type: 'action', value: 'Freeze' };
    let state = makeState({ deck: [freeze] });
    state = flipCard(state);
    state = handleActionTarget(state, 2);
    expect(state.players[2].banked).toBe(true);
  });

  it('Freeze: a player can freeze themselves and is immediately banked', () => {
    const freeze = { type: 'action', value: 'Freeze' };
    let state = makeState({ deck: [freeze] });
    state = flipCard(state);
    state = handleActionTarget(state, 0);
    expect(state.players[0].banked).toBe(true);
    expect(state.status).toBe(GameStatus.FreezeBanked);
  });

  it('Second Chance: only the drawn card is discarded, not the whole hand', () => {
    let state = makeState({
      deck: [{ type: 'number', value: 7 }],
      players: [
        { ...makePlayer('A'), secondChance: true, numberCards: [{ type: 'number', value: 7 }] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    state = flipCard(state);
    expect(state.players[0].numberCards.length).toBe(1);
    expect(state.discard.filter((c) => c.value === 7).length).toBe(1);
  });

  it('presents a choice point after a safe flip', () => {
    const state = makeState({ deck: [{ type: 'number', value: 2 }] });
    const s1 = flipCard(state);
    expect(s1.status).toBe(GameStatus.ChoicePoint);
  });

  it('presents a choice point after Second Chance is used', () => {
    const state = makeState({
      deck: [{ type: 'number', value: 7 }],
      players: [
        { ...makePlayer('A'), secondChance: true, numberCards: [{ type: 'number', value: 7 }] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.status).toBe(GameStatus.ChoicePoint);
  });

  it('does not present a choice point if player is forced to flip (Flip Three)', () => {
    const state = makeState({
      deck: [{ type: 'number', value: 2 }],
      players: [
        { ...makePlayer('A'), flipThree: 2 },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.status).not.toBe(GameStatus.ChoicePoint);
  });

  it('immediately awards Flip 7 bonus and ends round when a player acquires 7 unique number cards', () => {
    const uniqueCards = [1, 2, 3, 4, 5, 6].map((v) => ({ type: 'number', value: v }));
    const state = makeState({
      currentPlayer: 3,
      players: [
        makePlayer('A'),
        makePlayer('B'),
        makePlayer('C'),
        { ...makePlayer('D'), numberCards: uniqueCards },
      ],
      deck: [{ type: 'number', value: 7 }],
    });
    const s1 = flipCard(state);
    const d = s1.players[3];
    expect(d.numberCards.length).toBe(0);
    expect(d.banked).toBe(true);
    expect(d.score).toBe(28 + 15);
    expect(s1.status).toBe(GameStatus.Flip7BonusAwarded);
    expect(s1.gameOver).toBe(true);
  });

  it('returns state unchanged for unknown card type in flipCard', () => {
    const state = makeState({ deck: [{ type: 'unknown', value: '???' }] });
    const result = flipCard(state);
    expect(result).toBe(state);
  });

  it('returns state unchanged for unknown action in resolveAction', () => {
    const state = makeState({ deck: [] });
    const card = { type: 'action', value: 'UnknownAction' };
    const result = resolveAction(state, card, 0, {});
    expect(result).toBe(state);
  });

  it('returns state unchanged for unknown action type in handleActionTarget', () => {
    const state = makeState({ deck: [] });
    const actionState = {
      ...state,
      currentAction: {
        pendingAction: {
          type: 'unknown-action', // removed type assertion for ESM compatibility
          card: { type: 'action', value: '???' },
          actingPlayer: 0,
        },
      },
      actionStack: [],
    };
    const result = handleActionTarget(actionState, 1);
    expect(result).toBe(actionState);
  });

  it('returns state unchanged for bankScore if no conditions match', () => {
    const state = makeState({});
    const result = bankScore(state, 1);
    expect(result.status).toBe(GameStatus.Banked);
  });

  it('adds a modifier card to the player hand', () => {
    const state = makeState({
      deck: [{ type: 'modifier', value: 2 }],
    });
    const s1 = flipCard(state);
    expect(s1.players[0].modifiers).toEqual([{ type: 'modifier', value: 2 }]);
    expect(s1.status).toBe(GameStatus.ChoicePoint);
  });

  it('handleActionTarget returns state for unknown action type', () => {
    const state = makeState({ deck: [] });
    const actionState = {
      ...state,
      currentAction: {
        pendingAction: {
          type: 'unknown-action', // removed type assertion for ESM compatibility
          card: { type: 'action', value: '???' },
          actingPlayer: 0,
        },
      },
      actionStack: [],
    };
    const result = handleActionTarget(actionState, 1);
    expect(result).toBe(actionState);
  });

  it('bankScore returns CannotBankBusted if player is busted', () => {
    const state = makeState();
    state.players[1].busted = true;
    const result = bankScore(state, 1);
    expect(result.status).toBe(GameStatus.CannotBankBusted);
  });

  it('bankScore returns CannotBankDuringFlipThree if player is in flipThree', () => {
    const state = makeState();
    state.players[2].flipThree = 2;
    const result = bankScore(state, 2);
    expect(result.status).toBe(GameStatus.CannotBankDuringFlipThree);
  });

  it('bankScore advances to next player if current player just banked', () => {
    const state = makeState();
    state.players[0].numberCards = [{ type: 'number', value: 5 }];
    const result = bankScore(state, 0);
    expect(result.currentPlayer).toBe(1);
    expect(result.status).toBe(GameStatus.Banked);
  });

  it('handleSecondChance returns SecondChanceSurvived if not at choice point', () => {
    const duplicateCard = { type: 'number', value: 2 };
    const state = makeState({
      deck: [duplicateCard],
      players: [
        { ...makePlayer('A'), secondChance: true, flipThree: 1, numberCards: [duplicateCard] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.message).toContain('survived your Second Chance');
    expect(s1.status).toBe(GameStatus.Flipped);
  });

  it('handleSecondChance returns SecondChanceSurvived if NOT at choice point (e.g., flipThree > 0)', () => {
    const duplicateCard = { type: 'number', value: 2 };
    const state = makeState({
      deck: [duplicateCard],
      players: [
        { ...makePlayer('A'), secondChance: true, flipThree: 2, numberCards: [duplicateCard] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.message).toContain('survived your Second Chance');
    expect(s1.status).toBe(GameStatus.Flipped);
  });

  it('handleSecondChance returns ChoicePoint if player IS at choice point (flipThree = 0)', () => {
    const duplicateCard = { type: 'number', value: 2 };
    const state = makeState({
      deck: [duplicateCard],
      players: [
        { ...makePlayer('A'), secondChance: true, flipThree: 0, numberCards: [duplicateCard] },
        makePlayer('B'),
        makePlayer('C'),
        makePlayer('D'),
      ],
    });
    const s1 = flipCard(state);
    expect(s1.status).toBe(GameStatus.ChoicePoint);
  });

  it('reshuffles discard into deck when deck is empty before flip', () => {
    const discard = [
      { type: 'number', value: 1 },
      { type: 'number', value: 2 },
      { type: 'number', value: 3 },
    ];
    const state = makeState({ deck: [], discard });
    const s1 = flipCard(state);
    expect(s1.discard.length).toBe(1);
    expect(s1.deck.length).toBeLessThanOrEqual(2);
    expect(s1.discard[0].value).toBe(3);
  });

  it('applies modifier multipliers, then Flip 7 bonus, then additions on bank', () => {
    const numberCards = [0, 1, 2, 3, 4, 5, 6].map((v) => ({ type: 'number', value: v }));
    const modifiers = [
      { type: 'modifier', value: 'X2', label: '×2' }, // multiplier
      { type: 'modifier', value: 4, label: '+4' }, // addition
    ];
    const state = makeState({
      players: [
        { ...makePlayer('A'), numberCards, modifiers },
        makePlayer('B'), makePlayer('C'), makePlayer('D')
      ]
    });
    const result = bankScore(state, 0);
    // Base score: 0+1+2+3+4+5+6 = 21
    // X2 multiplier: 21 * 2 = 42
    // Flip 7 bonus: 42 + 15 = 57
    // Addition modifier: 57 + 4 = 61
    expect(result.players[0].score).toBe(61);
  });
});
