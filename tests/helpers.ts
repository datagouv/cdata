import type { Page } from '@playwright/test'
import { test } from '@playwright/test'

// When clicking "Suivant" we execute the validation of the frequency input
// because we blur outside the select. This validation create a warning (because
// "Inconnu" is not recommanded), and the warning make the "Suivant" button
// move a little bit down so the click is miss. We want to fix this one day!
// (it also happens in a regular browser with a human, so it's really not ideal)
export const clickOutside = async (page: Page) => {
  await page.mouse.click(1, 1)
}

const IGNORED_MESSAGES = [
  // Cookie secure flag doesn't work in dev (HTTP)
  'non-HTTPS cookie',
]

export function setupConsoleTracking(page: Page) {
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

  return {
    annotateAndCheck() {
      for (const w of warnings) {
        test.info().annotations.push({ type: 'warning', description: w })
      }
      for (const e of errors) {
        test.info().annotations.push({ type: 'error', description: e })
      }

      const all = [...errors, ...warnings]
      if (all.length > 0) {
        throw new Error(`Console errors/warnings:\n${all.join('\n')}`)
      }
    },
  }
}
