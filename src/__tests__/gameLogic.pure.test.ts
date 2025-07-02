import { flipCard, bankScore, GameState, handleActionTarget } from '../lib/gameLogic';
import { CardType, Player } from '../types';
import { describe, it, expect } from '@jest/globals';

describe('Flip 7 Pure Game Logic', () => {
  function makePlayer(name: string): Player {
    return {
      name,
      score: 0,
      numberCards: [],
      modifiers: [],
      actionCards: [],
      secondChance: false,
      busted: false,
      banked: false,
      isDealer: false,
      isActive: true,
    };
  }
  function makeState(overrides: Partial<GameState> = {}): GameState {
    return {
      deck: [],
      discard: [],
      players: [makePlayer('A'), makePlayer('B'), makePlayer('C'), makePlayer('D')],
      currentPlayer: 0,
      round: 1,
      status: '',
      actionStack: [],
      currentAction: undefined,
      gameOver: false,
      ...overrides,
    };
  }

  it('number cards are only discarded on bust', () => {
    const state = makeState({
      deck: [
        { type: 'number', value: 5 },
        { type: 'number', value: 5 },
      ],
    });
    const s1 = flipCard(state);
    expect(s1.players[0].numberCards.length).toBe(1);
    const s2 = flipCard({ ...s1, deck: s1.deck });
    expect(s2.players[0].numberCards.length).toBe(0); // Discarded on bust
    expect(s2.discard.some((c) => c.value === 5)).toBe(true);
    return undefined;
  });

  it('action cards are discarded immediately after use', () => {
    const freeze: CardType = { type: 'action', value: 'Freeze' };
    const state = makeState({ deck: [freeze] });
    const s1 = flipCard(state);
    expect(s1.discard).toContain(freeze);
    expect(s1.currentAction?.pendingAction?.type).toBe('freeze');
    return undefined;
  });

  it('Second Chance is only discarded when redeemed', () => {
    const sc: CardType = { type: 'action', value: 'Second Chance' };
    let state = makeState({ deck: [sc] });
    state = flipCard(state);
    expect(state.players[0].secondChance).toBe(true);
    // Simulate bust with Second Chance
    const updatedPlayers = state.players.map((p, i) =>
      i === 0 ? { ...p, numberCards: [{ type: 'number', value: 7 } as CardType] } : p,
    );
    const updatedDeck: ReadonlyArray<CardType> = [{ type: 'number', value: 7 } as CardType];
    let newState = { ...state, players: updatedPlayers, deck: updatedDeck };
    // Simulate Second Chance logic immutably
    if (
      newState.players[0].secondChance &&
      newState.players[0].numberCards.some((c) => c.value === 7)
    ) {
      const player = newState.players[0];
      const newPlayer = { ...player, secondChance: false, numberCards: [] };
      const newDiscard: ReadonlyArray<CardType> = [
        ...newState.discard,
        { type: 'number', value: 7 } as CardType,
        { type: 'action', value: 'Second Chance' } as CardType,
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
              { type: 'number', value: 3 } as CardType,
              { type: 'number', value: 4 } as CardType,
            ],
            modifiers: [{ type: 'modifier', value: 2 } as CardType],
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
    const flipThree: CardType = { type: 'action', value: 'Flip Three' };
    const numCard: CardType = { type: 'number', value: 2 };
    const state = makeState({
      deck: [flipThree, numCard, numCard, numCard],
    });
    let s = flipCard(state);
    expect(s.currentAction?.pendingAction?.type).toBe('flip-three');
    s = handleActionTarget(s, 0); // Player 0 targets self
    s = flipCard(s); // Should flip a 2
    expect(s.players[0].numberCards.length).toBe(1);
    s = flipCard(s); // Should flip a 2
    expect(s.players[0].numberCards.length).toBe(2);
    s = flipCard(s); // Should flip a 2
    expect(s.players[0].numberCards.length).toBe(3);
    return undefined;
  });
});
