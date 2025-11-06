import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(async ({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      vue(),
      isDev && (await import('vite-plugin-vue-devtools')).default() // only include this in dev mode
    ].filter(Boolean),

    root: 'src/frontend',
    server: {
      proxy: { '/api': 'http://localhost:3000' }
    },
    build: {
      emptyOutDir: true,
      outDir: path.resolve(__dirname, 'dist_frontend')
    }
  }
})
