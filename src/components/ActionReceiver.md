# ActionReceiver Component Design

## Purpose

The `ActionReceiver` component provides an interactive UI element (button) that allows the current player to target another player with an action card (e.g., Freeze, Flip Three, Second Chance). It is only enabled for valid targets and only visible when an action card is being resolved.

## Responsibilities

- Display a button or indicator on each player who is a valid target for the current action card.
- Allow the current player to select a target by clicking the button.
- Trigger the appropriate game state update when a target is selected.
- Be accessible and clearly indicate which player is being targeted.

## Props

```ts
interface ActionReceiverProps {
  isActive: boolean; // Is this receiver currently enabled for targeting?
  onReceive: () => void; // Callback when this player is selected as the target
  label?: string; // Optional label for the button (e.g., 'Freeze', 'Flip 3')
}
```

## UI/UX

- Show a prominent button (e.g., "Freeze Me!") for each valid target.
- Button is only enabled for valid targets and only visible during action resolution.
- Use ARIA attributes for accessibility (e.g., `aria-label`, `aria-live`).
- Provide visual feedback when a player is selected as the target.

## Example Usage

```tsx
<ActionReceiver isActive={true} onReceive={() => handleTarget(idx)} label="Freeze" />
```

## Extensibility

- Support for different action types (Freeze, Flip Three, etc.) via the `label` prop.
- Allow for animations or effects when a player is targeted.
