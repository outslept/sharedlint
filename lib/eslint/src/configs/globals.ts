import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import globals from "globals";

export type GlobalsConfig = Array<keyof typeof globals>;

export function defineGlobals(
  config: GlobalsConfig = ["node", "browser", "es2020"]
): FlatConfig.Config[] {
  if (!Array.isArray(config)) {
    throw new Error("Globals config must be an array");
  }

  const collectedGlobals = config.reduce((acc, env) => {
    if (!globals[env]) {
      console.warn(`Unknown global environment: ${env}`);
      return acc;
    }
    return { ...acc, ...globals[env] };
  }, {});

  return [
    {
      name: "outslept/globals",
      languageOptions: {
        globals: collectedGlobals,
      },
    },
  ];
}
