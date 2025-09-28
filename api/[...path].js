import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const CONFIG_DIR = path.join(process.cwd(), 'configs')

const toPosix = (p) => p.split(path.sep).join('/')

async function scanConfigs () {
  const index = new Map()
  async function walk (dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        const rel = toPosix(path.relative(CONFIG_DIR, full))
        const s = await stat(full)
        index.set(rel, {
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
  return index
}

async function getConfigContent (id) {
  const full = path.join(CONFIG_DIR, id)
  try {
    return await readFile(full, 'utf8')
  } catch {
    return null
  }
}

function contentTypeFor (id) {
  if (id.endsWith('.json')) return 'application/json; charset=utf-8'
  if (id.endsWith('.yml') || id.endsWith('.yaml')) return 'text/yaml; charset=utf-8'
  return 'text/plain; charset=utf-8'
}

function etagFor (meta) {
  return `W/"${meta.bytes}-${Math.trunc(meta.mtimeMs)}"`
}

export default async function handler (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match')

    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD, OPTIONS')
      res.status(405).json({ status: 405, code: 'method_not_allowed', message: 'Method not allowed' })
      return
    }

    const pathParam = req.query['...path'] || []
    const segs = Array.isArray(pathParam) ? pathParam : [pathParam].filter(Boolean)
    const [resource, ...rest] = segs

    const index = await scanConfigs()

    if (!resource) {
      res.status(404).json({ status: 404, code: 'not_found', message: 'Not found' })
      return
    }

    if (resource === 'configs' && rest.length === 0) {
      const items = [...index.values()].sort((a, b) => a.id.localeCompare(b.id))
      res.status(200).json({ total: items.length, items })
      return
    }

    if (resource === 'configs' && rest.length >= 1) {
      const id = decodeURI(rest.join('/'))
      const meta = index.get(id)
      if (!meta) {
        res.status(404).json({ status: 404, code: 'config_not_found', message: 'Config not found' })
        return
      }

      const etag = etagFor(meta)
      res.setHeader('ETag', etag)
      res.setHeader('Cache-Control', 'public, max-age=60')
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end()
        return
      }

      const url = new URL(req.url || '', 'http://localhost')
      const format = (url.searchParams.get('format') || '').toLowerCase()
      const download = url.searchParams.get('download') === '1'

      if (format === 'meta') {
        if (req.method === 'HEAD') {
          res.status(200).end()
          return
        }
        res.status(200).json({
          id: meta.id,
          name: meta.name,
          ext: meta.ext || null,
          bytes: meta.bytes,
          mtimeMs: meta.mtimeMs,
          contentType: contentTypeFor(meta.id),
        })
        return
      }

      if (format === 'raw') {
        const content = await getConfigContent(meta.id)
        if (content == null) {
          res.status(500).json({ status: 500, code: 'read_failed', message: 'Failed to read the file' })
          return
        }
        res.setHeader('Content-Type', contentTypeFor(meta.id))
        res.setHeader('X-Content-Type-Options', 'nosniff')
        if (download) {
          res.setHeader('Content-Disposition', `attachment; filename="${meta.name}"`)
        }
        if (req.method === 'HEAD') {
          res.status(200).end()
          return
        }
        res.status(200).send(content)
        return
      }

      const content = await getConfigContent(meta.id)
      if (content == null) {
        res.status(500).json({ status: 500, code: 'read_failed', message: 'Failed to read the file' })
        return
      }
      if (req.method === 'HEAD') {
        res.status(200).end()
        return
      }
      res.status(200).json({
        id: meta.id,
        name: meta.name,
        contentType: contentTypeFor(meta.id),
        content,
      })
      return
    }

    res.status(404).json({ status: 404, code: 'not_found', message: 'Not found' })
  } catch (error) {
    res.status(500).json({ status: 500, code: 'internal_error', message: error.message })
  }
}
