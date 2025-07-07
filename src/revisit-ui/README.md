# Archived UI Components

This folder contains React/Preact components that were identified as unused during spring cleaning on January 7, 2025.

These components have been renamed to `.txt` files so they:
- Are not included in builds or code coverage
- Are not scanned by TypeScript
- Are preserved for potential future reference

## Archived Components:

- **ActionQueue.tsx.txt** - Component for displaying action cards in a queue
- **ActionReceiver.tsx.txt** - Action receiver component (was only used by PlayerComposition)
- **BonusCardsContainer.tsx.txt** - Container for bonus card functionality  
- **FlipStackNew.tsx.txt** - Alternative implementation of flip stack
- **FlipStackOld.tsx.txt** - Legacy flip stack implementation
- **InfoPanel.tsx.txt** - Information panel component
- **PlayerComposition.tsx.txt** - Player layout component (imports ActionReceiver and PlayerHand)
- **PlayerHand.tsx.txt** - Player hand component (was only used by PlayerComposition)
- **TallyBoard.tsx.txt** - Score tallying component

## How to Restore:

If you need to restore any of these components:

1. Rename the file back to `.tsx`
2. Move it back to `src/components/`
3. Install any missing dependencies
4. Update imports in other files as needed

## Analysis Results:

These components were identified as unused through static analysis on January 7, 2025:
- No imports found in the codebase
- No JSX usage found
- No references in tests or configuration files

Total components analyzed: 21
- Used: 11 (52%)
- Archived: 9 (43%)
- Documentation files: 1 (.md files and .svg assets)

This represents a significant cleanup of ~43% of the component directory.
