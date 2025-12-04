const eslintPluginReact = require('eslint-plugin-react');
const parser = require('@typescript-eslint/parser');
const eslintPluginTypescript = require('@typescript-eslint/eslint-plugin');
let eslintPluginReactHooks;
try {
  // Optional: only used if installed in this environment
  eslintPluginReactHooks = require('eslint-plugin-react-hooks');
} catch {
  eslintPluginReactHooks = undefined;
}

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins:
      eslintPluginReactHooks != null
        ? {
            'react': eslintPluginReact,
            'react-hooks': eslintPluginReactHooks,
            '@typescript-eslint': eslintPluginTypescript,
          }
        : {
            'react': eslintPluginReact,
            '@typescript-eslint': eslintPluginTypescript,
          },
    rules: {
      /** 🧹 General Clean Code Rules **/
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',

      /** TypeScript Rules **/
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      // These are very strict and generate many errors in existing React Native code.
      // Keep them as warnings so they guide new code without breaking the build.
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],

      /** React + JSX Rules **/
      'react/jsx-boolean-value': ['warn', 'never'],
      // Helpful but non-blocking – use as warning while gradually fixing existing lists.
      'react/jsx-key': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/self-closing-comp': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': 'error',
      'react/react-in-jsx-scope': 'off',

      /** 🪝 React Hooks Rules **/
      ...(eslintPluginReactHooks
        ? {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
          }
        : {}),

      /** Stylistic Consistency (Prettier overlap is okay) **/
      'react/jsx-curly-spacing': ['warn', { when: 'never', children: true }],
      'react/jsx-tag-spacing': ['warn', { beforeSelfClosing: 'always' }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
