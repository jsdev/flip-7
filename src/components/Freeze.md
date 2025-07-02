# Freeze Card Design Doc

## Purpose

The Freeze action card in Flip 7 is used to force another player to immediately end their round and bank their current unbanked score. This adds a layer of strategy, as it can be used to prevent opponents from accumulating more points or to force them to bank at an inopportune time.

## Flow of Play

1. **Drawing Freeze**: When a player flips a Freeze card, they must immediately choose another player (not themselves) as the target.
2. **Targeted Player**: The targeted player must immediately bank their current round score, even if it is zero. If they have already busted or banked this round, the Freeze has no effect.
3. **Action Resolution**:
   - The Freeze card is moved to the discard pile after use.
   - The action and its result are logged in the action log for stats/superlatives.
   - The targeted player’s hand is cleared and their score is updated as if they had chosen to bank.
4. **Turn Continuation**: The player who drew the Freeze continues their turn as normal after resolving the Freeze.

## UI/UX

- When a Freeze is drawn, prompt the acting player to select a target (any other player who has not yet banked or busted this round).
- If no valid targets exist, the Freeze card is discarded with no effect.
- Show a clear message/log entry about who was frozen and their banked score.

## Game State Changes

- The targeted player’s hand is banked and cleared.
- The Freeze card is added to the discard pile.
- The action is logged.

## Extensibility

- In the future, allow for AI/computer player targeting logic.
- Support for animations or visual effects when a player is frozen.

---

## Example Action Log Entry

```
{ round: 2, player: 1, card: { type: 'action', value: 'Freeze' }, result: 'froze', action: 'freeze', target: 2, banked: 13 }
```
