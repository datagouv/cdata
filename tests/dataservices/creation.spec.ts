import { test, expect } from '@playwright/test'
import { clickOutside } from '../helpers'

test('can create a dataservice', async ({ page }) => {
  const uniqueId = Date.now()

  await page.goto('/')
  await page.getByRole('button', { name: 'Publier sur data.gouv.fr' }).click()
  await expect(page.getByRole('link', { name: 'Une API' })).toBeVisible()
  await page.getByRole('link', { name: 'Une API' }).click()
  await expect(page).toHaveURL(/\/admin\/dataservices\/new/)

  // Step 1: Describe dataservice
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Admin User' }).click()

  await page.getByRole('textbox', { name: 'Nom de l\'API' }).fill(`Mon API ${uniqueId}`)
  await page.getByTestId('markdown-editor').click()
  await page.getByTestId('markdown-editor').fill('Une description de mon API qui permet de récupérer des données publiques de manière programmatique via des endpoints REST.')
  await page.getByTestId('markdown-editor').press('Tab')
  await clickOutside(page)

  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Modal appears warning about missing OpenAPI documentation
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Step 2: Link datasets (skip)
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Step 3: Publish
  await page.getByRole('button', { name: 'Publier l\'API' }).click()

  // Verify
  await expect(page.getByRole('heading', { level: 1 })).toContainText(`Mon API ${uniqueId}`)

  // Cleanup: delete the created dataservice
  await page.getByRole('link', { name: 'Modifier' }).click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByText('Envoyer un mail automatique (voies de recours)').click()
  await page.getByRole('button', { name: 'Supprimer l\'API' }).click()
})
