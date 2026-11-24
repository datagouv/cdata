import { test, expect } from '../base'
import { createDataset, deleteDatasets, gotoHydrated } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets.splice(0))
})

// The community resource form has a submit button: Enter in the link field would submit it, and
// the browser validation stops that submission on the required fields still empty
test('Enter in the link field adds the dataset without submitting the surrounding form', async ({ page, request }) => {
  const dataset = await createDataset(request, `Jeu lié ${Date.now()}`, 'Reçoit une ressource communautaire')
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, '/admin/community-resources/new')
  const link = page.getByLabel('Lien vers le jeu de données')
  await link.evaluate((input) => {
    const counted = window as unknown as { submissions: number }
    counted.submissions = 0
    const form = input.closest('form')!
    form.addEventListener('submit', () => counted.submissions++)
    form.addEventListener('invalid', () => counted.submissions++, { capture: true })
  })
  await link.fill(`/datasets/${dataset.id}`)
  await link.press('Enter')

  await expect(page.getByText(dataset.title)).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { submissions: number }).submissions)).toBe(0)
})
