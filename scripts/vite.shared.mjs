import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

const dayjsCompat = fileURLToPath(new URL('../node_modules/dayjs/esm/index.js', import.meta.url))
const dayjsPluginCompat = fileURLToPath(new URL('../node_modules/dayjs/esm/plugin/$1/index.js', import.meta.url))
const dayjsLocaleCompat = fileURLToPath(new URL('../node_modules/dayjs/esm/locale/$1.js', import.meta.url))

export function createViteConfig() {
  return {
    plugins: [vue()],
    resolve: {
      alias: [
        { find: /^dayjs$/, replacement: dayjsCompat },
        { find: /^dayjs\/plugin\/([^/]+)\.js$/, replacement: dayjsPluginCompat },
        { find: /^dayjs\/locale\/([^/]+)\.js$/, replacement: dayjsLocaleCompat }
      ]
    },
    optimizeDeps: {
      noDiscovery: true,
      include: [],
      exclude: ['vue', 'vue-router', 'element-plus', '@element-plus/icons-vue']
    },
    server: {
      host: '::',
      port: 5173
    }
  }
}
