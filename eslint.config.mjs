// @ts-check
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  // ── Ignores ────────────────────────────────────────────────────────────────
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/prisma/migrations/**',
      '**/vite.config.ts',
      '**/tailwind.config.ts',
    ],
  },

  // ── TypeScript — all packages ───────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Core — no any
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Unused vars — allow underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Allow non-null assertions with a warning — controllers know req.user is set
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // withAuth() uses `as unknown as RequestHandler` — documented cast, allowed
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],

      // Prefer nullish coalescing
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // No floating promises
      '@typescript-eslint/no-floating-promises': 'error',

      // Allow async functions as Express handlers and JSX event attributes (return Promise<void>, expected void)
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false, attributes: false } }],

      // Allow shorthand arrow functions returning void — standard React pattern (onChange={(e) => setState(e.target.value)))
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],

      // Allow numbers in template literals — common and safe
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // unbound-method: off for controllers (arrow function properties don't have this issue;
      // method shorthands are wrapped via withAuth)
      '@typescript-eslint/unbound-method': 'off',

      // Explicit return types on module-level functions
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // ── React — dashboard + storefront ─────────────────────────────────────
  {
    files: ['apps/dashboard/**/*.{ts,tsx}', 'apps/storefront/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: { react: { version: 'detect' } },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // ── Node.js — API + packages ────────────────────────────────────────────
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
)
