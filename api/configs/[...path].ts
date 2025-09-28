import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const ROUTE_PREFIX = '/api/configs/'
const CONFIGS_ROOT = path.resolve(process.cwd(), 'configs')

function contentTypeOf (filePath: string): string {
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8'
  if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) return 'text/yaml; charset=utf-8'
  return 'text/plain; charset=utf-8'
}

function weakEtagFor (s: { size: number; mtimeMs: number }): string {
  return `W/"${s.size}-${Math.trunc(s.mtimeMs)}"`
}

function resolveInsideConfigs (requested: string): string | null {
  const absolute = path.resolve(CONFIGS_ROOT, requested)
  const relative = path.relative(CONFIGS_ROOT, absolute)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  return absolute
}

function clientSentEtag (req: VercelRequest, etag: string): boolean {
  const header = req.headers['if-none-match']
  if (!header) return false
  return String(header)
    .split(',')
    .map(s => s.trim())
    .includes(etag)
}

export default async function handler (req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ status: 405, message: 'Method not allowed' })
  }

  const url = new URL(req.url || '/', 'http://localhost')
  const pathname = url.pathname
  if (!pathname.startsWith(ROUTE_PREFIX) || pathname === ROUTE_PREFIX) {
    return res.status(404).json({ status: 404, message: 'Not found' })
  }

  const requestedPath = decodeURIComponent(pathname.slice(ROUTE_PREFIX.length))
  const absolutePath = resolveInsideConfigs(requestedPath)
  if (!absolutePath) {
    return res.status(400).json({ status: 400, message: 'Invalid path' })
  }

  const stats = await stat(absolutePath).catch(() => null)
  if (!stats || !stats.isFile()) {
    return res.status(404).json({ status: 404, message: 'Config not found' })
  }

  const etag = weakEtagFor(stats)
  res.setHeader('ETag', etag)
  res.setHeader('Cache-Control', 'public, max-age=60')

  if (clientSentEtag(req, etag)) return res.status(304).end()

  const format = (url.searchParams.get('format') || '').toLowerCase()
  const asDownload = url.searchParams.get('download') === '1'

  if (format === 'meta') {
    if (method === 'HEAD') return res.status(200).end()
    return res.status(200).json({
      id: requestedPath,
      name: path.basename(requestedPath),
      ext: path.extname(requestedPath).slice(1) || null,
      bytes: stats.size,
      mtimeMs: stats.mtimeMs,
      contentType: contentTypeOf(requestedPath),
    })
  }

  if (format === 'raw') {
    res.setHeader('Content-Type', contentTypeOf(requestedPath))
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (asDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(requestedPath)}"`)
    }
    if (method === 'HEAD') return res.status(200).end()
    const text = await readFile(absolutePath, 'utf8')
    return res.status(200).send(text)
  }

  if (method === 'HEAD') return res.status(200).end()
  const text = await readFile(absolutePath, 'utf8')
  return res.status(200).json({
    id: requestedPath,
    name: path.basename(requestedPath),
    contentType: contentTypeOf(requestedPath),
    content: text,
  })
}
