#!/usr/bin/env node

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const BASE_URL = 'https://sharedlint.vercel.app';

async function fetchConfig(filename) {
  const response = await fetch(`${BASE_URL}/${filename}`);
  if (!response.ok) {
    throw new Error(`Config '${filename}' not found`);
  }
  return response.text();
}

async function listConfigs() {
  const response = await fetch(`${BASE_URL}/configs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch config list: ${response.status}`);
  }

  const data = await response.json();
  return data.configs;
}

async function ensureDir(filePath) {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

function showHelp() {
  console.log(`Usage: sharedlint <command> [options]

Commands:
  list                    List available config files
  add <config>           Add a config file to current directory
  add <config> -o <path> Add config to specific path
  add-all                Add all configs to current directory
  add-all -d <dir>       Add all configs to specific directory

Examples:
  sharedlint list
  sharedlint add biome.json
  sharedlint add prettier.config.mjs -o configs/prettier.config.mjs
  sharedlint add-all -d configs`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length == 0 || args[0] == 'help' || args[0] == '--help') {
    showHelp();
    return;
  }

  const command = args[0];

  try {
    if (command == 'list') {
      console.log('Fetching configs...');
      const configs = await listConfigs();
      console.log('Available configs:');
      configs.forEach(config => console.log(`  ${config}`));

    } else if (command == 'add') {
      const config = args[1];
      if (!config) {
        console.error('Error: Config name required');
        process.exit(1);
      }

      const outputIndex = args.indexOf('-o');
      const outputPath = outputIndex != -1 ? args[outputIndex + 1] : config;

      console.log(`Downloading ${config}...`);
      const content = await fetchConfig(config);

      await ensureDir(outputPath);
      await writeFile(outputPath, content);

      console.log(`Added ${config} to ${outputPath}`);

    } else if (command == 'add-all') {
      const dirIndex = args.indexOf('-d');
      const targetDir = dirIndex != -1 ? args[dirIndex + 1] : '.';

      console.log('Fetching all configs...');
      const configs = await listConfigs();

      console.log(`Downloading ${configs.length} configs...`);
      for (const config of configs) {
        const content = await fetchConfig(config);
        const outputPath = join(targetDir, config);

        await ensureDir(outputPath);
        await writeFile(outputPath, content);
      }

      console.log(`Added ${configs.length} configs to ${targetDir}`);

    } else {
      console.error(`Error: Unknown command '${command}'`);
      showHelp();
      process.exit(1);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
