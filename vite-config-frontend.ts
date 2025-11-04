import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

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
  }
})
