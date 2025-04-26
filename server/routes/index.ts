import { defineEventHandler } from 'h3'
import { version } from '../../package.json'
import { getConfigList } from '../utils/config'

export default defineEventHandler(() => {
  return {
    name: 'configs',
    version,
    docs: 'https://github.com/outslept/sharedint',
    deployTime: new Date().toISOString(),
    deployRevision: 'main',
    availableConfigs: getConfigList(),
    endpoints: {
      '/': 'API documentation',
      '/configs': 'List of all available configurations',
      '/configs/:name': 'Get specific configuration by name'
    }
  }
})
