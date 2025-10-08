import { test, expect } from '@playwright/test'
import * as path from 'path'

const __dirname = import.meta.dirname

test('can create a dataset', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Publier sur data.gouv.fr' }).click()
  await page.getByRole('link', { name: 'Un jeu de données' }).click()
  await page.getByRole('button', { name: 'Commencer la publication' }).click()
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Admin User' }).click()
  await page.getByRole('textbox', { name: 'Titre *' }).click()
  await page.getByRole('textbox', { name: 'Titre *' }).fill('Test jeu de données')
  await page.getByRole('textbox', { name: 'Titre *' }).press('Tab')
  await page.getByTestId('markdown-editor').click()
  await page.getByTestId('markdown-editor').fill('Une description')
  await page.getByTestId('markdown-editor').press('Tab')
  await page.getByText('Il est recommandé d\'avoir une').click()
  await page.getByTestId('select-frequency').click()
  await page.screenshot({ path: 'screenshot.png' })
  await page.getByRole('option', { name: 'Inconnu' }).click()

  // When clicking "Suivant" we execute the validation of the frequency input
  // because we blur outside the select. This validation create a warning (because
  // "Inconnu" is not recommanded), and the warning make the "Suivant" button
  // move a little bit down so the click is miss. Chromium doesn't seems to have this
  // problem (only Firefox). We want to fix this one day!
  await page.getByText('Qu’est-ce qu’un jeu de données ?').click()

  await page.getByRole('button', { name: 'Suivant' }).click()
  await page.getByRole('button', { name: 'Ajoutez des fichiers' }).click()
  // Start waiting for file chooser before clicking. Note no await.
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Parcourir' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(__dirname, '../../public/illustrations/administration.svg'))
  await page.getByRole('button', { name: 'Envoyer' }).click()
  await page.getByRole('button', { name: 'Suivant' }).click()
  await page.getByRole('button', { name: 'Publier le jeu de données' }).click()
  await page.getByRole('heading', { name: 'Test jeu de données' }).click()
  await page.getByText('Une description').click()
  await page.getByTestId('expand-button').click()
  await expect(page.locator('h1')).toContainText('Test jeu de données')
  await expect(page.locator('[id="__nuxt"]')).toContainText('Une description')
  await expect(page.locator('[id="__nuxt"]')).toContainText('Description des données non renseignée')
  await expect(page.locator('[id="__nuxt"]')).toContainText('Ce jeu de données a été publié à l\'initiative et sous la responsabilité de Admin User.')
})
