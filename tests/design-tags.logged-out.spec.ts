import { expect, test } from './base'
import { gotoHydrated } from './helpers'

test.beforeEach(async ({ page }) => {
  await gotoHydrated(page, '/design/tags')
})

test('shows every compact tag state', async ({ page }) => {
  const staticTag = page.getByTestId('static-tag')
  const clickableTag = page.getByTestId('clickable-tag')
  const selectableTag = page.getByTestId('selectable-tag')
  const disabledTag = page.getByTestId('disabled-tag')

  for (const tag of [staticTag, clickableTag, selectableTag, disabledTag]) {
    await expect(tag).toHaveCSS('font-size', '12px')
    await expect(tag).toHaveCSS('line-height', '18px')
    await expect(tag).toHaveCSS('min-height', '24px')
    await expect(tag).toHaveCSS('border-top-width', '1px')
  }

  const restBackground = await clickableTag.evaluate(element => getComputedStyle(element).backgroundColor)
  await clickableTag.hover()
  await expect(clickableTag).not.toHaveCSS('background-color', restBackground)
  await clickableTag.focus()
  await expect(clickableTag).toHaveCSS('outline-style', 'solid')

  await selectableTag.click()
  await expect(selectableTag).toHaveAttribute('aria-pressed', 'true')
  await expect(selectableTag.locator('svg')).toHaveCount(1)
  await expect(selectableTag.locator('svg')).toHaveCSS('width', '14px')
  expect(await selectableTag.evaluate(element => getComputedStyle(element, '::after').content)).toBe('none')
  const selectedBackground = await selectableTag.evaluate(element => getComputedStyle(element).backgroundColor)
  await selectableTag.hover()
  await expect(selectableTag).toHaveCSS('background-color', selectedBackground)

  const disabledBackground = await disabledTag.evaluate(element => getComputedStyle(element).backgroundColor)
  await disabledTag.hover()
  await expect(disabledTag).toHaveCSS('background-color', disabledBackground)

  const dismissibleTag = page.getByTestId('dismissible-tag')
  const dismissibleBackground = await dismissibleTag.evaluate(element => getComputedStyle(element).backgroundColor)
  await dismissibleTag.hover()
  await expect(dismissibleTag).not.toHaveCSS('background-color', dismissibleBackground)
})

test('opens and closes a tag toggletip', async ({ page }) => {
  const tag = page.getByTestId('toggletip-tag')
  const content = page.getByTestId('toggletip-tag-content')

  await expect(tag).toHaveCSS('font-size', '12px')
  await expect(tag).toHaveCSS('min-height', '24px')
  await expect(tag.locator('svg')).toHaveCount(1)
  await tag.focus()
  await expect(tag).toHaveCSS('outline-style', 'solid')

  await tag.click()
  await expect(tag).toHaveAttribute('aria-expanded', 'true')
  await expect(content).toBeVisible()

  await page.getByTestId('toggletip-tag-close').click()
  await expect(tag).toHaveAttribute('aria-expanded', 'false')
  await expect(content).toBeHidden()
})

test('shows the business labels used by cards', async ({ page }) => {
  const labels = page.getByTestId('card-business-labels')
  const statuses = page.getByTestId('table-statuses')
  const accessTypes = page.getByTestId('access-type-badges')

  for (const text of ['Brouillon', 'Archivé', 'Accès restreint', 'Ouvert avec un compte', 'Supprimé', 'Service public']) {
    await expect(labels.getByText(text, { exact: true })).toBeVisible()
  }

  const cardBadges = labels.locator('.admin-badge')
  await expect(cardBadges).toHaveCount(6)
  await expect(cardBadges.first()).toHaveCSS('min-height', '24px')
  await expect(cardBadges.first().locator('svg')).toHaveCSS('width', '14px')

  for (const [cardLabel, tableStatus] of [['Brouillon', 'Brouillon'], ['Archivé', 'Archivé'], ['Accès restreint', 'Archivé'], ['Supprimé', 'Supprimé'], ['Service public', 'Public']]) {
    const cardBadge = cardBadges.filter({ hasText: cardLabel })
    const tableBadge = statuses.locator('.admin-badge').filter({ hasText: tableStatus }).first()
    await expect(cardBadge).toHaveCSS('color', await tableBadge.evaluate(element => getComputedStyle(element).color))
    await expect(cardBadge).toHaveCSS('background-color', await tableBadge.evaluate(element => getComputedStyle(element).backgroundColor))
  }

  const accountCardBadge = cardBadges.filter({ hasText: 'Ouvert avec un compte' })
  const accountAccessBadge = accessTypes.locator('.admin-badge').filter({ hasText: 'Ouvert avec un compte' })
  await expect(accountCardBadge).toHaveCSS('color', await accountAccessBadge.evaluate(element => getComputedStyle(element).color))
  await expect(accountCardBadge).toHaveCSS('background-color', await accountAccessBadge.evaluate(element => getComputedStyle(element).backgroundColor))

  const draftIcon = cardBadges.filter({ hasText: 'Brouillon' }).locator('svg')
  const restrictedIcon = cardBadges.filter({ hasText: 'Accès restreint' }).locator('svg')
  expect(await draftIcon.innerHTML()).not.toBe(await restrictedIcon.innerHTML())
})

test('shows API access types with the account-only yellow tone', async ({ page }) => {
  const accessTypes = page.getByTestId('access-type-badges')

  await expect(accessTypes.getByText('Ouvert', { exact: true })).toBeVisible()
  await expect(accessTypes.getByText('Ouvert avec un compte', { exact: true })).toBeVisible()
  await expect(accessTypes.getByText('Accès restreint', { exact: true })).toBeVisible()
  await expect(accessTypes.locator('.admin-badge')).toHaveCount(3)

  const openBadge = accessTypes.locator('.admin-badge').filter({ hasText: /^Ouvert$/ })
  const accountBadge = accessTypes.locator('.admin-badge').filter({ hasText: 'Ouvert avec un compte' })
  const restrictedBadge = accessTypes.locator('.admin-badge').filter({ hasText: 'Accès restreint' })
  await expect(openBadge.locator('svg')).toHaveCount(0)
  await expect(accountBadge.locator('svg')).toHaveCount(1)
  await expect(restrictedBadge.locator('svg')).toHaveCount(1)
  await expect(accountBadge.locator('svg')).toHaveCSS('width', '14px')
  await expect(restrictedBadge.locator('svg')).toHaveCSS('width', '14px')
  await expect(accountBadge).not.toHaveCSS('background-color', await restrictedBadge.evaluate(element => getComputedStyle(element).backgroundColor))
})

test('shows the statuses used in tables', async ({ page }) => {
  const statuses = page.getByTestId('table-statuses')

  for (const context of ['Publication des objets', 'Traitements', 'Disponibilité des ressources principales', 'Disponibilité des ressources communautaires', 'Discussions']) {
    await expect(statuses.getByText(context, { exact: true })).toBeVisible()
  }

  for (const text of ['Public', 'Brouillon', 'Archivé', 'Supprimé', 'En attente', 'En traitement', 'Terminé', 'Terminé avec des erreurs', 'Échoué', 'Inconnu', 'Pas encore contrôlé', 'Nouveau', 'Répondu', 'Clos']) {
    await expect(statuses.getByText(text, { exact: true })).toBeVisible()
  }

  const badges = statuses.locator('.admin-badge')
  await expect(badges).toHaveCount(18)
  await expect(badges.first()).toHaveCSS('min-height', '20px')
  await expect(badges.first()).toHaveCSS('line-height', '16px')
  await expect(badges.first()).toHaveCSS('padding-top', '1px')
  await expect(badges.first()).toHaveCSS('padding-bottom', '1px')
  await expect(badges.first().locator(':scope > span')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -1)')
})

test('shows the data schema badge', async ({ page }) => {
  const schema = page.getByTestId('schema-badge')

  await expect(schema.getByText('etalab/schema-irve', { exact: true })).toBeVisible()
})

test('shows component tags with a stroke, including the linked variant', async ({ page }) => {
  const staticTag = page.getByTestId('components-tag-static')
  const iconTag = page.getByTestId('components-tag-icon')
  const linkedTag = page.getByTestId('components-tag-link')

  for (const tag of [staticTag, iconTag, linkedTag]) {
    await expect(tag).toHaveCSS('border-top-width', '1px')
    await expect(tag).toHaveCSS('min-height', '24px')
  }

  const link = linkedTag.locator('..')
  const restBackground = await linkedTag.evaluate(element => getComputedStyle(element).backgroundColor)
  await link.hover()
  await expect(linkedTag).not.toHaveCSS('background-color', restBackground)
  await link.focus()
  await expect(link).toHaveCSS('outline-style', 'solid')
})

test('shows and removes multiple TagsSelect values', async ({ page }) => {
  const selectedTags = page.getByTestId('selected-tags')
  await expect(selectedTags.getByRole('button')).toHaveCount(3)
  await expect(selectedTags.getByRole('button').first()).toHaveCSS('font-size', '12px')
  await expect(selectedTags.getByRole('button').first()).toHaveCSS('line-height', '18px')
  await expect(selectedTags.getByRole('button').first()).toHaveCSS('min-height', '24px')
  await expect(selectedTags.getByRole('button').first().locator('svg')).toHaveCSS('width', '14px')

  await page.getByRole('button', { name: 'Supprimer le mot-clé transport' }).click()
  await expect(selectedTags.getByRole('button')).toHaveCount(2)
  await expect(selectedTags).not.toContainText('transport')
})

test('shows DatasetLabelTag with and without a link', async ({ page }) => {
  const staticLabel = page.getByTestId('dataset-label-static')
  const linkedLabel = page.getByTestId('dataset-label-link')

  await expect(staticLabel).not.toHaveAttribute('href')
  await expect(linkedLabel).toHaveAttribute('href', '/datasets/search?badge=hvd')
  await expect(staticLabel).toHaveCSS('line-height', '18px')
  await expect(linkedLabel).toHaveCSS('min-height', '24px')
  await expect(linkedLabel.locator('img')).toHaveCSS('width', '14px')
  await expect(linkedLabel.locator('img')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  const restBackground = await linkedLabel.evaluate(element => getComputedStyle(element).backgroundColor)
  await linkedLabel.hover()
  await expect(linkedLabel).not.toHaveCSS('background-color', restBackground)
  await linkedLabel.focus()
  await expect(linkedLabel).toHaveCSS('outline-style', 'solid')
})

test('shows HvdStatutBadge with and without a data URL', async ({ page }) => {
  await expect(page.getByTestId('hvd-status-empty').getByText('-', { exact: true })).toBeVisible()

  const staticBadge = page.getByTestId('hvd-status-static').locator('.admin-badge')
  const completedTableBadge = page.getByTestId('table-statuses').locator('.admin-badge').filter({ hasText: 'Terminé' }).first()
  await expect(staticBadge).toHaveCSS('text-transform', 'none')
  await expect(staticBadge).toHaveCSS('min-height', '20px')
  await expect(staticBadge).toHaveCSS('color', await completedTableBadge.evaluate(element => getComputedStyle(element).color))
  await expect(staticBadge).toHaveCSS('background-color', await completedTableBadge.evaluate(element => getComputedStyle(element).backgroundColor))

  const linkedBadge = page.getByTestId('hvd-status-link').locator('a')
  await expect(linkedBadge).toHaveAttribute('target', '_blank')
  await expect(linkedBadge).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(linkedBadge).toHaveAttribute('aria-label', /Publié.*Voir les données.*nouvel onglet/)
  await expect(linkedBadge.locator('svg')).toHaveCount(1)
  await expect(linkedBadge.locator('svg')).toHaveCSS('width', '14px')

  const badgeBackground = await linkedBadge.locator('.admin-badge').evaluate(element => getComputedStyle(element).backgroundColor)
  await linkedBadge.hover()
  await expect(linkedBadge.locator('.admin-badge')).toHaveCSS('background-color', badgeBackground)
  await expect(linkedBadge.locator('.admin-badge > span')).toHaveCSS('text-decoration-line', 'underline')
  await linkedBadge.focus()
  await expect(linkedBadge).toHaveCSS('outline-style', 'solid')
})
