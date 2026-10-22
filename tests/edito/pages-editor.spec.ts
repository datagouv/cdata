import type { Locator, Page } from '@playwright/test'
import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

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

// The returned locator stands for the last bloc whenever it is used: use it before the next
// bloc is added.
async function addBloc(page: Page, name: string): Promise<Locator> {
  await page.getByRole('button', { name: 'Ajouter un bloc' }).last().click()
  await page.getByRole('menuitem', { name }).click()
  return page.getByTestId('edito-bloc').last()
}

// An editable text only hands its value to the bloc once it loses the focus
async function editText(textbox: Locator, value: string) {
  await textbox.fill(value)
  await textbox.blur()
  await expect(textbox).toHaveText(value)
}

// Picks each object by the option bearing its title, so a slow search answering after
// the next keystroke cannot get the wrong object picked, or none at all.
async function pickObjects(page: Page, bloc: Locator, addLabel: string, dialogTitle: string, picks: Array<{ search: string, title: RegExp }>): Promise<void> {
  await bloc.getByRole('button', { name: addLabel }).click()
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

async function addLink(bloc: Locator, title: string, url: string) {
  await bloc.getByRole('button', { name: 'Ajouter un lien' }).click()
  await editText(bloc.getByRole('textbox').filter({ hasText: 'Titre du lien' }), title)
  await bloc.getByRole('textbox', { name: 'URL du lien' }).last().fill(url)
}

async function editMainButton(bloc: Locator, title: string, url: string) {
  await editText(bloc.getByRole('textbox', { name: 'Titre du bouton' }), title)
  await bloc.getByRole('textbox', { name: 'URL du bouton' }).fill(url)
}

test('can edit edito page with all bloc types', async ({ page }) => {
  // A dozen blocs are filled in, each object picked through a search
  test.setTimeout(120_000)

  await gotoHydrated(page, '/datasets?edit=true')
  const blocs = page.getByTestId('edito-bloc')

  // Start from an empty page
  const existingBlocs = await blocs.count()
  for (let left = existingBlocs; left > 0; left--) {
    await blocs.first().getByRole('button', { name: 'Supprimer' }).first().click()
    await expect(blocs).toHaveCount(left - 1)
  }
  await expect(page.getByText('Cette page est vide')).toBeVisible()

  // Hero
  const hero = await addBloc(page, 'Hero')
  await editText(hero.getByRole('textbox').first(), 'Bienvenue sur data.gouv.fr')
  await hero.getByRole('button', { name: 'Ajouter une description' }).click()
  await editText(hero.getByRole('textbox').nth(1), 'La plateforme ouverte des données publiques françaises')
  await hero.getByTitle('Vert').click()
  await editMainButton(hero, 'Découvrir les données', 'https://www.data.gouv.fr/fr/datasets/')

  // Datasets, two rows of them
  const datasets = await addBloc(page, 'Données à la une')
  await editText(datasets.getByRole('textbox').first(), 'Nos jeux de données phares')
  await datasets.getByRole('button', { name: 'Ajouter un sous-titre' }).click()
  await editText(datasets.getByRole('textbox').nth(1), 'Découvrez les données les plus consultées')
  await pickObjects(page, datasets, 'Ajouter un jeu de données', 'Sélectionner des jeux de données', [
    { search: 'marché', title: /Marchés publics de la Métropole de Lyon/ },
    { search: 'adresse', title: /Base Adresse Nationale/ },
    { search: 'véhicule', title: /Véhicules à faibles et à très faibles émissions/ },
    { search: 'covid', title: /personnes vaccinées contre/ },
  ])
  await expect(datasets.getByRole('link', { name: /Marchés publics de la Métropole de Lyon/ })).toBeVisible()

  // Reuses, deleted further down
  const reuses = await addBloc(page, 'Réutilisations à la une')
  await editText(reuses.getByRole('textbox').first(), 'Réutilisations innovantes')
  await pickObjects(page, reuses, 'Ajouter une réutilisation', 'Sélectionner des réutilisations', [
    { search: 'itineriz', title: /Itineriz/ },
    { search: 'kbis', title: /Extrait kbis/ },
    { search: 'infonet', title: /Extrait infonet/ },
    { search: 'proximap', title: /Proximap/ },
  ])

  // API
  const dataservices = await addBloc(page, 'API à la une')
  await editText(dataservices.getByRole('textbox').first(), 'API essentielles')
  await pickObjects(page, dataservices, 'Ajouter une API', 'Sélectionner des API', [
    { search: 'sirene', title: /API Sirene/ },
    { search: 'explore', title: /Explore API/ },
  ])

  // Links with a paragraph, the main button sitting under it
  const resources = await addBloc(page, 'Liens à la une')
  await editText(resources.getByRole('textbox').first(), 'Ressources utiles')
  await resources.getByRole('button', { name: 'Ajouter un paragraphe' }).click()
  await editText(resources.getByRole('textbox').filter({ hasText: 'Texte du paragraphe' }), 'Découvrez nos guides et ressources pour mieux exploiter les données publiques.')
  await addLink(resources, 'Documentation', 'https://doc.data.gouv.fr')
  await addLink(resources, 'Guides', 'https://guides.data.gouv.fr')
  await editMainButton(resources, 'Voir tous les guides', 'https://guides.data.gouv.fr')

  // Markdown. The bloc is labelled "Texte" like its group header: its description is unique.
  const markdown = await addBloc(page, 'Ajouter du contenu texte riche')
  await markdown.locator('.milkdown').click()
  await page.keyboard.type('# Titre de section')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Voici un paragraphe avec du **texte en gras** et du *texte en italique*.')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- Premier élément')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- Deuxième élément')

  // Links without a paragraph, the main button sitting next to them
  const shortcuts = await addBloc(page, 'Liens à la une')
  await editText(shortcuts.getByRole('textbox').first(), 'Liens rapides')
  await addLink(shortcuts, 'API', 'https://api.data.gouv.fr')
  await addLink(shortcuts, 'Support', 'https://support.data.gouv.fr')
  await editMainButton(shortcuts, 'Contacter le support', 'https://support.data.gouv.fr')

  // Accordion
  const accordion = await addBloc(page, 'Accordéon')
  await accordion.getByRole('button', { name: 'Ajouter une description' }).click()
  await editText(accordion.getByRole('textbox').nth(1), 'Questions fréquemment posées')
  // Typed key by key: a space typed in an accordion title used to toggle the accordion
  const newItemTitle = accordion.getByTestId('accordion-new-item-title')
  await newItemTitle.pressSequentially('Comment acceder aux donnees ?')
  await newItemTitle.blur()
  await expect(accordion.getByRole('textbox').filter({ hasText: 'Comment acceder aux donnees ?' })).toBeVisible()
  await newItemTitle.fill('Où trouver de l\'aide ?')
  await newItemTitle.blur()
  await expect(accordion.getByRole('textbox').filter({ hasText: 'Où trouver de l\'aide ?' })).toBeVisible()

  // Moving the hero down, then back up
  await blocs.first().getByRole('button', { name: 'Descendre' }).click()
  await expect(blocs.first()).toContainText('Nos jeux de données phares')
  await blocs.nth(1).getByRole('button', { name: 'Monter' }).click()
  await expect(blocs.first()).toContainText('Bienvenue sur data.gouv.fr')

  // Deleting the reuses bloc, then adding another one at the end
  await blocs.filter({ hasText: 'Réutilisations innovantes' }).getByRole('button', { name: 'Supprimer' }).first().click()
  await expect(blocs.filter({ hasText: 'Réutilisations innovantes' })).toHaveCount(0)
  const otherReuses = await addBloc(page, 'Réutilisations à la une')
  await pickObjects(page, otherReuses, 'Ajouter une réutilisation', 'Sélectionner des réutilisations', [
    { search: 'mobby', title: /Mobby/ },
    { search: 'chalandise', title: /chalandise/ },
  ])

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Page sauvegardée')).toBeVisible()

  // What was saved is what a visitor gets. Looked for within the blocs: the site menu has
  // links of its own, an "API" one among them.
  await gotoHydrated(page, '/datasets')
  await expect(blocs.getByRole('heading', { name: 'Bienvenue sur data.gouv.fr', level: 1 })).toBeVisible()
  await expect(blocs.getByRole('link', { name: 'Découvrir les données' })).toBeVisible()
  for (const title of ['Nos jeux de données phares', 'API essentielles', 'Ressources utiles', 'Liens rapides', 'Mon accordéon', 'Mes réutilisations']) {
    await expect(blocs.getByRole('heading', { name: title, level: 2 })).toBeVisible()
  }
  await expect(page.getByText('Réutilisations innovantes')).toHaveCount(0)
  await expect(blocs.getByRole('link', { name: /Base Adresse Nationale/ }).first()).toBeVisible()
  await expect(blocs.getByRole('link', { name: /API Sirene/ }).first()).toBeVisible()
  await expect(blocs.getByRole('link', { name: /Mobby/ }).first()).toBeVisible()
  for (const link of ['Documentation', 'Guides', 'Voir tous les guides', 'API', 'Support', 'Contacter le support']) {
    await expect(blocs.getByRole('link', { name: link, exact: true })).toBeVisible()
  }
  await expect(blocs.getByRole('heading', { name: 'Titre de section' })).toBeVisible()
  await expect(blocs.getByRole('button', { name: 'Comment acceder aux donnees ?' })).toBeVisible()
  await expect(blocs.getByRole('button', { name: 'Où trouver de l\'aide ?' })).toBeVisible()

  await expect(page).toHaveScreenshot('edito-page-final.png', {
    mask: [page.getByTestId('user-avatar'), page.getByTestId('commit-version'), page.getByTestId('udata-version')],
    fullPage: true,
    maxDiffPixelRatio: 0.01, // Allow 1% pixel difference for minor rendering variations
  })
})
