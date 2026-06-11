import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

async function createDataset(page: import('@playwright/test').Page, uniqueId: number) {
  const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: `Test discussions lifecycle ${uniqueId}`,
      description: 'Dataset pour tester le cycle de vie des discussions',
      frequency: 'unknown',
    },
  })
  return await response.json()
}

async function createDiscussion(page: import('@playwright/test').Page, subjectClass: 'Dataset' | 'Dataservice', subjectId: string, title: string) {
  const response = await page.request.post(`${API_BASE}/api/1/discussions/`, {
    data: {
      subject: { class: subjectClass, id: subjectId },
      title,
      comment: `Premier message de « ${title} »`,
    },
  })
  return await response.json()
}

test.describe('Discussions lifecycle', () => {
  test('owner can reply and close a discussion', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(page, uniqueId)
    const discussion = await createDiscussion(page, 'Dataset', dataset.id, `Discussion à clôturer ${uniqueId}`)

    await page.goto(`/datasets/${dataset.id}/discussions`)
    await page.waitForLoadState('networkidle')

    await page.getByText(`Discussion à clôturer ${uniqueId}`).click()
    await page.getByRole('button', { name: 'Répondre' }).first().click()

    await page.getByTestId('producer-select').click()
    await page.getByRole('option', { name: /Admin/ }).first().click()
    await page.getByRole('textbox', { name: /Votre message/ }).fill('Réponse de clôture E2E')

    await page.getByRole('button', { name: 'Répondre & Clôturer' }).click()

    await expect(page.getByText(/Discussion close par/)).toBeVisible()

    // The closed state is persisted: after a reload the discussion is collapsed
    // behind a "Voir la discussion" toggle
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: 'Voir la discussion' })).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/discussions/${discussion.id}/`)
    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('author can edit a comment', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(page, uniqueId)
    const discussion = await createDiscussion(page, 'Dataset', dataset.id, `Discussion à éditer ${uniqueId}`)

    await page.goto(`/datasets/${dataset.id}/discussions`)
    await page.waitForLoadState('networkidle')

    await page.getByText(`Discussion à éditer ${uniqueId}`).click()
    await page.getByRole('button', { name: 'Modifier' }).first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Éditer le message' })).toBeVisible()
    await dialog.getByRole('textbox', { name: /Votre message/ }).fill('Message édité par le test E2E')
    await dialog.getByRole('button', { name: 'Mettre à jour' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Message édité par le test E2E')).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/discussions/${discussion.id}/`)
    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('deep-link to a discussion shows a banner', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(page, uniqueId)
    const discussion = await createDiscussion(page, 'Dataset', dataset.id, `Discussion deep-link ${uniqueId}`)
    await createDiscussion(page, 'Dataset', dataset.id, `Autre discussion ${uniqueId}`)

    await page.goto(`/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Vous consultez une discussion spécifique sur ce jeu de donnée.')).toBeVisible()
    await expect(page.getByText(`Discussion deep-link ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Autre discussion ${uniqueId}`)).not.toBeVisible()

    await page.getByRole('button', { name: 'Voir toutes les discussions' }).click()
    await expect(page.getByText('Vous consultez une discussion spécifique sur ce jeu de donnée.')).not.toBeVisible()
    await expect(page.getByText(`Autre discussion ${uniqueId}`)).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can search within discussions', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(page, uniqueId)
    await createDiscussion(page, 'Dataset', dataset.id, `Sujet alpha ${uniqueId}`)
    await createDiscussion(page, 'Dataset', dataset.id, `Sujet beta ${uniqueId}`)

    await page.goto(`/datasets/${dataset.id}/discussions`)
    await page.waitForLoadState('networkidle')

    await page.getByPlaceholder('Recherche').fill(`Sujet alpha ${uniqueId}`)

    await expect(page.getByText(`Sujet alpha ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Sujet beta ${uniqueId}`)).not.toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('admin page can filter open and closed discussions', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(page, uniqueId)
    await createDiscussion(page, 'Dataset', dataset.id, `Discussion ouverte ${uniqueId}`)
    const closed = await createDiscussion(page, 'Dataset', dataset.id, `Discussion fermée ${uniqueId}`)
    await page.request.post(`${API_BASE}/api/1/discussions/${closed.id}/`, {
      data: {
        comment: 'Clôture via API pour le test',
        close: true,
      },
    })

    await page.goto(`/admin/datasets/${dataset.id}/discussions`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(`Discussion ouverte ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Discussion fermée ${uniqueId}`)).toBeVisible()

    await page.getByLabel('Type').selectOption({ label: 'Discussions clôturées' })
    await expect(page.getByText(`Discussion fermée ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Discussion ouverte ${uniqueId}`)).not.toBeVisible()

    await page.getByLabel('Type').selectOption({ label: 'Discussions ouvertes' })
    await expect(page.getByText(`Discussion ouverte ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Discussion fermée ${uniqueId}`)).not.toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('discussions work on a dataservice too', async ({ page }) => {
    const uniqueId = Date.now()

    const response = await page.request.post(`${API_BASE}/api/1/dataservices/`, {
      data: {
        title: `Test discussions dataservice ${uniqueId}`,
        description: 'API pour tester les discussions',
      },
    })
    const dataservice = await response.json()
    const discussion = await createDiscussion(page, 'Dataservice', dataservice.id, `Discussion API ${uniqueId}`)

    await page.goto(`/dataservices/${dataservice.id}/discussions`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(`Discussion API ${uniqueId}`)).toBeVisible()

    // Deep-link banner uses the dataservice wording
    await page.goto(`/dataservices/${dataservice.id}/discussions?discussion_id=${discussion.id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Vous consultez une discussion spécifique sur cette API.')).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/dataservices/${dataservice.id}/`)
  })
})
