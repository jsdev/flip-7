# Flip 7 Modular Component Design

## PlayerHand Component
- **Props:**
  - `numberCards`: Array of number card objects (unique by value, order can be changed by user).
  - `onReorder`: Function to handle drag-and-drop or button-based reordering.
  - `onCardClick`: (optional) For future features like card selection.
- **Behavior:**
  - Renders number cards in a horizontal row (queue).
  - Cards are always visible (never hidden).
  - New cards are added to the end (right) by default.
  - User can reorder cards (drag-and-drop or with arrow buttons).
  - Supports future config: insert between values.

## ActionQueue Component
- **Props:**
  - `actionCards`: Array of action card objects.
  - `onActionUse`: Function to trigger using an action card (choose target, etc).
- **Behavior:**
  - Renders action cards above or below the number card queue.
  - Action cards are not mixed with number cards.
  - User can click an action card to use it (future: select a target).

## Settings
- `settings.json` will store configuration for PlayerHand queue behavior:
  - `numberCardInsertMode`: "end" (default) or "between"
- Components will read from settings to determine how to add new cards.
