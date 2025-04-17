import fs from 'node:fs/promises'
import { join, resolve } from 'pathe'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

type Registry = Record<string, {
  name: string
  description: string
  version: string
  files: string[]
}>

type ConfigPackage = {
  name?: string
  description?: string
  version?: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const app = new Hono()
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || 'localhost'

const CONFIGS_DIR = resolve(process.cwd(), 'dist')

app.use('*', logger())

app.use('*', async (c, next) => {
  await next()
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type')
})

app.options('*', (c) => c.text(''))

app.get('/r/registry.json', async (c) => {
  try {
    const registryPath = join(CONFIGS_DIR, 'registry.json')
    const content = await fs.readFile(registryPath, 'utf-8')
    return c.json(JSON.parse(content) as Registry)
  } catch (error) {
    c.status(500)
    return c.json({ error: 'Failed to get registry' })
  }
})

app.get('/r/:config/package.json', async (c) => {
  try {
    const config = c.req.param('config')
    const packageJsonPath = join(CONFIGS_DIR, config, 'package.json')

    const content = await fs.readFile(packageJsonPath, 'utf-8')
    return c.json(JSON.parse(content) as ConfigPackage)
  } catch (error) {
    c.status(404)
    return c.json({ error: 'Configuration not found' })
  }
})

app.get('/r/:config/:file', async (c) => {
  try {
    const { config, file } = c.req.param()
    const filePath = join(CONFIGS_DIR, config, file)

    const content = await fs.readFile(filePath, 'utf-8')

    if (file.endsWith('.json')) {
      return c.json(JSON.parse(content))
    } else {
      c.header('Content-Type', getContentType(file))
      return c.body(content)
    }
  } catch (error) {
    c.status(404)
    return c.json({ error: 'File not found' })
  }
})

app.get('/static/*', async (c) => {
  const path = c.req.path.replace('/static/', '')
  try {
    const filePath = join(CONFIGS_DIR, path)
    const content = await fs.readFile(filePath, 'utf-8')
    c.header('Content-Type', getContentType(path))
    return c.body(content)
  } catch (error) {
    c.status(404)
    return c.json({ error: 'File not found' })
  }
})

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const types: Record<string, string> = {
    'js': 'application/javascript',
    'mjs': 'application/javascript',
    'cjs': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'yml': 'application/yaml',
    'yaml': 'application/yaml',
    'json': 'application/json'
  }
  return types[ext] || 'text/plain'
}

console.log(`Starting registry server on http://${HOST}:${PORT}`)

export default {
  fetch: app.fetch,
  port: PORT
}
