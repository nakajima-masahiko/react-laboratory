import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: 'validation-artifacts/playwright',
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'validation-artifacts/playwright-results.json' }],
    ['html', { outputFolder: 'validation-artifacts/report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173/react-laboratory/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/react-laboratory/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
