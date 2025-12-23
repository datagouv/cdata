import { test, expect, type Page } from '@playwright/test'

async function addBloc(page: Page, blocName: string) {
  await page.getByRole('button', { name: 'Ajouter un bloc' }).first().click()
  await page.getByRole('menuitem', { name: blocName }).click()
}

async function deleteAllBlocsAndSave(page: Page) {
  const deleteButtons = page.getByRole('button', { name: 'Supprimer le bloc' })
  while (await deleteButtons.count() > 0) {
    await deleteButtons.first().click()
  }
  const saveButton = page.getByRole('button', { name: 'Sauvegarder' })
  if (await saveButton.isVisible()) {
    await saveButton.click()
    await expect(page.getByText('Page sauvegardée')).toBeVisible()
  }
}

// Use serial mode since tests share state (pages are saved to the database)
test.describe.serial('Edito pages', () => {
  test.describe('Datasets edito page', () => {
    test('can create a DatasetsListBloc and see it on /datasets', async ({ page }) => {
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Données à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test DatasetsListBloc Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test DatasetsListBloc Subtitle')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/datasets')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test DatasetsListBloc Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test DatasetsListBloc Subtitle', { exact: true })).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })

    test('can create a LinksListBloc and see it on /datasets', async ({ page }) => {
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Liens à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test LinksListBloc Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test LinksListBloc Subtitle')
      await page.getByRole('textbox', { name: 'Texte libre' }).fill('Test LinksListBloc paragraph content.')
      await page.getByRole('textbox', { name: 'Titre du bouton principal' }).fill('Test Main Button')
      await page.getByRole('textbox', { name: 'Lien pour le bouton principal' }).fill('https://example.com/test-main-button')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/datasets')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test LinksListBloc Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test LinksListBloc Subtitle', { exact: true })).toBeVisible()
      await expect(page.getByText('Test LinksListBloc paragraph content.', { exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Test Main Button', exact: true })).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })

    test('can create a LinksListBloc with links and see them on /datasets', async ({ page }) => {
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Liens à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test Links With Items Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test Links With Items Subtitle')

      // Scroll down in the modal to see the "Ajouter un lien" button
      const modal = page.locator('[role="dialog"]')
      await modal.evaluate(el => el.scrollTop = el.scrollHeight)

      await page.getByRole('button', { name: 'Ajouter un lien' }).click()

      // Fill link fields using the label
      await page.getByLabel('Titre', { exact: true }).last().fill('Test Link Item One')
      await page.getByLabel('Lien vers la page').last().fill('https://example.com/test-link-one')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/datasets')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test Links With Items Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Links With Items Subtitle', { exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Test Link Item One' }).first()).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })

    test('can create a MarkdownBloc and see it on /datasets', async ({ page }) => {
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Contenu libre')

      await expect(page.getByText('Contenu libre').first()).toBeVisible()
      await expect(page.getByText('Pas encore de contenu').first()).toBeVisible()

      const allEditButtons = page.getByRole('button', { name: 'Modifier le bloc' })
      await allEditButtons.last().click()

      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()
      await expect(modal.getByText('Contenu Markdown')).toBeVisible()

      // Switch to raw markdown mode and use the textarea
      await modal.getByTitle('Voir le markdown').click()
      await modal.locator('textarea').fill('Test Markdown Content for E2E')

      await modal.getByRole('button', { name: 'Valider' }).click()

      await expect(page.getByText('Test Markdown Content for E2E').first()).toBeVisible()

      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Page sauvegardée')).toBeVisible({ timeout: 10000 })

      await page.goto('/datasets')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test Markdown Content for E2E').first()).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/datasets')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })
  })

  test.describe('Reuses edito page', () => {
    test('can create a ReusesListBloc and see it on /reuses', async ({ page }) => {
      await page.goto('/admin/site/edito/reuses')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Réutilisations à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test ReusesListBloc Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test ReusesListBloc Subtitle')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/reuses')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test ReusesListBloc Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test ReusesListBloc Subtitle', { exact: true })).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/reuses')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })

    test('can create a DatasetsListBloc on reuses page and see it on /reuses', async ({ page }) => {
      await page.goto('/admin/site/edito/reuses')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Données à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test Datasets On Reuses Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test Datasets On Reuses Subtitle')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/reuses')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test Datasets On Reuses Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Datasets On Reuses Subtitle', { exact: true })).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/reuses')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })
  })

  test.describe('Dataservices edito page', () => {
    test('can create a DataservicesListBloc and see it on /dataservices', async ({ page }) => {
      await page.goto('/admin/site/edito/dataservices')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'APIs à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test DataservicesListBloc Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test DataservicesListBloc Subtitle')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/dataservices')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test DataservicesListBloc Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test DataservicesListBloc Subtitle', { exact: true })).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/dataservices')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })

    test('can create a LinksListBloc with all fields on /dataservices', async ({ page }) => {
      await page.goto('/admin/site/edito/dataservices')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)

      await addBloc(page, 'Liens à la une')

      await page.getByRole('button', { name: 'Modifier le bloc' }).first().click()
      await page.getByRole('textbox', { name: 'Titre *' }).fill('Test Links On Dataservices Title')
      await page.getByRole('textbox', { name: 'Sous-titre' }).fill('Test Links On Dataservices Subtitle')
      await page.getByRole('textbox', { name: 'Texte libre' }).fill('Test Links On Dataservices paragraph.')
      await page.getByRole('textbox', { name: 'Titre du bouton principal' }).fill('Test Dataservices Main Button')
      await page.getByRole('textbox', { name: 'Lien pour le bouton principal' }).fill('https://example.com/test-ds-main')

      await page.getByRole('button', { name: 'Valider' }).click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Page sauvegardée')).toBeVisible()

      await page.goto('/dataservices')
      await page.waitForLoadState('networkidle')

      await expect(page.getByText('Test Links On Dataservices Title', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Links On Dataservices Subtitle', { exact: true })).toBeVisible()
      await expect(page.getByText('Test Links On Dataservices paragraph.', { exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Test Dataservices Main Button', exact: true })).toBeVisible()

      // Cleanup: delete the bloc
      await page.goto('/admin/site/edito/dataservices')
      await page.waitForLoadState('networkidle')
      await deleteAllBlocsAndSave(page)
    })
  })
})
