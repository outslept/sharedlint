import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  compatibilityDate: '2025-04-26',
  srcDir: "server",
  preset: 'vercel',

  routeRules: {
    '/**': { cors: true }
  },

  publicAssets: [
    {
      dir: 'configs',
      baseURL: '/raw-configs'
    }
  ],

  runtimeConfig: {
    app: {
      repoUrl: 'https://github.com/outslept/sharedlint',
      deployTime: new Date().toISOString(),
      revision: 'main'
    }
  },
})
