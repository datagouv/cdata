import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { deleteEditItem, focusedDragHandle, gotoHydrated } from '../helpers'

// Both tests save the edito page of the site's datasets: run in parallel, one would
// overwrite what the other just saved.
test.describe.configure({ mode: 'serial' })

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

// Sections are the only blocs of a page: no menu to pick one from
async function addSection(page: Page) {
  const sections = page.getByTestId('page-SectionBloc')
  const before = await sections.count()
  await page.getByRole('button', { name: 'Ajouter une section' }).last().click()
  await expect(sections).toHaveCount(before + 1)
}

async function pickInLastSectionAddMenu(page: Page, key: string) {
  await page.getByTestId('add-bloc-in-section').last().click()
  await page.getByTestId(`add-bloc-${key}`).click()
}

// Adds a bloc at the end of the last section
async function addBlocInLastSection(page: Page, key: string) {
  const blocs = page.getByTestId('page-SectionBloc').last().getByTestId(`bloc-${key}`)
  const before = await blocs.count()
  await pickInLastSectionAddMenu(page, key)
  await expect(blocs).toHaveCount(before + 1)
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

// Adds object blocs at the end of the last section, picking each object by the option bearing
// its title, so a slow search answering after the next keystroke cannot get the wrong object
// picked, or none at all.
async function addObjectsInLastSection(page: Page, key: string, dialogTitle: string, picks: Array<{ search: string, title: RegExp }>): Promise<void> {
  await pickInLastSectionAddMenu(page, key)
  const dialog = page.getByRole('dialog', { name: dialogTitle })
  const search = dialog.getByRole('combobox')
  for (const pick of picks) {
    await search.fill(pick.search)
    await dialog.getByRole('option', { name: pick.title }).click()
  }
  // The suggestions stay open after a pick and would cover the footer
  await search.press('Escape')
  await expect(dialog.getByRole('listbox')).toBeHidden()
  await dialog.getByRole('button', { name: 'Valider' }).click()
  await expect(dialog).toBeHidden()
}

test('can edit edito page with all bloc types', async ({ page }) => {
  // A dozen blocs are filled in, each object picked through a search
  test.setTimeout(120_000)

  await gotoHydrated(page, '/datasets?edit=true')

  // === Step 0: Delete all existing sections to start fresh ===
  const pageBlocs = page.locator('[data-testid^="page-"][data-drop-item]')
  while (await pageBlocs.count() > 0) {
    const before = await pageBlocs.count()
    await deleteEditItem(pageBlocs.first())
    await expect(pageBlocs).toHaveCount(before - 1)
  }
  await expect(page.getByText('Cette page est vide')).toBeVisible()

  // === Step 1: A green section, with a title and a button, as the heroes were ===
  await addSection(page)
  await addTitleInLastSection(page, 'Bienvenue sur data.gouv.fr', 'La plateforme ouverte des données publiques françaises')
  await addBlocInLastSection(page, 'ButtonBloc')
  const buttonTitle = page.getByLabel('Titre du bouton')
  await buttonTitle.click()
  await buttonTitle.fill('Découvrir les données')
  await page.mouse.click(1, 1)
  await page.getByLabel('URL du bouton').fill('https://www.data.gouv.fr/fr/datasets/')

  const firstSection = page.getByTestId('page-SectionBloc').first()
  await firstSection.hover({ position: { x: 20, y: 20 } })
  await firstSection.getByRole('button', { name: 'Actions sur Section' }).click()
  await page.getByRole('menuitem', { name: 'Fond vert' }).click()

  // === Step 2: A section of datasets, side by side ===
  await addSection(page)
  await addTitleInLastSection(page, 'Nos jeux de données phares', 'Découvrez les données les plus consultées')
  await addObjectsInLastSection(page, 'DatasetBloc', 'Sélectionner des jeux de données', [
    { search: 'marché', title: /Marchés publics de la Métropole de Lyon/ },
    { search: 'adresse', title: /Base Adresse Nationale/ },
    { search: 'véhicule', title: /Véhicules à faibles et à très faibles émissions/ },
    { search: 'covid', title: /personnes vaccinées contre/ },
  ])
  await expect(page.getByTestId('page-SectionBloc').last().getByTestId('bloc-DatasetBloc')).toHaveCount(4)

  // === Step 3: A section of reuses ===
  await addSection(page)
  await addTitleInLastSection(page, 'Réutilisations innovantes')
  await addObjectsInLastSection(page, 'ReuseBloc', 'Sélectionner des réutilisations', [
    { search: 'itineriz', title: /Itineriz/ },
    { search: 'kbis', title: /Extrait kbis/ },
    { search: 'infonet', title: /Extrait infonet/ },
    { search: 'proximap', title: /Proximap/ },
  ])
  await expect(page.getByTestId('page-SectionBloc').last().getByTestId('bloc-ReuseBloc')).toHaveCount(4)

  // === Step 4: A section of API, two per row, then a text ===
  await addSection(page)
  await addTitleInLastSection(page, 'API essentielles')
  await addObjectsInLastSection(page, 'DataserviceBloc', 'Sélectionner des API', [
    { search: 'sirene', title: /API Sirene/ },
    { search: 'explore', title: /Explore API/ },
  ])
  const lastSection = page.getByTestId('page-SectionBloc').last()
  await expect(lastSection.getByTestId('bloc-DataserviceBloc')).toHaveCount(2)
  await addBlocInLastSection(page, 'MarkdownBloc')
  await page.locator('.milkdown').last().click()
  await page.keyboard.type('Les API les plus utilisées de la plateforme.')

  // === Step 5: Links, then a button under them ===
  await addSection(page)
  await addTitleInLastSection(page, 'Ressources utiles')
  await addBlocInLastSection(page, 'LinksListBloc')

  const links = page.getByTestId('page-SectionBloc').last().getByTestId('bloc-LinksListBloc')
  await links.getByRole('button', { name: 'Ajouter un lien' }).click()
  const linkTitle = links.getByRole('textbox').filter({ hasText: 'Titre du lien' })
  await linkTitle.click()
  await linkTitle.fill('Documentation')
  await page.mouse.click(1, 1)
  await expect(links.getByRole('textbox').filter({ hasText: 'Documentation' })).toBeVisible()
  await links.getByRole('textbox', { name: 'URL du lien' }).fill('https://doc.data.gouv.fr')

  await addBlocInLastSection(page, 'ButtonBloc')
  const guidesButton = page.getByLabel('Titre du bouton').last()
  await guidesButton.click()
  await guidesButton.fill('Voir tous les guides')
  await page.mouse.click(1, 1)
  await page.getByLabel('URL du bouton').last().fill('https://guides.data.gouv.fr')

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
  const accordion = page.getByTestId('page-SectionBloc').last().getByTestId('bloc-AccordionListBloc')
  await expect(accordion.getByRole('textbox').filter({ hasText: 'Comment acceder aux donnees ?' })).toBeVisible()

  const secondItemTitle = page.getByTestId('accordion-new-item-title')
  await secondItemTitle.click()
  await secondItemTitle.fill('Où trouver de l\'aide ?')
  await page.mouse.click(1, 1)
  await expect(accordion.getByRole('textbox').filter({ hasText: 'Où trouver de l\'aide ?' })).toBeVisible()

  // === Step 8: Section manipulation ===
  const sectionTitles = page.getByTestId('page-SectionBloc').getByTestId('bloc-TitleBloc')
  // Move the datasets section (after the green one) below the reuses one with the keyboard on
  // its drag handle, then delete the reuses section
  await (await focusedDragHandle(page.getByTestId('page-SectionBloc').nth(1))).press('ArrowDown')
  await expect(sectionTitles.nth(1)).toContainText('Réutilisations innovantes')
  await deleteEditItem(page.getByTestId('page-SectionBloc').nth(1))
  await expect(sectionTitles.nth(1)).toContainText('Nos jeux de données phares')

  // === Step 9: Save the page ===
  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()

  // === Step 10: What was saved is what a visitor gets ===
  // Looked for within the sections: the site menu has links of its own.
  await gotoHydrated(page, '/datasets')
  const sections = page.getByTestId('page-SectionBloc')
  for (const title of ['Bienvenue sur data.gouv.fr', 'Nos jeux de données phares', 'API essentielles', 'Ressources utiles', 'Questions fréquemment posées']) {
    await expect(sections.getByRole('heading', { name: title, level: 2 })).toBeVisible()
  }
  await expect(page.getByText('Réutilisations innovantes')).toHaveCount(0)
  await expect(sections.getByRole('link', { name: 'Découvrir les données' })).toBeVisible()
  await expect(sections.getByRole('link', { name: /Base Adresse Nationale/ }).first()).toBeVisible()
  await expect(sections.getByRole('link', { name: /API Sirene/ }).first()).toBeVisible()
  for (const link of ['Documentation', 'Voir tous les guides']) {
    await expect(sections.getByRole('link', { name: link, exact: true })).toBeVisible()
  }
  await expect(sections.getByRole('heading', { name: 'Titre de section' })).toBeVisible()
  await expect(sections.getByRole('button', { name: 'Comment acceder aux donnees ?' })).toBeVisible()
  await expect(sections.getByRole('button', { name: 'Où trouver de l\'aide ?' })).toBeVisible()

  // === Step 11: Final screenshot for visual regression ===

  await expect(page).toHaveScreenshot('edito-page-final.png', {
    mask: [page.getByTestId('user-avatar'), page.getByTestId('commit-version'), page.getByTestId('udata-version')],
    fullPage: true,
    maxDiffPixelRatio: 0.01, // Allow 1% pixel difference for minor rendering variations
  })
})
