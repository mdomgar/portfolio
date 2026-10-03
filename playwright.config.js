import { defineConfig, devices } from '@playwright/test'
import { BASE_URL } from './e2e/helpers.js'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  // System Chrome: no browser download (spec decision).
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'npm run preview',
    url: BASE_URL,
    // Never test whatever else happens to listen on :4173.
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
