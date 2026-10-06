import { expect, test } from '../base'

const ORG_SLUG = 'sobrana'

test.describe('organization banner', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    // Tests mutate the shared fixture org; reset banner state so reruns and
    // the second browser project start from the default banner.
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
    const page = await context.newPage()
    await page.request.put('http://dev.local:7000/api/1/organizations/6461fa1f4e1de2ee027048b7/', {
      data: { banner_color: null },
    })
    await context.close()
  })

  test('renders the default banner at desktop height', async ({ page }) => {
    await page.goto(`/organizations/${ORG_SLUG}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toHaveCSS('height', '230px')
  })

  test('admins see the add-banner control on hover', async ({ page }) => {
    await page.goto(`/organizations/${ORG_SLUG}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await expect(page.getByRole('button', { name: 'Ajouter une bannière' })).toBeVisible()
  })

  test('applying a swatch color updates the banner immediately', async ({ page }) => {
    await page.goto(`/organizations/${ORG_SLUG}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await page.getByRole('button', { name: 'Ajouter une bannière' }).click()
    await page.getByRole('tab', { name: 'Couleur' }).click()
    await page.getByRole('button', { name: 'green-emeraude' }).click()

    await expect(banner).toHaveCSS('background-color', 'rgb(0, 169, 95)')
  })

  test('uploading an image sets an image banner with reposition available', async ({ page }) => {
    test.skip(true, 'pending udata banner endpoints (POST/DELETE /banner/)')
    await page.goto(`/organizations/${ORG_SLUG}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover()
    await page.getByRole('button', { name: 'Modifier' }).click()
    await page.getByRole('tab', { name: 'Importer' }).click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/banner-1200x400.png')

    await expect.poll(async () => banner.evaluate(el => getComputedStyle(el).backgroundImage)).toMatch(/blob:|http/)
    await expect(banner.locator('..').getByText('Repositionner')).toBeVisible()
  })

  test('repositioning persists after reload', async ({ page }) => {
    test.skip(true, 'pending udata banner endpoints (POST/DELETE /banner/)')
    await page.goto(`/organizations/${ORG_SLUG}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover()
    await page.getByRole('button', { name: 'Repositionner' }).click()

    await expect(page.getByText('Glisser pour repositionner')).toBeVisible()
    // startReposition loads the image natural size asynchronously; dragging
    // before onload fires would be a no-op.
    await page.waitForTimeout(500)
    const box = (await banner.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 60, { steps: 5 })
    await page.mouse.up()
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await page.reload()
    const position = await banner.evaluate(el => parseFloat(getComputedStyle(el).backgroundPositionY))
    expect(position).toBeGreaterThan(50)
  })

  test('deleting the banner restores the default color', async ({ page }) => {
    test.skip(true, 'pending udata banner endpoints (POST/DELETE /banner/)')
    await page.goto(`/organizations/${ORG_SLUG}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover()
    await page.getByRole('button', { name: 'Supprimer la bannière' }).click()

    await expect(banner).toHaveCSS('background-color', 'rgb(243, 246, 254)')
  })

  test('admin "Voir la page de l\'organisation" targets the presentation tab', async ({ page }) => {
    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/profile')

    await expect(page.getByRole('link', { name: /Voir la page de l'organisation/ })).toHaveAttribute('href', /\/presentation$/)
  })
})
