import type { Page } from '@playwright/test'
import { test, expect } from './base'
import { gotoHydrated } from './helpers'

const certificationLabel = 'L\'identité de ce service public est certifiée par data.gouv.fr'

// Popovers are teleported out of the cards: the organization details are the one holding the link to its page.
function detailsPanel(page: Page) {
  return page.locator('#tooltips > *').filter({ has: page.getByRole('link', { name: 'Voir la page de l’organisation' }) })
}

const organization = {
  id: 'card-organization', name: 'Organisation des cartes', acronym: null,
  slug: 'card-organization', page: '/organizations/card-organization',
  logo: null, logo_thumbnail: null, badges: [{ kind: 'public-service' }, { kind: 'certified' }],
}
const reuse = {
  id: 'card-reuse', title: 'Une réutilisation de démonstration avec un titre suffisamment long pour vérifier le retour à la ligne',
  slug: 'card-reuse', page: '/reuses/card-reuse',
  description: 'Une description de la réutilisation pour vérifier son affichage selon la largeur disponible.',
  image: null, organization, owner: null, type: 'application',
  created_at: '2026-01-12T12:00:00+00:00', private: false, archived: null,
  metrics: { views: 2400, followers: 24 },
}
const organizationDetails = {
  ...organization,
  description: 'Description complète de l’organisation, affichée sur deux lignes dans la fiche de détails.',
  metrics: { datasets: 42, dataservices: 3, reuses: 7, followers: 12 },
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/1/organizations/card-organization/**', route => route.fulfill({ json: organizationDetails }))
  await page.route('**/api/2/reuses/search/**', route => route.fulfill({
    json: { data: [reuse], total: 1, page: 1, page_size: 20, facets: {} },
  }))
  await gotoHydrated(page, '/reuses/search')
  // Trigger a client-side search so the same fixture works with SSR enabled.
  await page.getByRole('searchbox', { name: 'Rechercher une réutilisation de données' }).fill('cartes de démonstration')
  await expect(page.getByRole('heading', { name: reuse.title })).toBeVisible()
})

test('organization details button is named after the organization', async ({ page }) => {
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: reuse.title }) })
  await expect(card.getByRole('button', { name: organization.name })).toHaveAccessibleDescription('À propos de cette organisation')
})

test('organization details remain independent from the full-card link and close with Escape', async ({ page }) => {
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: reuse.title }) })
  const trigger = card.getByRole('button', { name: organization.name })
  await trigger.focus()
  await expect(page.getByRole('tooltip')).toContainText(certificationLabel)
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const destination = page.getByRole('link', { name: 'Voir la page de l’organisation' })
  await expect(destination).toBeVisible()
  await expect(destination).toHaveAttribute('href', organization.page)
  const panel = detailsPanel(page)
  await expect(panel.getByText(organizationDetails.description)).toBeVisible()
  await expect(panel.getByText('42 jeux de données', { exact: true })).toBeVisible()
  await expect(panel.getByText(organizationDetails.description)).toHaveCSS('-webkit-line-clamp', '2')
  // Opening the details with the keyboard closes the certification tooltip of the focused button.
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  await expect(page).toHaveURL(/\/reuses\/search/)
  await page.keyboard.press('Escape')
  await expect(destination).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(card.getByRole('link', { name: reuse.title })).toHaveAttribute('href', reuse.page)
})

test('organization details load only on demand and are reused after reopening', async ({ page }) => {
  let requests = 0
  await page.route('**/api/1/organizations/card-organization/**', (route) => {
    requests++
    return route.fulfill({ json: organizationDetails })
  })
  expect(requests).toBe(0)
  const trigger = page.getByRole('button', { name: organization.name })
  await trigger.click()
  await expect(page.getByRole('tooltip')).not.toBeVisible()
  await expect(page.getByText(organizationDetails.description)).toBeVisible()
  await page.keyboard.press('Escape')
  await trigger.click()
  await expect(page.getByText(organizationDetails.description)).toBeVisible()
  expect(requests).toBe(1)
})

test('mobile cards retain identity and date without overflowing the viewport', async ({ page }) => {
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: reuse.title }) })
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(card.getByText(reuse.description)).toBeVisible()
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(card.getByRole('heading', { name: reuse.title })).toBeVisible()
  await expect(card.getByRole('button', { name: organization.name })).toBeVisible()
  await expect(card.locator('time')).toBeVisible()
  await expect(card.getByText(reuse.description)).not.toBeVisible()
  const box = await card.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)
})

test.describe('when the organization details fail to load', () => {
  test.use({ allowedConsoleMessages: ['Failed to load resource: the server responded with a status of 500'] })

  test('the details report it, keep the link to the organization page and retry when reopened', async ({ page }) => {
    await page.route('**/api/1/organizations/card-organization/**', route => route.fulfill({ status: 500 }))
    const trigger = page.getByRole('button', { name: organization.name })
    await trigger.click()
    const panel = detailsPanel(page)
    await expect(panel.getByText('Les détails de cette organisation sont temporairement indisponibles.')).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Voir la page de l’organisation' })).toHaveAttribute('href', organization.page)

    await page.route('**/api/1/organizations/card-organization/**', route => route.fulfill({ json: organizationDetails }))
    await page.keyboard.press('Escape')
    await trigger.click()
    await expect(panel.getByText(organizationDetails.description)).toBeVisible()
    await expect(panel.getByText('Les détails de cette organisation sont temporairement indisponibles.')).toHaveCount(0)
  })
})

test('certification tooltip is keyboard accessible inside organization details', async ({ page }) => {
  await page.getByRole('button', { name: organization.name }).click()
  const panel = detailsPanel(page)
  await expect(panel.getByText('Service public', { exact: true })).toBeVisible()
  const certificate = panel.getByText(certificationLabel, { exact: true }).locator('..')
  await certificate.focus()
  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toContainText('certifiée par data.gouv.fr')
  await expect(certificate).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') as string)
  await page.keyboard.press('Escape')
  await expect(tooltip).not.toBeVisible()
  await expect(panel).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).not.toBeVisible()
})
