import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Include only unit test files, not Playwright tests
    include: ['src/**/*.test.{ts,mts}', 'src/**/*.spec.{ts,mts}'],
    exclude: [
      'tests/**', 
      'node_modules/**'
    ],
    coverage: {
      // Configure coverage reporting
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,mts}',
        'src/**/*.spec.{ts,mts}',
        'src/main.tsx', // Entry point
        'src/cli.ts',   // CLI entry point
        'src/**/*.d.ts'
      ],
      // Threshold configuration
      thresholds: {
        global: {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
