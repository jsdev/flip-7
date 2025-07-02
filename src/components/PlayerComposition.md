# PlayerComposition & Game Layout Design

## Overview

This design describes a modern, modular, and visually engaging layout for Flip 7, using a PlayerComposition panel for each player, a central FlipStack (flip button styled as a card back), and a visually rich DiscardPile. The layout is designed for 4 players, always centering the current player and rotating/anchoring the other players around the board.

---

## Layout Structure

- **GameBoard**: Main container, flex/relative layout.
  - **FlipStack**: Centered, styled as a card back with "Flip 7" text. Acts as the flip button for the current player.
  - **DiscardPile**: Left of FlipStack, shows a loose, fanned pile of recently discarded cards (not interactive).
  - **PlayerComposition (x4)**: One for each player, positioned and rotated:
    - Current player: Centered at bottom, upright.
    - Next player: Right, rotated -90°, anchored to right.
    - Opposite player: Top, rotated -180°, anchored to top.
    - Previous player: Left, rotated -270°, anchored to left.
  - **Transitions**: When turn advances, rotate/animate PlayerComposition panels so the new current player is always at the bottom center.

---

## Component Responsibilities

### PlayerComposition

- Shows player name, score, hand (number cards), and Second Chance indicator.
- Highlights if player is current/active.
- Receives props for player data, position, and rotation.
- May include ActionReceiver prompt if player is a valid target for an action card.

### FlipStack

- Styled as a card back with "Flip 7" text.
- Centered in GameBoard.
- Acts as the flip button for the current player only.
- Triggers flip logic when clicked.

### DiscardPile

- Left of FlipStack.
- Shows a loose, fanned pile of recently discarded cards.
- Each card is rendered with a random rotation/offset for a natural look.
- Not interactive, but visually communicates game state.

---

## UI/UX Notes

- Responsive and accessible.
- Animations for transitions and card movement.
- Clear visual cues for current player and action prompts.
- Modular, so each component can be tested and styled independently.

---

## Example Layout (ASCII Art)

```
   [Top Player]
        ^
        |
[Left]<--+-->[Right]
        |
     [Bottom]

[FlipStack] centered, [DiscardPile] to the left
```

---

## Implementation Plan

1. Create PlayerComposition component with props for player, position, rotation, and action prompt.
2. Refactor GameBoard to use 4 PlayerComposition panels, FlipStack, and DiscardPile.
3. Add CSS for rotation/anchoring and transitions.
4. Integrate FlipStack as the only way to flip for the current player.
5. Animate/rotate PlayerComposition panels on turn change.
