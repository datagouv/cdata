import { readFileSync } from 'node:fs'
import type { BrowserContext } from '@playwright/test'
import { test, expect } from '../base'
import { createDataset, createRemoteResource, deleteDatasets, type ApiResource } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

const ARCHIVE_URL = 'https://pmtiles.example.com/paris-thevenot.pmtiles'
const ARCHIVE = readFileSync(new URL('../fixtures/pmtiles/paris-thevenot.pmtiles', import.meta.url))
// The fixture pads its tile data to this offset, so pmtiles.js answers the
// initial 16 KiB header read without it; the tile read is a separate range
// request that only happens if the maplibre worker pipeline is alive.
const TILE_DATA_OFFSET = 16384

// Minimal TileJSON whose tile endpoint serves empty bodies: the base map
// renders nothing, but maplibre v6 needs a non-empty `tiles` array — an empty
// one makes VectorTileSource.loadTile crash on `undefined.replace` every
// render, which starves the pmtiles source too.
const EMPTY_TILEJSON = { tilejson: '3.0.0', tiles: ['https://openmaptiles.geo.data.gouv.fr/data/empty/{z}/{x}/{y}.pbf'], minzoom: 0, maxzoom: 14 }
// 1×1 transparent PNG for the sprite stub.
const PIXEL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

async function fakePmtilesArchive(context: BrowserContext): Promise<{ tileReads: () => number }> {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET' }
  let tileReads = 0
  await context.route('https://pmtiles.example.com/**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors })
    }
    const range = route.request().headers().range
    if (!range) {
      return route.fulfill({ status: 400, headers: cors, body: 'range required' })
    }
    const [startStr, endStr] = range.replace('bytes=', '').split('-')
    const start = Number(startStr)
    const clampedEnd = Math.min(endStr ? Number(endStr) : ARCHIVE.length - 1, ARCHIVE.length - 1)
    if (start >= TILE_DATA_OFFSET) tileReads++
    return route.fulfill({
      status: 206,
      headers: {
        ...cors,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes=${start}-${clampedEnd}/${ARCHIVE.length}`,
      },
      contentType: 'application/octet-stream',
      body: ARCHIVE.subarray(start, clampedEnd + 1),
    })
  })
  return { tileReads: () => tileReads }
}

async function fakeBaseMap(context: BrowserContext) {
  await context.route('https://openmaptiles.geo.data.gouv.fr/data/**', (route) => {
    if (route.request().url().endsWith('.pbf')) {
      return route.fulfill({ status: 200, contentType: 'application/x-protobuf', body: '' })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_TILEJSON) })
  })
  await context.route('https://openmaptiles.github.io/**', (route) => {
    if (route.request().url().endsWith('.json')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
    return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG })
  })
  // Nothing renders text in this test: an empty protobuf is a valid empty
  // glyph response, and these requests must not leave the test.
  await context.route('https://openmaptiles.geo.data.gouv.fr/fonts/**', route =>
    route.fulfill({ status: 200, contentType: 'application/x-protobuf', body: '' }))
}

async function createDatasetWithPmtilesResource(request: import('@playwright/test').APIRequestContext, archiveUrl: string): Promise<{ resource: ApiResource, datasetId: string }> {
  const dataset = await createDataset(request, `Test PMTiles preview ${Date.now()}`, 'Dataset de test E2E')
  createdDatasets.push(dataset.id)
  const resource = await createRemoteResource(request, dataset.id, 'paris-thevenot', {
    format: 'pmtiles',
    extras: {
      'analysis:parsing:pmtiles_url': archiveUrl,
      'analysis:parsing:finished_at': '2026-10-15T09:00:00',
    },
  }) as ApiResource & { extras: Record<string, string> }
  // Reserved extras are admin-writable through the v1 resource form
  // (udata forms/fields.py can_write). If this assertion fails, udata closed
  // that path: fake the extras by intercepting the dataset API response
  // instead (see tests/explore/index.spec.ts).
  expect(resource.extras['analysis:parsing:pmtiles_url']).toBe(archiveUrl)
  return { resource, datasetId: dataset.id }
}

// The single-feature fixture archive has degenerate (min == max) bounds, and
// the headless GL driver reports ReadPixels stalls; both are expected noise.
test.use({ allowedConsoleMessages: ['Bounds of PMTiles archive', 'GL Driver Message'] })

test('the PMTiles map preview loads the archive and opens a popup on click', async ({ page, context, request, browserName }) => {
  // Headless firefox cannot create WebGL contexts (AllowWebgl2:false) and
  // maplibre v6 requires WebGL2, so no map can render there.
  test.skip(browserName === 'firefox', 'headless firefox has no WebGL2')

  const archive = await fakePmtilesArchive(context)
  await fakeBaseMap(context)

  const { resource, datasetId } = await createDatasetWithPmtilesResource(request, ARCHIVE_URL)

  await page.goto(`/datasets/${datasetId}/?resource_id=${resource.id}`)

  await expect(page.getByText(/Aperçu de la carte mis à jour le/)).toBeVisible()
  const canvas = page.locator('.maplibregl-canvas')
  await expect(canvas).toBeVisible()

  // Only fires if the maplibre worker loaded the tile — the regression net
  // for a broken or missing setWorkerUrl().
  await expect.poll(() => archive.tileReads(), { timeout: 20000 }).toBeGreaterThan(0)

  // The fixture holds a single feature centered on its own coordinates, so
  // the dot sits at the exact canvas center.
  const box = (await canvas.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const popup = page.locator('.maplibregl-popup')
  await expect(popup).toBeVisible()
  await expect(popup).toContainText('THEVENOT')
  await expect(popup).toContainText('Passy')
})

test.describe('broken archive', () => {
  test('the PMTiles preview falls back to PreviewUnavailable when the archive 404s', async ({ page, context, request }) => {
    await context.route('https://pmtiles-down.example.com/**', route =>
      route.fulfill({ status: 404, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }, body: 'not found' }))
    await fakeBaseMap(context)

    const { resource, datasetId } = await createDatasetWithPmtilesResource(request, 'https://pmtiles-down.example.com/gone.pmtiles')

    await page.goto(`/datasets/${datasetId}/?resource_id=${resource.id}`)

    await expect(page.getByText('L\'aperçu cartographique de ce fichier n\'a pas pu être chargé.')).toBeVisible()
    await expect(page.locator('.maplibregl-canvas')).toHaveCount(0)
  })
})
