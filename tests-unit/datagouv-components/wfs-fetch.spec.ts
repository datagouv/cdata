import { readFileSync } from 'node:fs'
import { DOMParser } from '@xmldom/xmldom'
import { createApp } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { configKey, type ResolvedPluginConfig } from '~/datagouv-components/src/config'
import { useWfsFeatures, useWfsSchema } from '~/datagouv-components/src/composables/useWfs'
import { getWfsPreviewLayer, type WfsPreviewLayer, type WfsSchema } from '~/datagouv-components/src/functions/wfs'
import {
  diagnoseWfsError,
  fetchWfsText,
  loadWfsFeatures,
  WfsHttpError,
  WfsRequestError,
  WfsTimeoutError,
  WfsTooLargeError,
} from '~/datagouv-components/src/functions/wfsFetch'
import { WfsMalformedResponseError, WfsServiceError } from '~/datagouv-components/src/functions/wfs'
import type { Resource } from '~/datagouv-components/src/types/resources'

const fixture = (name: string) => readFileSync(new URL(`./fixtures/wfs/${name}`, import.meta.url), 'utf8')

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('DOMParser', DOMParser)
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.useRealTimers()
})

const layer: WfsPreviewLayer = {
  url: 'https://example.com/wfs',
  version: '2.0.0',
  typeName: 'dreal_b:bande_100m_trait_cote',
  defaultCrs: null,
  outputFormats: ['application/json'],
}

const schema: WfsSchema = {
  attributes: [{ name: 'id', type: 'int', nullable: true }, { name: 'idcarreau', type: 'string', nullable: true }],
  geometry: { name: 'geom', type: 'MultiPolygon' },
}

const featureCollection = (count: number) => `<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:dreal_b="http://geobretagne.fr/ns/dreal_b" numberMatched="192" numberReturned="${count}">${
  Array.from({ length: count }, (_, i) => `<wfs:member><dreal_b:bande_100m_trait_cote><dreal_b:id>${i}</dreal_b:id><dreal_b:idcarreau>c${i}</dreal_b:idcarreau></dreal_b:bande_100m_trait_cote></wfs:member>`).join('')
}</wfs:FeatureCollection>`

describe('fetchWfsText', () => {
  test('returns the body', async () => {
    fetchMock.mockResolvedValue(new Response('hello'))
    await expect(fetchWfsText('https://example.com', { maxBytes: 100 })).resolves.toBe('hello')
  })

  test('stops reading past the byte cap', async () => {
    fetchMock.mockResolvedValue(new Response('x'.repeat(200)))
    await expect(fetchWfsText('https://example.com', { maxBytes: 100 })).rejects.toBeInstanceOf(WfsTooLargeError)
  })

  test('trusts a Content-Length over the cap without reading', async () => {
    fetchMock.mockResolvedValue(new Response('small', { headers: { 'Content-Length': '5000000' } }))
    await expect(fetchWfsText('https://example.com', { maxBytes: 100 })).rejects.toBeInstanceOf(WfsTooLargeError)
  })

  test('an error status carries the service exception when there is one', async () => {
    fetchMock.mockResolvedValue(new Response('<ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1"><ows:Exception><ows:ExceptionText>Unknown namespace [nope]</ows:ExceptionText></ows:Exception></ows:ExceptionReport>', { status: 400 }))
    await expect(fetchWfsText('https://example.com', { maxBytes: 10_000 })).rejects.toEqual(new WfsServiceError('Unknown namespace [nope]'))
    fetchMock.mockResolvedValue(new Response('Not found', { status: 404 }))
    await expect(fetchWfsText('https://example.com', { maxBytes: 10_000 })).rejects.toEqual(new WfsHttpError(404))
  })

  test('a large error page is an HTTP error, not a large layer', async () => {
    fetchMock.mockResolvedValue(new Response(`<html>${'x'.repeat(500_000)}</html>`, { status: 500 }))
    await expect(fetchWfsText('https://example.com', { maxBytes: 100 })).rejects.toEqual(new WfsHttpError(500))
  })

  test('a rejected fetch is a request error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await fetchWfsText('https://example.com', { maxBytes: 100 }).catch(e => e)
    expect(error).toBeInstanceOf(WfsRequestError)
  })

  test('gives up after the timeout', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation((_, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal!.reason))
    }))
    const result = expect(fetchWfsText('https://example.com', { maxBytes: 100, timeoutMs: 1000 })).rejects.toBeInstanceOf(WfsTimeoutError)
    await vi.advanceTimersByTimeAsync(1000)
    await result
  })
})

describe('loadWfsFeatures', () => {
  test('asks the attributes only, without the geometry', async () => {
    fetchMock.mockResolvedValue(new Response(featureCollection(2)))
    const page = await loadWfsFeatures(layer, schema)
    expect(page).toEqual({ rows: [{ id: '0', idcarreau: 'c0' }, { id: '1', idcarreau: 'c1' }], total: 192 })
    const url = new URL(fetchMock.mock.calls[0]![0] as string)
    expect(url.searchParams.get('PROPERTYNAME')).toBe('id,idcarreau')
    expect(url.searchParams.get('COUNT')).toBe('20')
    // The server's default output, GML: MapServer's GeoJSON would carry the geometries.
    expect(url.searchParams.has('OUTPUTFORMAT')).toBe(false)
  })

  test('a page over the cap is too large, whatever the server sends', async () => {
    // MapServer sends the geometries even without them in PROPERTYNAME.
    fetchMock.mockResolvedValue(new Response('x', { headers: { 'Content-Length': '50000000' } }))
    await expect(loadWfsFeatures(layer, schema)).rejects.toBeInstanceOf(WfsTooLargeError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('does not fetch a layer without attributes', async () => {
    await expect(loadWfsFeatures(layer, { attributes: [], geometry: schema.geometry })).resolves.toEqual({ rows: [], total: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('diagnoseWfsError', () => {
  test('maps each failure to a preview error', () => {
    expect(diagnoseWfsError(new WfsServiceError('Unknown layer'))).toEqual({ type: 'load_failed', detail: 'Unknown layer' })
    expect(diagnoseWfsError(new WfsHttpError(500))).toEqual({ type: 'load_failed', detail: 'HTTP 500' })
    expect(diagnoseWfsError(new WfsMalformedResponseError('x'))).toEqual({ type: 'malformed' })
    expect(diagnoseWfsError(new WfsTooLargeError())).toEqual({ type: 'too_large' })
    expect(diagnoseWfsError(new WfsTimeoutError())).toEqual({ type: 'network' })
    expect(diagnoseWfsError(new WfsRequestError())).toEqual({ type: 'network' })
  })

  test('a bug of ours is not blamed on the server', () => {
    expect(diagnoseWfsError(new TypeError('Cannot read properties of undefined'))).toEqual({ type: 'unknown' })
  })
})

describe('useWfsSchema / useWfsFeatures', () => {
  const resource = (extras: Record<string, unknown> = {}) => ({
    id: 'res-1',
    url: 'https://example.com/wfs?SERVICE=WFS&REQUEST=GetCapabilities',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '2.0.0',
        output_formats: ['application/json'],
        detected_layer: { name: 'dreal_b:bande_100m_trait_cote', default_crs: 'EPSG:2154' },
      },
      ...extras,
    },
  }) as unknown as Resource

  const layerOf = (r: Resource) => getWfsPreviewLayer(r)

  // `useWfsSchema` reads the components config (Vue inject).
  const withConfig = <T>(callback: () => T): T => {
    const app = createApp({})
    app.provide(configKey, { trustedDomains: ['data.gouv.fr'] } as unknown as ResolvedPluginConfig)
    return app.runWithContext(callback)
  }

  test('loads the schema, then the rows', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(fixture('geoserver.xsd')))
      .mockResolvedValueOnce(new Response(featureCollection(2)))
    await withConfig(async () => {
      const schemaState = useWfsSchema(resource(), layerOf(resource()))
      const features = useWfsFeatures(layerOf(resource()), schemaState)
      await schemaState.load()
      expect(schemaState.status.value).toBe('success')
      expect(schemaState.schema.value?.geometry).toEqual({ name: 'geom', type: 'MultiPolygon' })
      await features.load()
      expect(features.status.value).toBe('success')
      expect(features.rows.value).toHaveLength(2)
      expect(features.total.value).toBe(192)
    })
  })

  test('the rows share the schema failure, without fetching', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Not found', { status: 404 }))
    await withConfig(async () => {
      const schemaState = useWfsSchema(resource(), layerOf(resource()))
      const features = useWfsFeatures(layerOf(resource()), schemaState)
      await schemaState.load()
      await features.load()
      expect(features.status.value).toBe('error')
      expect(features.error.value).toEqual({ type: 'load_failed', detail: 'HTTP 404' })
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  test('does not query a server the robot found without CORS', async () => {
    await withConfig(async () => {
      const r = resource({ 'check:cors:allow-origin': 'https://elsewhere.fr' })
      const schemaState = useWfsSchema(r, layerOf(r))
      await schemaState.load()
      expect(schemaState.error.value).toEqual({ type: 'cors' })
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  test('does not query an unavailable server', async () => {
    await withConfig(async () => {
      const r = resource({ 'check:available': false })
      const schemaState = useWfsSchema(r, layerOf(r))
      await schemaState.load()
      expect(schemaState.error.value).toEqual({ type: 'unavailable' })
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  test('a failed schema request is tried again by the next load', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response(fixture('geoserver.xsd')))
    await withConfig(async () => {
      const schemaState = useWfsSchema(resource(), layerOf(resource()))
      await schemaState.load()
      expect(schemaState.status.value).toBe('error')
      await schemaState.load()
      expect(schemaState.status.value).toBe('success')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })

  test('the rows of an older request never replace the newer ones', async () => {
    let answerFirst!: (response: Response) => void
    fetchMock
      .mockResolvedValueOnce(new Response(fixture('geoserver.xsd')))
      .mockImplementationOnce(() => new Promise(resolve => (answerFirst = resolve)))
      .mockResolvedValueOnce(new Response(featureCollection(5)))
    await withConfig(async () => {
      const schemaState = useWfsSchema(resource(), layerOf(resource()))
      const features = useWfsFeatures(layerOf(resource()), schemaState)
      await schemaState.load()
      const first = features.load()
      await features.load()
      answerFirst(new Response(featureCollection(2)))
      await first
      expect(features.rows.value).toHaveLength(5)
    })
  })

  test('stays idle for a resource without a WFS preview', async () => {
    await withConfig(async () => {
      const schemaState = useWfsSchema({ id: 'r', url: 'https://example.com/a.csv', extras: {} } as unknown as Resource, null)
      await schemaState.load()
      expect(schemaState.status.value).toBe('idle')
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
