import { test, expect } from './base'
import { gotoHydrated } from './helpers'
import { exampleDataservices, exampleDatasets, exampleOrganizations, exampleReuses } from '../utils/design/cardExamples'
import type { Page } from '@playwright/test'

const searchPages = {
  organizations: '/organizations',
  dataservices: '/dataservices/search',
  reuses: '/reuses/search',
}

async function search(page: Page, type: keyof typeof searchPages, data: unknown, query: string) {
  await page.route(`**/api/2/${type}/search/**`, route => route.fulfill({
    json: { data: [data], total: 1, page: 1, page_size: 20, facets: {} },
  }))
  await gotoHydrated(page, searchPages[type])
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
  const link = page.getByRole('article').getByRole('link', { name: organization.name }).first()
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
  await expect(card.getByTestId('organization-banner')).toBeVisible()
  await expect(card.getByTestId('organization-banner')).toHaveCSS('background-color', 'rgb(236, 236, 254)')
})

test('a reuse image that fails to load is replaced by its placeholder', async ({ page }) => {
  const reuse = { ...exampleReuses[0]!.data, image: '/broken-card-image.png', image_thumbnail: '/broken-card-image.png' }
  await page.route('**/broken-card-image.png', route => route.fulfill({ status: 404 }))
  await search(page, 'reuses', reuse, reuse.title)
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: reuse.title }) })
  await expect(card.getByRole('img', { name: reuse.title })).toBeVisible()
  await expect(card.locator('img')).toHaveCount(0)
})

test('narrow reuse cards in a grid keep their title below the status badge', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await gotoHydrated(page, '/design/cards')
  const reuse = exampleReuses[2]!.data
  const title = page.getByRole('heading', { name: reuse.title, exact: true }).first()
  const card = page.getByRole('article').filter({ has: title }).first()
  const badge = card.getByText('Archivé', { exact: true })
  const titleBox = await title.boundingBox()
  const badgeBox = await badge.boundingBox()
  expect(titleBox).not.toBeNull()
  expect(badgeBox).not.toBeNull()
  expect(titleBox!.y).toBeGreaterThanOrEqual(badgeBox!.y + badgeBox!.height)
})

test('a null organization URL renders the organization name as plain text', async ({ page }) => {
  await gotoHydrated(page, '/design/cards')
  const example = exampleDatasets.find(example => example.organizationUrl === null)!
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: example.data.title }) })
  const organizationName = example.data.organization!.name
  await expect(card.getByText(organizationName).first()).toBeVisible()
  await expect(card.getByRole('button', { name: organizationName })).toHaveCount(0)
  await expect(card.getByRole('link', { name: organizationName })).toHaveCount(0)
})
