import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import { pluginComments } from "../plugins";

export interface CommentsConfig {
  /**
   * Override default rules
   * @example { 'eslint-comments/no-unlimited-disable': 'warn' }
   */
  overrides?: Partial<typeof pluginComments.rules>;
}

export function defineComments(
  options: CommentsConfig = {}
): FlatConfig.Config[] {
  const baseRules = {
    "eslint-comments/no-aggregating-enable": "error",
    "eslint-comments/no-duplicate-disable": "error",
    "eslint-comments/no-unlimited-disable": "error",
    "eslint-comments/no-unused-enable": "error",
  };

  return [
    {
      name: "antfu/eslint-comments/rules",
      plugins: {
        "eslint-comments": pluginComments,
      },
      rules: {
        ...baseRules,
        ...(options.overrides || {}),
      },
    },
  ];
}
