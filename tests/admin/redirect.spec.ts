import { test, expect } from '../base'

test('clicking Administration in the header redirects and renders content', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('banner').getByRole('link', { name: 'Administration' }).click()

  await expect(page).toHaveURL(/\/admin\/(me|organizations\/[^/]+)\/datasets/)
  await expect(page.getByRole('heading', { level: 1, name: 'Jeux de données' })).toBeVisible()
})

test('clicking Administration breadcrumb from an admin page redirects and renders content', async ({ page }) => {
  await page.goto('/admin/me/datasets')
  await expect(page.getByRole('heading', { level: 1, name: 'Jeux de données' })).toBeVisible()

  await page.getByLabel('Vous êtes ici :').getByRole('link', { name: 'Administration' }).click()

  await expect(page).toHaveURL(/\/admin\/(me|organizations\/[^/]+)\/datasets/)
  await expect(page.getByRole('heading', { level: 1, name: 'Jeux de données' })).toBeVisible()
})
