import fs from 'fs/promises'
import { join, resolve } from 'pathe'
import c from 'ansis'
import ora from 'ora'

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

async function buildRegistry(): Promise<void> {
  const spinner = ora('Building configuration registry').start()

  try {
    const configsDir = resolve(process.cwd(), 'configs')
    const configs = await fs.readdir(configsDir)
    const registry: Registry = {}

    for (const config of configs) {
      const configPath = join(configsDir, config)
      const stat = await fs.stat(configPath)

      if (stat.isDirectory()) {
        try {
          const files = await fs.readdir(configPath)
          const packageJsonPath = join(configPath, 'package.json')
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
          const packageJson = JSON.parse(packageJsonContent) as ConfigPackage

          registry[config] = {
            name: config,
            description: packageJson.description || `${config} configuration`,
            version: packageJson.version || '1.0.0',
            files: files
              .filter(file => file !== 'package.json')
              .map(file => `/${config}/${file}`)
          }
        } catch (error) {
          console.error(`Error processing ${config}:`, error)
        }
      }
    }

    const outputDir = resolve(process.cwd(), 'dist')
    await fs.mkdir(outputDir, { recursive: true })
    await fs.writeFile(join(outputDir, 'registry.json'), JSON.stringify(registry, null, 2))

    for (const [config, info] of Object.entries(registry)) {
      const configDir = join(outputDir, config)
      await fs.mkdir(configDir, { recursive: true })

      const packageJsonPath = join(configsDir, config, 'package.json')
      await fs.copyFile(packageJsonPath, join(configDir, 'package.json'))

      for (const fileUrl of info.files) {
        const fileName = fileUrl.split('/').pop() as string
        const srcPath = join(configsDir, config, fileName)
        const destPath = join(configDir, fileName)
        await fs.copyFile(srcPath, destPath)
      }
    }

    spinner.succeed('Registry built successfully')
    console.log(c.green(`Output directory: ${outputDir}`))
  } catch (error) {
    spinner.fail('Failed to build registry')
    console.error(c.red((error as Error).message))
    process.exit(1)
  }
}

buildRegistry()
