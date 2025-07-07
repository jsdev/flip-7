import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test only CLI-related logic
    include: [
      'src/__tests__/gameLogic.helpers.test.mts',
      'src/__tests__/gameLogic.test.mts', 
      'src/__tests__/deck.test.mts'
    ],
    exclude: ['tests/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      reportsDirectory: './coverage-cli',
      include: [
        'src/lib/**/*.{ts,tsx}', // Core game logic
        'src/types.ts'
      ],
      exclude: [
        'src/**/*.test.{ts,mts}',
        'src/**/*.spec.{ts,mts}',
        'src/**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
