import { test, expect } from './base'

// Dates are computed in the timezone of whoever renders them: the server uses its
// own, the browser uses the reader's. Any date whose UTC time falls outside the
// reader's day therefore differs between the served HTML and the first client
// render. `base.ts` fails on console errors, so a missing `data-allow-mismatch`
// surfaces here as "Hydration completed but contains mismatches".
test.use({ timezoneId: 'Pacific/Kiritimati' })

test('a dataset list hydrates without mismatch from another timezone', async ({ page }) => {
  await page.goto('/datasets')

  await expect(page.locator('time').first()).toBeVisible()
})

test('a dataset page hydrates without mismatch from another timezone', async ({ page }) => {
  await page.goto('/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/')

  await expect(page).toHaveTitle(
    'Jeu de données - Base Sirene des entreprises et de leurs établissements (SIREN, SIRET) | data.gouv.fr',
  )
  // The machine-readable value is the same everywhere; only the displayed text
  // depends on the reader's timezone.
  await expect(page.locator('time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/)
})
