import { test, expect } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

/**
 * Utility functions for custom visual diffing with pixelmatch
 */

// Helper function to compare images with pixelmatch
export async function compareImages(
  actualPath: string,
  expectedPath: string,
  diffPath: string,
  threshold: number = 0.1
): Promise<{ diffPixels: number; totalPixels: number; diffPercentage: number }> {
  const actual = PNG.sync.read(fs.readFileSync(actualPath));
  const expected = PNG.sync.read(fs.readFileSync(expectedPath));
  
  const { width, height } = actual;
  const totalPixels = width * height;
  
  // Create diff image
  const diff = new PNG({ width, height });
  
  const diffPixels = pixelmatch(
    actual.data,
    expected.data,
    diff.data,
    width,
    height,
    { threshold }
  );
  
  // Save diff image
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  
  const diffPercentage = (diffPixels / totalPixels) * 100;
  
  return { diffPixels, totalPixels, diffPercentage };
}

// Custom test for detailed visual inspection
test.describe('Custom Visual Diff Tests', () => {
  test('detailed card component comparison', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Open card showcase for detailed comparison
    await page.click('button:has-text("View Cards")');
    await page.waitForSelector('[data-testid="card-showcase"]');
    
    // Take screenshot of specific card types
    const cardTypes = ['number', 'modifier', 'action'];
    
    for (const cardType of cardTypes) {
      const cardElement = page.locator(`[data-card-type="${cardType}"]`).first();
      
      if (await cardElement.count() > 0) {
        const screenshot = await cardElement.screenshot({
          animations: 'disabled'
        });
        
        // Create custom comparison
        const testResultsDir = 'test-results/custom-diffs';
        if (!fs.existsSync(testResultsDir)) {
          fs.mkdirSync(testResultsDir, { recursive: true });
        }
        
        const actualPath = path.join(testResultsDir, `${cardType}-actual.png`);
        const expectedPath = path.join(testResultsDir, `${cardType}-expected.png`);
        const diffPath = path.join(testResultsDir, `${cardType}-diff.png`);
        
        fs.writeFileSync(actualPath, screenshot);
        
        // If expected image exists, compare it
        if (fs.existsSync(expectedPath)) {
          const comparison = await compareImages(actualPath, expectedPath, diffPath, 0.1);
          
          console.log(`${cardType} card comparison:`, {
            diffPixels: comparison.diffPixels,
            totalPixels: comparison.totalPixels,
            diffPercentage: comparison.diffPercentage.toFixed(2) + '%'
          });
          
          // Fail test if difference is too large
          expect(comparison.diffPercentage).toBeLessThan(5); // 5% threshold
        } else {
          // Create baseline
          fs.copyFileSync(actualPath, expectedPath);
          console.log(`Created baseline for ${cardType} card`);
        }
      }
    }
    
    // Close dialog
    await page.click('[data-testid="card-showcase"] button:has-text("Close")');
  });

  test('game state progression screenshots', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    const testResultsDir = 'test-results/game-progression';
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    // Initial state
    let screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    fs.writeFileSync(path.join(testResultsDir, '01-initial-state.png'), screenshot);
    
    // Start game
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(500);
    screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    fs.writeFileSync(path.join(testResultsDir, '02-game-started.png'), screenshot);
    
    // Flip some cards
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Flip")');
      await page.waitForTimeout(300);
      screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
      fs.writeFileSync(path.join(testResultsDir, `03-after-flip-${i + 1}.png`), screenshot);
    }
    
    // Try to bank if possible
    const bankButton = page.locator('button:has-text("Bank")');
    if (await bankButton.isEnabled()) {
      await bankButton.click();
      await page.waitForTimeout(500);
      screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
      fs.writeFileSync(path.join(testResultsDir, '04-after-bank.png'), screenshot);
    }
    
    console.log('Game progression screenshots saved to:', testResultsDir);
  });

  test('responsive breakpoint comparison', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large', width: 1920, height: 1080 }
    ];
    
    const testResultsDir = 'test-results/responsive';
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto('http://localhost:5175');
      await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
      
      // Start game to see layout with cards
      await page.click('button:has-text("Start Game")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Flip")');
      await page.waitForTimeout(300);
      
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled'
      });
      
      fs.writeFileSync(
        path.join(testResultsDir, `${breakpoint.name}-${breakpoint.width}x${breakpoint.height}.png`),
        screenshot
      );
    }
    
    console.log('Responsive screenshots saved to:', testResultsDir);
  });
});

test.describe('Performance Visual Tests', () => {
  test('animation performance capture', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    
    // Start video recording for animation analysis
    const context = page.context();
    await context.tracing.start({ 
      screenshots: true, 
      snapshots: true, 
      sources: true 
    });
    
    // Perform actions that trigger animations
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(500);
    
    // Rapid card flipping to test animation performance
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Flip")');
      await page.waitForTimeout(200);
    }
    
    // Open and close card showcase
    await page.click('button:has-text("View Cards")');
    await page.waitForTimeout(500);
    await page.click('[data-testid="card-showcase"] button:has-text("Close")');
    
    // Stop tracing
    await context.tracing.stop({ path: 'test-results/animation-trace.zip' });
    
    console.log('Animation performance trace saved to: test-results/animation-trace.zip');
  });
});
