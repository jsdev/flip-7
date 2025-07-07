import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test UI-related code (all tests for now)
    include: ['src/**/*.test.{ts,mts}', 'src/**/*.spec.{ts,mts}'],
    exclude: ['tests/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      reportsDirectory: './coverage-ui',
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/store/**/*.{ts,tsx}',
        'src/app.tsx',
        'src/main.tsx'
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
