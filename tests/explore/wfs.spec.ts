import { readFileSync } from 'node:fs'
import type { APIRequestContext, Page, Route } from '@playwright/test'
import { test, expect } from '../base'
import { createDataset, createRemoteResource, deleteDatasets } from '../helpers'

// The WFS layer is only queried by the browser, after mount: a Playwright route is
// enough to stand in for the server, unlike the Tabular API (tests/fake-services.ts).

const WFS_URL = 'https://wfs.example.com/geoserver/wfs'
const LAYER = 'dreal_b:bande_100m_trait_cote'

// A real GeoServer schema, shared with the unit tests.
const SCHEMA = readFileSync(new URL('../../tests-unit/datagouv-components/fixtures/wfs/geoserver.xsd', import.meta.url), 'utf8')

// A real GeoServer answer (WFS 2.0, GML 3.2), shared with the unit tests.
const FEATURES = readFileSync(new URL('../../tests-unit/datagouv-components/fixtures/wfs/geoserver.gml', import.meta.url), 'utf8')

const CORS = { 'Access-Control-Allow-Origin': '*' }

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

async function createWfsResource(request: APIRequestContext, extras: Record<string, unknown> = {}) {
  const dataset = await createDataset(request, `Test explore WFS ${Date.now()}`, 'Dataset de test E2E')
  createdDatasets.push(dataset.id)
  const resource = await createRemoteResource(request, dataset.id, 'Couche WFS', {
    format: 'wfs',
    url: `${WFS_URL}?SERVICE=WFS&REQUEST=GetCapabilities`,
    extras: {
      // What the analysis robot stores after reading the GetCapabilities document.
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '2.0.0',
        output_formats: ['text/xml; subtype=gml/3.2', 'application/json'],
        detected_layer: { name: LAYER, default_crs: 'EPSG:2154' },
      },
      ...extras,
    },
  })
  return { dataset, resource }
}

type WfsRequests = { describeFeatureType: Array<URL>, getFeature: Array<URL>, all: Array<URL> }

async function routeWfs(page: Page, respond: (request: string, route: Route) => Promise<void> = defaultResponse): Promise<WfsRequests> {
  const requests: WfsRequests = { describeFeatureType: [], getFeature: [], all: [] }
  await page.route(`${WFS_URL}**`, async (route) => {
    const url = new URL(route.request().url())
    requests.all.push(url)
    const request = url.searchParams.get('REQUEST') ?? ''
    if (request === 'DescribeFeatureType') requests.describeFeatureType.push(url)
    if (request === 'GetFeature') requests.getFeature.push(url)
    await respond(request, route)
  })
  return requests
}

async function defaultResponse(request: string, route: Route) {
  if (request === 'DescribeFeatureType') return route.fulfill({ contentType: 'text/xml', headers: CORS, body: SCHEMA })
  if (request === 'GetFeature') return route.fulfill({ contentType: 'application/gml+xml; version=3.2', headers: CORS, body: FEATURES })
  return route.fulfill({ status: 404, headers: CORS, body: 'Not found' })
}

test('the data tab shows the first rows of the layer, without its geometry', async ({ page, request }) => {
  const { dataset, resource } = await createWfsResource(request)
  const requests = await routeWfs(page)

  await page.goto(`/explore/${dataset.id}?resource_id=${resource.id}`)

  await expect(page.getByTestId('row-count')).toHaveText('2 premières lignes sur 192', { timeout: 30000 })
  const table = page.getByRole('table')
  await expect(table.getByRole('columnheader')).toHaveText(['id', 'idcarreau'])
  await expect(table.getByRole('cell', { name: '10kmN277E333' })).toBeVisible()

  // Only the attributes are asked: the geometry weighs most of a GetFeature answer.
  expect(requests.getFeature).toHaveLength(1)
  const getFeature = requests.getFeature[0]!
  expect(getFeature.searchParams.get('TYPENAMES')).toBe(LAYER)
  expect(getFeature.searchParams.get('PROPERTYNAME')).toBe('id,idcarreau')
  // The server's default, GML: MapServer's GeoJSON would carry the geometries.
  expect(getFeature.searchParams.has('OUTPUTFORMAT')).toBe(false)
  expect(getFeature.searchParams.get('COUNT')).toBe('20')
})

test('the structure tab lists the geometry then the attributes, from the schema shared with the data tab', async ({ page, request }) => {
  const { dataset, resource } = await createWfsResource(request)
  const requests = await routeWfs(page)

  await page.goto(`/explore/${dataset.id}?resource_id=${resource.id}`)
  await expect(page.getByTestId('row-count')).toBeVisible({ timeout: 30000 })
  await page.getByRole('tab', { name: 'Structure des données' }).click()

  const panel = page.getByRole('tabpanel')
  await expect(panel.locator('h5')).toHaveText(['geom', 'id', 'idcarreau'])
  await expect(panel.locator('code')).toHaveText(['géométrie (multipolygone)', 'int', 'string'])
  expect(requests.describeFeatureType).toHaveLength(1)
})

test.describe('a server error', () => {
  test.use({ allowedConsoleMessages: ['the server responded with a status of 400'] })

  test('shows the message of the WFS server', async ({ page, request }) => {
    const { dataset, resource } = await createWfsResource(request)
    await routeWfs(page, async (_, route) => {
      await route.fulfill({
        status: 400,
        contentType: 'text/xml',
        headers: CORS,
        body: `<?xml version="1.0" encoding="UTF-8"?><ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1" version="2.0.0">
          <ows:Exception exceptionCode="InvalidParameterValue"><ows:ExceptionText>Unknown namespace [dreal_b]</ows:ExceptionText></ows:Exception>
        </ows:ExceptionReport>`,
      })
    })

    await page.goto(`/explore/${dataset.id}?resource_id=${resource.id}`)

    await expect(page.getByText('L\'aperçu de ce fichier n\'a pas pu être chargé.')).toBeVisible({ timeout: 30000 })
    await expect(page.getByText('Unknown namespace [dreal_b]')).toBeVisible()
  })
})

test('a server the robot found without CORS is not queried', async ({ page, request }) => {
  const { dataset, resource } = await createWfsResource(request, { 'check:cors:allow-origin': 'https://elsewhere.example.com' })
  const requests = await routeWfs(page)

  await page.goto(`/explore/${dataset.id}?resource_id=${resource.id}`)

  await expect(page.getByText('Ce fichier est hébergé sur un site externe qui n’autorise pas son affichage dans data.gouv.fr.')).toBeVisible({ timeout: 30000 })
  expect(requests.all).toHaveLength(0)
})
