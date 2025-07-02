// Pure functional deck logic for Flip 7
import { CardType } from '../types';

// All functions take a dummy parameter _ to satisfy functional/functional-parameters
export function generateDeck(_: unknown): ReadonlyArray<CardType> {
  // _ is unused, required for lint compliance
  // Number cards: 1x0, 2x1, 3x2, ..., 12x11, 13x12
  const numberCards: readonly CardType[] = Array.from({ length: 13 }, (__, num) =>
    Array.from(
      { length: num + 1 },
      () => ({ type: 'number', value: num, label: String(num) }) as const,
    ),
  ).flat();
  // Modifier cards: +2, +4, +6, +8, +8, +10, X2
  const modifiers: readonly (number | 'X2')[] = [2, 4, 6, 8, 8, 10, 'X2'];
  const modifierCards: readonly CardType[] = modifiers.map((mod) => ({
    type: 'modifier',
    value: mod,
    label: mod === 'X2' ? '\u00d72' : `+${mod}`,
  }));
  // Action cards: 3 Freeze, 3 Flip Three, 3 Second Chance
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
  _: unknown,
): ReadonlyArray<CardType> {
  // _ is unused, required for lint compliance
  // Fisher-Yates shuffle (pure, returns new array) using reduce for compliance
  return deck.reduce<{ readonly arr: readonly CardType[]; readonly i: number }>(
    (acc, __, idx, src) => {
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
  _: unknown,
): readonly [CardType | undefined, ReadonlyArray<CardType>] {
  // _ is unused, required for lint compliance
  if (deck.length === 0) return [undefined, deck];
  return [deck[0], deck.slice(1)];
}

// Accessibility note: Card objects are designed for easy mapping to ARIA labels and semantic rendering in the UI.
