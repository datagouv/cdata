import { test, expect } from '@playwright/test'
import * as path from 'path'
import { clickOutside } from '../helpers'

const __dirname = import.meta.dirname

test('can create a reuse', async ({ page }) => {
  const uniqueId = Date.now()

  await page.goto('/')
  await page.getByRole('button', { name: 'Publier sur data.gouv.fr' }).click()
  await expect(page.getByRole('link', { name: 'Une réutilisation' })).toBeVisible()
  await page.getByRole('link', { name: 'Une réutilisation' }).click()
  await page.waitForURL('**/admin/reuses/new**')

  // Step 1: Describe reuse
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Admin User' }).click()

  await page.getByRole('textbox', { name: 'Nom de la réutilisation' }).fill(`Visualisation des données ${uniqueId}`)
  await page.getByRole('textbox', { name: 'Lien' }).fill(`https://example.com/reuse-${uniqueId}`)

  await page.getByTestId('searchable-select-type').click()
  await page.getByRole('option', { name: 'Application' }).click()
  await clickOutside(page)

  await page.getByTestId('searchable-select-thmatique').click()
  await page.getByRole('option', { name: 'Culture et loisirs' }).click()
  await clickOutside(page)

  await page.getByTestId('markdown-editor').click()
  await page.getByTestId('markdown-editor').fill('Une description de ma réutilisation qui utilise des données ouvertes. Cette réutilisation permet de visualiser et d\'analyser des données publiques de manière innovante et accessible à tous les citoyens français et européens.')
  await page.getByTestId('markdown-editor').press('Tab')

  // Upload image
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Parcourir' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))
  await clickOutside(page)

  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Step 2: Link datasets (skip)
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Step 3: Publish
  await page.getByRole('button', { name: 'Publier la réutilisation' }).click()

  // Verify
  await expect(page.getByRole('heading', { level: 1 })).toContainText(`Visualisation des données ${uniqueId}`)

  // Cleanup: delete the created reuse
  await page.getByRole('link', { name: 'Modifier' }).click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('button', { name: 'Supprimer cette réutilisation' }).click()
})
