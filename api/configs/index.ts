import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const CONFIGS_ROOT = path.resolve(process.cwd(), 'configs')
const toPosix = (p: string) => p.split(path.sep).join('/')

type Item = {
  id: string
  name: string
  ext: string
  bytes: number
  mtimeMs: number
}

async function listAllConfigs(): Promise<Item[]> {
  const items: Item[] = []

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (!entry.isFile()) continue

      const rel = toPosix(path.relative(CONFIGS_ROOT, full))
      const s = await stat(full)
      items.push({
        id: rel,
        name: entry.name,
        ext: path.extname(entry.name).slice(1),
        bytes: s.size,
        mtimeMs: s.mtimeMs,
      })
    }
  }

  await walk(CONFIGS_ROOT)
  items.sort((a, b) => a.id.localeCompare(b.id))
  return items
}

export default async function listConfigs(req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ status: 405, message: 'Method not allowed' })
  }

  try {
    const items = await listAllConfigs()
    if (method === 'HEAD') return res.status(200).end()
    return res.status(200).json({ total: items.length, items })
  } catch (err: any) {
    return res.status(500).json({ status: 500, message: err?.message || 'Internal error' })
  }
}