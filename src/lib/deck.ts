// Deck and Card class definitions for Flip 7 (modular, dumb data only)

export interface CardType {
  type: 'number' | 'modifier' | 'action';
  value: number | string;
  label?: string;
}

export class Deck {
  cards: CardType[];

  constructor() {
    this.cards = this.generateDeck();
  }

  generateDeck(): CardType[] {
    const cards: CardType[] = [];
    // Number cards: 1x0, 2x1, 3x2, ..., 12x11, 13x12
    for (let num = 0; num <= 12; num++) {
      for (let i = 0; i < num + 1; i++) {
        cards.push({ type: 'number', value: num, label: String(num) });
      }
    }
    // Modifier cards: +2, +4, +6, +8, +8, +10, X2
    const modifiers = [2, 4, 6, 8, 8, 10, 'X2'] as const;
    for (const mod of modifiers) {
      cards.push({ type: 'modifier', value: mod, label: mod === 'X2' ? '\u00d72' : `+${mod}` });
    }
    // Action cards: 3 Freeze, 3 Flip Three, 3 Second Chance
    for (let i = 0; i < 3; i++) {
      cards.push({ type: 'action', value: 'Freeze', label: 'Freeze' });
      cards.push({ type: 'action', value: 'Flip Three', label: 'Flip 3' });
      cards.push({ type: 'action', value: 'Second Chance', label: '2nd Chance' });
    }
    return cards;
  }

  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(): CardType | undefined {
    return this.cards.shift();
  }
}

// Accessibility note: Card objects are designed for easy mapping to ARIA labels and semantic rendering in the UI.
