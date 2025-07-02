# InfoPanel Component Design

## Purpose
Display the current player's info, score, turn order, and game status in a clear, accessible, and visually appealing way.

## Props
- `player`: { name, score, isActive, isDealer, ... }
- `turn`: current turn number or player index
- `totalPlayers`: number of players
- `status`: string (e.g. "Your turn", "Waiting", "Busted!", etc)
- (optional) `round`: current round number

## Behavior
- Highlights the active player (bolder, colored border, or background)
- Shows player name (or Player 1, Player 2, etc), score, and status
- Shows turn order visually (e.g. chips, avatars, or a simple list)
- Responsive and accessible (good contrast, readable at a glance)

## Refactoring UI Principles
- Use clear hierarchy: larger, bolder text for the most important info (active player, score)
- Use subtle backgrounds and borders for grouping
- Use color and whitespace to separate sections
- Use icons or badges for status (e.g. a check for "Banked", an alert for "Busted")
- Avoid clutter: only show what's relevant for the current turn

## Example Layout (Tailwind-inspired)
```
<div class="flex flex-col items-center bg-white/80 rounded-lg shadow p-4 mb-4 w-full max-w-sm">
  <div class="flex items-center gap-2 mb-2">
    <span class="font-bold text-lg text-gray-900">Player 1</span>
    <span class="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">Active</span>
    <span class="text-xs bg-gray-200 text-gray-700 rounded px-2 py-0.5">Dealer</span>
  </div>
  <div class="flex items-center gap-4 mb-2">
    <span class="text-2xl font-bold text-green-700">42</span>
    <span class="text-sm text-gray-600">points</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="text-xs text-gray-500">Turn 2 of 4</span>
    <span class="text-xs text-gray-500">Round 1</span>
  </div>
  <div class="mt-2 text-sm text-gray-700">Your turn!</div>
</div>
```

## Accessibility
- Use ARIA roles/labels for status and turn
- Ensure color contrast for all text and backgrounds
- Use semantic HTML for structure
