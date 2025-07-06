/* eslint-disable functional/functional-parameters, functional/immutable-data */
// Pure functional deck logic for Flip 7
import { CardType } from '../types';

// Generate a deck of Flip 7 cards
export function generateDeck(): ReadonlyArray<CardType> {
  // Number cards: 1x0, 2x1, 3x2, ..., 13x12
  const numberCards: readonly CardType[] = Array.from({ length: 13 }, (_, num) =>
    Array.from(
      { length: num + 1 },
      () => ({ type: 'number', value: num, label: String(num) }) as const,
    ),
  ).flat();
  // Modifier cards: +2, +4, +6, +8, +10, X2 (6 total)
  const modifiers: readonly (number | 'X2')[] = [2, 4, 6, 8, 10, 'X2'];
  const modifierCards: readonly CardType[] = modifiers.map((mod) => ({
    type: 'modifier',
    value: mod,
    label: mod === 'X2' ? '×2' : `+${mod}`,
  }));
  // Action cards: 3 Freeze, 3 Flip Three, 3 Second Chance (9 total)
  const actionCards: readonly CardType[] = Array.from({ length: 3 }).flatMap(() => [
    { type: 'action', value: 'Freeze', label: 'Freeze' },
    { type: 'action', value: 'Flip Three', label: 'Flip 3' },
    { type: 'action', value: 'Second Chance', label: '2nd Chance' },
  ]);
  return [...numberCards, ...modifierCards, ...actionCards];
}

export function shuffleDeck(
  deck: ReadonlyArray<CardType>,
  rng: () => number = Math.random,
): ReadonlyArray<CardType> {
  // Fisher-Yates shuffle (pure, returns new array) using reduce for compliance
  return deck.reduce<{ readonly arr: readonly CardType[]; readonly i: number }>(
    (acc, _, idx, src) => {
      if (idx === 0) return { arr: [...src], i: src.length - 1 };
      const j = Math.floor(rng() * (acc.i + 1));
      const arr = [...acc.arr];
      [arr[acc.i], arr[j]] = [arr[j], arr[acc.i]];
      return { arr, i: acc.i - 1 };
    },
    { arr: [...deck], i: deck.length - 1 },
  ).arr;
}

export function dealCard(
  deck: ReadonlyArray<CardType>,
): readonly [CardType | undefined, ReadonlyArray<CardType>] {
  if (deck.length === 0) return [undefined, deck];
  return [deck[0], deck.slice(1)];
}

// Reshuffle discard pile (except top card) into deck when deck is empty
export function maybeReshuffleDeck(
  deck: ReadonlyArray<CardType>,
  discard: ReadonlyArray<CardType>,
  rng: () => number = Math.random,
): { readonly deck: ReadonlyArray<CardType>; readonly discard: ReadonlyArray<CardType> } {
  if (deck.length > 0 || discard.length <= 1) {
    return { deck, discard };
  }
  // Keep top card in discard, shuffle rest into deck
  const [top, ...rest] = discard.slice().reverse();
  const reshuffled = shuffleDeck(rest.reverse(), rng);
  return { deck: reshuffled, discard: [top] };
}

// Accessibility note: Card objects are designed for easy mapping to ARIA labels and semantic rendering in the UI.
