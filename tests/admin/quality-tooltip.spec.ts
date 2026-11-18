import { test, expect } from '../base'
import { API_BASE, createDataset, gotoHydrated } from '../helpers'

// The quality tooltip of the admin pages is a `Tooltip` around a non-focusable meter, with a
// link in its content: it covers the cases outside of the content cards.
test.describe('quality tooltip of the admin dataset page', () => {
  let datasetId: string

  test.beforeEach(async ({ page }) => {
    const dataset = await createDataset(page.request, `Infobulle qualité ${Date.now()}`, 'Jeu de données pour tester l’infobulle de qualité.')
    datasetId = dataset.id
    await gotoHydrated(page, `/admin/datasets/${dataset.id}/`)
  })

  test.afterEach(async ({ page }) => {
    await page.request.delete(`${API_BASE}/api/1/datasets/${datasetId}/`)
  })

  test('the guide link of the tooltip can be reached with the mouse', async ({ page }) => {
    await page.getByRole('meter').first().hover()
    const link = page.getByRole('tooltip').getByRole('link', { name: /En savoir plus sur cet indicateur/ })
    await expect(link).toBeVisible()
    await link.hover()
    await expect(link).toBeVisible()
  })

  test('the tooltip opens with the keyboard and describes the focused score', async ({ page }) => {
    const reference = page.getByRole('meter').first().locator('..')
    await reference.focus()
    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toContainText('Qualité des métadonnées :')
    await expect(reference).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') as string)
    await page.keyboard.press('Escape')
    await expect(tooltip).toHaveCount(0)
  })
})
