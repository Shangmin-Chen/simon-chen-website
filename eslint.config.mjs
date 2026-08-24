import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    ignores: ['build/', 'gallery-dist/', 'dist/', '.wrangler/'],
  },

  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx}'],
    ...react.configs.flat.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      // Browser globals cover the SPA; `caches` also covers the Cloudflare
      // Workers runtime used by src/worker.js (fetch, Request, Response,
      // URL are already standard browser globals).
      globals: {
        ...globals.browser,
        caches: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      // React 19 + Vite use the automatic JSX runtime.
      'react/react-in-jsx-scope': 'off',
      // JS-only codebase without PropTypes; type shape is documented at call sites.
      'react/prop-types': 'off',
    },
  },

  {
    files: ['src/**/*.{js,jsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
  },

  {
    // Build/dev tooling runs in Node.
    files: ['scripts/**/*.{js,mjs,cjs}', '*.config.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
