import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import { GLOB_EXCLUDE } from "../globs";

export interface IgnoresOptions {
  /**
   * Additional patterns to ignore
   * @default []
   */
  patterns?: string[];

  /**
   * Override default ignores
   * @default false
   */
  override?: boolean;
}

export function defineIgnores(
  options: IgnoresOptions = {}
): Array<FlatConfig.Config> {
  const { patterns = [], override = false } = options;

  const finalIgnores = override
    ? [...patterns]
    : [...GLOB_EXCLUDE, ...patterns];

  return [
    {
      ignores: finalIgnores,
      name: "outslept/ignores",
    },
  ];
}
