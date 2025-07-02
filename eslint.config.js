import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import preact from 'eslint-plugin-preact';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import functional from 'eslint-plugin-functional';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  // Strict functional/immutable rules for core logic and tests
  {
    files: ['src/lib/**/*.ts', 'src/__tests__/**/*.ts'],
    plugins: {
      functional,
      sonarjs,
      unicorn,
    },
    rules: {
      'functional/immutable-data': ['error', { ignoreIdentifierPattern: '^draft' }],
      'functional/no-let': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-mixed-types': 'error',
      'functional/no-return-void': 'error',
      'functional/prefer-readonly-type': 'error',
      'functional/prefer-property-signatures': 'error',
      'functional/prefer-tacit': 'warn',
      'functional/type-declaration-immutability': 'error',
      'functional/no-classes': 'error',
      'functional/no-class-inheritance': 'error',
      'functional/no-conditional-statements': 'off', // allow if/else for clarity in UI
      'functional/no-expression-statements': 'off', // allow for UI rendering
      'functional/no-promise-reject': 'error',
      'functional/no-this-expressions': 'error',
      'functional/no-throw-statements': 'error',
      'functional/no-try-statements': 'error',
      'functional/functional-parameters': 'error',
      // ...other rules as needed...
      'unicorn/prefer-ternary': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-null': 'error',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 10],
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      preact,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...preact.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Prettier is the only formatting authority:
      'prettier/prettier': 'error',
      // Explicitly disable all formatting rules from other plugins:
      indent: 'off',
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-closing-bracket-location': 'off',
      'react/jsx-closing-tag-location': 'off',
      'react/jsx-curly-spacing': 'off',
      'react/jsx-equals-spacing': 'off',
      'react/jsx-first-prop-new-line': 'off',
      'react/jsx-max-props-per-line': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-props-no-multi-spaces': 'off',
      'react/jsx-tag-spacing': 'off',
      'react/jsx-wrap-multilines': 'off',
      'brace-style': 'off',
      'comma-dangle': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'jsx-quotes': 'off',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // Add more as needed if you see more formatting rules in lint output
    },
    settings: {
      preact: { pragma: 'h' },
    },
  },
];
