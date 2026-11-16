import { expect, test } from './base'
import { gotoHydrated } from './helpers'

test.beforeEach(async ({ page }) => {
  await gotoHydrated(page, '/design/tags')
})

// Rendering (sizes, alignment, colours) is checked on screenshots of each section, behaviour by interacting
const screenshotOptions = { maxDiffPixelRatio: 0.01 }

test('renders every tag and badge section', async ({ page }) => {
  for (const section of ['components-tag-examples', 'tag-variants', 'tags-select-example', 'dataset-label-examples', 'card-business-labels', 'access-type-badges', 'schema-badge', 'table-statuses', 'hvd-status-examples']) {
    await expect(page.getByTestId(section)).toHaveScreenshot(`${section}.png`, screenshotOptions)
  }
})

test('renders the hover and pressed states of interactive tags', async ({ page }) => {
  const variants = page.getByTestId('tag-variants')

  await page.getByTestId('clickable-tag').hover()
  await expect(variants).toHaveScreenshot('tag-variants-hover.png', screenshotOptions)

  await page.getByTestId('selectable-tag').click()
  await page.mouse.move(0, 0)
  await expect(variants).toHaveScreenshot('tag-variants-pressed.png', screenshotOptions)
})

test('toggles a selectable tag', async ({ page }) => {
  const selectableTag = page.getByTestId('selectable-tag')

  await expect(selectableTag).toHaveAttribute('aria-pressed', 'false')
  await selectableTag.click()
  await expect(selectableTag).toHaveAttribute('aria-pressed', 'true')
  await selectableTag.click()
  await expect(selectableTag).toHaveAttribute('aria-pressed', 'false')
})

test('opens and closes a tag toggletip', async ({ page }) => {
  const tag = page.getByTestId('toggletip-tag')
  const content = page.getByTestId('toggletip-tag-content')

  await tag.click()
  await expect(tag).toHaveAttribute('aria-expanded', 'true')
  await expect(content).toBeVisible()

  await tag.click()
  await expect(tag).toHaveAttribute('aria-expanded', 'false')
  await expect(content).toBeHidden()
})

test('shows the business labels used by cards', async ({ page }) => {
  const labels = page.getByTestId('card-business-labels')

  for (const text of ['Brouillon', 'Archivé', 'Accès restreint', 'Ouvert avec un compte', 'Supprimé', 'Service public']) {
    await expect(labels.getByText(text, { exact: true })).toBeVisible()
  }
})

test('shows API access types, with an icon only on the restricted ones', async ({ page }) => {
  const accessTypes = page.getByTestId('access-type-badges')
  const badge = (text: string | RegExp) => accessTypes.locator('span').filter({ has: page.getByText(text, { exact: true }) }).first()

  await expect(badge('Ouvert').locator('svg')).toHaveCount(0)
  await expect(badge('Ouvert avec un compte').locator('svg')).toHaveCount(1)
  await expect(badge('Accès restreint').locator('svg')).toHaveCount(1)
})

test('shows the statuses used in tables', async ({ page }) => {
  const statuses = page.getByTestId('table-statuses')

  for (const context of ['Publication des objets', 'Traitements', 'Disponibilité des ressources principales', 'Disponibilité des ressources communautaires', 'Discussions']) {
    await expect(statuses.getByText(context, { exact: true })).toBeVisible()
  }

  for (const text of ['Public', 'Brouillon', 'Archivé', 'Supprimé', 'En attente', 'En cours d\'initialisation', 'Initialisé', 'En traitement', 'Terminé', 'Terminé avec des erreurs', 'Échoué', 'Inconnu', 'Pas encore contrôlé', 'Nouveau', 'Répondu', 'Clos']) {
    await expect(statuses.getByText(text, { exact: true })).toBeVisible()
  }
})

test('shows the data schema badge', async ({ page }) => {
  await expect(page.getByTestId('schema-badge').getByText('etalab/schema-irve', { exact: true })).toBeVisible()
})

test('links a component tag', async ({ page }) => {
  await expect(page.getByTestId('components-tag-link')).toHaveAttribute('href', '#components-tag-examples')
  await expect(page.getByTestId('components-tag-static')).not.toHaveAttribute('href')
})

test('shows and removes multiple TagsSelect values', async ({ page }) => {
  const selectedTags = page.getByTestId('selected-tags')
  await expect(selectedTags.getByRole('button')).toHaveCount(3)

  await page.getByRole('button', { name: 'Supprimer transport' }).click()
  await expect(selectedTags.getByRole('button')).toHaveCount(2)
  await expect(selectedTags).not.toContainText('transport')
})

test('shows DatasetLabelTag with and without a link', async ({ page }) => {
  await expect(page.getByTestId('dataset-label-static')).not.toHaveAttribute('href')
  await expect(page.getByTestId('dataset-label-link')).toHaveAttribute('href', '/datasets/search?badge=hvd')
})

test('shows HvdStatutBadge with and without a data URL', async ({ page }) => {
  await expect(page.getByTestId('hvd-status-empty').getByText('-', { exact: true })).toBeVisible()
  await expect(page.getByTestId('hvd-status-static').getByRole('link')).toHaveCount(0)

  const linkedBadge = page.getByTestId('hvd-status-link').getByRole('link')
  await expect(linkedBadge).toHaveAttribute('target', '_blank')
  await expect(linkedBadge).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(linkedBadge).toHaveAttribute('aria-label', /Publié.*Voir les données.*nouvel onglet/)
  await expect(linkedBadge.locator('svg')).toHaveCount(1)
})
