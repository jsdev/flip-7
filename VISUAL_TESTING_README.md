# Visual Regression Testing Setup for Flip 7

## Overview
We have successfully set up Playwright + Pixelmatch for both visual regression testing and component rendering inspection for the Flip 7 game. This setup allows agents to see what components look like when rendered and enables automated visual diffing.

## What's Been Implemented

### 1. Core Testing Infrastructure
- **Playwright Configuration** (`playwright.config.ts`)
  - Multi-browser testing (Chrome, Firefox, Safari, Mobile)
  - Screenshot comparison with threshold settings
  - Global setup/teardown for dev server management
  - HTML report generation

### 2. Test Suites

#### Visual Regression Tests (`tests/visual.spec.ts`)
- Homepage baseline comparison
- Card showcase dialog testing
- Game board with cards
- Number cards fanning behavior
- Responsive design testing (mobile, tablet, desktop)
- Component rendering tests for isolated components

#### Component Isolation Tests (`tests/component-isolation.spec.ts`)
- Individual component rendering in isolation
- CardComponent with all card types
- Size variations testing
- NumberCardsContainer fanning
- CardShowcase modal dialog
- Controls component states

#### Custom Visual Diffing (`tests/custom-visual.spec.ts`)
- Detailed pixelmatch comparison with custom thresholds
- Game state progression screenshots
- Responsive breakpoint comparison
- Performance and animation capture

### 3. Visual Testing Tools
- **Pixelmatch Integration**: Pixel-level comparison with configurable thresholds
- **PNG.js**: Image processing for baseline/actual/diff generation
- **Screenshot Management**: Automated baseline creation and comparison
- **Cross-browser Support**: Consistent rendering across different browsers

### 4. Test Data Attributes
Added test IDs to key components for reliable element selection:
- `data-testid="game-board"` on main game container
- `data-testid="card-showcase"` on card showcase dialog
- `data-testid="card-showcase-overlay"` on modal overlay
- `data-testid="number-cards-container"` on card fanning container
- `data-card-type` attributes for individual card type identification

### 5. Helper Scripts

#### Visual Test Script (`scripts/visual-test.sh`)
```bash
# Run visual tests
./scripts/visual-test.sh

# Update baseline images
./scripts/visual-test.sh --update-baselines
```

Features:
- Automatic baseline management
- Dependency checking
- Colored output for status reporting
- Test failure investigation guidance

### 6. Package.json Scripts
```json
{
  "test:visual": "./scripts/visual-test.sh",
  "test:visual:update": "./scripts/visual-test.sh --update-baselines",
  "test:playwright": "playwright test",
  "test:playwright:ui": "playwright test --ui",
  "test:components": "playwright test tests/component-isolation.spec.ts",
  "test:custom-visual": "playwright test tests/custom-visual.spec.ts"
}
```

## What Works Now

### ✅ Component Rendering Inspection
- Isolated component rendering for visual inspection by agents
- All card types showcased with labels and descriptions
- Size comparison tests for different component scales
- Cross-browser rendering consistency checks

### ✅ Visual Baseline Creation
Successfully created baseline images for:
- Card components (all types) across 4 browsers
- Card size variations across 4 browsers
- Component isolation tests ready for comparison

### ✅ Pixelmatch Integration
- Custom comparison functions with configurable thresholds
- Automatic diff image generation
- Detailed pixel difference reporting
- Support for both automated and manual visual inspection

## Usage Examples

### For Agents - Component Inspection
```typescript
// Component isolation tests render components in isolation
// so agents can see exactly how they look when rendered
test('CardComponent - all card types', async ({ page }) => {
  // Renders all card types in a grid with labels
  // Creates screenshot at: test-results/component-card-all-types.png
});
```

### For Visual Regression
```typescript
// Automatically compares with baseline
await expect(screenshot).toMatchSnapshot('homepage.png', { 
  threshold: 0.1 
});
```

### For Custom Diffing
```typescript
// Manual pixelmatch comparison with detailed metrics
const comparison = await compareImages(
  actualPath, 
  expectedPath, 
  diffPath, 
  0.1
);
console.log(`Diff: ${comparison.diffPercentage}%`);
```

## File Structure
```
tests/
├── visual.spec.ts              # Main visual regression tests
├── component-isolation.spec.ts # Component rendering tests
├── custom-visual.spec.ts       # Custom pixelmatch utilities
├── global-setup.ts            # Dev server management
├── global-teardown.ts         # Cleanup
└── visual.spec.ts-snapshots/  # Baseline images
    ├── card-components-chromium-linux.png
    ├── card-components-firefox-linux.png
    ├── card-sizes-chromium-linux.png
    └── ...

test-results/                  # Test artifacts
├── visual-*-*/               # Individual test results
│   ├── test-failed-1.png    # Failure screenshots
│   └── video.webm           # Failure videos
└── custom-diffs/            # Custom comparison results
    ├── number-actual.png
    ├── number-expected.png
    └── number-diff.png

scripts/
└── visual-test.sh            # Test runner script
```

## Current Status

### ✅ Successfully Working
1. **Component Isolation Testing** - Agents can see rendered components
2. **Baseline Image Creation** - Reference images for comparison
3. **Pixelmatch Integration** - Custom visual diffing with metrics
4. **Cross-browser Testing** - Consistent rendering verification
5. **Test Infrastructure** - Complete Playwright setup

### 🔧 Pending Issues
1. **Main App Loading** - Full app integration tests need app debugging
2. **Test Reliability** - Some tests timeout due to app state issues

### 🎯 Next Steps
1. Debug main app loading to enable full visual regression suite
2. Add more component isolation tests for complex interactions
3. Integrate visual tests into CI/CD pipeline
4. Add performance testing for animations

## Example Output
The visual testing system generates:
- **HTML Reports**: Interactive test results with screenshots
- **Baseline Images**: Reference screenshots for comparison
- **Diff Images**: Highlighting visual changes with pixelmatch
- **Metrics**: Detailed pixel difference percentages
- **Videos**: Recorded test failures for debugging

This setup provides a comprehensive visual testing framework that can catch visual regressions, verify component rendering, and help agents inspect the actual appearance of UI components.
