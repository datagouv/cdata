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

test('shows the business labels used by cards', async ({ page }) => {
  const labels = page.getByTestId('card-business-labels')

  for (const text of ['Brouillon', 'Archivé', 'Accès restreint', 'Ouvert avec un compte', 'Supprimé', 'Service public']) {
    await expect(labels.getByText(text, { exact: true })).toBeVisible()
  }

  await expect(labels.locator('span').first()).toHaveCSS('min-height', '24px')
  await expect(labels.locator('svg').first()).toHaveCSS('width', '14px')
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
  await expect(staticBadge).toHaveCSS('text-transform', 'none')

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
