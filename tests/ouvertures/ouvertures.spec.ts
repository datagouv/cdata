import type { Page } from '@playwright/test'
import { test as testWithoutConsoleCheck, expect } from '@playwright/test'
import { test } from '../base'

// The /ouvertures page loads its data client-side from two Grist tables. The Grist
// endpoint is not available in CI (NUXT_PUBLIC_OUVERTURES_GRIST_* are empty by
// default), so every test mocks both endpoints through page.route.

const GRIST_RECORDS = {
  records: [
    {
      id: 1,
      fields: {
        nom_donnee: 'Zèbre',
        organisation: ['L', 1],
        ministere_de_tutelle: ['L', 2],
        type: ['L', 'API', 'Code source'],
        source_demande_front: 'Forum',
        thematique: ['L', 'Transport'],
        statut_front: 'Disponible',
        restriction_acces: 'Aucune',
        url: 'https://www.data.gouv.fr/datasets/zebre',
      },
    },
    {
      id: 2,
      fields: {
        nom_donnee: 'Abeille',
        organisation: ['L', 2],
        ministere_de_tutelle: null,
        // Not a Grist list — unwrapList must return no values, displayed as "-".
        type: 'not-a-list',
        source_demande_front: null,
        thematique: null,
        statut_front: 'En cours',
        restriction_acces: 'Restreint',
        url: null,
      },
    },
    {
      id: 3,
      fields: {
        // Empty title — must be sorted last.
        nom_donnee: null,
        // Unknown organisation id — must be silently dropped.
        organisation: ['L', 99],
        ministere_de_tutelle: null,
        type: ['L', 'Téléchargement'],
        source_demande_front: null,
        thematique: null,
        statut_front: 'Non disponible',
        restriction_acces: null,
        url: null,
      },
    },
  ],
}

const GRIST_ORGANISATIONS = {
  records: [
    { id: 1, fields: { nom_organisation: 'INSEE' } },
    { id: 2, fields: { nom_organisation: 'DGFiP' } },
  ],
}

// The main table name comes from runtime config and may be empty (CI), so match
// any (possibly empty) table name and dispatch on the Organisations table.
const GRIST_TABLE_ROUTE = /\/tables\/[^/]*\/records$/

async function mockGristEndpoints(page: Page) {
  await page.route(GRIST_TABLE_ROUTE, async (route) => {
    if (route.request().url().includes('/tables/Organisations/')) {
      await route.fulfill({ json: GRIST_ORGANISATIONS })
    }
    else {
      await route.fulfill({ json: GRIST_RECORDS })
    }
  })
}

test('displays the enriched Grist records sorted by title', async ({ page }) => {
  await mockGristEndpoints(page)
  await page.goto('/ouvertures')

  const rows = page.locator('.grist-table-viewer tbody tr')
  await expect(rows).toHaveCount(3)

  // Sorted by title, records without a title last.
  await expect(rows.locator('td:first-child')).toHaveText(['Abeille', 'Zèbre', '-'])

  const zebreRow = rows.nth(1)
  // Organisation ids resolved to names through the Organisations table.
  await expect(zebreRow.locator('td').nth(1)).toHaveText('INSEE')
  await expect(zebreRow.locator('td').nth(2)).toHaveText('DGFiP')
  // Grist list unwrapped: one badge per value, no "L" marker.
  await expect(zebreRow.locator('td').nth(3).locator('.fr-badge')).toHaveText(['API', 'Code source'])

  const abeilleRow = rows.nth(0)
  // Non-list type value yields no badge.
  await expect(abeilleRow.locator('td').nth(3)).toHaveText('-')
  // Unknown organisation id dropped.
  await expect(rows.nth(2).locator('td').nth(1)).toHaveText('-')
})

test('filters the records and syncs the selection to the URL', async ({ page }) => {
  await mockGristEndpoints(page)
  await page.goto('/ouvertures')

  const rows = page.locator('.grist-table-viewer tbody tr')
  await expect(rows).toHaveCount(3)

  const statutSelect = page.getByLabel('Statut', { exact: true })
  // Options follow the custom valueOrder, not the alphabetical order.
  await expect(statutSelect.locator('option')).toHaveText(['Tous les statuts', 'Non disponible', 'En cours', 'Disponible'])

  await statutSelect.selectOption('Disponible')
  await expect(rows).toHaveCount(1)
  await expect(rows.first().locator('td:first-child')).toHaveText('Zèbre')
  await expect(page).toHaveURL(/statut=Disponible/)

  await page.getByRole('button', { name: 'Ré-initialiser tous les filtres' }).click()
  await expect(rows).toHaveCount(3)
  await expect(page).not.toHaveURL(/statut=/)
})

test('pre-fills the filters from the URL query', async ({ page }) => {
  await mockGristEndpoints(page)
  await page.goto('/ouvertures?statut=En cours')

  const rows = page.locator('.grist-table-viewer tbody tr')
  await expect(rows).toHaveCount(1)
  await expect(rows.first().locator('td:first-child')).toHaveText('Abeille')
  await expect(page.getByLabel('Statut', { exact: true })).toHaveValue('En cours')
})

test('shows the empty state when no record matches the filters', async ({ page }) => {
  await mockGristEndpoints(page)
  // Zèbre is INSEE/Disponible and Abeille is DGFiP/En cours: nothing matches both.
  await page.goto('/ouvertures?organisation=INSEE&statut=En cours')

  await expect(page.getByText('Aucun résultat ne correspond aux filtres sélectionnés')).toBeVisible()
  await expect(page.locator('.grist-table-viewer table')).toHaveCount(0)
})

// This test uses the raw Playwright test because the assertNoConsoleErrors fixture
// from ../base would fail on the browser's own "Failed to load resource: 500" log
// and on the page's console.error, both expected in this scenario.
testWithoutConsoleCheck('shows an error instead of "no data" when the Grist fetch fails', async ({ page }) => {
  await page.route(GRIST_TABLE_ROUTE, route => route.fulfill({ status: 500, json: { error: 'boom' } }))
  await page.goto('/ouvertures')

  const alert = page.locator('.fr-alert--error')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('Erreur lors du chargement des données')
  await expect(page.getByText('Aucune donnée disponible')).toHaveCount(0)
})
