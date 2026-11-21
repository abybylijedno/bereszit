import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/bereszit/`,
    serviceWorkers: 'allow',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Tests run against the production build, because the PWA exists only there.
  webServer: {
    command: `npm run build-only && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/bereszit/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
