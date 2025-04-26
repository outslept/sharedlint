import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, extname, dirname, resolve } from 'pathe'
import { fileURLToPath } from 'url'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)

const findRootDir = (startDir: string): string => {
  const possibleConfigsDir = resolve(startDir, 'configs')
  if (existsSync(possibleConfigsDir)) {
    return startDir
  }

  if (startDir.includes('.nitro/dev')) {
    return resolve(startDir, '../..')
  }

  const parentDir = resolve(startDir, '..')

  if (parentDir === startDir) {
    return startDir
  }

  return findRootDir(parentDir)
}

const rootDir = findRootDir(currentDir)
console.log('Root directory:', rootDir)

interface ConfigRegistry {
  [key: string]: any;
}

export function buildConfigRegistry(): ConfigRegistry {
  const configsDir = join(rootDir, 'configs')
  console.log('Configs directory:', configsDir)

  const registry: ConfigRegistry = {}

  try {
    if (!existsSync(configsDir)) {
      console.error(`Configs directory does not exist: ${configsDir}`)
      return registry
    }

    const files = readdirSync(configsDir)

    for (const file of files) {
      const filePath = join(configsDir, file)
      const ext = extname(file)
      const name = file.replace(ext, '')

      try {
        let content: any

        if (ext === '.json') {
          content = JSON.parse(readFileSync(filePath, 'utf-8'))
        } else if (['.js', '.mjs'].includes(ext)) {
          const fileContent = readFileSync(filePath, 'utf-8')
          content = {
            type: 'js-module',
            content: fileContent
          }
        } else {
          content = readFileSync(filePath, 'utf-8')
        }

        registry[name] = content
      } catch (error) {
        console.error(`Error processing file ${file}:`, error)
        registry[name] = { error: `Failed to process: ${error.message}` }
      }
    }
  } catch (error) {
    console.error('Error reading configs directory:', error)
  }

  return registry
}

export const configRegistry = buildConfigRegistry()
