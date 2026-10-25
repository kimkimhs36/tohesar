import { defineConfig } from '@playwright/test';
export default defineConfig({
  timeout: 60000,
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: 'npm run preview -- --port 4321',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: true,
      },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
          args: ['--no-sandbox'],
        },
      },
    },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
