import { defineEventHandler } from 'h3'
import { version } from '../../package.json'
import { getConfigList } from '../utils/config'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);

  return {
    name: 'configs',
    version,
    docs: runtimeConfig.app.repoUrl,
    deployTime: runtimeConfig.app.deployTime,
    deployRevision: runtimeConfig.app.revision,
    availableConfigs: await getConfigList(),
    endpoints: {
      '/': 'API documentation',
      '/configs': 'List of all available configurations',
      '/configs/:name': 'Get specific configuration by name'
    }
  }
})
