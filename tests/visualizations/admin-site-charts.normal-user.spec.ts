import { test, expect } from '../base'

// The empty state is tested as a normal user: the list endpoint
// returns soft-deleted charts to admins, so once a chart has been created and
// deleted, an admin can never see the empty state.
test('shows the empty state when the site has no chart', async ({ page }) => {
  await page.goto('/admin/site/charts')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText(`Il n'y a pas encore de graphique sur le site`)).toBeVisible()
})
