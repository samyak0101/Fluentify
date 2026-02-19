import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore generated and vendor files
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
  },

  // TypeScript + React source files
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // TypeScript handles unused vars via noUnusedLocals — don't double-report
      '@typescript-eslint/no-unused-vars': 'off',
      // Chrome extension code frequently uses `any` in message handlers / chrome API
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow non-null assertions — common in DOM manipulation
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Console usage is fine in background/content scripts
      'no-console': 'off',
    },
  },
);
