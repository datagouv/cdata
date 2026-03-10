import { getWfsExportFormats } from '~/datagouv-components/src/functions/resourceCapabilities'
import { test, expect } from '../base'

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
