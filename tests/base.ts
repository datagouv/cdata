import { test as base } from '@playwright/test'

const IGNORED_MESSAGES = [
  // Cookie secure flag doesn't work in dev (HTTP)
  'non-HTTPS cookie',
  // TODO: find a way to only ignore this in redirect tests (use `ignoredConsoleMessages`)
  // instead of globally silencing 404 errors. Example test that needs this:
  //   test('/datasets/slug/ → /datasets/slug', async ({ page }) => {
  //     await page.goto('/datasets/slug/')
  //     await expect(page).toHaveURL('/datasets/slug')
  //   })
  'Failed to load resource: the server responded with a status of 404',
  'Page not found:',
  // Fixtures have broken image URLs (dev.local prefix baked in), see udata-fixtures v7.0.0
  'OpaqueResponseBlocking',
  // Firefox warning about scroll-linked positioning, not actionable
  'scroll-linked positioning effect',
  // Nuxt wraps 404 errors during app init, same root cause as "Page not found:"
  'error caught during app initialization',
]

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const test = base.extend<{ ignoredConsoleMessages: Array<string>, assertNoConsoleErrors: void }>({
  // Extra messages to ignore for a specific file/describe, via
  // test.use({ ignoredConsoleMessages: [...] }). Always document why.
  ignoredConsoleMessages: [[], { option: true }],
  assertNoConsoleErrors: [async ({ page, ignoredConsoleMessages }, use) => {
    const ignoredMessages = [...IGNORED_MESSAGES, ...ignoredConsoleMessages]
    const warnings: string[] = []
    const errors: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (ignoredMessages.some(ignored => text.includes(ignored))) return

      const type = msg.type()
      if (type === 'warning') {
        warnings.push(text)
      }
      if (type === 'error') {
        errors.push(text)
      }
    })

    page.on('pageerror', (error) => {
      if (ignoredMessages.some(ignored => error.message.includes(ignored))) return
      errors.push(error.message)
    })

    await use()

    for (const w of warnings) {
      base.info().annotations.push({ type: 'warning', description: w })
    }
    for (const e of errors) {
      base.info().annotations.push({ type: 'error', description: e })
    }

    const all = [...errors, ...warnings]
    if (all.length > 0) {
      throw new Error(`Console errors/warnings:\n${all.join('\n')}`)
    }
  }, { auto: true }],
})

export { expect } from '@playwright/test'
