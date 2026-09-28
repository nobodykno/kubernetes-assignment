import { defineConfig } from 'eslint/config';

import tseslint from 'typescript-eslint';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';

export default defineConfig([
  {
    files: ['src/**/*.ts'],

    extends: [tseslint.configs.recommendedTypeChecked],

    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // Don't allow relative imports
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: false,
          prefix: '@',
        },
      ],

      // TypeScript rules
      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
    },
  },
]);