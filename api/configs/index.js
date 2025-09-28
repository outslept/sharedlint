const { readdir, stat } = require('node:fs/promises')
const path = require('node:path')

const CONFIG_DIR = path.join(process.cwd(), 'configs')
const toPosix = (p) => p.split(path.sep).join('/')

async function scanConfigs () {
  const index = []
  async function walk (dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        const rel = toPosix(path.relative(CONFIG_DIR, full))
        const s = await stat(full)
        index.push({
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
  index.sort((a, b) => a.id.localeCompare(b.id))
  return index
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ status: 405, message: 'Method not allowed' })
  }
  try {
    const items = await scanConfigs()
    if (req.method === 'HEAD') return res.status(200).end()
    return res.status(200).json({ total: items.length, items })
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message })
  }
}