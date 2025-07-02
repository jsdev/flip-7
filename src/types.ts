// Shared types for Flip 7 Preact app

export interface CardType {
  type: 'number' | 'modifier' | 'action';
  value: number | string;
  label?: string;
}

export interface Player {
  name: string;
  score: number;
  numberCards: CardType[];
  modifiers: CardType[];
  actionCards: CardType[];
  secondChance: boolean;
  busted: boolean;
  banked: boolean;
  isDealer: boolean;
  isActive: boolean;
}
