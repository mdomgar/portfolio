import { defineConfig, devices } from '@playwright/test'
import { BASE_URL, PORT } from './e2e/helpers.js'

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
    // A dedicated port: other preview servers may be listening on 4173 or its neighbours.
    command: 'node scripts/serve-build.js',
    env: { PORT: String(PORT) },
    url: BASE_URL,
    // Never test whatever else happens to be listening.
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
