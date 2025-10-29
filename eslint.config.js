const eslintPluginReact = require('eslint-plugin-react');
const parser = require('@typescript-eslint/parser');
const eslintPluginTypescript = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      'react': eslintPluginReact,
      '@typescript-eslint': eslintPluginTypescript,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
