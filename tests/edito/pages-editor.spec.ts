import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { deleteEditItem, focusedDragHandle } from '../helpers'

test('can save edito page from admin without error toast', async ({ page }) => {
  await page.goto('/admin/site/edito/datasets')
  await page.waitForLoadState('networkidle')

  // Wait for page to be loaded
  await expect(page.getByRole('button', { name: 'Sauvegarder' })).toBeVisible()

  // Save the page
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  // Wait for toast to appear - should be success, not error
  await expect(page.getByText('Page sauvegardée')).toBeVisible({ timeout: 5000 })

  // Verify error toast is NOT visible
  await expect(page.getByText('Erreur lors de la sauvegarde')).not.toBeVisible()
})

async function addSection(page: Page) {
  await page.getByRole('button', { name: 'Ajouter une section' }).last().click()
  await page.getByTestId('add-bloc-SectionBloc').click()
  await page.waitForTimeout(300)
}

// Adds a bloc at the end of the last section
async function addBlocInLastSection(page: Page, key: string) {
  await page.getByTestId('add-bloc-in-section').last().click()
  await page.getByTestId(`add-bloc-${key}`).click()
  await page.waitForTimeout(300)
}

async function addTitleInLastSection(page: Page, title: string, subtitle?: string) {
  await addBlocInLastSection(page, 'TitleBloc')
  const titleBloc = page.getByTestId('bloc-TitleBloc').last()
  const titleInput = titleBloc.locator('[contenteditable="true"]').first()
  await titleInput.click()
  await titleInput.fill(title)
  await page.mouse.click(1, 1)
  if (subtitle) {
    await titleBloc.getByText('Ajouter un sous-titre').click()
    const subtitleInput = titleBloc.locator('[contenteditable="true"]').nth(1)
    await subtitleInput.click()
    await subtitleInput.fill(subtitle)
    await page.mouse.click(1, 1)
  }
}

// Picks several objects in one go in the selector opened by the "add" menu
async function selectObjects(page: Page, placeholder: string, searchTerms: Array<string>) {
  for (const term of searchTerms) {
    const searchInput = page.getByPlaceholder(placeholder)
    await searchInput.clear()
    await searchInput.fill(term)
    await page.waitForTimeout(500)

    const options = page.getByRole('option')
    if (await options.count() > 0) {
      await options.first().click()
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
  }
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.waitForTimeout(500)
}

test('can edit edito page with all bloc types', async ({ page }) => {
  // Go directly to the datasets page in edit mode
  await page.goto('/datasets?edit=true')
  await page.waitForLoadState('networkidle')

  // === Step 0: Delete all existing sections to start fresh ===
  const pageBlocs = page.locator('[data-testid^="page-"][data-drop-item]')
  while (await pageBlocs.count() > 0) {
    const before = await pageBlocs.count()
    await deleteEditItem(pageBlocs.first())
    await expect(pageBlocs).toHaveCount(before - 1)
  }

  // === Step 1: Add a HeroBloc ===
  await page.getByRole('button', { name: 'Ajouter une section' }).first().click()
  await page.getByTestId('add-bloc-HeroBloc').click()
  await page.waitForTimeout(300)

  // Edit the hero title (it has a default "Titre")
  const heroTitle = page.locator('.bg-new-blue-illustration [contenteditable="true"]').first()
  await heroTitle.click()
  await heroTitle.fill('Bienvenue sur data.gouv.fr')
  await page.mouse.click(1, 1)

  // Add a description
  await page.getByText('Ajouter une description').click()
  await page.waitForTimeout(200)
  const heroDescription = page.locator('.bg-new-blue-illustration [contenteditable="true"]').nth(1)
  await heroDescription.click()
  await heroDescription.fill('La plateforme ouverte des données publiques françaises')
  await page.mouse.click(1, 1)

  // Change the color to green
  await page.locator('.bg-new-green-illustration.size-8').click()
  await page.waitForTimeout(200)

  // Add a CTA button
  const heroCTATitle = page.locator('.bg-new-green-illustration [aria-label="Titre du bouton"]')
  await heroCTATitle.click()
  await heroCTATitle.fill('Découvrir les données')
  await page.mouse.click(1, 1)
  const heroCTAUrl = page.locator('.bg-new-green-illustration [aria-label="URL du bouton"]')
  await heroCTAUrl.fill('https://www.data.gouv.fr/fr/datasets/')

  // === Step 2: A section of datasets, laid out in a grid ===
  await addSection(page)
  await addTitleInLastSection(page, 'Nos jeux de données phares', 'Découvrez les données les plus consultées')
  await addBlocInLastSection(page, 'datasets')
  await selectObjects(page, 'Rechercher un jeu de données…', ['marché', 'adresse', 'véhicule', 'covid'])
  await expect(page.getByTestId('page-SectionBloc').last().getByTestId('grid-cell')).not.toHaveCount(0)

  // === Step 3: A section of reuses ===
  await addSection(page)
  await addTitleInLastSection(page, 'Réutilisations innovantes')
  await addBlocInLastSection(page, 'reuses')
  await selectObjects(page, 'Rechercher une réutilisation…', ['itineriz', 'kbis', 'infonet', 'proximap'])

  // === Step 4: A section of API, next to a text in a two columns grid ===
  await addSection(page)
  await addTitleInLastSection(page, 'API essentielles')
  await addBlocInLastSection(page, 'GridBloc')
  const lastSection = page.getByTestId('page-SectionBloc').last()
  // A cell is added with its content: each API gets its own cell, then the text
  await lastSection.getByTestId('add-grid-cell').click()
  await page.getByTestId('add-bloc-dataservices').click()
  await selectObjects(page, 'Rechercher une API…', ['sirene', 'explore'])
  await expect(lastSection.getByTestId('grid-cell')).toHaveCount(2)
  await lastSection.getByTestId('add-grid-cell').click()
  await page.getByTestId('add-bloc-MarkdownBloc').click()
  await expect(lastSection.getByTestId('grid-cell')).toHaveCount(3)
  await page.locator('.milkdown').last().click()
  await page.keyboard.type('Les API les plus utilisées de la plateforme.')

  // === Step 5: A LinksListBloc WITH paragraph ===
  await addSection(page)
  await addTitleInLastSection(page, 'Ressources utiles')
  await addBlocInLastSection(page, 'LinksListBloc')

  await page.getByText('Ajouter un paragraphe').first().click()
  await page.waitForTimeout(300)
  const paragraph = page.locator('p[contenteditable="true"]')
  await paragraph.click()
  await paragraph.fill('Découvrez nos guides et ressources pour mieux exploiter les données publiques.')
  await page.mouse.click(1, 1)

  await page.getByText('Ajouter un lien').first().click()
  await page.waitForTimeout(300)
  const linkTitle = page.locator('.text-3xl [contenteditable="true"]').first()
  await linkTitle.click()
  await linkTitle.fill('Documentation')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL"]').first().fill('https://doc.data.gouv.fr')

  const buttonTitle1 = page.locator('[aria-label="Titre du bouton"]').first()
  await buttonTitle1.click()
  await buttonTitle1.fill('Voir tous les guides')
  await page.mouse.click(1, 1)
  await page.locator('input[placeholder="URL du bouton"]').first().fill('https://guides.data.gouv.fr')

  // === Step 6: A MarkdownBloc in the same section ===
  await addBlocInLastSection(page, 'MarkdownBloc')
  const markdownEditor = page.locator('.milkdown').last()
  await markdownEditor.click()
  await page.keyboard.type('# Titre de section')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Voici un paragraphe avec du **texte en gras** et du *texte en italique*.')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- Premier élément')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- Deuxième élément')

  // === Step 7: An AccordionBloc ===
  await addSection(page)
  await addTitleInLastSection(page, 'Questions fréquemment posées')
  await addBlocInLastSection(page, 'AccordionListBloc')

  // Typing the title character by character tests that spaces can be typed (they were
  // blocked by DisclosureButton before the fix)
  const firstItemTitle = page.getByTestId('accordion-new-item-title')
  await firstItemTitle.click()
  await firstItemTitle.pressSequentially('Comment acceder aux donnees ?')
  await page.mouse.click(1, 1)
  await page.waitForTimeout(300)

  const secondItemTitle = page.getByTestId('accordion-new-item-title')
  await secondItemTitle.click()
  await secondItemTitle.fill('Où trouver de l\'aide ?')
  await page.mouse.click(1, 1)

  // === Step 8: Section manipulation ===
  const sectionTitles = page.getByTestId('page-SectionBloc').getByTestId('bloc-TitleBloc')
  // Move the datasets section below the reuses one with the keyboard on its drag handle,
  // then delete the reuses section
  await (await focusedDragHandle(page.getByTestId('page-SectionBloc').nth(0))).press('ArrowDown')
  await expect(sectionTitles.nth(0)).toContainText('Réutilisations innovantes')
  await deleteEditItem(page.getByTestId('page-SectionBloc').nth(0))
  await expect(sectionTitles.nth(0)).toContainText('Nos jeux de données phares')

  // === Step 9: Save the page ===
  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()

  // === Step 10: Final screenshot for visual regression ===
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  await expect(page).toHaveScreenshot('edito-page-final.png', {
    mask: [page.getByTestId('user-avatar'), page.getByTestId('commit-version'), page.getByTestId('udata-version')],
    fullPage: true,
    maxDiffPixelRatio: 0.01, // Allow 1% pixel difference for minor rendering variations
  })
})
