import { test, expect } from '../base'
import { createPost, deletePosts } from '../helpers'

// Needs the server to run with NUXT_CONTENT_SECURITY_POLICY=enforce, as in the CI.
test.describe('Content Security Policy', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  // The browser reports each script it refuses: those are the point of the test.
  test.use({ allowedConsoleMessages: ['Content Security Policy', 'Content-Security-Policy'] })

  test('the scripts of an HTML post do not run', async ({ page, request }) => {
    // The body of an HTML post is rendered as is, by the server: its scripts reach the page.
    const post = await createPost(request, {
      name: `Actualité ${Date.now()}`,
      kind: 'news',
      headline: 'Une actualité',
      body_type: 'html',
      content: '<p>Du contenu.</p><script>window.injected = true</script><img src="data:," onerror="window.injected = true">',
    })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    await expect(page.getByText('Du contenu.')).toBeVisible()

    expect(await page.evaluate(() => 'injected' in window)).toBe(false)
    // While the inline scripts of Nuxt run: the app is loaded through the import map, and reads
    // its runtime config from `window.__NUXT__.config`
    await expect.poll(() => page.evaluate(() => {
      const root = document.querySelector('#__nuxt') as { __vue_app__?: { config: { globalProperties: { $config?: { public?: { apiBase?: string } } } } } } | null
      return root?.__vue_app__?.config.globalProperties.$config?.public?.apiBase
    })).toBeTruthy()
  })

  test('a script of the Matomo host other than matomo.js does not run', async ({ page, request }) => {
    await page.goto('/')
    const matomoHost = await page.evaluate(() => (window as { __NUXT__?: { config?: { public?: { matomo?: { host?: string } } } } }).__NUXT__?.config?.public?.matomo?.host)
    expect(matomoHost, 'the server must run with NUXT_PUBLIC_MATOMO_HOST set').toBeTruthy()
    // The real Matomo serves a JSONP API, which answers JavaScript calling the callback it is given
    await page.route('**/index.php?*', route => route.fulfill({ contentType: 'application/javascript', body: 'window.injected = true' }))

    const post = await createPost(request, {
      name: `Actualité ${Date.now()}`,
      kind: 'news',
      headline: 'Une actualité',
      body_type: 'html',
      content: `<p>Du contenu.</p><script src="${new URL('/index.php?module=API&jsoncallback=callback', matomoHost!).href}"></script>`,
    })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    await expect(page.getByText('Du contenu.')).toBeVisible()

    expect(await page.evaluate(() => 'injected' in window)).toBe(false)
  })

  test('a script written in the head does not allow the same one in the body', async ({ page, request }) => {
    // The headline ends up, unescaped, in the `content` of the description meta: the policy
    // must not take this text for a script of the head and allow its hash.
    const post = await createPost(request, {
      name: `Actualité ${Date.now()}`,
      kind: 'news',
      headline: 'Une actualité <script>window.injected = true</script>',
      body_type: 'html',
      content: '<p>Du contenu.</p><script>window.injected = true</script>',
    })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    await expect(page.getByText('Du contenu.')).toBeVisible()

    expect(await page.evaluate(() => 'injected' in window)).toBe(false)
  })
})
