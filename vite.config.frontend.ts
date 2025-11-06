import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  root: 'src/frontend',
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    }
  },
  build: {
    emptyOutDir: true,
    outDir: path.resolve(__dirname, 'dist_frontend')
  },
})
