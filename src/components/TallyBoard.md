# TallyBoard Component Design

## Purpose
Display all players' scores, stats, and end-of-game labels/awards. Clearly show the winner and fun stats like "Luckiest Flipper" or "Most Generous Player".

## Props
- `players`: Array of player objects with stats (score, rounds won, busts, etc)
- `round`: Current round number
- `winningScore`: Number (e.g. 200)
- `onNewGame`: Function to start a new game

## Stats to Track
- **Total Score**: Sum of all rounds
- **Rounds Won**: Number of rounds with highest score
- **Luckiest Flipper**: Most times a player drew a card and it was the only number left that wouldn't bust them (i.e. lowest odds, highest risk successful draw)
- **Most Generous Player**: Most action cards given to others (esp. Second Chance, Flip Three, etc)
- **Most Self-Busts**: Most times a player busted themselves (drew a duplicate number)
- **Most Busts Caused**: Most times a player caused another to bust (e.g. via Flip Three or Freeze)

## Tie-Breaking
- If multiple players tie for a label, show all names ("Tie!")

## Example Layout (Tailwind-inspired)
```
<div class="bg-white/90 rounded-lg shadow p-6 w-full max-w-2xl mx-auto">
  <h2 class="text-xl font-bold mb-4">Final Scores</h2>
  <table class="w-full mb-4">
    <thead>
      <tr class="text-left text-gray-700">
        <th>Player</th>
        <th>Score</th>
        <th>Rounds Won</th>
        <th>Busts</th>
        <th>Busts Caused</th>
        <th>Generous</th>
        <th>Luckiest</th>
      </tr>
    </thead>
    <tbody>
      <!-- Player rows here -->
    </tbody>
  </table>
  <div class="flex flex-wrap gap-2">
    <span class="bg-green-200 text-green-900 rounded px-3 py-1">Winner: Player 2</span>
    <span class="bg-blue-200 text-blue-900 rounded px-3 py-1">Luckiest Flipper: Player 3</span>
    <span class="bg-yellow-200 text-yellow-900 rounded px-3 py-1">Most Generous: Player 1</span>
    <span class="bg-red-200 text-red-900 rounded px-3 py-1">Most Busts: Player 4</span>
  </div>
  <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={onNewGame}>New Game</button>
</div>
```

## Accessibility
- Use semantic table markup
- Use color and icons for awards, but always include text
- Announce winner and awards with ARIA live region

## Stat Calculation Notes
- **Luckiest Flipper:** Track each time a player draws a card with only one possible safe number left (i.e. all other numbers would bust them).
- **Most Generous:** Count action cards given to others.
- **Most Self-Busts:** Count busts from drawing a duplicate number.
- **Most Busts Caused:** Count busts caused by your action cards (e.g. Flip Three, Freeze).
