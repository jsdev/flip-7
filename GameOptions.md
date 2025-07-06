# Game Options Configuration

Flip 7 supports several configurable options that affect gameplay behavior. These options are shared between the CLI and web UI versions of the game.

## Available Options

### `passingEnabled: boolean`
- **Default:** `true`
- **Description:** Whether players can pass during choice points instead of being forced to make a decision
- **Impact:** When enabled, players have more strategic control and can choose to skip certain decisions

### `defaultFlipCount: number`
- **Default:** `1`
- **Description:** The number of card flips each player gets per turn
- **Impact:** Higher values allow players to draw multiple cards per turn, increasing both risk and reward potential

### `showOddsOfBust: boolean`
- **Default:** `true`
- **Description:** Whether to display the probability of busting (drawing a duplicate number) to the current player
- **Impact:** When enabled, helps players make informed decisions by showing mathematical odds

## Configuration Locations

### Web UI
Game options are configured in the shared game logic at `src/lib/gameLogic.ts`:

```typescript
export const DEFAULT_GAME_OPTIONS: GameOptions = {
  passingEnabled: true,
  defaultFlipCount: 1,
  showOddsOfBust: true,
};
```

### CLI
The CLI uses the same default options and can be modified by editing the `DEFAULT_GAME_OPTIONS` constant.

## Usage Examples

### Conservative Play (Beginner-Friendly)
```typescript
{
  passingEnabled: true,    // Allow passing for safer play
  defaultFlipCount: 1,     // Standard one flip per turn
  showOddsOfBust: true,    // Show odds to help learning
}
```

### Aggressive Play (Advanced)
```typescript
{
  passingEnabled: false,   // Force decisions for faster gameplay
  defaultFlipCount: 2,     // Multiple flips increase risk/reward
  showOddsOfBust: false,   // Hide odds for pure intuition play
}
```

### Teaching Mode
```typescript
{
  passingEnabled: true,    // Allow passes to discuss strategy
  defaultFlipCount: 1,     // Keep it simple
  showOddsOfBust: true,    // Educational probability display
}
```

## Implementation Notes

- All options are immutable and passed through the game state
- Changing options requires restarting the game
- Options affect both game logic and UI display elements
- The same options structure is used across CLI and web platforms for consistency
