import { test, expect } from '../base'

const redirectionCases = [
  { from: '/datasets/65271c20a80b3f04010e71ff/', to: '/datasets/marches-publics-de-la-metropole-de-lyon' },
  { from: '/datasets/65271c20a80b3f04010e71ff/discussions/', to: '/datasets/marches-publics-de-la-metropole-de-lyon/discussions' },
  { from: '/dataservices/6690725d0fd97cb0a91ff6b5/', to: '/dataservices/explore-api-v2-30' },
  { from: '/dataservices/6690725d0fd97cb0a91ff6b5/discussions/', to: '/dataservices/explore-api-v2-30/discussions' },
  { from: '/reuses/66a23b96cc450c85e4409890/', to: '/reuses/itineriz-deplacements-professionnels-jop-paris-2024' },
  { from: '/reuses/66a23b96cc450c85e4409890/discussions/', to: '/reuses/itineriz-deplacements-professionnels-jop-paris-2024/discussions' },
  { from: '/organizations/6461fa1f4e1de2ee027048b7/', to: '/organizations/sobrana' },
  { from: '/organizations/6461fa1f4e1de2ee027048b7/datasets/', to: '/organizations/sobrana/datasets' },
  { from: '/users/5acb73d9c751df2c8dd8deb7/', to: '/users/antoine-augusti' },
]

test.describe('Redirects from ID to slug (and from old slug to new slug)', () => {
  redirectionCases.forEach(({ from, to }) => {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from)
      await expect(page).toHaveURL(to)
    })
  })
})
