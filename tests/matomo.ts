import type { BrowserContext } from '@playwright/test'

// The server under test must have NUXT_PUBLIC_MATOMO_HOST set so every spec
// loads matomo.js. A failed load logs a console error that
// assertNoConsoleErrors would fail on, so this fake serves an empty script:
// it loads cleanly and the plugin queues tracker calls into window._paq
// regardless of the script content.
//
// A test that asserts what the app sends to the tracker (matomo-tracking
// spec) installs its own page route with a recording mock — page routes take
// precedence over the context route installed here.
// Note: the matomo-tracking spec requires a production server (pnpm run
// preview or node .output/server/index.mjs): the dev server never fires the
// page load event, so page.goto times out.
export async function fakeMatomo(context: BrowserContext): Promise<void> {
  await context.route('**/matomo.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: '/* matomo.js stubbed by tests/matomo.ts */',
  }))
}
