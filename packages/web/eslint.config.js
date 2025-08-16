import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import pluginI18next from 'eslint-plugin-i18next';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      '.react-router/**',
      'build/**',
      'storybook-static/**',
      'scripts/**',
      '**/*.stories.{js,jsx,ts,tsx}',
      '**/stories/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      'react-refresh': pluginReactRefresh,
      'i18next': pluginI18next,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'i18next/no-literal-string': [
        'error',
        {
          markupOnly: true,
          ignoreAttribute: ['className', 'style', 'data-testid', 'id', 'type', 'role', 'aria-label'],
          ignore: ['^[A-Z_]+$', '^\\d+$', '^[a-z-]+$'],
        },
      ],
    },
  },
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts', '**/stories/**', 'scripts/**', '**/__stories__/**'],
    rules: {
      'i18next/no-literal-string': 'off',
    },
  },
  {
    files: ['**/features/**'],
    rules: {
      'i18next/no-literal-string': 'error',
    },
  },
]);
