import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

test('search launch without params', async ({ page }) => {
  await page.goto('/datasets/search/')

  await expect(page).toHaveTitle(
    'Moteur de recherche des jeux de données - data.gouv.fr',
  )

  await expect(page.getByTestId('search-result-count')).toBeVisible()

  // Results are displayed in a list
  const results = page.locator('.search-results ul')
  await expect(results.locator('li')).not.toHaveCount(0)

  const url = new URL(page.url())
  expect(url.searchParams.size).toBe(0)
})

test('dataset label filter is available and functional', async ({ page }) => {
  await gotoHydrated(page, '/datasets/search/')

  // Badge filter is now a RadioGroup with legend "Label de donnée"
  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()
  await expect(badgeFieldset).toBeVisible()

  // Check that radio options are available
  const radioOptions = badgeFieldset.locator('input[type="radio"]')
  await expect(radioOptions).not.toHaveCount(0)

  // Click on first non-default option (skip "Tous")
  const firstBadgeOption = badgeFieldset.getByText('Données de forte valeur')
  await firstBadgeOption.click()

  // Verify URL is updated with badge parameter
  await page.waitForURL(/badge=/)
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()
})

test('search results update when badge filter is applied', async ({ page }) => {
  await gotoHydrated(page, '/datasets/search/')

  // Wait for initial results to load
  await expect(page.getByTestId('search-result-count')).toBeVisible()

  // Badge filter is now a RadioGroup
  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()

  // Click on a badge option
  await badgeFieldset.getByText('Données de forte valeur').click()

  // Wait for URL to update with badge parameter
  await page.waitForURL(/badge=/)

  // Either results are shown with a count, or "no results" message is displayed
  const hasResults = await page.getByTestId('search-result-count').isVisible().catch(() => false)
  const hasNoResultsMessage = await page.getByText('Vous n\'avez pas trouvé ce que vous cherchez').isVisible().catch(() => false)

  expect(hasResults || hasNoResultsMessage).toBeTruthy()
})

// The type counts come from `total`, which udata returns whether or not it runs
// on Elasticsearch. Facet counts would be a more direct target, but the CI runs
// udata on MongoDB alone, which answers without any facet.
const typeCount = (page: Page) => page
  .locator('fieldset')
  .filter({ has: page.locator('input[name="search-type"]') })
  .getByTestId('radio-count')
  .first()

// Hold searches back so the page can be inspected while a request is in flight.
const slowDownSearch = (page: Page) => page.route('**/api/2/datasets/search/**', async (route) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  await route.continue()
})

test('counts stay on screen while a sort change reloads the results', async ({ page }) => {
  await gotoHydrated(page, '/datasets/search/')
  await expect(page.getByTestId('search-result-count')).toBeVisible()

  const count = typeCount(page)
  await expect(count).toHaveText(/\d/)
  const countBeforeSort = await count.textContent()

  await slowDownSearch(page)

  const sortRequest = page.waitForRequest('**/api/2/datasets/search/**')
  await page.locator('#sort-search').selectOption({ label: 'Nombre de réutilisations' })
  await sortRequest

  // Read without retrying: the point is the state while the request is in flight.
  // Sort cannot move a single count, so none of them may go to dots.
  expect(await count.textContent()).toBe(countBeforeSort)
})

test('counts show their loading state while a filter change reloads the results', async ({ page }) => {
  await gotoHydrated(page, '/datasets/search/')
  await expect(page.getByTestId('search-result-count')).toBeVisible()

  const count = typeCount(page)
  await expect(count).toHaveText(/\d/)

  await slowDownSearch(page)

  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()
  const filterRequest = page.waitForRequest('**/api/2/datasets/search/**')
  await badgeFieldset.getByText('Données de forte valeur').click()
  await filterRequest

  // A filter change does move the counts, so the stale ones give way to dots.
  expect(await count.textContent()).toBe('')
})

test('counts keep their loading state when a sort change follows a filter change', async ({ page }) => {
  await gotoHydrated(page, '/datasets/search/')
  await expect(page.getByTestId('search-result-count')).toBeVisible()

  const count = typeCount(page)
  await expect(count).toHaveText(/\d/)

  await slowDownSearch(page)

  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()
  const filterRequest = page.waitForRequest('**/api/2/datasets/search/**')
  await badgeFieldset.getByText('Données de forte valeur').click()
  await filterRequest

  // The sort select sits outside the LoadingBlock, so it stays clickable while
  // the filter request is still in flight — unlike the pagination, which the
  // loader overlay covers.
  const sortRequest = page.waitForRequest('**/api/2/datasets/search/**')
  await page.locator('#sort-search').selectOption({ label: 'Nombre de réutilisations' })
  await sortRequest

  // Sort alone cannot move a count, but the filter response never landed: the
  // counts on screen are stale, so they must stay as dots.
  expect(await count.textContent()).toBe('')
})

test('badge filter can be cleared', async ({ page }) => {
  // Start with a badge filter applied
  await gotoHydrated(page, '/datasets/search/?badge=hvd')

  // Find the reset filters button in the sidebar (first one)
  const resetButton = page.getByRole('button', { name: 'Réinitialiser les filtres' }).first()
  await resetButton.scrollIntoViewIfNeeded()

  // Click reset filters button
  await resetButton.click()

  // Verify URL parameter is removed
  await page.waitForURL(url => !url.searchParams.has('badge'))
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeFalsy()
})

test('badge filter persists on page reload', async ({ page }) => {
  await gotoHydrated(page, '/datasets/search/')

  // Badge filter is now a RadioGroup
  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()

  // Click on a badge option
  await badgeFieldset.getByText('Données de forte valeur').click()

  // Wait for URL to update
  await page.waitForURL(/badge=/)
  const badgeValue = new URL(page.url()).searchParams.get('badge')

  // Reload the page
  await page.reload()

  // Verify URL still has the badge parameter with same value
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()
  expect(url.searchParams.get('badge')).toBe(badgeValue)
})

test('custom theme filter is visible on design search page', async ({ page }) => {
  await page.goto('/design/dataset-search')

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await expect(themeSelect).toBeVisible()
})

test('custom theme filter updates URL', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search')

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await themeSelect.selectOption('environnement')

  await page.waitForURL(/theme=environnement/)
  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('environnement')
})

test('custom theme filter persists on reload', async ({ page }) => {
  await page.goto('/design/dataset-search?theme=transport')

  const themeSelect = page.locator('#theme-filter')
  await expect(themeSelect).toHaveValue('transport')

  await page.reload()

  await expect(page.locator('#theme-filter')).toHaveValue('transport')
  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('transport')
})

test('custom theme filter is cleared by reset button', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search?theme=sante')

  await expect(page.locator('#theme-filter')).toHaveValue('sante')

  const resetButton = page.getByRole('button', { name: 'Réinitialiser les filtres' }).first()
  await resetButton.scrollIntoViewIfNeeded()
  await resetButton.click()

  await page.waitForURL(url => !url.searchParams.has('theme'))
  await expect(page.locator('#theme-filter')).not.toHaveValue('sante')
})

test('custom theme filter is hidden on non-dataset types', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search')

  await expect(page.locator('#theme-filter')).toBeVisible()

  const reusesRadio = page.getByRole('radio', { name: 'Réutilisations' })
  await reusesRadio.click({ force: true })

  await expect(page.locator('#theme-filter')).not.toBeVisible()
})

test('custom theme filter URL param is cleared when switching to a type that hides it', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search?theme=transport')

  await expect(page.locator('#theme-filter')).toHaveValue('transport')

  const reusesRadio = page.getByRole('radio', { name: 'Réutilisations' })
  await reusesRadio.click({ force: true })

  await page.waitForURL(url => !url.searchParams.has('theme'))
  const url = new URL(page.url())
  expect(url.searchParams.has('theme')).toBeFalsy()
})

test('custom theme filter URL param persists when switching between types that both show it', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search?theme=transport')

  await expect(page.locator('#theme-filter')).toHaveValue('transport')

  const inspireRadio = page.getByRole('radio', { name: 'Données INSPIRE' })
  await inspireRadio.click({ force: true })

  await page.waitForLoadState('networkidle')
  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('transport')
  await expect(page.locator('#theme-filter')).toHaveValue('transport')
})

test('custom theme filter resets page to 1 on change', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search?page=2')

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await themeSelect.selectOption('education')

  await page.waitForURL(/theme=education/)
  const url = new URL(page.url())
  expect(url.searchParams.get('page')).toBeNull()
})

test('custom theme filter preserves page param on initial load', async ({ page }) => {
  await page.goto('/design/dataset-search?theme=transport&page=2')

  await expect(page.locator('#theme-filter')).toHaveValue('transport')

  // Give the client a chance to hydrate and any stray watchers to fire.
  await page.waitForLoadState('networkidle')

  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('transport')
  expect(url.searchParams.get('page')).toBe('2')
})

test('custom theme filter applies its apiParam mapping to the results', async ({ page }) => {
  await gotoHydrated(page, '/design/dataset-search')

  const results = page.locator('.search-results ul')
  await expect(results.locator('li')).not.toHaveCount(0)

  // The UI param is `theme` but useSearchFilter maps it to `tag` for the API.
  // Assert both: the outgoing request uses `tag`, and the results reflect it.
  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()

  const apiRequest = page.waitForRequest(req =>
    req.url().includes('/api/2/datasets/search/')
    && new URL(req.url()).searchParams.get('tag') === 'transport',
  )
  await themeSelect.selectOption('transport')
  await apiRequest

  await expect(
    results.getByText('Réseau de transport en commun Trans\'Agglo de DLVA'),
  ).toBeVisible()
})

test('custom filter scoped to dataset types never appears in the parallel dataservices search', async ({ page }) => {
  // Collect tag values from every dataservices request (initial + any re-fetches)
  const dataservicesTags: (string | null)[] = []
  page.on('request', (req) => {
    if (req.url().includes('/api/2/dataservices/search/')) {
      dataservicesTags.push(new URL(req.url()).searchParams.get('tag'))
    }
  })

  await gotoHydrated(page, '/design/dataset-search')

  // Change the theme filter and wait for the all-datasets search to re-fetch with tag=transport
  // (confirms the filter change was processed before we check dataservices)
  const datasetsWithTagPromise = page.waitForRequest(
    req =>
      req.url().includes('/api/2/datasets/search/')
      && new URL(req.url()).searchParams.get('tag') === 'transport'
      && !new URL(req.url()).searchParams.has('badge'),
  )

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await themeSelect.selectOption('transport')
  await datasetsWithTagPromise

  // tag=transport must never have appeared in any dataservices request
  expect(dataservicesTags.every(tag => tag !== 'transport')).toBe(true)
})

test('switching search type resets page to 1', async ({ page }) => {
  // Reproduces the bug: deep into datasets results (page 18), switching to the
  // organizations type used to carry the stale page over to /organizations.
  await gotoHydrated(page, '/datasets/search/?q=biblioth%C3%A8que&page=18')

  const organizationsRadio = page.getByRole('radio', { name: 'Organisations' })
  await organizationsRadio.click({ force: true })

  await page.waitForURL(/\/organizations/)
  const url = new URL(page.url())
  expect(url.searchParams.has('page')).toBeFalsy()
})

test('switching type in-component resets page to 1', async ({ page }) => {
  // Same reset, but exercised through GlobalSearch's internal type model (no
  // navigation) as used on the design search page.
  await gotoHydrated(page, '/design/dataset-search?page=2')

  const reusesRadio = page.getByRole('radio', { name: 'Réutilisations' })
  await reusesRadio.click({ force: true })

  await page.waitForURL(url => !url.searchParams.has('page'))
  const url = new URL(page.url())
  expect(url.searchParams.has('page')).toBeFalsy()
})

test('switching type resets page and clears a type-scoped custom filter in one go', async ({ page }) => {
  // Combined case: a deep page AND an active custom filter the target type hides.
  // Both URL updates must batch into a single navigation without clobbering each
  // other (page reset via useRouteQuery vs. the custom filter being cleared).
  await gotoHydrated(page, '/design/dataset-search?theme=transport&page=18')
  await expect(page.locator('#theme-filter')).toHaveValue('transport')

  const reusesRadio = page.getByRole('radio', { name: 'Réutilisations' })
  await reusesRadio.click({ force: true })

  await page.waitForURL(url => !url.searchParams.has('theme'))
  const url = new URL(page.url())
  expect(url.searchParams.has('theme')).toBeFalsy()
  expect(url.searchParams.has('page')).toBeFalsy()
})

test.describe('organization filter option list', () => {
  // `organization` is an advanced filter on the default dataset config, so the
  // "Filtres avancés" panel has to be open. The testid sits on the combobox button,
  // not on its input, and the input is targeted by its placeholder rather than by
  // role + name: the "Organisations" label is shared with the search type radio
  // group, and a disabled input is dropped from the accessibility tree anyway,
  // which would hide it while the selected organization is still being resolved.
  const openAdvancedFilters = async (page: Page) => {
    await page.getByRole('button', { name: 'Filtres avancés' }).click()
  }

  const organizationInput = (page: Page) => page.getByPlaceholder('Toutes les organisations')

  const openOrganizationSelect = async (page: Page) => {
    await openAdvancedFilters(page)

    const trigger = page.getByTestId('searchable-select-organisations')
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    return organizationInput(page)
  }

  test('falls back to the suggest endpoint while nothing narrows the results', async ({ page }) => {
    await page.goto('/datasets/search')
    await page.waitForLoadState('networkidle')

    const suggestRequest = page.waitForRequest(req => req.url().includes('/api/1/organizations/suggest/'))
    await openOrganizationSelect(page)
    await suggestRequest

    // The suggest endpoint answers without a count, unlike the facets.
    await expect(page.getByTestId('organization-option-count')).toHaveCount(0)
  })

  test('offers the counted facets of the results once a query narrows them down', async ({ page }) => {
    // Collect the organization suggest calls to assert none is needed here.
    let suggestCalls = 0
    page.on('request', (req) => {
      if (req.url().includes('/api/1/organizations/suggest/')) suggestCalls++
    })

    await page.goto('/datasets/search?q=meteo')
    await page.waitForLoadState('networkidle')

    await openOrganizationSelect(page)

    // The facet carries a count, unlike the suggest endpoint which returns none.
    // Its exact value depends on the seed, and `Intl` renders it in French compact
    // notation ("1,2 k" past a thousand), so only assert it starts with a non-zero digit.
    const meteoFrance = page.getByRole('option').filter({ hasText: 'Météo-France' })
    await expect(meteoFrance).toBeVisible()
    await expect(meteoFrance.getByTestId('organization-option-count')).toHaveText(/^[1-9]/)
    expect(suggestCalls).toBe(0)
  })

  test('goes back to the suggest endpoint as soon as the user types', async ({ page }) => {
    await page.goto('/datasets/search?q=meteo')
    await page.waitForLoadState('networkidle')

    const input = await openOrganizationSelect(page)

    const suggestRequest = page.waitForRequest((req) => {
      const url = new URL(req.url())
      return url.pathname.includes('/api/1/organizations/suggest/') && url.searchParams.get('q') === 'met'
    })
    // fill() dispatches the change event SearchableSelect listens to, then the
    // debounced watcher calls the suggest endpoint with the typed query.
    await input.click()
    await input.fill('met')
    await suggestRequest
  })

  test('offers the counted facets once the query narrows the results after mounting', async ({ page }) => {
    // Regression guard: the select resolves its options on mount, so a query typed
    // afterwards used to leave the mount-time suggest list in place, without counts.
    await page.goto('/datasets/search')
    await page.waitForLoadState('networkidle')

    // The main search input is named after its placeholder on the datasets page.
    await page.getByPlaceholder('ex. élections présidentielles').fill('meteo')
    await page.waitForURL(/q=meteo/)

    await openOrganizationSelect(page)

    // Météo-France is only reachable through the facets here, since the suggest
    // endpoint is not asked again for an already non-empty query.
    const meteoFrance = page.getByRole('option').filter({ hasText: 'Météo-France' })
    await expect(meteoFrance).toBeVisible()
    await expect(meteoFrance.getByTestId('organization-option-count')).toHaveText(/^[1-9]/)
  })

  test('keeps the selected organization displayed once it drops out of the facets', async ({ page }) => {
    // Brest métropole has 366 datasets but none of them match "meteo", so the
    // organization_id_with_name facet of that result is empty while the filter
    // stays applied. The field must not fall back to its placeholder.
    await page.goto('/datasets/search?organization=534fff5ba3a7292c64a77d19&q=meteo')
    await page.waitForLoadState('networkidle')

    await openAdvancedFilters(page)
    await expect(organizationInput(page)).toHaveValue('Brest métropole')
  })
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the collapsed filter panel does not break hydration', async ({ page }) => {
    // The server has no viewport and always renders the panel expanded. When the
    // panel was collapsed from a JS media query, a narrow client dropped it from
    // its vdom and Vue tore the subtree down mid-hydration. The console fixture in
    // tests/base.ts turns the resulting mismatch into a failure.
    await gotoHydrated(page, '/datasets/search/?badge=hvd')

    const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
    await expect(badgeFieldset).toBeHidden()

    await page.getByRole('button', { name: 'Filtres', exact: true }).click()
    await expect(badgeFieldset).toBeVisible()
  })
})

test('clicking dataset navigates to detail', async ({ page }) => {
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await gotoHydrated(page, '/datasets/search/')

  const datasetLink = page.getByRole('link', { name: /SIRENE/i }).first()
  await expect(datasetLink).toBeVisible()

  await datasetLink.click()

  await expect(page).toHaveURL(/\/datasets\/base-sirene/)
})
