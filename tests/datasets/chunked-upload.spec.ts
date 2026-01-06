import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { clickOutside } from '../helpers'

const __dirname = import.meta.dirname

/**
 * Generate a file where a \r byte falls exactly at the chunk boundary.
 */
function generateFileWithCRLFAtChunkBoundary(filePath: string, chunkSize: number): void {
  const buffer = Buffer.alloc(chunkSize + 1000, 'a')
  buffer[chunkSize - 1] = 0x0D // \r at end of first chunk
  fs.writeFileSync(filePath, buffer)
}

test('can upload a large file with CRLF at chunk boundary (chunked upload)', async ({ page }) => {
  const chunkSize = 2 * 1000 * 1000 // 2MB
  const tempDir = os.tmpdir()
  const testFilePath = path.join(tempDir, 'test-chunked-upload.csv')
  const uniqueTitle = `Test chunked upload CRLF ${Date.now()}`

  generateFileWithCRLFAtChunkBoundary(testFilePath, chunkSize)

  await page.goto('/')
  await page.getByRole('button', { name: 'Publier sur data.gouv.fr' }).click()
  await page.getByRole('link', { name: 'Un jeu de données' }).click()
  await page.getByRole('button', { name: 'Commencer la publication' }).click()
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Admin User' }).click()
  await page.getByRole('textbox', { name: 'Titre *' }).fill(uniqueTitle)
  await page.getByTestId('markdown-editor').fill('Test dataset for chunked upload with CRLF line endings.')
  await page.getByTestId('markdown-editor').press('Tab')
  await page.getByText('Il est recommandé d\'avoir une').click()
  await page.getByTestId('select-frequency').click()
  await page.getByRole('option', { name: 'Inconnu' }).click()
  await clickOutside(page)
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Upload the large file
  await page.getByRole('button', { name: 'Ajoutez des fichiers' }).click()
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Parcourir' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(testFilePath)

  await page.getByRole('button', { name: 'Envoyer' }).click()
  await page.getByRole('button', { name: 'Suivant' }).click()

  // Wait for upload to complete
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  // Verify no chunk size mismatch error
  await expect(page.getByText('Chunk size mismatch')).not.toBeVisible()

  // Go to the dataset page and verify the file is present
  await page.getByRole('link', { name: uniqueTitle }).click()
  await expect(page.getByText('test-chunked-upload.csv')).toBeVisible()
})
