import { defineEventHandler, createError } from 'h3'
import { getConfigByName, hasConfig } from '../../utils/config'

export default defineEventHandler((event) => {
  const name = event.context.params?.name

  if (!name || !hasConfig(name)) {
    throw createError({
      statusCode: 404,
      statusMessage: `Configuration '${name}' not found`
    })
  }

  return getConfigByName(name)
})
