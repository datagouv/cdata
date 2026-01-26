import { test, expect } from '@playwright/test'
import { clickOutside } from '../helpers'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Badge editing', () => {
  test.describe('Dataset badges', () => {
    test('can add a badge on a dataset', async ({ page }) => {
      const uniqueId = Date.now()

      // Create dataset via API
      const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
        data: {
          title: `Test badges ${uniqueId}`,
          description: 'Description pour test des badges',
          frequency: 'unknown',
        },
      })
      const dataset = await response.json()

      // Go to admin page
      await page.goto(`/admin/datasets/${dataset.id}/`)

      // Verify badges selector is visible (admin only)
      const badgeSelect = page.getByTestId('badge-select')
      await expect(badgeSelect).toBeVisible()

      // Open badge selector and add a badge
      await badgeSelect.click()
      const firstBadgeOption = page.getByRole('option').first()
      await firstBadgeOption.click()
      await clickOutside(page)

      // Save the form
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      // Verify success toast
      await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

      // Verify via API that badge was saved
      const datasetResponse = await page.request.get(`${API_BASE}/api/1/datasets/${dataset.id}/`)
      const updatedDataset = await datasetResponse.json()
      expect(updatedDataset.badges.length).toBe(1)
      expect(updatedDataset.badges[0].kind).toBe('hvd')
    })
  })

  test.describe('Organization badges', () => {
    test('can add a badge on an organization', async ({ page }) => {
      const uniqueId = Date.now()

      // Create organization via API
      const response = await page.request.post(`${API_BASE}/api/1/organizations/`, {
        data: {
          name: `Test org badges ${uniqueId}`,
          description: 'Description pour test des badges',
        },
      })
      const organization = await response.json()

      // Go to admin profile page
      await page.goto(`/admin/organizations/${organization.id}/profile/`)

      // Verify badges selector is visible (admin only)
      const badgeSelect = page.getByTestId('badge-select')
      await expect(badgeSelect).toBeVisible()

      // Open badge selector and add a badge
      await badgeSelect.click()
      const firstBadgeOption = page.getByRole('option').first()
      await firstBadgeOption.click()
      await clickOutside(page)

      // Save the form
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      // Verify success toast
      await expect(page.getByText('Organisation mise à jour !')).toBeVisible()

      // Verify via API that badge was saved
      const orgResponse = await page.request.get(`${API_BASE}/api/1/organizations/${organization.id}/`)
      const updatedOrg = await orgResponse.json()
      expect(updatedOrg.badges.length).toBe(1)
    })
  })
})
