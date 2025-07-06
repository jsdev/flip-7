# Flip 7 - User Experience Design

## Current State Analysis

The current UI uses a rotating player position system where players are anchored to different sides of the screen (bottom, right, top, left) with rotation effects. While visually interesting, this approach has scalability and usability issues.

### Current Issues
1. **Fixed positioning**: Players are anchored to screen edges, limiting layout flexibility
2. **Rotation effects**: Text rotation makes player information harder to read
3. **Space inefficiency**: Large amounts of empty space in the center
4. **Limited scalability**: Difficult to adapt for different screen sizes or player counts
5. **Card stack visualization**: FlipStack component lacks visual depth and card-like appearance

## Proposed New Interface Design

### Core Principles
- **Information clarity**: All text should be readable without rotation
- **Efficient space usage**: Maximize information density while maintaining readability
- **Responsive design**: Work well on mobile, tablet, and desktop
- **Game state visibility**: Clear visual representation of all game elements
- **Accessibility**: Screen reader friendly and keyboard navigable

### Layout Structure

#### 1. Main Game Area (Center)
```
┌─────────────────────────────────────┐
│              Status Bar             │
├─────────────────────────────────────┤
│         Central Game Board          │
│  ┌─────────┐    ┌─────────────────┐ │
│  │  Deck   │    │   Discard Pile  │ │
│  │ (Stack) │    │   (Last Card)   │ │
│  └─────────┘    └─────────────────┘ │
│         Controls & Actions          │
└─────────────────────────────────────┘
```

#### 2. Player Information Panel (Side or Bottom)
Instead of rotating players around the board, create a consolidated player panel showing:

```
Player Name | Cards in Hand | Bonus Cards | Status | Score
──────────────────────────────────────────────────────────
Player 1    | [3][5][7]     | 2nd Chance  | Active | 15
Player 2    | [2][4]        | --          | Banked | 23
Player 3    | [1][6][9][K]  | +2 Mod      | Turn   | 8
Player 4    | --            | --          | Busted | 0
```

### Component Improvements

#### 1. Enhanced Card Stack Component
The deck should look like an actual stack of cards:
- **Multiple card layers**: 3-4 card shadows offset behind the top card
- **Depth effect**: Drop shadows and borders to create 3D appearance
- **Hover states**: Subtle lift effect when hoverable
- **Animation**: Card dealing animation when flipping

```css
/* Proposed card stack styling */
.card-stack {
  position: relative;
  
  /* Base card */
  .card-layer-0 { z-index: 4; }
  
  /* Shadow cards */
  .card-layer-1 { z-index: 3; transform: translate(2px, 2px); opacity: 0.8; }
  .card-layer-2 { z-index: 2; transform: translate(4px, 4px); opacity: 0.6; }
  .card-layer-3 { z-index: 1; transform: translate(6px, 6px); opacity: 0.4; }
}
```

#### 2. Improved Player Cards Display
Each player's cards should be clearly visible:
- **Horizontal card layout**: Cards displayed side by side
- **Card type indicators**: Color coding for number vs action vs modifier cards
- **Quantity indicators**: Show card counts when space is limited
- **Special cards badges**: Clear indicators for Second Chance, bonus cards

#### 3. Game Status & Messaging
Separate status from messages:
- **Status**: Current game phase (e.g., "Player 3's Turn", "Awaiting Action Target")
- **Messages**: Temporary feedback (e.g., "Player 1 survived their Second Chance!", "Flip 7 bonus awarded!")
- **Progress indicators**: Visual cues for multi-step actions (Flip Three progress)

### Responsive Breakpoints

#### Mobile (< 768px)
- Single column layout
- Players list vertically stacked
- Larger touch targets
- Simplified card displays (show counts vs individual cards)

#### Tablet (768px - 1024px)
- Hybrid layout with central board
- Player panel on bottom
- Medium-sized card representations

#### Desktop (> 1024px)
- Full layout with side player panel
- Large card representations
- All information visible simultaneously

### Accessibility Improvements

1. **Screen Reader Support**
   - Descriptive ARIA labels
   - Live regions for game state updates
   - Semantic HTML structure

2. **Keyboard Navigation**
   - Tab order that follows game flow
   - Keyboard shortcuts for common actions
   - Focus indicators

3. **Visual Accessibility**
   - High contrast color schemes
   - Clear typography hierarchy
   - Sufficient color contrast ratios

### Implementation Phases

#### Phase 1: Core Layout Restructure
- [ ] Remove rotating player positions
- [ ] Create new PlayerList component
- [ ] Implement responsive grid layout
- [ ] Update GameBoard to use new layout

#### Phase 2: Enhanced Card Stack
- [ ] Create layered card stack visual effect
- [ ] Add card dealing animations
- [ ] Implement hover and interaction states
- [ ] Add stack count indicators

#### Phase 3: Improved Player Information Display
- [ ] Design compact player card layout
- [ ] Implement bonus cards display
- [ ] Add player status indicators
- [ ] Create responsive player panel

#### Phase 4: Status & Messaging System
- [ ] Separate status from messages in game state
- [ ] Implement message queue system
- [ ] Add progress indicators for multi-step actions
- [ ] Create notification animations

#### Phase 5: Polish & Accessibility
- [ ] Add screen reader support
- [ ] Implement keyboard navigation
- [ ] Add sound effects and haptic feedback
- [ ] Performance optimization

### Design Tokens

#### Colors
```css
:root {
  /* Card colors */
  --card-number: #ffffff;
  --card-modifier: #dbeafe;
  --card-action: #fef3c7;
  --card-bonus: #dcfce7;
  
  /* Player status */
  --status-active: #3b82f6;
  --status-banked: #059669;
  --status-busted: #dc2626;
  --status-waiting: #6b7280;
  
  /* Game elements */
  --deck-primary: #f59e0b;
  --deck-shadow: #92400e;
  --discard-primary: #6b7280;
  --background-primary: #f3f4f6;
}
```

#### Typography
- **Headers**: Inter/System font, 600 weight
- **Body text**: Inter/System font, 400 weight
- **Card labels**: Mono font for consistent spacing
- **Status text**: 500 weight for emphasis

### Success Metrics

1. **Usability**: Players can understand game state at a glance
2. **Accessibility**: Works with screen readers and keyboard navigation
3. **Performance**: Smooth animations on mobile devices
4. **Scalability**: Easy to add new features and player counts
5. **Visual Polish**: Professional, game-like appearance

This design approach prioritizes information clarity and efficient space usage while maintaining the fun, game-like feel of Flip 7.
