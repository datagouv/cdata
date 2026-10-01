import type { BrowserContext } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets, type ApiResource } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

const SERVICE_URL = 'https://wms.example.com/wms'
const LAYER_NAME = 'test-layer'
const PAYLOAD = '<img src=x onerror="window.__wmsXss = true">'
const XML_PAYLOAD = PAYLOAD.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// The GetCapabilities document is written by whoever publishes the resource: every
// string it carries is attacker-controlled, including the links.
const CAPABILITIES = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms" xmlns:xlink="http://www.w3.org/1999/xlink">
  <Capability>
    <Layer>
      <Title>Root</Title>
      <CRS>EPSG:3857</CRS>
      <Layer queryable="1">
        <Name>${LAYER_NAME}</Name>
        <Title>${XML_PAYLOAD}</Title>
        <Abstract>${XML_PAYLOAD}</Abstract>
        <CRS>EPSG:3857</CRS>
        <BoundingBox CRS="EPSG:3857" minx="-20037508.34" miny="-20037508.34" maxx="20037508.34" maxy="20037508.34"/>
        <Attribution>
          <Title>${XML_PAYLOAD}</Title>
          <OnlineResource xlink:type="simple" xlink:href="javascript:window.__wmsXss=true"/>
        </Attribution>
        <MetadataURL type="ISO19115:2003">
          <Format>text/xml</Format>
          <OnlineResource xlink:type="simple" xlink:href="javascript:window.__wmsXss=true"/>
        </MetadataURL>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`

// 1×1 transparent PNG, served for every map tile so no request leaves the test.
const TILE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

async function fakeWmsService(context: BrowserContext) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }
  await context.route(`${SERVICE_URL}**`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors })
    }
    if (new URL(route.request().url()).searchParams.get('REQUEST') === 'GetCapabilities') {
      return route.fulfill({ status: 200, headers: cors, contentType: 'text/xml', body: CAPABILITIES })
    }
    return route.fulfill({ status: 200, headers: cors, contentType: 'image/png', body: TILE })
  })
  await context.route('https://tile.openstreetmap.org/**', route => route.fulfill({ status: 200, contentType: 'image/png', body: TILE }))
}

// The layer switcher warns about the OSM base layer on every map it builds.
test.use({ allowedConsoleMessages: ['Greyscale only implemented for raster and vector tiles'] })

test('the WMS map preview renders the GetCapabilities strings as text', async ({ page, context, request }) => {
  await fakeWmsService(context)

  const dataset = await createDataset(request, `Test WMS preview ${Date.now()}`, 'Dataset de test E2E')
  createdDatasets.push(dataset.id)
  const response = await request.post(`${API_BASE}/api/1/datasets/${dataset.id}/resources/`, {
    data: {
      title: LAYER_NAME,
      type: 'main',
      filetype: 'remote',
      url: `${SERVICE_URL}?SERVICE=WMS&REQUEST=GetCapabilities`,
      format: 'ogc:wms',
    },
  })
  const resource: ApiResource = await response.json()

  await page.goto(`/datasets/${dataset.id}/?resource_id=${resource.id}`)

  await expect(page.locator('.GPimportGetCapProposal')).toHaveText(PAYLOAD)
  // The OSM base layer, titled "0", sits below the WMS layer.
  await expect(page.locator('.GPlayerName')).toHaveText([PAYLOAD, '0'])

  await page.getByRole('button', { name: 'Ma sélection de cartes' }).click()
  // The WMS layer is listed first, above the base layer.
  await page.getByTitle('Plus d\'outils').first().click()
  await page.locator('[id^="GPinfo_ID_"]:enabled').click()
  await expect(page.locator('[id^="GPlayerInfoDescription"]')).toHaveText(PAYLOAD)

  expect(await page.evaluate(() => (window as unknown as { __wmsXss?: boolean }).__wmsXss)).toBeUndefined()
  await expect(page.locator('img[src="x"]')).toHaveCount(0)
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0)
})
