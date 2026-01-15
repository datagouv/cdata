import { test, expect } from '@playwright/test'

test('show details page', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(
    'Jeu de données - Base Sirene des entreprises et de leurs établissements (SIREN, SIRET) | data.gouv.fr',
  )
})

test('dataset with labels shows label section', async ({ page }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )

  await expect(page).toHaveTitle(
    'Jeu de données - Base Sirene des entreprises et de leurs établissements (SIREN, SIRET) | data.gouv.fr',
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
  // Wait for Vue hydration before clicking the toggletip (try fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

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
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

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
  await expect(page).toHaveURL('/datasets/search?badge=spd')

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
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const discussionsTab = page.getByRole('link', { name: /Discussions/ })
  await discussionsTab.click()

  await expect(page).toHaveURL('/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/discussions')
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

test('quality tooltip displays content and link is clickable', async ({ page, context }) => {
  await page.goto(
    '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
  )
  // Wait for Vue hydration before clicking the toggletip (try fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const qualityButton = page.getByRole('button', { name: 'Qualité des métadonnées' }).first()
  await expect(qualityButton).toBeVisible()

  await qualityButton.click()

  // Target the tooltip panel specifically
  const tooltip = page.locator('#tooltips')

  // Verify tooltip content (actual data from seed)
  await expect(tooltip.getByText('Qualité des métadonnées :')).toBeVisible()
  await expect(tooltip.getByText('Description des données renseignée')).toBeVisible()
  await expect(tooltip.getByText('Fichiers documentés')).toBeVisible()
  await expect(tooltip.getByText('Licence non renseignée')).toBeVisible()
  await expect(tooltip.getByText('Fréquence de mise à jour non respectée')).toBeVisible()
  await expect(tooltip.getByText('Formats de fichiers standards')).toBeVisible()
  await expect(tooltip.getByText('Couverture temporelle renseignée')).toBeVisible()
  await expect(tooltip.getByText('Couverture spatiale non renseignée')).toBeVisible()
  await expect(tooltip.getByText('Tous les fichiers sont disponibles')).toBeVisible()

  // Verify link is clickable
  const learnMoreLink = tooltip.getByRole('link', { name: /En savoir plus sur cet indicateur/i })
  await expect(learnMoreLink).toBeVisible()

  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    learnMoreLink.click(),
  ])

  await expect(newPage).toHaveURL(/guides/)
})
