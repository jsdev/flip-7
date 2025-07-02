# DiscardPile Component Design

## Purpose

The `DiscardPile` component visually and functionally represents the pile of cards that have been played, used, or scored during a round of Flip 7. It provides players with a clear, accessible view of the current discard pile and supports game logic for deck reshuffling when the draw deck is empty.

## Responsibilities

- **Display**: Show the current discard pile as a stack or fanned-out set of cards, with the top card visible and accessible.
- **Accessibility**: Use ARIA roles and labels to ensure screen readers can identify the discard pile and its contents.
- **Game Logic**:
  - At the end of each round, collect all cards from:
    - Busted hands (all number, modifier, and used action cards)
    - Banked hands (all cards that contributed to the score)
    - Used action cards (Freeze, Flip Three, Second Chance)
    - Unused Second Chance cards
    - Gifted or un-giftable Second Chance cards
  - When the draw deck is empty, shuffle the discard pile to form a new draw deck.
- **Extensibility**: Allow for future features such as viewing discard history, animating card movement, or showing the number of cards in the pile.

## Props

```ts
interface DiscardPileProps {
  cards: CardType[]; // The current discard pile (top card is last in array)
  onReshuffle?: () => void; // Optional callback when reshuffling occurs
}
```

## UI/UX

- **Visuals**:
  - Show a stack or fanned set of cards, with only the top card’s face visible.
  - Optionally display the count of cards in the pile.
  - Animate cards being added to the pile for polish.
- **Accessibility**:
  - Use `aria-label="Discard pile"` on the container.
  - Announce when the pile is reshuffled.
- **Interactivity**:
  - If the deck is empty, allow the discard pile to be clicked (or auto-reshuffled) to form a new deck.

## Example Usage

```tsx
<DiscardPile cards={discardPile} onReshuffle={handleReshuffle} />
```

## Notes on Game Flow

- The discard pile is only reshuffled into the deck when the draw deck is empty.
- All cards from the round (busted, banked, used actions, unused Second Chance) are added to the discard pile at the end of the round.
- No cards are carried over between rounds.

## Future Enhancements

- Show a history of discarded cards.
- Animate card movement from player hands to the discard pile.
- Allow players to inspect the discard pile (for advanced/variant rules).
