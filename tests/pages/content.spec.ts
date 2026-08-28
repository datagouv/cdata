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
})
