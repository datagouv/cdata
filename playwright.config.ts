import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env')
if (existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

// The fake-services server (assistant chat, matomo, metrics, tabular SQL mocks
// for the chart configurator E2E tests) must be reachable by Playwright itself:
// FAKE_SERVICES_URL must point at a local URL, either the webServer started
// below (default http://localhost:3100) or an already-running local server.
const fakeServicesUrl = process.env.FAKE_SERVICES_URL || 'http://localhost:3100'
const fakeServicesPort = Number(new URL(fakeServicesUrl).port || 3100)
const assistantApiBase = process.env.NUXT_PUBLIC_ASSISTANT_API_BASE || fakeServicesUrl

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  /* Retry on CI to absorb transient failures (flaky externals, network blips); flakes still surface in the report. */
  retries: process.env.CI ? 2 : 0,
  /* Each CI shard has its own backend and runner: use all of its cores. */
  workers: process.env.CI ? '100%' : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* On CI we use the blob reporter so the sharded jobs can be merged into a single HTML report afterwards. */
  reporter: process.env.CI ? [['blob'], ['github']] : 'html',
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
        /.*\.logged-out\.spec\.ts/,
      ],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      // setup-normal-user is needed too: some tests (e.g. partial-editor) open a
      // second context with the normal-user storage state, so that file must exist.
      dependencies: ['setup', 'setup-normal-user'],
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
      name: 'chromium-logged-out',
      testMatch: /.*\.logged-out\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      // No storageState: the browser is logged out. The setup dependency is still
      // needed so tests can create fixtures through an authenticated API context.
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      testIgnore: [
        /.*\.normal-user\.spec\.ts/,
        /.*\.2fa-user\.spec\.ts/,
        /.*\.logged-out\.spec\.ts/,
      ],
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/user.json' },
      // setup-normal-user is needed too: some tests (e.g. partial-editor) open a
      // second context with the normal-user storage state, so that file must exist.
      dependencies: ['setup', 'setup-normal-user'],
    },
  ],

  webServer: [
    /* Run your local dev server before starting the tests */
    {
      command: 'pnpm run dev',
      url: process.env.BASE_URL || 'http://localhost:3000',
      reuseExistingServer: true,
      env: { NUXT_PUBLIC_ASSISTANT_API_BASE: assistantApiBase },
    },
    // Also serves the assistant endpoint used by the chart configurator E2E tests.
    // Starts even when FAKE_SERVICES_URL is set: it must stay a local URL (see
    // above) so deriving the port from it keeps a single server per run.
    {
      command: `FAKE_SERVICES_PORT=${fakeServicesPort} node tests/fake-services.ts`,
      url: `${fakeServicesUrl}/matomo.js`,
      reuseExistingServer: true,
    },
  ],
})
