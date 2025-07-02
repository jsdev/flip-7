# Flip Three Card Design Doc

## Purpose

The Flip Three action card in Flip 7 allows the acting player to force another player to take three consecutive turns, flipping one card at a time. The targeted player becomes the active player and must flip a card, resolve it, and repeat until three cards have been flipped (or they bust). After the sequence, control returns to the original player, who must then choose to BANK or FLIP as normal. Play then continues to the next player in seated order.

## Flow of Play

1. **Drawing Flip Three**: When a player flips a Flip Three card, they must immediately choose another player (not themselves) as the target.
2. **Targeted Player**: The targeted player becomes the active player and must flip a card, resolve it, and repeat for a total of three flips (unless they bust before reaching three).
3. **Bust**: If the targeted player busts at any point, their Flip Three sequence ends immediately.
4. **Return Control**: After the Flip Three sequence (or bust), control returns to the original player, who must then choose to BANK or FLIP as normal.
5. **Continue Play**: After the original player finishes their turn, play continues to the next player in seated order (even if that is the player who just did Flip Three).

## UI/UX

- When Flip Three is drawn, prompt the acting player to select a valid target (any other player who has not banked or busted).
- Show a clear indicator of whose turn it is during the Flip Three sequence.
- After the sequence, return control to the original player and prompt them to continue their turn.
- Log all actions for stats/superlatives.

## Game State Changes

- Track the Flip Three sequence state (who is the target, how many flips remain, who is the original player).
- Temporarily set the targeted player as active for the sequence.
- After the sequence, restore the original player as active.
- If the targeted player busts, end the sequence immediately.
- The Flip Three card is discarded after use.

## Extensibility

- Support for animations or effects during the Flip Three sequence.
- Allow for AI/computer player targeting logic in the future.

---

## Example Action Log Entries

```
{ round: 2, player: 1, card: { type: 'action', value: 'Flip Three' }, result: 'flip-three', action: 'flip-three', target: 2 }
{ round: 2, player: 2, card: { type: 'number', value: 7 }, result: 'safe', action: 'flip-three-flip', flipThreeStep: 1 }
{ round: 2, player: 2, card: { type: 'number', value: 9 }, result: 'safe', action: 'flip-three-flip', flipThreeStep: 2 }
{ round: 2, player: 2, card: { type: 'number', value: 2 }, result: 'bust', action: 'flip-three-flip', flipThreeStep: 3 }
{ round: 2, player: 1, card: { type: 'action', value: 'Flip Three' }, result: 'flip-three-end', action: 'flip-three-end', target: 2 }
```
