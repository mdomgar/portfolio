import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { reactRouter } from '@react-router/dev/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [process.env.VITEST ? react() : reactRouter()],
  // The footer year is fixed at build time: prerender and hydration always agree, even on 1 January.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**', 'build/**'],
  },
})
