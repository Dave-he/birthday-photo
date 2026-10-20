const { defineConfig, devices } = require('@playwright/test');

/**
 * Dev-server ports. The admin panel runs on Vite's default port in dev
 * (5173); the Docker image serves the production build on 8080.
 */
const WEB_URL = process.env.E2E_WEB_URL || 'http://localhost:3000';
const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5173';

/**
 * Escape hatch for offline / air-gapped machines: point Playwright at an
 * already-downloaded Chromium build. Playwright's own `npx playwright install`
 * is the normal path.
 */
const chromiumExecutablePath = process.env.E2E_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunchOptions = chromiumExecutablePath
  ? { executablePath: chromiumExecutablePath }
  : undefined;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: chromiumLaunchOptions },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Run the local dev servers before starting the E2E tests.
  webServer: [
    {
      command: 'pnpm --dir apps/web dev',
      url: WEB_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    {
      command: 'pnpm --dir apps/admin dev',
      url: ADMIN_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
  ],
});
