import type { BrowserContext } from '@playwright/test'

// The matomo host set in playwright.config.ts webServer.env makes every spec
// load matomo.js. A failed load logs a console error (404, MIME refusal or
// DNS failure depending on the host) that assertNoConsoleErrors would fail
// on, so this fake serves an empty script: the plugin loads it, finds no
// window.Matomo and falls back to its no-op implementation.
//
// A test that asserts what the app sends to the tracker (matomo-tracking
// spec) installs its own page route with a recording mock — page routes take
// precedence over the context route installed here.
export async function fakeMatomo(context: BrowserContext): Promise<void> {
  await context.route('**/matomo.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: '/* matomo.js stubbed by tests/matomo.ts */',
  }))
}
