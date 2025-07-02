# Flip 7 Game Rules & Turn Structure

## Overview
Flip 7 is a modular, turn-based card game for 4 players. The goal is to collect as many unique number cards as possible without busting, using special action and modifier cards to influence play. The first player to reach 200 points wins.

## Card Types
- **Number Cards:** 0–12, with each number appearing as many times as its value (e.g., twelve 12s, eleven 11s, etc.).
- **Modifier Cards:** +2, +4, +6, +8, +8, +10, X2. Add points or multiply your score if you don't bust.
- **Action Cards:** Freeze, Flip Three, Second Chance. Each has a unique effect, resolved immediately when drawn.

## Turn Structure
1. **On Your Turn:**
   - You may either **bank** your points (end your turn), or **draw** one card from the deck.
2. **If You Bank:**
   - Your turn ends. You keep all points from your number and modifier cards (unless you bust).
3. **If You Draw:**
   - Draw the top card and immediately resolve its effect:
     - **Number Card:**
       - If you already have that number, you bust (unless you have a Second Chance card).
       - If you bust and have a Second Chance, discard both the duplicate and the Second Chance, and continue.
       - Otherwise, add the card to your hand.
     - **Modifier Card:** Add to your modifiers (for end-of-round scoring).
     - **Action Card:**
       - **Freeze:** Immediately choose an active player (including yourself) to be forced to bank.
       - **Flip Three:** Immediately choose an active player to draw three cards, one at a time, resolving each.
       - **Second Chance:** If you already have one, you must immediately give the new one to another player without one (if possible); otherwise, keep it as a passive safety net.
4. **Repeat:**
   - If you have not busted or banked, you may choose to draw again or bank on your next turn.

## Special Rules
- **Second Chance:**
  - Passive; automatically saves you from busting once, then is discarded.
  - If you draw a second one, you must immediately give it away if possible.
- **Banking:**
  - Ends your turn immediately. You cannot take any further actions.
- **Action Cards:**
  - Always resolved immediately when drawn. You do not hold them for later use (except Second Chance).
- **No Multi-Action Turns:**
  - You cannot chain actions. Each turn is a single decision: draw or bank.

## End of Round
- The round ends when all players have either banked or busted.
- Calculate scores:
  - Add up all number cards.
  - Apply X2 modifier if present.
  - Add other modifiers.
  - Add 15-point bonus for collecting all 7 unique numbers (Flip 7 bonus).
  - Busted players score zero.
- Rotate dealer, reshuffle discards if needed, and start the next round.

## Winning
- The game ends when a player reaches 200 points. The highest score wins.

---

For more details, see the DESIGN.md and component docs.
