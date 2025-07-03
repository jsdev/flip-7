// Shared types for Flip 7 Preact app

export interface CardType {
  readonly type: 'number' | 'modifier' | 'action';
  readonly value: number | string;
  readonly label?: string;
}

export interface Player {
  readonly name: string;
  readonly score: number;
  readonly numberCards: ReadonlyArray<CardType>;
  readonly modifiers: ReadonlyArray<CardType>;
  readonly actionCards: ReadonlyArray<CardType>;
  readonly secondChance: boolean;
  readonly busted: boolean;
  readonly banked: boolean;
  readonly isDealer: boolean;
  readonly isActive: boolean;
  readonly flipThree: number; // Number of forced flips remaining (0 if not active)
}
