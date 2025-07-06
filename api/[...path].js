import { readdir, readFile } from 'fs/promises';
import { join, relative, basename } from 'path';

const CONFIG_DIR = join(process.cwd(), 'configs');

async function scanConfigs() {
  const configMap = new Map();

  async function scan(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile()) {
        const relativePath = relative(CONFIG_DIR, fullPath);
        configMap.set(entry.name, relativePath);
      }
    }
  }

  await scan(CONFIG_DIR);
  return configMap;
}

async function getConfigContent(configMap, filename) {
  const relativePath = configMap.get(filename);
  if (!relativePath) return null;

  try {
    const fullPath = join(CONFIG_DIR, relativePath);
    const content = await readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const pathParam = req.query['...path'] || [];
    const path = Array.isArray(pathParam) ? pathParam : [pathParam].filter(Boolean);
    const pathname = '/' + path.join('/');

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const configMap = await scanConfigs();
    const configList = [...configMap.keys()].sort();

    if (pathname === '/' || pathname === '/help') {
      return res.json({
        endpoints: {
          'GET /': 'This help message',
          'GET /configs': 'List all available config files',
          'GET /{filename}': 'Get specific config file content'
        },
        available_configs: configList,
        total_configs: configList.length
      });
    }

    if (pathname === '/configs') {
      return res.json({
        configs: configList,
        total: configList.length,
        base_url: `https://${req.headers.host}`
      });
    }

    const filename = basename(pathname);
    if (!filename || filename === '/') {
      return res.status(400).json({ error: 'Filename required' });
    }

    const content = await getConfigContent(configMap, filename);
    if (content === null) {
      return res.status(404).json({
        error: `Config file '${filename}' not found. Available: ${configList.join(', ')}`
      });
    }

    const contentType = filename.endsWith('.json') ? 'application/json' : 'text/plain';
    res.setHeader('Content-Type', contentType);
    res.send(content);

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
