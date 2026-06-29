import { test as base, type ConsoleMessage } from '@playwright/test'

// `msg.text()` flattens an `Error` argument to its bare message (e.g. "Error"),
// dropping the stack on Firefox. Resolve the args to recover `error.stack`.
const fullText = (msg: ConsoleMessage) =>
  Promise.all(msg.args().map(arg => arg.evaluate(v => (v instanceof Error ? v.stack : v)).catch(() => null)))
    .then(parts => parts.filter(p => p != null).join(' ') || msg.text())

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
  // Fixtures have broken image URLs (dev.local prefix baked in), see udata-fixtures v7.0.0
  'OpaqueResponseBlocking',
  // Firefox warning about scroll-linked positioning, not actionable
  'scroll-linked positioning effect',
  // Nuxt wraps 404 errors during app init, same root cause as "Page not found:"
  'error caught during app initialization',
]

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const test = base.extend<{ assertNoConsoleErrors: void }>({
  assertNoConsoleErrors: [async ({ page }, use) => {
    const warnings: Array<Promise<string>> = []
    const errors: Array<Promise<string>> = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (IGNORED_MESSAGES.some(ignored => text.includes(ignored))) return

      const type = msg.type()
      if (type === 'warning') {
        warnings.push(fullText(msg))
      }
      if (type === 'error') {
        errors.push(fullText(msg))
      }
    })

    page.on('pageerror', (error) => {
      if (IGNORED_MESSAGES.some(ignored => error.message.includes(ignored))) return
      errors.push(Promise.resolve(error.stack ?? error.message))
    })

    await use()

    const resolvedWarnings = await Promise.all(warnings)
    const resolvedErrors = await Promise.all(errors)

    for (const w of resolvedWarnings) {
      base.info().annotations.push({ type: 'warning', description: w })
    }
    for (const e of resolvedErrors) {
      base.info().annotations.push({ type: 'error', description: e })
    }

    const all = [...resolvedErrors, ...resolvedWarnings]
    if (all.length > 0) {
      throw new Error(`Console errors/warnings:\n${all.join('\n')}`)
    }
  }, { auto: true }],
})

export { expect } from '@playwright/test'
