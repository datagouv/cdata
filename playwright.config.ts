import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  timeout: 60_0000,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://dev.local:3000',

    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',

    locale: 'fr-FR',

    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'setup-normal-user', testMatch: /auth-normal-user\.setup\.ts/ },

    {
      name: 'chromium',
      testIgnore: [
        /.*\.normal-user\.spec\.ts/,
        /.*\.2fa-user\.spec\.ts/,
      ],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },

    {
      name: 'chromium-normal-user',
      testMatch: /.*\.normal-user\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/normal-user.json' },
      dependencies: ['setup-normal-user'],
    },

    {
      name: 'chromium-2fa-user',
      testMatch: /.*\.2fa-user\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: [],
    },

    {
      name: 'firefox',
      testIgnore: [
        /.*\.normal-user\.spec\.ts/,
        /.*\.2fa-user\.spec\.ts/,
      ],
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
