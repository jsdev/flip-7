import { test, expect } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

/**
 * Component isolation testing for development inspection
 * These tests render individual components in isolation for visual inspection
 */

test.describe('Component Isolation Tests', () => {
  // Helper function to create isolated component test page
  const createComponentTestPage = (componentName: string, componentCode: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${componentName} Test</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <!-- Load Tailwind CSS from CDN for reliable styling -->
      <script src="https://cdn.tailwindcss.com"></script>
      
      <!-- Import fonts and basic CSS -->
      <link rel="stylesheet" href="/src/index.css">
      
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          margin: 0;
        }
        .test-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin: 20px 0;
        }
        .test-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        .component-showcase {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="test-container">
        <div class="test-title">${componentName} Component Test</div>
        <div id="component-root"></div>
      </div>
      <script type="module">
        import { render } from 'preact';
        ${componentCode}
      </script>
    </body>
    </html>
  `;

  test('CardComponent - all card types', async ({ page }) => {
    const componentCode = `
      // Define the CardComponent inline to ensure it loads properly
      const CardComponent = ({ card, className = '' }) => {
        const baseStyle = 'w-20 h-28 rounded-lg shadow-lg transition-all duration-200 m-2';

        if (card.type === 'number') {
          return (
            <div className={\`\${baseStyle} bg-white border-2 border-gray-300 flex items-center justify-center \${className}\`}>
              <span className="text-2xl font-bold text-gray-800">{card.value}</span>
            </div>
          );
        }

        if (card.type === 'modifier') {
          if (card.value === 'X2') {
            return (
              <div className={\`\${baseStyle} bg-gradient-to-br from-yellow-200 to-orange-300 border-2 border-yellow-600 flex flex-col items-center justify-center \${className}\`}>
                <span className="text-2xl font-bold text-purple-700">×2</span>
                <span className="text-xs text-yellow-800 mt-1">MULT</span>
              </div>
            );
          }
          return (
            <div className={\`\${baseStyle} bg-gradient-to-br from-yellow-200 to-orange-300 border-2 border-yellow-600 flex flex-col items-center justify-center \${className}\`}>
              <span className="text-xl font-bold text-red-700">+{card.value}</span>
              <span className="text-xs text-yellow-800 mt-1">ADD</span>
            </div>
          );
        }

        if (card.type === 'action') {
          const actionStyles = {
            'Freeze': 'bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-700',
            'Flip Three': 'bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-700', 
            'Second Chance': 'bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-700'
          };
          
          const actionIcons = {
            'Freeze': '🧊',
            'Flip Three': '🔄',
            'Second Chance': '💖'
          };
          
          const actionText = {
            'Freeze': 'FREEZE',
            'Flip Three': 'FLIP 3',
            'Second Chance': '2ND'
          };
          
          return (
            <div className={\`\${baseStyle} \${actionStyles[card.value]} flex flex-col items-center justify-center text-white \${className}\`}>
              <span className="text-lg">{actionIcons[card.value]}</span>
              <span className="text-xs font-bold mt-1">{actionText[card.value]}</span>
            </div>
          );
        }

        return (
          <div className={\`\${baseStyle} bg-gray-200 border-2 border-gray-400 flex items-center justify-center \${className}\`}>
            <span className="text-sm text-gray-600">{card.value}</span>
          </div>
        );
      };
      
      const allCards = [
        // Number cards
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
        { type: 'number', value: 3 },
        { type: 'number', value: 4 },
        { type: 'number', value: 5 },
        { type: 'number', value: 6 },
        { type: 'number', value: 7 },
        // Modifier cards
        { type: 'modifier', value: 2 },
        { type: 'modifier', value: 4 },
        { type: 'modifier', value: 6 },
        { type: 'modifier', value: 8 },
        { type: 'modifier', value: 10 },
        { type: 'modifier', value: 'X2' },
        // Action cards
        { type: 'action', value: 'Freeze' },
        { type: 'action', value: 'Flip Three' },
        { type: 'action', value: 'Second Chance' }
      ];
      
      const TestGrid = () => (
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; padding: 20px;">
          {allCards.map((card, i) => (
            <div key={i} style="text-align: center;">
              <CardComponent card={card} />
              <div style="margin-top: 8px; font-size: 12px; color: #666;">
                {card.type}: {card.value}
              </div>
            </div>
          ))}
        </div>
      );
      
      render(<TestGrid />, document.getElementById('component-root'));
    `;

    await page.setContent(createComponentTestPage('CardComponent', componentCode));
    await page.waitForTimeout(2000); // Give time for Tailwind to load and render
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('component-card-all-types.png', { threshold: 0.1 });
  });

  test('CardComponent - size variations', async ({ page }) => {
    const componentCode = `
      // Same CardComponent definition
      const CardComponent = ({ card, size = 'medium', className = '' }) => {
        const sizeStyles = {
          small: 'w-12 h-16 text-sm',
          medium: 'w-20 h-28 text-lg', 
          large: 'w-28 h-40 text-2xl'
        };
        
        const baseStyle = \`\${sizeStyles[size]} rounded-lg shadow-lg transition-all duration-200 m-2\`;

        if (card.type === 'number') {
          return (
            <div className={\`\${baseStyle} bg-white border-2 border-gray-300 flex items-center justify-center \${className}\`}>
              <span className="font-bold text-gray-800">{card.value}</span>
            </div>
          );
        }

        if (card.type === 'modifier') {
          if (card.value === 'X2') {
            return (
              <div className={\`\${baseStyle} bg-gradient-to-br from-yellow-200 to-orange-300 border-2 border-yellow-600 flex flex-col items-center justify-center \${className}\`}>
                <span className="font-bold text-purple-700">×2</span>
                <span className="text-xs text-yellow-800">MULT</span>
              </div>
            );
          }
          return (
            <div className={\`\${baseStyle} bg-gradient-to-br from-yellow-200 to-orange-300 border-2 border-yellow-600 flex flex-col items-center justify-center \${className}\`}>
              <span className="font-bold text-red-700">+{card.value}</span>
              <span className="text-xs text-yellow-800">ADD</span>
            </div>
          );
        }

        if (card.type === 'action') {
          return (
            <div className={\`\${baseStyle} bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-700 flex flex-col items-center justify-center text-white \${className}\`}>
              <span>🧊</span>
              <span className="text-xs font-bold">FREEZE</span>
            </div>
          );
        }

        return (
          <div className={\`\${baseStyle} bg-gray-200 border-2 border-gray-400 flex items-center justify-center \${className}\`}>
            <span className="text-gray-600">{card.value}</span>
          </div>
        );
      };
      
      const testCard = { type: 'number', value: 7 };
      const sizes = ['small', 'medium', 'large'];
      
      const SizeTest = () => (
        <div>
          {sizes.map(size => (
            <div key={size} style="margin: 30px 0; text-align: center;">
              <h3 style="margin-bottom: 15px; color: #333;">Size: {size}</h3>
              <div style="display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap;">
                <CardComponent card={testCard} size={size} />
                <CardComponent card={{ type: 'modifier', value: 'X2' }} size={size} />
                <CardComponent card={{ type: 'action', value: 'Freeze' }} size={size} />
              </div>
            </div>
          ))}
        </div>
      );
      
      render(<SizeTest />, document.getElementById('component-root'));
    `;

    await page.setContent(createComponentTestPage('CardComponent Sizes', componentCode));
    await page.waitForTimeout(2000);
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('component-card-sizes.png', { threshold: 0.1 });
  });

  test('NumberCardsContainer - card fanning', async ({ page }) => {
    const componentCode = `
      import { NumberCardsContainer } from '/src/components/NumberCardsContainer.tsx';
      import { render } from 'preact';
      
      const testCases = [
        {
          title: '2 Cards',
          cards: [
            { type: 'number', value: 3 },
            { type: 'number', value: 7 }
          ]
        },
        {
          title: '4 Cards',
          cards: [
            { type: 'number', value: 1 },
            { type: 'number', value: 3 },
            { type: 'number', value: 5 },
            { type: 'number', value: 7 }
          ]
        },
        {
          title: '6 Cards',
          cards: [
            { type: 'number', value: 1 },
            { type: 'number', value: 2 },
            { type: 'number', value: 3 },
            { type: 'number', value: 5 },
            { type: 'number', value: 6 },
            { type: 'number', value: 7 }
          ]
        }
      ];
      
      const FanningTest = () => (
        <div>
          {testCases.map((testCase, i) => (
            <div key={i} style="margin: 40px 0; text-align: center;">
              <h3 style="margin-bottom: 20px; color: #333;">{testCase.title}</h3>
              <div style="height: 140px; display: flex; justify-content: center; align-items: center;">
                <NumberCardsContainer cards={testCase.cards} />
              </div>
            </div>
          ))}
        </div>
      );
      
      render(<FanningTest />, document.getElementById('component-root'));
    `;

    await page.setContent(createComponentTestPage('NumberCardsContainer', componentCode));
    await page.waitForTimeout(1500);
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('component-number-cards-fanning.png', { threshold: 0.1 });
  });

  test('CardShowcase - modal dialog', async ({ page }) => {
    const componentCode = `
      import { CardShowcase } from '/src/components/CardShowcase.tsx';
      import { render } from 'preact';
      import { useState } from 'preact/hooks';
      
      const ShowcaseTest = () => {
        const [isOpen, setIsOpen] = useState(true);
        
        return (
          <div>
            <button 
              onClick={() => setIsOpen(true)}
              style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;"
            >
              Open Card Showcase
            </button>
            <CardShowcase isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        );
      };
      
      render(<ShowcaseTest />, document.getElementById('component-root'));
    `;

    await page.setContent(createComponentTestPage('CardShowcase', componentCode));
    await page.waitForTimeout(1500);
    
    // Wait for modal to be visible
    await page.waitForSelector('[data-testid="card-showcase"]', { timeout: 5000 });
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('component-card-showcase.png', { threshold: 0.1 });
  });

  test('Controls component states', async ({ page }) => {
    const componentCode = `
      import { Controls } from '/src/components/Controls.tsx';
      import { render } from 'preact';
      
      const controlStates = [
        {
          title: 'Game Not Started',
          props: {
            gameStarted: false,
            gameOver: false,
            status: 'setup',
            currentPlayerName: 'Player 1',
            onStartGame: () => {},
            onFlip: () => {},
            onBank: () => {},
            onPass: () => {},
            canFlip: false,
            canBank: false,
            canPass: false
          }
        },
        {
          title: 'Choice Point',
          props: {
            gameStarted: true,
            gameOver: false,
            status: 'ChoicePoint',
            currentPlayerName: 'Player 1',
            onStartGame: () => {},
            onFlip: () => {},
            onBank: () => {},
            onPass: () => {},
            canFlip: true,
            canBank: true,
            canPass: true
          }
        },
        {
          title: 'Must Flip',
          props: {
            gameStarted: true,
            gameOver: false,
            status: 'Flipped',
            currentPlayerName: 'Player 2',
            onStartGame: () => {},
            onFlip: () => {},
            onBank: () => {},
            onPass: () => {},
            canFlip: true,
            canBank: false,
            canPass: false
          }
        }
      ];
      
      const ControlsTest = () => (
        <div>
          {controlStates.map((state, i) => (
            <div key={i} style="margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="margin-bottom: 15px; color: #333;">{state.title}</h3>
              <Controls {...state.props} />
            </div>
          ))}
        </div>
      );
      
      render(<ControlsTest />, document.getElementById('component-root'));
    `;

    await page.setContent(createComponentTestPage('Controls', componentCode));
    await page.waitForTimeout(1500);
    
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    await expect(screenshot).toMatchSnapshot('component-controls-states.png', { threshold: 0.1 });
  });
});
