const { readFile, stat } = require('node:fs/promises')
const path = require('node:path')

const CONFIG_DIR = path.join(process.cwd(), 'configs')
const BASE = path.resolve(CONFIG_DIR)

function contentTypeFor (id) {
  if (id.endsWith('.json')) return 'application/json; charset=utf-8'
  if (id.endsWith('.yml') || id.endsWith('.yaml')) return 'text/yaml; charset=utf-8'
  return 'text/plain; charset=utf-8'
}

function etagFor (s) {
  return `W/"${s.size}-${Math.trunc(s.mtimeMs)}"`
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ status: 405, message: 'Method not allowed' })
  }
  try {
    const segs = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean)
    if (segs.length === 0) return res.status(404).json({ status: 404, message: 'Not found' })
    const id = segs.join('/')

    const full = path.resolve(path.join(BASE, id))
    if (!full.startsWith(BASE + path.sep)) {
      return res.status(400).json({ status: 400, message: 'Invalid path' })
    }

    let s
    try {
      s = await stat(full)
    } catch {
      return res.status(404).json({ status: 404, message: 'Config not found' })
    }

    const etag = etagFor(s)
    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', 'public, max-age=60')
    if (req.headers['if-none-match'] === etag) return res.status(304).end()

    const url = new URL(req.url || '', 'http://localhost')
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
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message })
  }
}