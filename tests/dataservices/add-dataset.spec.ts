import { test, expect } from '../base'
import { clickOutside } from '../helpers'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test('can add a dataset to an existing dataservice', async ({ page }) => {
  const uniqueId = Date.now()

  // Create a dataservice via API
  const dataserviceResponse = await page.request.post(`${API_BASE}/api/1/dataservices/`, {
    data: {
      title: `Test API ${uniqueId}`,
      description: 'Une API de test pour vérifier l\'ajout de datasets',
    },
  })
  const dataservice = await dataserviceResponse.json()

  // Create a dataset via API
  const datasetResponse = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: `Test dataset ${uniqueId}`,
      description: 'Un dataset de test à associer à l\'API',
      frequency: 'unknown',
    },
  })
  const dataset = await datasetResponse.json()

  // Go to the dataservice admin page
  await page.goto(`/admin/dataservices/${dataservice.id}/datasets`)

  // Click on the dataset select dropdown
  await page.getByTestId('searchable-select-rechercherunjeudedonnes').click()

  // Type the dataset name to search
  await page.getByPlaceholder('Rechercher un jeu de données…').fill(`Test dataset ${uniqueId}`)
  await page.waitForTimeout(500)

  // Select the dataset from the dropdown
  await page.getByRole('option', { name: `Test dataset ${uniqueId}` }).click()
  await clickOutside(page)

  // Verify the dataset card is displayed (check for the description which is unique to the card)
  await expect(page.locator('text=Un dataset de test à associer à l\'API')).toBeVisible()

  // Save the changes
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  // Verify the dataset card is still visible after save (use the link in the card)
  await expect(page.getByRole('link', { name: `Test dataset ${uniqueId}` })).toBeVisible()

  // Cleanup: delete the created resources
  await page.request.delete(`${API_BASE}/api/1/dataservices/${dataservice.id}/`)
  await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
})
