import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'pathe';

const projectRoot = process.cwd();

interface ConfigRegistry {
  [key: string]: any;
}

export function buildConfigRegistry(): ConfigRegistry {
  const configsDir = resolve(projectRoot, 'configs');
  const registry: ConfigRegistry = {};

  if (!existsSync(configsDir) || !statSync(configsDir).isDirectory()) {
    console.error(`[build-registry] Configs directory does not exist or is not a directory: ${configsDir}`);
    return registry;
  }

  try {
    const files = readdirSync(configsDir);

    if (files.length === 0) {
      console.warn(`[build-registry] No files found in ${configsDir}. Registry will be empty.`);
    }

    for (const file of files) {
      const filePath = join(configsDir, file);

      if (!statSync(filePath).isFile()) {
        console.log(`[build-registry] Skipping non-file (e.g., directory): ${file}`);
        continue;
      }

      const ext = extname(file);
      const name = file.replace(ext, '');

      try {
        let content: any;
        const fileContentRaw = readFileSync(filePath, 'utf-8');

        if (ext === '.json') {
          content = JSON.parse(fileContentRaw);
        } else if (['.js', '.mjs', '.cjs', '.ts'].includes(ext)) {
          content = {
            type: 'module-content',
            content: fileContentRaw
          };
        } else {
          content = fileContentRaw;
        }
        registry[name] = content;
      } catch (error: any) {
        console.error(`[build-registry] Error processing file ${file} at ${filePath}:`, error.message);
        registry[name] = { error: `Failed to process: ${error.message}` };
      }
    }
  } catch (error: any) {
    console.error(`[build-registry] Error reading configs directory ${configsDir} or processing files:`, error.message);
  }

  if (Object.keys(registry).length > 0) {
    console.log('[build-registry] Successfully built config registry with keys:', Object.keys(registry));
  } else {
    console.warn('[build-registry] Registry is empty after processing. Check paths, file contents, and permissions.');
  }

  return registry;
}

export const configRegistry = buildConfigRegistry();
