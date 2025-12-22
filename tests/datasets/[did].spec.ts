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

  await page.getByTestId('label-toggletip-button').click()
  await expect(page.getByTestId('label-toggletip-content')).toBeVisible()
  await page.getByTestId('label-toggletip-close-button').click()
  await expect(page.getByTestId('label-toggletip-content')).not.toBeVisible()
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

  await page.waitForURL('**/datasets/search*')

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

test('tabs are accessible', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  await expect(page.getByRole('link', { name: /Fichiers/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Réutilisations et API/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Discussions/ })).toBeVisible()
})

test('discussions tab navigates to discussions page', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  const discussionsTab = page.getByRole('link', { name: /Discussions/ })
  await discussionsTab.click()

  await page.waitForURL('**/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/discussions')
})

test('resources are displayed and accordion expands', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  // Check that resource accordions are present (expand buttons)
  const expandButtons = page.getByTestId('expand-button')
  await expect(expandButtons.first()).toBeVisible()

  // Get the first accordion button
  const firstAccordion = expandButtons.first()

  // Check it's not expanded initially
  await expect(firstAccordion).toHaveAttribute('aria-expanded', 'false')

  // Click to expand
  await firstAccordion.click()

  // Verify it's now expanded
  await expect(firstAccordion).toHaveAttribute('aria-expanded', 'true')
})
