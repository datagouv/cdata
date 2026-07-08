import { test, expect } from '../base'

// Regression test: GristTableViewer in url mode used to render a broken empty
// table (rows without any cell) when `columns` was undefined — here a product
// with a roadmap_url but no roadmap_column. The "Aucune donnée disponible"
// alert must show instead.

const PRODUCTS_RESPONSE = {
  records: [
    {
      id: 1,
      fields: {
        slug: 'test-product',
        product: 'Test Product',
        description: 'A test product',
        roadmap_url: 'https://grist.numerique.gouv.fr/api/docs/TEST/tables/Roadmap/records',
        // roadmap_column intentionally missing — reproduces the bug.
      },
    },
  ],
}

const ROADMAP_RESPONSE = {
  records: [
    { id: 1, fields: { Chantier: 'Refonte', Statut: 'En cours' } },
  ],
}

test('shows "no data" instead of a broken table when roadmap columns are missing', async ({ page }) => {
  await page.route('**/tables/Productsv2/records', route => route.fulfill({ json: PRODUCTS_RESPONSE }))
  await page.route('**/tables/Member/records', route => route.fulfill({ json: { records: [] } }))
  await page.route('**/tables/Roadmap/records', route => route.fulfill({ json: ROADMAP_RESPONSE }))

  await page.goto('/products/test-product')

  await expect(page.getByRole('heading', { name: 'Feuille de route' })).toBeVisible()
  await expect(page.getByText('Aucune donnée disponible')).toBeVisible()
  await expect(page.locator('.grist-table-viewer table')).toHaveCount(0)
})
