import { test, expect } from '@playwright/test';
import { join } from 'path';
import { readFileSync } from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const VISUAL_THRESHOLD = 0.2; // 20% difference threshold

test.describe('Visual Regression Tests', () => {
  test('homepage matches baseline', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175');
    
    // Wait for the game to load
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    // Compare with baseline (or create baseline if it doesn't exist)
    await expect(screenshot).toMatchSnapshot('homepage.png', { threshold: VISUAL_THRESHOLD });
  });

  test('card showcase dialog', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Open card showcase
    await page.click('button:has-text("View Cards")');
    await page.waitForSelector('[data-testid="card-showcase"]');
    
    // Take screenshot of the dialog
    const dialog = page.locator('[data-testid="card-showcase"]');
    const screenshot = await dialog.screenshot({
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('card-showcase.png', { threshold: VISUAL_THRESHOLD });
  });

  test('game board with cards', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Start the game and flip a few cards
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(500);
    
    // Flip some cards to get a populated game state
    await page.click('button:has-text("Flip")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Flip")');
    await page.waitForTimeout(300);
    
    // Take screenshot of the game board
    const gameBoard = page.locator('[data-testid="game-board"]');
    const screenshot = await gameBoard.screenshot({
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('game-board-with-cards.png', { threshold: VISUAL_THRESHOLD });
  });

  test('number cards container fanning', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Start game and get some cards
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(500);
    
    // Flip multiple cards to see fanning effect
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Flip")');
      await page.waitForTimeout(200);
    }
    
    // Screenshot the number cards container
    const cardsContainer = page.locator('[data-testid="number-cards-container"]');
    if (await cardsContainer.count() > 0) {
      const screenshot = await cardsContainer.screenshot({
        animations: 'disabled'
      });
      
      await expect(screenshot).toMatchSnapshot('number-cards-fanning.png', { threshold: VISUAL_THRESHOLD });
    }
  });
});

test.describe('Component Rendering Tests', () => {
  test('card component renders all types correctly', async ({ page }) => {
    // Create a simple test page for isolated component testing
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Card Component Test</title>
      <script type="module">
        import { render } from '/src/main.tsx';
        // We'll create a test component
      </script>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 20px; }
      </style>
    </head>
    <body>
      <div id="test-cards"></div>
      <script type="module">
        import { CardComponent } from '/src/components/CardComponent.tsx';
        import { render } from 'preact';
        
        const testCards = [
          { type: 'number', value: 1 },
          { type: 'number', value: 7 },
          { type: 'modifier', value: 2 },
          { type: 'modifier', value: 'X2' },
          { type: 'action', value: 'Freeze' },
          { type: 'action', value: 'Flip Three' },
          { type: 'action', value: 'Second Chance' }
        ];
        
        const TestGrid = () => (
          <div class="card-grid">
            {testCards.map((card, i) => (
              <CardComponent key={i} card={card} size="medium" />
            ))}
          </div>
        );
        
        render(<TestGrid />, document.getElementById('test-cards'));
      </script>
    </body>
    </html>
    `;
    
    // Set content and take screenshot
    await page.setContent(testHtml);
    await page.waitForTimeout(1000); // Wait for components to render
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('card-components.png', { threshold: VISUAL_THRESHOLD });
  });

  test('card sizes comparison', async ({ page }) => {
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Card Sizes Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .size-section { margin: 20px 0; }
        .size-label { font-weight: bold; margin-bottom: 10px; }
        .cards-row { display: flex; gap: 15px; align-items: center; }
      </style>
    </head>
    <body>
      <div id="size-test"></div>
      <script type="module">
        import { CardComponent } from '/src/components/CardComponent.tsx';
        import { render } from 'preact';
        
        const testCard = { type: 'number', value: 7 };
        const sizes = ['small', 'medium', 'large'];
        
        const SizeTest = () => (
          <div>
            {sizes.map(size => (
              <div key={size} class="size-section">
                <div class="size-label">Size: {size}</div>
                <div class="cards-row">
                  <CardComponent card={testCard} size={size} />
                  <CardComponent card={{ type: 'modifier', value: 'X2' }} size={size} />
                  <CardComponent card={{ type: 'action', value: 'Freeze' }} size={size} />
                </div>
              </div>
            ))}
          </div>
        );
        
        render(<SizeTest />, document.getElementById('size-test'));
      </script>
    </body>
    </html>
    `;
    
    await page.setContent(testHtml);
    await page.waitForTimeout(1000);
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('card-sizes.png', { threshold: VISUAL_THRESHOLD });
  });
});

test.describe('Layout Tests', () => {
  test('responsive design - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('mobile-layout.png', { threshold: VISUAL_THRESHOLD });
  });

  test('responsive design - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('tablet-layout.png', { threshold: VISUAL_THRESHOLD });
  });

  test('responsive design - desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('desktop-layout.png', { threshold: VISUAL_THRESHOLD });
  });
});
