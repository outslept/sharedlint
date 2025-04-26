import { configRegistry } from '../../build-registry'

export function getConfigList() {
  return Object.keys(configRegistry)
}

export function getConfigByName(name: string) {
  return configRegistry[name] || null
}

export function hasConfig(name: string) {
  return name in configRegistry
}
