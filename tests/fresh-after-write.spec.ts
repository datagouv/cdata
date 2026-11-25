import type { BrowserContext } from '@playwright/test'
import { test, expect } from './base'
import { createDataset, deleteDatasets } from './helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

const FRESH_COOKIE = 'cdata_fresh'
const FRESH_SECONDS = 600

const freshCookie = async (context: BrowserContext) =>
  (await context.cookies()).find(cookie => cookie.name === FRESH_COOKIE)

test.describe('Fresh-after-write cookie', () => {
  test('is set by writes only, and each write pushes its expiry back', async ({ page, context, request }) => {
    const dataset = await createDataset(request, `Test fresh cookie dataset ${Date.now()}`, 'Dataset pour tester le cookie cdata_fresh')
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    expect(await freshCookie(context)).toBeUndefined()

    const beforeFollow = Date.now() / 1000
    await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()

    const afterFollow = await freshCookie(context)
    expect(afterFollow).toBeDefined()
    expect(afterFollow!.sameSite).toBe('Lax')
    expect(afterFollow!.expires).toBeGreaterThanOrEqual(Math.floor(beforeFollow) + FRESH_SECONDS - 1)
    expect(afterFollow!.expires).toBeLessThanOrEqual(Math.ceil(Date.now() / 1000) + FRESH_SECONDS + 1)

    // Cookie expiries have a one-second resolution: wait long enough for the second
    // write to land on a later one.
    await page.waitForTimeout(1500)

    await page.getByRole('button', { name: 'Retirer des favoris' }).click()
    await expect(page.getByRole('button', { name: 'Ajouter aux favoris' })).toBeVisible()

    const afterUnfollow = await freshCookie(context)
    expect(afterUnfollow).toBeDefined()
    expect(afterUnfollow!.expires).toBeGreaterThan(afterFollow!.expires)
  })

  test.describe('when the write fails', () => {
    test.use({ allowedConsoleMessages: ['status of 500', ': 500'] })

    test('is not set', async ({ page, context, request }) => {
      const dataset = await createDataset(request, `Test fresh cookie failed write ${Date.now()}`, 'Dataset pour tester le cookie cdata_fresh')
      createdDatasets.push(dataset.id)

      await page.route(url => url.pathname.endsWith('/followers/'), route =>
        route.request().method() === 'POST'
          ? route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
          : route.fallback(),
      )

      await page.goto(`/datasets/${dataset.id}/`)
      await page.waitForLoadState('networkidle')

      await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
      await expect(page.getByText(`L'API a retourné une erreur inattendue`)).toBeVisible()

      expect(await freshCookie(context)).toBeUndefined()
    })
  })
})
