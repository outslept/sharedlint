/**
 * @type {import('prettier').Options}
 * @see https://prettier.io/docs/en/options.html
 */
const prettierConfig = {
  /**
   * Some of Prettier's defaults can be overridden by an EditorConfig file. We
   * define those here to ensure that doesn't happen.
   *
   * @see https://github.com/prettier/prettier/blob/main/docs/configuration.md#editorconfig
   */
  endOfLine: 'lf',
  tabWidth: 2,
  printWidth: 120,
  useTabs: false,

  singleQuote: true,

  trailingComma: 'es5',
  semi: true,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'css',

  embeddedLanguageFormatting: 'auto',
  proseWrap: 'preserve',
  quoteProps: 'as-needed',

  plugins: ['prettier-plugin-packagejson'],
}

export default prettierConfig
