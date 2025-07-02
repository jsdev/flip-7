// Deck and Card class definitions for Flip 7

/**
 * Card object for Flip 7
 * @typedef {Object} Card
 * @property {string} suit - 'hearts', 'diamonds', 'clubs', 'spades'
 * @property {string|number} rank - 2-10, 'J', 'Q', 'K', 'A'
 * @property {number} value - Numeric value for game logic
 */

class Deck {
    constructor() {
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
        this.cards = this.generateDeck();
    }

    generateDeck() {
        const cards = [];
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                let value;
                if (typeof rank === 'number') value = rank;
                else if (rank === 'A') value = 11;
                else value = 10;
                cards.push({ suit, rank, value });
            }
        }
        return cards;
    }

    shuffle() {
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.shift();
    }
}

// Accessibility note: Card objects are designed for easy mapping to ARIA labels and semantic rendering in the UI.

// Expose Deck globally for browser
window.Deck = Deck;
