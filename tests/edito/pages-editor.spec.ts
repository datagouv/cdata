import { test, expect } from '@playwright/test'

test('can edit edito page with all bloc types', async ({ page }) => {
  // Go directly to the datasets page in edit mode
  await page.goto('/datasets?edit=true')
  await page.waitForLoadState('networkidle')

  // Debug screenshot: initial state
  await page.screenshot({ path: 'tests/edito/screenshots/01-initial-state.png', fullPage: true })

  // === Step 0: Delete all existing blocs to start fresh ===
  let deleteButtons = page.locator('[title="Supprimer"]')
  let count = await deleteButtons.count()
  while (count > 0) {
    await deleteButtons.first().click()
    await page.waitForTimeout(200)
    deleteButtons = page.locator('[title="Supprimer"]')
    count = await deleteButtons.count()
  }

  // Debug screenshot: after deleting all blocs
  await page.screenshot({ path: 'tests/edito/screenshots/01b-empty-page.png', fullPage: true })

  // === Step 1: Add a DatasetsListBloc with multiple datasets ===
  await page.getByRole('button', { name: 'Ajouter un bloc' }).first().click()
  await page.getByText('Données à la une').click()
  await page.waitForTimeout(300)

  // Edit the title
  const datasetsBlocTitle = page.locator('[contenteditable="true"]').first()
  await datasetsBlocTitle.click()
  await datasetsBlocTitle.fill('Nos jeux de données phares')
  await page.mouse.click(1, 1)

  // Add subtitle
  await page.getByText('Ajouter un sous-titre').first().click()
  const datasetsSubtitle = page.locator('[contenteditable="true"]').nth(1)
  await datasetsSubtitle.click()
  await datasetsSubtitle.fill('Découvrez les données les plus consultées')
  await page.mouse.click(1, 1)

  // Add multiple datasets (4 for 2 rows) - use search terms that match fixtures
  const datasetSearchTerms = ['marché', 'adresse', 'véhicule', 'covid']
  for (let i = 0; i < 4; i++) {
    await page.getByText('Ajouter un jeu de données').click()
    await page.waitForTimeout(300)

    const searchInput = page.getByPlaceholder('Rechercher un jeu de données…')
    await searchInput.clear()
    await searchInput.fill(datasetSearchTerms[i])
    await page.waitForTimeout(500)

    const datasetOptions = page.getByRole('option')
    const optionCount = await datasetOptions.count()
    if (optionCount > 0) {
      await datasetOptions.first().click()
    }

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Valider' }).click()
    await page.waitForTimeout(300)
  }

  // Debug screenshot: after adding datasets
  await page.screenshot({ path: 'tests/edito/screenshots/02-datasets-bloc.png', fullPage: true })

  // === Step 2: Add a ReusesListBloc with multiple reuses ===
  await page.getByRole('button', { name: 'Ajouter un bloc' }).last().click()
  await page.getByText('Réutilisations à la une').click()
  await page.waitForTimeout(300)

  // Edit the title - default is "Mes réutilisations"
  const reusesBlocTitle = page.getByText('Mes réutilisations')
  await reusesBlocTitle.click()
  await reusesBlocTitle.fill('Réutilisations innovantes')
  await page.mouse.click(1, 1)

  // Add multiple reuses (4 for 2 rows) - use search terms that match fixtures
  const reuseSearchTerms = ['itineriz', 'kbis', 'infonet', 'proximap']
  for (let i = 0; i < 4; i++) {
    await page.getByText('Ajouter une réutilisation').click()
    await page.waitForTimeout(300)

    const searchInput = page.getByPlaceholder('Rechercher une réutilisation…')
    await searchInput.clear()
    await searchInput.fill(reuseSearchTerms[i])
    await page.waitForTimeout(500)

    const reuseOptions = page.getByRole('option')
    const optionCount = await reuseOptions.count()
    if (optionCount > 0) {
      await reuseOptions.first().click()
    }

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Valider' }).click()
    await page.waitForTimeout(300)
  }

  // Debug screenshot: after adding reuses
  await page.screenshot({ path: 'tests/edito/screenshots/03-reuses-bloc.png', fullPage: true })

  // === Step 3: Add a DataservicesListBloc with multiple APIs ===
  await page.getByRole('button', { name: 'Ajouter un bloc' }).last().click()
  await page.getByText('APIs à la une').click()
  await page.waitForTimeout(300)

  // Edit the title - default is "Mes APIs"
  const dataservicesBlocTitle = page.getByText('Mes APIs')
  await dataservicesBlocTitle.click()
  await dataservicesBlocTitle.fill('APIs essentielles')
  await page.mouse.click(1, 1)

  // Add multiple dataservices (3 available in fixtures: Sirene, Explore, BAN)
  const apiSearchTerms = ['sirene', 'explore', 'adresse']
  for (let i = 0; i < 3; i++) {
    await page.getByText('Ajouter une API').click()
    await page.waitForTimeout(300)

    const searchInput = page.getByPlaceholder('Rechercher une API…')
    await searchInput.clear()
    await searchInput.fill(apiSearchTerms[i])
    await page.waitForTimeout(500)

    const dataserviceOptions = page.getByRole('option')
    const optionCount = await dataserviceOptions.count()
    if (optionCount > 0) {
      await dataserviceOptions.first().click()
    }

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Valider' }).click()
    await page.waitForTimeout(300)
  }

  // Debug screenshot: after adding dataservices
  await page.screenshot({ path: 'tests/edito/screenshots/04-dataservices-bloc.png', fullPage: true })

  // === Step 4: Add a LinksListBloc WITH paragraph ===
  await page.getByRole('button', { name: 'Ajouter un bloc' }).last().click()
  await page.getByText('Liens à la une').click()
  await page.waitForTimeout(300)

  // Edit the title - default is "Mes liens"
  const linksBlocTitle1 = page.getByText('Mes liens').first()
  await linksBlocTitle1.click()
  await linksBlocTitle1.fill('Ressources utiles')
  await page.mouse.click(1, 1)

  // Add a paragraph
  await page.getByText('Ajouter un paragraphe').first().click()
  await page.waitForTimeout(300)

  const paragraph = page.locator('p[contenteditable="true"]')
  await paragraph.click()
  await paragraph.fill('Découvrez nos guides et ressources pour mieux exploiter les données publiques.')
  await page.mouse.click(1, 1)

  // Add links
  await page.getByText('Ajouter un lien').first().click()
  await page.waitForTimeout(300)

  const linkTitle = page.locator('.text-7xl [contenteditable="true"], .text-6xl [contenteditable="true"]').first()
  await linkTitle.click()
  await linkTitle.fill('Documentation')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL"]').first().fill('https://doc.data.gouv.fr')

  await page.getByText('Ajouter un lien').first().click()
  await page.waitForTimeout(300)

  const linkTitle2 = page.locator('.text-7xl [contenteditable="true"], .text-6xl [contenteditable="true"]').nth(1)
  await linkTitle2.click()
  await linkTitle2.fill('Guides')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL"]').nth(1).fill('https://guides.data.gouv.fr')

  // Fill in the main button
  const buttonTitle1 = page.locator('[aria-label="Titre du bouton"]').first()
  await buttonTitle1.click()
  await buttonTitle1.fill('Voir tous les guides')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL du bouton"]').first().fill('https://guides.data.gouv.fr')

  // Debug screenshot: after adding links bloc with paragraph
  await page.screenshot({ path: 'tests/edito/screenshots/05-links-bloc-with-paragraph.png', fullPage: true })

  // === Step 5: Add a LinksListBloc WITHOUT paragraph ===
  await page.getByRole('button', { name: 'Ajouter un bloc' }).last().click()
  await page.getByText('Liens à la une').click()
  await page.waitForTimeout(300)

  // Edit the title - default is "Mes liens" (we need to find the new one, not the first "Ressources utiles")
  const linksBlocTitle2 = page.getByText('Mes liens')
  await linksBlocTitle2.click()
  await linksBlocTitle2.fill('Liens rapides')
  await page.mouse.click(1, 1)

  // Add links directly without paragraph
  await page.getByText('Ajouter un lien').last().click()
  await page.waitForTimeout(300)

  const linkTitle3 = page.locator('.text-7xl [contenteditable="true"], .text-6xl [contenteditable="true"]').nth(2)
  await linkTitle3.click()
  await linkTitle3.fill('API')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL"]').nth(2).fill('https://api.data.gouv.fr')

  await page.getByText('Ajouter un lien').last().click()
  await page.waitForTimeout(300)

  const linkTitle4 = page.locator('.text-7xl [contenteditable="true"], .text-6xl [contenteditable="true"]').nth(3)
  await linkTitle4.click()
  await linkTitle4.fill('Support')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL"]').nth(3).fill('https://support.data.gouv.fr')

  // Fill in the main button
  const buttonTitle2 = page.locator('[aria-label="Titre du bouton"]').last()
  await buttonTitle2.click()
  await buttonTitle2.fill('Contacter le support')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL du bouton"]').last().fill('https://support.data.gouv.fr')

  // Debug screenshot: after adding links bloc without paragraph
  await page.screenshot({ path: 'tests/edito/screenshots/06-links-bloc-without-paragraph.png', fullPage: true })

  // === Step 6: Test bloc manipulation ===
  // Move the first bloc down
  await page.locator('[title="Descendre"]').first().click()
  await page.waitForTimeout(300)

  // Debug screenshot: after moving bloc down
  await page.screenshot({ path: 'tests/edito/screenshots/07-bloc-moved-down.png', fullPage: true })

  // Move it back up
  await page.locator('[title="Monter"]').nth(1).click()
  await page.waitForTimeout(300)

  // Delete the reuses bloc (second one)
  await page.locator('[title="Supprimer"]').nth(1).click()
  await page.waitForTimeout(300)

  // Debug screenshot: after deleting reuses bloc
  await page.screenshot({ path: 'tests/edito/screenshots/08-reuses-bloc-deleted.png', fullPage: true })

  // Re-add a reuses bloc and add some reuses to it
  await page.getByRole('button', { name: 'Ajouter un bloc' }).last().click()
  await page.getByText('Réutilisations à la une').click()
  await page.waitForTimeout(300)

  // Add 2 reuses to the new bloc (use last() to target the new bloc)
  const newReuseSearchTerms = ['mobby', 'chalandise']
  for (let i = 0; i < 2; i++) {
    await page.getByText('Ajouter une réutilisation').last().click()
    await page.waitForTimeout(300)

    const searchInput = page.getByPlaceholder('Rechercher une réutilisation…')
    await searchInput.clear()
    await searchInput.fill(newReuseSearchTerms[i])
    await page.waitForTimeout(500)

    const reuseOptions = page.getByRole('option')
    const optionCount = await reuseOptions.count()
    if (optionCount > 0) {
      await reuseOptions.first().click()
    }

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Valider' }).click()
    await page.waitForTimeout(300)
  }

  // Debug screenshot: after re-adding reuses bloc
  await page.screenshot({ path: 'tests/edito/screenshots/09-reuses-bloc-readded.png', fullPage: true })

  // === Step 7: Save the page ===
  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await page.waitForTimeout(1000)

  // Debug screenshot: after saving
  await page.screenshot({ path: 'tests/edito/screenshots/10-after-save.png', fullPage: true })

  // Wait for the toast to confirm save
  await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()

  // === Step 8: Final screenshot for visual regression ===
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  // Take the final screenshot for visual regression testing
  await expect(page).toHaveScreenshot('edito-page-final.png', {
    mask: [page.getByTestId('user-avatar')],
    fullPage: true,
    maxDiffPixelRatio: 0.01, // Allow 1% pixel difference for minor rendering variations
  })
})
