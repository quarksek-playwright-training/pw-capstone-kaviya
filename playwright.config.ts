import { defineConfig, devices } from '@playwright/test';
import { APP_URL } from './src/config';

const browsers = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [
        ['html', { open: 'never' }],
        ['list'],
        ['github'],
      ]
    : [
        ['html', { open: 'never' }],
        ['list'],
      ],
  use: {
    baseURL: APP_URL,
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Signs in through the form, so it does not depend on the saved session.
    ...browsers.map((browser) => ({
      name: `${browser.name}-login`,
      testMatch: /login-check\.spec\.ts/,
      use: browser.use,
    })),
    ...browsers.map((browser) => ({
      name: browser.name,
      testIgnore: /auth\.setup\.ts|login-check\.spec\.ts/,
      dependencies: ['setup'],
      use: browser.use,
    })),
  ],
});
