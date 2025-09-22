import { test, expect } from '@playwright/test'

test('show details page', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(
    'Base Sirene des entreprises et de leurs établissements (SIREN, SIRET)',
  )
})

test('dataset with labels shows label section', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  await expect(page).toHaveTitle(
    'Base Sirene des entreprises et de leurs établissements (SIREN, SIRET)',
  )

  // Check that there's a corresponding dd element with labels
  const labelsList = page.getByTestId('label-list')
  await expect(labelsList).toBeVisible()

  // Check that labels are clickable links
  await expect(labelsList.locator('a')).toHaveCount(1)
})

test('dataset labels have proper tooltips and information', async ({
  page,
}) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  // Check if there's a label section with tooltip
  const labelTooltip = page.getByTestId('label-toggletip-button')

  // Click tooltip to open it
  await labelTooltip.click()

  // Check that tooltip content is displayed
  const tooltipContent = page.getByTestId('label-toggletip-content')
  await expect(tooltipContent).toBeVisible()

  // Check for close button
  const closeButton = page.getByTestId('label-toggletip-close-button')
  await expect(closeButton).toBeVisible()

  // Close tooltip
  await closeButton.click()

  // Verify tooltip is closed
  await expect(tooltipContent).not.toBeVisible()
})

test('clicking dataset label navigates to filtered search', async ({
  page,
}) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  // Check if dataset has labels
  const labelsList = page.getByTestId('label-list')

  const labelLinks = labelsList.locator('a')

  // Get the href of the first label link
  const firstLabel = labelLinks.first()
  const href = await firstLabel.getAttribute('href')
  expect(href).toBeTruthy()
  expect(href).toContain('/datasets/search?badge=')

  // Click the label
  await firstLabel.click()

  // Should navigate to search page with badge filter
  expect(page.url()).toContain('/datasets/search?badge=spd')

  // Verify search page loads with filter applied
  await expect(page).toHaveTitle(
    'Recherche des jeux de données — data.gouv.fr',
  )

  // Verify the badge filter is applied
  const filter = page.getByTestId('dataset-label-filter')
  const filterButton = filter.locator('button').first()
  const selectedText = await filterButton.textContent()
  expect(selectedText).not.toBe('Tous les badges')
})

test('dataset without labels does not show label section', async ({ page }) => {
  await page.goto('/datasets/fichier-des-personnes-decedees')
  // Check if this dataset has no label section
  const labelSection = page.getByTestId('labelsList')
  await expect(labelSection).not.toBeVisible()
})
