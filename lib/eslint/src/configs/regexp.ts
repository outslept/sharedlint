import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import { pluginRegexp } from "../plugins";

export interface RegexpConfigOptions {
  /**
   * Enable strict rules beyond recommended (default: false)
   * @default false
   */
  strict?: boolean;
}

export function defineRegexp(
  options: RegexpConfigOptions = {}
): FlatConfig.Config[] {
  const strictRules: Record<string, string | Record<string, unknown>> =
    options.strict
      ? {
          /**
           * Disallow elements that contradict assertions
           * 💡 Manually fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-contradiction-with-assertion.html
           */
          "regexp/no-contradiction-with-assertion": "error",

          /**
           * Disallow control characters
           * 💡 Manually fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-control-character.html
           */
          "regexp/no-control-character": "error",

          /**
           * Disallow confusing quantifiers
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/confusing-quantifier.html
           */
          "regexp/confusing-quantifier": "error",

          /**
           * Enforce negation escapes
           * 🔧 Fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/negation.html
           */
          "regexp/negation": "error",

          /**
           * Disallow standalone backslashes
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-standalone-backslash.html
           */
          "regexp/no-standalone-backslash": "error",

          /**
           * Disallow trivially nested assertions
           * 🔧 Fixable - https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-trivially-nested-assertion.html
           */
          "regexp/no-trivially-nested-assertion": "error",

          /**
           * Optimize lookaround quantifiers
           * 💡 Manually fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/optimal-lookaround-quantifier.html
           */
          "regexp/optimal-lookaround-quantifier": "error",

          /**
           * Enforce optimal quantifier concatenation
           * 🔧 Fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/optimal-quantifier-concatenation.html
           */
          "regexp/optimal-quantifier-concatenation": "error",

          /**
           * Enforce grapheme string literals
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/grapheme-string-literal.html
           */
          "regexp/grapheme-string-literal": "error",

          /**
           * Enforce consistent letter case
           * 🔧 Fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/letter-case.html
           */
          "regexp/letter-case": "error",

          /**
           * Enforce match any character style
           * 🔧 Fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/match-any.html
           */
          "regexp/match-any": "error",

          /**
           * Sort character class elements
           * 🔧 Fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/sort-character-class-elements.html
           */
          "regexp/sort-character-class-elements": "error",

          /**
           * Sort regex flags
           * 🔧 Fixable
           * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/sort-flags.html
           */
          "regexp/sort-flags": "error",
        }
      : {};

  return [
    {
      name: "outslept/regexp/config",
      plugins: { regexp: pluginRegexp },
      rules: {
        // Base recommended rules from plugin
        ...(pluginRegexp.configs?.recommended.rules as Record<string, unknown>),

        // Additional strict rules
        ...strictRules,

        /**
         * Disallow legacy RegExp features
         * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-legacy-features.html
         */
        "regexp/no-legacy-features": "error",

        /**
         * Enforce unicode regexp
         * 🔧 Fixable
         * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/require-unicode-regexp.html
         */
        "regexp/require-unicode-regexp": "error",

        /**
         * Prefer named capture groups
         * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-named-capture-group.html
         */
        "regexp/prefer-named-capture-group": "warn",
      },
    },
  ];
}
