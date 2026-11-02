import { test, expect } from '../base'
import { createDataset, deleteDatasets, gotoHydrated } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

test('can edit a dataset and changes are visible on the public page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const newTitle = `Dataset modifié ${uniqueId}`
  const newDescription = `Description modifiée par le test E2E ${uniqueId}`

  const dataset = await createDataset(request, `Test edition dataset ${uniqueId}`, 'Dataset pour tester l\'édition')
  createdDatasets.push(dataset.id)

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre *', { exact: true }).fill(newTitle)
  await page.getByTestId('markdown-editor').fill(newDescription)
  // The markdown editor emits its changes with a 300ms debounce: wait for the
  // model to be updated before saving
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

  // The changes are persisted and visible on the public page
  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)
  await expect(page.getByText(newDescription)).toBeVisible()
})

test('the link preview of the description editor never renders a javascript: link', async ({ page, request }) => {
  // Any editor of the dataset can write its description through the API, so the link
  // reaches the editor of another member without going through the editor UI.
  const href = 'javascript:alert(document.domain)'
  const dataset = await createDataset(request, `Test link preview ${Date.now()}`, `Introduction.\n\n[Lisez la doc](${href})`)
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, `/admin/datasets/${dataset.id}/`)
  const editor = page.getByTestId('markdown-editor')
  // The preview only shows up while the editor has the focus.
  await editor.focus()
  await editor.getByText('Lisez la doc').hover()

  // The tooltip still shows the stored URL, so the editor can see the link and remove it.
  const previewLink = page.getByTitle(href)
  await expect(previewLink).toBeVisible()
  await expect(previewLink).not.toHaveAttribute('href', /^javascript:/i)
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0)
})
