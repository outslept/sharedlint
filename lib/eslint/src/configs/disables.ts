import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import { GLOB_SRC, GLOB_SRC_EXT } from "../globs";

interface DisablesOverrides {
  scripts?: {
    files?: string[];
    rules?: Record<string, string>;
  };
  cli?: {
    files?: string[];
    rules?: Record<string, string>;
  };
  bin?: {
    files?: string[];
    rules?: Record<string, string>;
  };
  dts?: {
    files?: string[];
    rules?: Record<string, string>;
  };
  cjs?: {
    files?: string[];
    rules?: Record<string, string>;
  };
  configs?: {
    files?: string[];
    rules?: Record<string, string>;
  };
}

export function defineDisables(
  overrides: DisablesOverrides = {}
): Array<FlatConfig.Config> {
  const configs: FlatConfig.Config[] = [];

  configs.push({
    files: overrides.scripts?.files || [`**/scripts/${GLOB_SRC}`],
    name: "outslept/disables/scripts",
    rules: {
      "antfu/no-top-level-await": "off",
      "no-console": "off",
      "ts/explicit-function-return-type": "off",
      ...(overrides.scripts?.rules || {}),
    },
  });

  configs.push({
    files: overrides.cli?.files || [
      `**/cli/${GLOB_SRC}`,
      `**/cli.${GLOB_SRC_EXT}`,
    ],
    name: "outslept/disables/cli",
    rules: {
      "antfu/no-top-level-await": "off",
      "no-console": "off",
      ...(overrides.cli?.rules || {}),
    },
  });

  configs.push({
    files: overrides.bin?.files || ["**/bin/**/*", `**/bin.${GLOB_SRC_EXT}`],
    name: "outslept/disables/bin",
    rules: {
      "antfu/no-import-dist": "off",
      "antfu/no-import-node-modules-by-path": "off",
      ...(overrides.bin?.rules || {}),
    },
  });

  configs.push({
    files: overrides.dts?.files || ["**/*.d.?([cm])ts"],
    name: "outslept/disables/dts",
    rules: {
      "eslint-comments/no-unlimited-disable": "off",
      "import/no-duplicates": "off",
      "no-restricted-syntax": "off",
      "unused-imports/no-unused-vars": "off",
      ...(overrides.dts?.rules || {}),
    },
  });

  configs.push({
    files: overrides.cjs?.files || ["**/*.js", "**/*.cjs"],
    name: "outslept/disables/cjs",
    rules: {
      "ts/no-require-imports": "off",
      ...(overrides.cjs?.rules || {}),
    },
  });

  configs.push({
    files: overrides.configs?.files || [
      `**/*.config.${GLOB_SRC_EXT}`,
      `**/*.config.*.${GLOB_SRC_EXT}`,
    ],
    name: "outslept/disables/config-files",
    rules: {
      "antfu/no-top-level-await": "off",
      "no-console": "off",
      "ts/explicit-function-return-type": "off",
      ...(overrides.configs?.rules || {}),
    },
  });

  return configs;
}
