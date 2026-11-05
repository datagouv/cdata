import { test, expect } from './base'
import { gotoHydrated } from './helpers'
import { exampleDataservices, exampleOrganizations } from '../utils/design/cardExamples'
import type { Page } from '@playwright/test'

async function search(page: Page, type: 'organizations' | 'dataservices', data: unknown, query: string) {
  await page.route(`**/api/2/${type}/search/**`, route => route.fulfill({
    json: { data: [data], total: 1, page: 1, page_size: 20, facets: {} },
  }))
  await gotoHydrated(page, type === 'organizations' ? '/organizations' : '/dataservices/search')
  await page.getByRole('searchbox').fill(query)
  await expect(page.getByRole('heading').filter({ hasText: query })).toBeVisible()
}

test('narrow cards keep long titles below status badges', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  const api = exampleDataservices[1]!.data
  await search(page, 'dataservices', api, api.title)
  const title = page.getByRole('heading', { name: 'API des équipements accessibles et des services de proximité', exact: true })
  const card = page.getByRole('article').filter({ has: title })
  const badge = card.getByText('Ouvert avec un compte', { exact: true })
  const titleBox = await title.boundingBox()
  const badgeBox = await badge.boundingBox()
  expect(titleBox).not.toBeNull()
  expect(badgeBox).not.toBeNull()
  expect(titleBox!.y).toBeGreaterThanOrEqual(badgeBox!.y + badgeBox!.height)
  expect(titleBox!.width).toBeGreaterThan(200)
})

test('certification is described on the focused organization link', async ({ page }) => {
  const organization = exampleOrganizations[0]!.data
  await search(page, 'organizations', organization, organization.name)
  const link = page.locator('.dg-organization-content-card .dg-card-title-link').first()
  await link.focus()
  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toContainText('certifiée par data.gouv.fr')
  await expect(link).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') as string)
  await page.keyboard.press('Escape')
  await expect(tooltip).not.toBeVisible()
  await expect(link).toBeFocused()
  await expect(link).not.toHaveAttribute('aria-describedby')
})

test('organization search uses the banner card variant', async ({ page }) => {
  await page.route('**/api/2/organizations/search/**', route => route.fulfill({ json: {
    data: [{
      id: 'banner-organization', name: 'Organisation avec bannière', slug: 'banner-organization',
      page: '/organizations/banner-organization', logo: null, logo_thumbnail: null,
      badges: [{ kind: 'public-service' }], description: '',
      banner_color: '#ececfe', banner_image: null, banner_image_position: 50,
      metrics: { datasets: 1, dataservices: 0, reuses: 0, followers: 0 },
    }], total: 1, page: 1, page_size: 21,
  } }))
  await gotoHydrated(page, '/organizations')
  await page.getByRole('searchbox').fill('Organisation avec bannière')
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Organisation avec bannière', exact: true }) })
  await expect(card).toHaveClass(/dg-organization-with-banner/)
  await expect(card.locator('.dg-organization-card-banner')).toBeVisible()
  await expect(card.locator('.dg-organization-card-banner')).toHaveCSS('background-color', 'rgb(236, 236, 254)')
})
