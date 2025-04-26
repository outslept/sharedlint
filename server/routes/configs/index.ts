import { defineEventHandler } from 'h3'
import { getConfigList } from '../../utils/config'

export default defineEventHandler(() => {
  return getConfigList()
})
