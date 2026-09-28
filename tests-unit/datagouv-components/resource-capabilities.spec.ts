import { expect, test } from 'vitest'
import { getGeneratedFormats, getWfsExportFormats } from '~/datagouv-components/src/functions/resourceCapabilities'

const TABULAR_API_URL = 'https://tabular-api.data.gouv.fr'

test('generated formats expose the storage URL read from extras', () => {
  const resource = {
    id: 'abc',
    extras: {
      'analysis:parsing:parquet_url': 'https://storage.example.com/abc.parquet',
      'analysis:parsing:parquet_size': 1234,
    },
  }

  expect(getGeneratedFormats(resource, TABULAR_API_URL)).toEqual([
    { url: 'https://storage.example.com/abc.parquet', size: 1234, format: 'parquet' },
  ])
})

test('generated formats drop a `javascript:` URL smuggled through extras', () => {
  const resource = {
    id: 'abc',
    extras: {
      'analysis:parsing:parquet_url': 'javascript:alert(document.domain)',
      'analysis:parsing:parquet_size': 1234,
    },
  }

  // The owner-writable extra must never reach an href: the whole entry is dropped.
  expect(getGeneratedFormats(resource, TABULAR_API_URL)).toEqual([])
})

test('generated formats drop `data:` and protocol-relative URLs too', () => {
  const resource = {
    id: 'abc',
    extras: {
      'analysis:parsing:geojson_url': 'data:text/html,<script>alert(1)</script>',
      'analysis:parsing:pmtiles_url': '//evil.tld/x.pmtiles',
    },
  }

  expect(getGeneratedFormats(resource, TABULAR_API_URL)).toEqual([])
})

test('generated formats keep the safe json export next to a dropped malicious one', () => {
  const resource = {
    id: 'abc',
    extras: {
      'analysis:parsing:parquet_url': 'javascript:alert(1)',
      'analysis:parsing:parsing_table': 'abc',
    },
  }

  // The json export URL is built from platform config, not from extras, so it stays.
  expect(getGeneratedFormats(resource, TABULAR_API_URL)).toEqual([
    { url: `${TABULAR_API_URL}/api/resources/abc/data/json/`, size: undefined, format: 'json' },
  ])
})

test('WFS export drops formats when the resource URL is not http(s)', () => {
  const resource = {
    url: 'javascript:alert(document.domain)',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '2.0.0',
        output_formats: ['application/json'],
        detected_layer: { name: 'my_layer', default_crs: 'EPSG:4326' },
      },
    },
  }

  expect(getWfsExportFormats(resource)).toEqual([])
})

test('WFS format download URLs generation', async () => {
  const resource = {
    url: 'https://example.com/wfs?service=WFS',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '2.0.0',
        output_formats: ['application/json', 'SHAPE-ZIP'],
        detected_layer: { name: 'my_layer', default_crs: 'EPSG:4326' },
      },
    },
  }

  const wfsFormats = getWfsExportFormats(resource)

  expect(wfsFormats).toEqual([
    {
      url: `https://example.com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=my_layer&OUTPUTFORMAT=${encodeURIComponent('application/json')}&SRSNAME=${encodeURIComponent('EPSG:4326')}`,
      format: 'json',
    },
    {
      url: `https://example.com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=my_layer&OUTPUTFORMAT=SHAPE-ZIP&SRSNAME=${encodeURIComponent('EPSG:4326')}`,
      format: 'shp',
    },
  ])
})

test('WFS format download URLs generation with version 1.0.0', async () => {
  const resource = {
    url: 'https://example.com/wfs?service=WFS',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '1.1.0',
        output_formats: ['application/json', 'SHAPE-ZIP'],
        detected_layer: { name: 'my_layer', default_crs: 'EPSG:4326' },
      },
    },
  }

  const wfsFormats = getWfsExportFormats(resource)

  expect(wfsFormats).toEqual([
    {
      url: `https://example.com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=1.1.0&TYPENAME=my_layer&OUTPUTFORMAT=${encodeURIComponent('application/json')}&SRSNAME=${encodeURIComponent('EPSG:4326')}`,
      format: 'json',
    },
    {
      url: `https://example.com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=1.1.0&TYPENAME=my_layer&OUTPUTFORMAT=SHAPE-ZIP&SRSNAME=${encodeURIComponent('EPSG:4326')}`,
      format: 'shp',
    },
  ])
})

test('WFS format download URLs generation with no detected layer', async () => {
  const resource = {
    url: 'https://example.com/wfs?service=WFS',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '1.1.0',
        output_formats: ['application/json', 'SHAPE-ZIP'],
      },
    },
  }

  const wfsFormats = getWfsExportFormats(resource)

  expect(wfsFormats).toEqual([])
})

test('WMS service don\'t expose WFS export formats', async () => {
  const resource = {
    url: 'https://example.com/wfs?service=WFS',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wms',
        version: '1.1.0',
        output_formats: ['application/json', 'SHAPE-ZIP'],
        detected_layer: null,
      },
    },
  }

  const wfsFormats = getWfsExportFormats(resource)

  expect(wfsFormats).toEqual([])
})

test('WFS format download URLs generation with null default_crs', async () => {
  const resource = {
    url: 'https://example.com/wfs?service=WFS',
    extras: {
      'analysis:parsing:ogc_metadata': {
        format: 'wfs',
        version: '1.1.0',
        output_formats: ['application/json'],
        detected_layer: { name: 'my_layer', default_crs: null },
      },
    },
  }

  const wfsFormats = getWfsExportFormats(resource)

  expect(wfsFormats).toEqual([
    {
      url: `https://example.com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=1.1.0&TYPENAME=my_layer&OUTPUTFORMAT=${encodeURIComponent('application/json')}`,
      format: 'json',
    },
  ])
})
