import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-index-for-surge',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        const indexPath = resolve(distDir, 'index.html')
        copyFileSync(indexPath, resolve(distDir, '200.html'))
        copyFileSync(indexPath, resolve(distDir, '404.html'))
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
