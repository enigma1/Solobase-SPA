module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['filenames', 'react-refresh', '@typescript-eslint', 'import'],
  rules: {
    'import/no-cycle': ['error', { maxDepth: 5 }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'filenames/match-regex': [2, '^[a-z0-9-]+$', true],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'typeLike', // includes types, interfaces, enums, etc.
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase', 'UPPER_CASE'],
        prefix: ['is', 'has', 'should', 'can'],
      },
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.tsx', '*.*.tsx'],
      rules: {
        'filenames/match-regex': [2, '^[A-Z][a-zA-Z0-9.]+$', true], // All tsx files
      },
    },
    {
      files: ['*.ts'],
      rules: {
        'filenames/match-regex': [2, '^[a-z0-9-]+$', true], // Keep kebab-case for other TS files
      },
    },
    {
      files: ['*.styled.tsx'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            modifiers: ['const'],
            format: ['PascalCase'],
          },
        ],
      },
    },
  ],
};
