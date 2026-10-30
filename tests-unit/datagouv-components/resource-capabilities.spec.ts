import { createApp } from 'vue'
import { describe, expect, test } from 'vitest'
import { configKey, type ResolvedPluginConfig } from '~/datagouv-components/src/config'
import { getGeneratedFormats, getWfsExportFormats } from '~/datagouv-components/src/functions/resourceCapabilities'
import { useResourceCapabilities } from '~/datagouv-components/src/composables/useResourceCapabilities'
import type { Dataset } from '~/datagouv-components/src/types/datasets'
import type { Resource } from '~/datagouv-components/src/types/resources'

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

// `useResourceCapabilities` relies on `useComponentsConfig` (Vue inject): run it
// inside an app context providing the plugin config, like the other
// datagouv-components specs.
function withConfig<T>(config: Partial<ResolvedPluginConfig>, callback: () => T): T {
  const app = createApp({})
  app.provide(configKey, config as ResolvedPluginConfig)
  return app.runWithContext(callback)
}

// No certified badge so datafair/openapi previews never kick in: the tab set is
// then driven only by format/extras, which is what these tests exercise.
const dataset = { organization: { badges: [] } } as unknown as Dataset

function resource(extras: Record<string, unknown>, format?: string, filetype = 'file'): Resource {
  return { id: 'res-1', format, filetype, url: '', extras } as unknown as Resource
}

function tabs(extras: Record<string, unknown>, format?: string, filetype?: string): Array<{ key: string, label: string }> {
  return withConfig({ tabularApiUrl: TABULAR_API_URL }, () => {
    const { tabsOptions } = useResourceCapabilities(
      () => resource(extras, format, filetype),
      () => dataset,
    )
    return tabsOptions.value
  })
}

describe('useResourceCapabilities tabsOptions', () => {
  test('labels the data tab Données and lists Structure des données before Description for a tabular file', () => {
    const result = tabs(
      { 'analysis:parsing:parsing_table': 'abc' },
      'csv',
      'file',
    )
    expect(result).toEqual([
      { key: 'data', label: 'Données' },
      { key: 'data-structure', label: 'Structure des données' },
      { key: 'metadata', label: 'Métadonnées' },
      { key: 'api', label: 'API' },
    ])
  })

  test('shows Description where one exists, between Structure des données and Métadonnées', () => {
    const result = withConfig({ tabularApiUrl: TABULAR_API_URL }, () => {
      const r = resource({ 'analysis:parsing:parsing_table': 'abc' }, 'csv')
      r.description = 'Un jeu de données'
      const { tabsOptions } = useResourceCapabilities(() => r, () => dataset)
      return tabsOptions.value
    })
    expect(result.map(tab => tab.key)).toEqual(['data', 'data-structure', 'description', 'metadata', 'api'])
  })

  test('shows only the Carte tab for a pmtiles-export parsing failure with no other preview', () => {
    // `analysis:parsing:error` names the pmtiles_export step.
    const result = tabs({ 'analysis:parsing:error': 'pmtiles_export:GeoJSON to PMTiles conversion failed with exit code 110' }, 'geojson')
    expect(result).toEqual([
      { key: 'map', label: 'Carte' },
      { key: 'metadata', label: 'Métadonnées' },
    ])
  })

  test('shows only the Carte tab for a pmtiles source the analysis could not download', () => {
    // The failure is stored in `analysis:error` instead of `analysis:parsing:error`.
    const result = tabs({ 'analysis:error': 'File too large to download' }, 'geojson')
    expect(result).toEqual([
      { key: 'map', label: 'Carte' },
      { key: 'metadata', label: 'Métadonnées' },
    ])
  })

  test('drops the Aperçu tab when nothing is previewable and no error is diagnosed', () => {
    // A format with no parsing table and no recorded error.
    const result = tabs({}, 'parquet')
    expect(result).toEqual([{ key: 'metadata', label: 'Métadonnées' }])
  })

  test('keeps the Aperçu tab for a link resource, which is meant to be visited', () => {
    const result = tabs({}, 'url')
    expect(result).toEqual([
      { key: 'data', label: 'Aperçu' },
      { key: 'metadata', label: 'Métadonnées' },
    ])
  })

  test('keeps the data tab when a diagnosable error explains the missing preview', () => {
    const result = tabs({ 'check:available': false }, 'csv')
    expect(result.map(tab => tab.key)).toEqual(['data', 'metadata'])
  })

  test('shows the Carte tab first, then Données, when a map exists alongside a table', () => {
    const result = tabs(
      { 'analysis:parsing:pmtiles_url': 'https://data.gouv.fr/map.pmtiles', 'analysis:parsing:parsing_table': 'abc' },
      'csv',
    )
    expect(result.map(tab => tab.key)).toEqual(['map', 'data', 'data-structure', 'metadata', 'api'])
  })

  test('shows only the Carte tab for a working pmtiles file with no other preview', () => {
    const result = tabs({}, 'pmtiles')
    expect(result).toEqual([
      { key: 'map', label: 'Carte' },
      { key: 'metadata', label: 'Métadonnées' },
    ])
  })
})
