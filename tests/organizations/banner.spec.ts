import { expect, test } from '../base'
import type { ApiOrganization } from '../helpers'
import { createOrganization, deleteOrganizations } from '../helpers'

test.describe('organization banner', () => {
  test.describe.configure({ mode: 'serial' })

  let org: ApiOrganization

  test.beforeAll(async ({ browser }, testInfo) => {
    // The chromium and firefox projects run this mutating suite in parallel:
    // each project gets its own organization so they never share banner state.
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
    org = await createOrganization(context.request, `banner-e2e ${testInfo.project.name} ${Date.now()}`)
    await context.close()
  })

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
    await deleteOrganizations(context.request, [org.id])
    await context.close()
  })

  test('renders the default banner at desktop height', async ({ page }) => {
    await page.goto(`/organizations/${org.id}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toHaveCSS('height', '230px')
  })

  test('admins see the add-banner control on hover', async ({ page }) => {
    await page.goto(`/organizations/${org.id}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await expect(page.getByRole('button', { name: 'Ajouter une bannière' })).toBeVisible()
  })

  test('applying a swatch color updates the banner immediately', async ({ page }) => {
    await page.goto(`/organizations/${org.id}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await page.getByRole('button', { name: 'Ajouter une bannière' }).click()
    await page.getByRole('button', { name: 'Couleur' }).click()
    await page.getByRole('button', { name: 'green-emeraude' }).click()

    await expect(banner).toHaveCSS('background-color', 'rgb(0, 169, 95)')
  })

  test('saving the presentation does not wipe the banner color', async ({ page }) => {
    // The blocs save PUTs the whole organization: it must spread the CURRENT
    // org (shared via the props getter), not a snapshot from page setup.
    await page.goto(`/organizations/${org.id}/presentation?edit=true`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Présentation sauvegardée')).toBeVisible()

    await page.goto(`/organizations/${org.id}/datasets`)
    await expect(page.getByTestId('organization-banner')).toHaveCSS('background-color', 'rgb(0, 169, 95)')
  })

  test('uploading an image sets an image banner with reposition available', async ({ page }) => {
    await page.goto(`/organizations/${org.id}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await page.getByRole('button', { name: 'Modifier' }).click()
    await page.getByRole('button', { name: 'Importer' }).click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/banner-1200x400.png')

    await expect.poll(async () => banner.evaluate(el => getComputedStyle(el).backgroundImage)).toMatch(/blob:|http/)
    await expect(banner.locator('..').getByText('Repositionner')).toBeVisible()
  })

  test('repositioning persists after reload', async ({ page }) => {
    await page.goto(`/organizations/${org.id}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await page.getByRole('button', { name: 'Repositionner' }).click()

    await expect(page.getByText('Glisser pour repositionner')).toBeVisible()
    const box = (await banner.boundingBox())!
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    // startReposition loads the image natural size asynchronously; retry the
    // drag (re-issuing the move) until it applies instead of sleeping a fixed
    // duration that races the image load.
    await expect(async () => {
      await page.mouse.move(cx, cy - 60)
      const position = await banner.evaluate(el => parseFloat(el.style.backgroundPosition.split(' ')[1] ?? '50'))
      expect(position).toBeGreaterThan(50)
    }).toPass({ timeout: 8000, intervals: [300] })
    await page.mouse.up()
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await page.reload()
    const position = await banner.evaluate(el => parseFloat(getComputedStyle(el).backgroundPositionY))
    expect(position).toBeGreaterThan(50)
  })

  test('deleting the banner restores the default color', async ({ page }) => {
    await page.goto(`/organizations/${org.id}/datasets`)

    const banner = page.getByTestId('organization-banner')
    await banner.hover({ position: { x: 30, y: 15 } })
    await page.getByRole('button', { name: 'Supprimer la bannière' }).click()

    await expect(banner).toHaveCSS('background-color', 'rgb(243, 246, 254)')
  })

  test('admin "Voir la page de l\'organisation" targets the presentation tab', async ({ page }) => {
    await page.goto(`/admin/organizations/${org.id}/profile`)

    await expect(page.getByRole('link', { name: /Voir la page de l'organisation/ })).toHaveAttribute('href', /\/presentation$/)
  })
})
