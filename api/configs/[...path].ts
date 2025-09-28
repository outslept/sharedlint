import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const CONFIG_DIR = path.join(process.cwd(), 'configs')
const BASE = path.resolve(CONFIG_DIR)
const BASE_ROUTE = '/api/configs/'

function contentTypeFor(id: string): string {
  if (id.endsWith('.json')) return 'application/json; charset=utf-8'
  if (id.endsWith('.yml') || id.endsWith('.yaml')) return 'text/yaml; charset=utf-8'
  return 'text/plain; charset=utf-8'
}
function etagFor(s: { size: number; mtimeMs: number }): string {
  return `W/"${s.size}-${Math.trunc(s.mtimeMs)}"`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ status: 405, message: 'Method not allowed' })
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost')
    const pathname = url.pathname

    if (!pathname.startsWith(BASE_ROUTE) || pathname === BASE_ROUTE) {
      return res.status(404).json({ status: 404, message: 'Not found' })
    }

    const id = decodeURIComponent(pathname.slice(BASE_ROUTE.length))
    const full = path.resolve(path.join(BASE, id))
    const rel = path.relative(BASE, full)
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return res.status(400).json({ status: 400, message: 'Invalid path' })
    }

    let s: { size: number; mtimeMs: number }
    try {
      s = await stat(full)
    } catch {
      return res.status(404).json({ status: 404, message: 'Config not found' })
    }

    const etag = etagFor(s)
    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', 'public, max-age=60')
    if (req.headers['if-none-match'] === etag) return res.status(304).end()

    const format = (url.searchParams.get('format') || '').toLowerCase()
    const download = url.searchParams.get('download') === '1'

    if (format === 'meta') {
      if (req.method === 'HEAD') return res.status(200).end()
      return res.status(200).json({
        id,
        name: path.basename(id),
        ext: path.extname(id).slice(1) || null,
        bytes: s.size,
        mtimeMs: s.mtimeMs,
        contentType: contentTypeFor(id),
      })
    }

    if (format === 'raw') {
      const content = await readFile(full, 'utf8')
      res.setHeader('Content-Type', contentTypeFor(id))
      res.setHeader('X-Content-Type-Options', 'nosniff')
      if (download) res.setHeader('Content-Disposition', `attachment; filename="${path.basename(id)}"`)
      if (req.method === 'HEAD') return res.status(200).end()
      return res.status(200).send(content)
    }

    const content = await readFile(full, 'utf8')
    if (req.method === 'HEAD') return res.status(200).end()
    return res.status(200).json({
      id,
      name: path.basename(id),
      contentType: contentTypeFor(id),
      content,
    })
  } catch (err: any) {
    return res.status(500).json({ status: 500, message: err?.message || 'Internal error' })
  }
}