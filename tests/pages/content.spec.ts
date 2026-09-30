import { test, expect } from '../base'

// Pages are stored in the datagouvfr-pages GitHub repository, either as a
// Markdown or as an HTML file, and the server route has to find out which one
// exists. Both extensions must keep rendering.
const pages = [
  { url: '/pages/legal/cgu', title: 'Modalités d’utilisation', heading: 'Modalités d’utilisation' }, // .md
  { url: '/pages/donnees_covid', title: 'Données relatives au Covid-19', heading: 'Les données relatives au COVID-19' }, // .html
]

test.describe('Pages content', () => {
  pages.forEach(({ url, title, heading }) => {
    test(`${url} renders its content`, async ({ page }) => {
      const response = await page.goto(url)
      expect(response?.status()).toBe(200)
      await expect(page.getByLabel('Vous êtes ici :')).toContainText(title)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    })
  })

  test('going back before the next page is loaded shows the previous one, not a 404', async ({ page }) => {
    await page.goto('/pages/legal/licences')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // The next page never answers: the back navigation always happens while it
    // is still loading, and the previous page is still the one displayed.
    let releaseNextPage = () => {}
    await page.route('**/nuxt-api/pages/legal/cgu', async (route) => {
      await new Promise<void>((resolve) => {
        releaseNextPage = resolve
      })
      await route.abort()
    })

    await page.locator('footer').getByRole('link', { name: 'Modalités d\'utilisation' }).click()
    await page.waitForURL('**/pages/legal/cgu')
    await page.goBack()
    await page.waitForURL('**/pages/legal/licences')

    // The abandoned page used to raise its 404 a few ms after the back
    // navigation. Nothing marks the moment it would have, hence a fixed window.
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: '404' })).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    releaseNextPage()
  })
})
