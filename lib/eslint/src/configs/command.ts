import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import {
  defineCommand as defineCmd,
  builtinCommands,
} from "eslint-plugin-command/commands";
import commandPlugin from "eslint-plugin-command/config";

export interface CommandOptions {
  /**
   * Custom commands to add to the configuration
   * @default []
   */
  commands?: Array<ReturnType<typeof defineCmd>>;

  /**
   * Include built-in commands
   * @default true
   */
  includeBuiltin?: boolean;
}

export function defineCommand(
  options: CommandOptions = {}
): FlatConfig.Config[] {
  const { commands = [], includeBuiltin = true } = options;

  return [
    {
      ...commandPlugin({
        commands: [...(includeBuiltin ? builtinCommands : []), ...commands],
      }),
      name: "outslept/command/rules",
    },
  ];
}
