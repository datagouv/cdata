import { test, expect } from '../base'

// Each step needs data filled on an earlier step (or does not exist), which a direct
// link cannot provide
const wizards = [
  '/admin/datasets/new?step=3',
  '/admin/datasets/structured?step=2',
  '/admin/dataservices/new?step=2',
  '/admin/reuses/new?step=2',
  '/admin/harvesters/new?step=2',
  '/admin/community-resources/new?step=2',
  '/admin/posts/new?step=2',
  '/admin/organizations/new?step=9',
]

for (const url of wizards) {
  test(`${url} reached directly goes back to the first step`, async ({ page }) => {
    await page.goto(url)
    await expect(page).toHaveURL(/[?&]step=1(&|$)/)
  })
}
