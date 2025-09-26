import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: [
        '**/ai-insights-cache.json',
        'ai-insights-cache.json',
        /ai-insights-cache\.json$/,
        /src\/data\/ai-insights-cache\.json$/,
        resolve(__dirname, 'src/data/ai-insights-cache.json')
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
