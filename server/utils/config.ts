import { extname } from 'pathe';

const STORAGE_NAMESPACE = 'assets:server:configs';

export async function getConfigList(): Promise<string[]> {
  const storage = useStorage(STORAGE_NAMESPACE);
  const keys = await storage.getKeys();
  return keys
    .filter(key => !key.includes('/'))
    .map(key => key.replace(extname(key), ''));
}

export async function hasConfig(name: string): Promise<boolean> {
  const storage = useStorage(STORAGE_NAMESPACE);
  const keys = await storage.getKeys();
  return keys.some(key => !key.includes('/') && key.startsWith(name + '.'));
}

export async function getConfigByName(name: string): Promise<any | null> {
  const storage = useStorage(STORAGE_NAMESPACE);
  const keys = await storage.getKeys();
  const foundKey = keys.find(key => !key.includes('/') && key.startsWith(name + '.'));

  if (!foundKey) {
    console.warn(`[configUtils] Config not found by name (without ext): ${name}. Searched in keys:`, keys);
    return null;
  }

  const content = await storage.getItem(foundKey);

  if (typeof content !== 'string') {
    console.warn(`[configUtils] Content for ${foundKey} is not a string:`, typeof content);
    return content;
  }

  if (extname(foundKey) === '.json') {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error(`[configUtils] Error parsing JSON for ${foundKey}:`, e);
      return { error: `Failed to parse JSON` };
    }
  }
  if (['.js', '.mjs', '.cjs', '.ts'].includes(extname(foundKey))) {
    return { type: 'module-content', content: content };
  }
  return content;
}
