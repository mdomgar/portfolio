import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { reactRouter } from '@react-router/dev/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [process.env.VITEST ? react() : reactRouter()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**', 'build/**'],
  },
})
