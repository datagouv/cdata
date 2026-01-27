import { test as base } from '@playwright/test'

const IGNORED_MESSAGES = [
  // Cookie secure flag doesn't work in dev (HTTP)
  'non-HTTPS cookie',
  // TODO: find a way to only ignore this in redirect tests (e.g. a per-test option)
  // instead of globally silencing 404 errors. Example test that needs this:
  //   test('/datasets/slug/ → /datasets/slug', async ({ page }) => {
  //     await page.goto('/datasets/slug/')
  //     await expect(page).toHaveURL('/datasets/slug')
  //   })
  'Failed to load resource: the server responded with a status of 404',
  'Page not found:',
]

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const test = base.extend<{ assertNoConsoleErrors: void }>({
  assertNoConsoleErrors: [async ({ page }, use) => {
    const warnings: string[] = []
    const errors: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (IGNORED_MESSAGES.some(ignored => text.includes(ignored))) return

      const type = msg.type()
      if (type === 'warning') {
        warnings.push(text)
      }
      if (type === 'error') {
        errors.push(text)
      }
    })

    page.on('pageerror', (error) => {
      if (IGNORED_MESSAGES.some(ignored => error.message.includes(ignored))) return
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
