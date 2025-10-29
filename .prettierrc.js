/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  jsxSingleQuote: false,
  bracketSameLine: false,
  quoteProps: 'consistent',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',

  overrides: [
    {
      files: ['app.config.ts', '*.config.ts'],
      options: {
        parser: 'typescript',
      },
    },
    {
      files: ['app.config.js'],
      options: {
        parser: 'babel',
      },
    },
    {
      files: ['*.md'],
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
};
