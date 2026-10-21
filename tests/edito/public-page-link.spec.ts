import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

// The admin edito page and the public page both read the site, asking for different
// fields: going from one to the other must not hand the public page the admin's data.
test('the public page opened from the admin edito page shows its counts', async ({ page }) => {
  await gotoHydrated(page, '/admin/site/edito/datasets')

  await page.getByRole('link', { name: 'Éditer sur la page publique' }).click()

  await expect(page).toHaveURL(/\/datasets\?edit=true/)
  await expect(page.getByText(/parmi les \d+ jeux de données sur/)).toBeVisible()
})
