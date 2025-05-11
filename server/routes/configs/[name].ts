import { defineEventHandler, createError, getRouterParam } from 'h3'
import { getConfigByName, hasConfig } from '../../utils/config'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')

  if (!name) {
      throw createError({
          statusCode: 400,
          statusMessage: 'Parameter "name" is required'
      });
  }

  if (!(await hasConfig(name))) {
    throw createError({
      statusCode: 404,
      statusMessage: `Configuration '${name}' not found`
    })
  }

  return await getConfigByName(name)
})
