import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const CONFIG_DIR = path.join(process.cwd(), 'configs')
const toPosix = (p: string) => p.split(path.sep).join('/')

type Item = {
  id: string
  name: string
  ext: string
  bytes: number
  mtimeMs: number
}

async function listConfigs(): Promise<Item[]> {
  const items: Item[] = []

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        const rel = toPosix(path.relative(CONFIG_DIR, full))
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
  }

  await walk(CONFIG_DIR)
  items.sort((a, b) => a.id.localeCompare(b.id))
  return items
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ status: 405, message: 'Method not allowed' })
  }
  try {
    const items = await listConfigs()
    if (req.method === 'HEAD') return res.status(200).end()
    return res.status(200).json({ total: items.length, items })
  } catch (err: any) {
    return res.status(500).json({ status: 500, message: err?.message || 'Internal error' })
  }
}