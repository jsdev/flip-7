import functional from 'eslint-plugin-functional';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['src/lib/**/*.ts', 'src/__tests__/**/*.ts'],
    plugins: {
      functional,
      sonarjs,
      unicorn,
    },
    rules: {
      'functional/immutable-data': ['error', { ignorePattern: ['^draft'] }],
      'functional/no-let': 'error',
      'functional/no-loop-statement': 'error',
      'functional/no-class': 'error',
      'functional/prefer-readonly-type': 'error',
      'functional/no-mixed-type': 'error',
      'functional/no-return-void': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-null': 'error',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 10],
    },
  },
];
