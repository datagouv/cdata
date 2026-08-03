import { expect } from '@playwright/test'
import { test } from '../base'

test('shows the hero and the two category cards', async ({ page }) => {
  await page.goto('/suivi-de-publication')

  await expect(page.getByRole('heading', { level: 1, name: 'Suivre les ouvertures et mises à disposition des données' })).toBeVisible()

  const demandesCard = page.getByRole('link', { name: 'Demandes de publications et engagements ministériels' })
  await expect(demandesCard).toBeVisible()
  await expect(demandesCard).toContainText('Suivre les prochaines publications de données ouvertes ou restreintes')

  const hvdCard = page.getByRole('link', { name: 'Données de forte valeur' })
  await expect(hvdCard).toBeVisible()
  await expect(hvdCard).toHaveAttribute('href', '/suivi-de-publication/donnees-de-forte-valeur')
})

test('shows the FAQ accordions', async ({ page }) => {
  await page.goto('/suivi-de-publication')

  const question = page.getByRole('button', { name: 'Qu\'est-ce que l\'ouverture des données ?' })
  await expect(question).toBeVisible()

  // The answer is collapsed until the question is opened.
  const answer = page.getByText('L\'ouverture des données désigne la publication de données en open data')
  await expect(answer).toBeHidden()
  await question.click()
  await expect(answer).toBeVisible()
})

test('navigates to the tracking table from the first card', async ({ page }) => {
  // The tracking table page fetches its Grist tables on mount; the endpoint is
  // not available in CI so it is mocked with empty tables.
  await page.route(/\/tables\/[^/]*\/records(\?|$)/, route => route.fulfill({ json: { records: [] } }))
  await page.goto('/suivi-de-publication')

  await page.getByRole('link', { name: 'Demandes de publications et engagements ministériels' }).click()
  await expect(page).toHaveURL(/\/suivi-de-publication\/engagements-et-demandes$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Suivi de la publication des données, API et codes sources publics' })).toBeVisible()
})
