import { readFileSync } from 'node:fs'
import { DOMParser } from '@xmldom/xmldom'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import {
  buildWfsUrl,
  getWfsLayer,
  getWfsPreviewLayer,
  parseWfsFeatures,
  parseWfsSchema,
  readServiceException,
  WfsMalformedResponseError,
  WfsServiceError,
  type WfsLayer,
} from '~/datagouv-components/src/functions/wfs'

// Unit tests run under node, which has no DOMParser: the browser one is stood in by xmldom.
beforeAll(() => {
  vi.stubGlobal('DOMParser', DOMParser)
})

// Captured from real servers listed in the data.gouv.fr catalogue.
const fixture = (name: string) => readFileSync(new URL(`./fixtures/wfs/${name}`, import.meta.url), 'utf8')

const wfsResource = (url: string, metadata: Record<string, unknown> = {}) => ({
  url,
  extras: {
    'analysis:parsing:ogc_metadata': {
      format: 'wfs',
      version: '2.0.0',
      output_formats: ['application/json', 'SHAPE-ZIP'],
      detected_layer: { name: 'ns:layer', default_crs: 'EPSG:2154' },
      ...metadata,
    },
  },
})

const layer = (overrides: Partial<WfsLayer> = {}): WfsLayer => ({
  url: 'https://example.com/wfs',
  version: '2.0.0',
  typeName: 'ns:layer',
  defaultCrs: null,
  outputFormats: [],
  ...overrides,
})

describe('getWfsLayer / getWfsPreviewLayer', () => {
  test('reads the layer from the analysis metadata', () => {
    expect(getWfsLayer(wfsResource('https://example.com/wfs'))).toEqual({
      url: 'https://example.com/wfs',
      version: '2.0.0',
      typeName: 'ns:layer',
      defaultCrs: 'EPSG:2154',
      outputFormats: ['application/json', 'SHAPE-ZIP'],
    })
  })

  test('ignores metadata whose fields are not the expected types', () => {
    expect(getWfsLayer(wfsResource('https://example.com/wfs', { version: null }))).toBeNull()
    expect(getWfsLayer(wfsResource('https://example.com/wfs', { detected_layer: { name: 42 } }))).toBeNull()
    expect(getWfsLayer(wfsResource('https://example.com/wfs', { output_formats: 'application/json' }))?.outputFormats).toEqual([])
  })

  test('needs a WFS service with a detected layer and an http(s) URL', () => {
    expect(getWfsLayer(wfsResource('https://example.com/wms', { format: 'wms' }))).toBeNull()
    expect(getWfsLayer(wfsResource('https://example.com/wfs', { detected_layer: null }))).toBeNull()
    expect(getWfsLayer(wfsResource('javascript:alert(1)'))).toBeNull()
    expect(getWfsLayer({ url: 'https://example.com/wfs', extras: {} })).toBeNull()
  })

  test('the preview needs https, whatever the output formats', () => {
    expect(getWfsPreviewLayer(wfsResource('https://example.com/wfs', { output_formats: ['text/xml; subtype=gml/3.2'] }))?.typeName).toBe('ns:layer')
    // The browser would block an http request from the https page (mixed content).
    expect(getWfsPreviewLayer(wfsResource('http://example.com/wfs'))).toBeNull()
  })
})

describe('buildWfsUrl', () => {
  test('WFS 2.0 GetFeature', () => {
    const url = buildWfsUrl(layer(), 'GetFeature', { outputFormat: 'application/json', count: 20, startIndex: 40, propertyNames: ['id', 'nom'] })
    expect(url).toBe('https://example.com/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=ns%3Alayer&OUTPUTFORMAT=application%2Fjson&COUNT=20&STARTINDEX=40&PROPERTYNAME=id%2Cnom')
  })

  test('WFS 1.1 uses TYPENAME and MAXFEATURES, and has no STARTINDEX', () => {
    const url = new URL(buildWfsUrl(layer({ version: '1.1.0' }), 'GetFeature', { count: 20, startIndex: 40 }))
    expect(url.searchParams.get('TYPENAME')).toBe('ns:layer')
    expect(url.searchParams.get('MAXFEATURES')).toBe('20')
    expect(url.searchParams.has('TYPENAMES')).toBe(false)
    expect(url.searchParams.has('COUNT')).toBe(false)
    expect(url.searchParams.has('STARTINDEX')).toBe(false)
  })

  test('DescribeFeatureType ignores the GetFeature options', () => {
    expect(buildWfsUrl(layer(), 'DescribeFeatureType', { count: 20, outputFormat: 'application/json' }))
      .toBe('https://example.com/wfs?SERVICE=WFS&REQUEST=DescribeFeatureType&VERSION=2.0.0&TYPENAMES=ns%3Alayer')
  })

  test('replaces the WFS parameters of the resource URL, whatever their case', () => {
    const url = new URL(buildWfsUrl(layer({ url: 'https://example.com/wfs?service=WFS&request=GetCapabilities&typeName=other&version=1.0.0' }), 'DescribeFeatureType'))
    expect([...url.searchParams.keys()]).toEqual(['SERVICE', 'REQUEST', 'VERSION', 'TYPENAMES'])
    expect(url.searchParams.get('REQUEST')).toBe('DescribeFeatureType')
  })

  test('keeps the other parameters, like QGIS Server\'s MAP', () => {
    // A catalogue URL, with its HTML-escaped separators.
    const qgis = 'https://qgisserver.example.com/cgi-bin/qgis_mapserv.fcgi?MAP=/var/www/data/emploi.qgz&amp;request=GetFeature&amp;typename=foo&SERVICE=WFS'
    const url = new URL(buildWfsUrl(layer({ url: qgis }), 'GetFeature', { count: 5 }))
    expect(url.pathname).toBe('/cgi-bin/qgis_mapserv.fcgi')
    expect(url.searchParams.get('MAP')).toBe('/var/www/data/emploi.qgz')
    expect(url.searchParams.has('amp;request')).toBe(false)
    expect(url.searchParams.has('amp;typename')).toBe(false)
    expect(url.searchParams.get('REQUEST')).toBe('GetFeature')
  })

  test('cleans the HTML-escaped separators off the parameters it keeps', () => {
    const url = new URL(buildWfsUrl(layer({ url: 'https://example.com/qgis?SERVICE=WFS&amp;amp;MAP=/data/p.qgs&amp;REPOSITORY=public' }), 'GetFeature'))
    expect(url.searchParams.get('MAP')).toBe('/data/p.qgs')
    expect(url.searchParams.get('REPOSITORY')).toBe('public')
    expect([...url.searchParams.keys()].some(key => key.startsWith('amp;'))).toBe(false)
  })
})

describe('parseWfsSchema', () => {
  test('GeoServer (prefixed xsd: types)', () => {
    expect(parseWfsSchema(fixture('geoserver.xsd'), 'dreal_b:bande_100m_trait_cote')).toEqual({
      attributes: [
        { name: 'id', type: 'int', nullable: true },
        { name: 'idcarreau', type: 'string', nullable: true },
      ],
      geometry: { name: 'geom', type: 'MultiPolygon' },
    })
  })

  test('MapServer (XSD as the default namespace)', () => {
    const schema = parseWfsSchema(fixture('mapserver.xsd'), 'ms:emi_centre_val_de_loire_departement_2021')
    expect(schema.geometry).toEqual({ name: 'msGeometry', type: 'Geometry' })
    expect(schema.attributes.slice(0, 3)).toEqual([
      { name: 'gid', type: 'integer', nullable: true },
      { name: 'code_dep', type: 'integer', nullable: true },
      { name: 'lib_dep', type: 'string', nullable: true },
    ])
    expect(schema.attributes.map(a => a.name)).not.toContain('msGeometry')
  })

  test('QGIS Server, with an unqualified layer name', () => {
    const schema = parseWfsSchema(fixture('qgis.xsd'), 'IFR_GRA_HAL_R_COM_SOLESOL_ORHA')
    expect(schema.geometry).toEqual({ name: 'geometry', type: 'MultiPolygon' })
    expect(schema.attributes).toContainEqual({ name: 'valeur', type: 'decimal', nullable: true })
  })

  test('ArcGIS (types declared inline as restrictions)', () => {
    const schema = parseWfsSchema(fixture('arcgis.xsd'), 'Service_WFS_ISOGEO:Zones_humides')
    expect(schema.geometry).toEqual({ name: 'geom', type: 'MultiPolygon' })
    expect(schema.attributes[0]).toEqual({ name: 'id_zh', type: 'int', nullable: true })
    expect(schema.attributes).toContainEqual({ name: 'codedep', type: 'string', nullable: true })
    expect(schema.attributes).toContainEqual({ name: 'datappro', type: 'date', nullable: true })
    expect(schema.attributes.map(a => a.name)).not.toContain('geom')
  })

  test('a layer without geometry', () => {
    const xsd = `<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ns="urn:ns">
      <xsd:complexType name="tableType"><xsd:complexContent><xsd:extension base="gml:AbstractFeatureType"><xsd:sequence>
        <xsd:element name="code" type="xsd:string" minOccurs="1"/>
      </xsd:sequence></xsd:extension></xsd:complexContent></xsd:complexType>
      <xsd:element name="table" type="ns:tableType" substitutionGroup="gml:AbstractFeature"/>
    </xsd:schema>`
    expect(parseWfsSchema(xsd, 'ns:table')).toEqual({
      attributes: [{ name: 'code', type: 'string', nullable: false }],
      geometry: null,
    })
  })

  test('ignores the children of a field declared with an inline type', () => {
    const xsd = `<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ns="urn:ns">
      <xsd:complexType name="layerType"><xsd:complexContent><xsd:extension base="gml:AbstractFeatureType"><xsd:sequence>
        <xsd:element name="code" type="xsd:string"/>
        <xsd:element name="address"><xsd:complexType><xsd:sequence>
          <xsd:element name="street" type="xsd:string"/>
          <xsd:element name="code" type="xsd:string"/>
        </xsd:sequence></xsd:complexType></xsd:element>
      </xsd:sequence></xsd:extension></xsd:complexContent></xsd:complexType>
      <xsd:element name="layer" type="ns:layerType" substitutionGroup="gml:AbstractFeature"/>
    </xsd:schema>`
    expect(parseWfsSchema(xsd, 'ns:layer').attributes.map(a => a.name)).toEqual(['code', 'address'])
  })

  test('throws the server message on an exception report', () => {
    expect(() => parseWfsSchema(OWS_EXCEPTION, 'nope:nope')).toThrow(new WfsServiceError('Unknown namespace [nope]'))
  })

  test('throws on anything else', () => {
    expect(() => parseWfsSchema('<html><body>Not found</body></html>', 'ns:layer')).toThrow(WfsMalformedResponseError)
    expect(() => parseWfsSchema('Unauthorized', 'ns:layer')).toThrow(WfsMalformedResponseError)
    expect(() => parseWfsSchema('<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"/>', 'ns:layer')).toThrow(WfsMalformedResponseError)
  })

  test('falls back to the only type described when the name does not match', () => {
    // We asked for this one layer: servers sometimes name it differently than the metadata.
    expect(parseWfsSchema(fixture('geoserver.xsd'), 'other').geometry?.name).toBe('geom')
  })
})

// GeoServer's answer to an unknown layer (wxs.ofb.fr).
const OWS_EXCEPTION = `<?xml version="1.0" encoding="UTF-8"?><ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1" version="2.0.0">
  <ows:Exception exceptionCode="InvalidParameterValue" locator="namespace">
    <ows:ExceptionText>Unknown namespace [nope]</ows:ExceptionText>
  </ows:Exception>
</ows:ExceptionReport>`

// QGIS Server's (sextant.ifremer.fr).
const SERVICE_EXCEPTION = `<?xml version="1.0" encoding="UTF-8"?>
<ServiceExceptionReport xmlns="http://www.opengis.net/ogc" version="1.2.0">
 <ServiceException code="RequestNotWellFormed">TypeName 'nope' could not be found</ServiceException>
</ServiceExceptionReport>`

describe('readServiceException', () => {
  test('reads both exception flavours', () => {
    expect(readServiceException(OWS_EXCEPTION)).toBe('Unknown namespace [nope]')
    expect(readServiceException(SERVICE_EXCEPTION)).toBe('TypeName \'nope\' could not be found')
  })

  test('returns null for anything else', () => {
    expect(readServiceException('{"type":"FeatureCollection","features":[]}')).toBeNull()
    expect(readServiceException(fixture('geoserver.xsd'))).toBeNull()
    expect(readServiceException('<not xml')).toBeNull()
  })
})

describe('parseWfsFeatures', () => {
  test('GeoServer (WFS 2.0), with its total count', () => {
    expect(parseWfsFeatures(fixture('geoserver.gml'))).toEqual({
      rows: [{ id: '1', idcarreau: '10kmN277E332' }, { id: '1', idcarreau: '10kmN277E333' }],
      total: 192,
    })
  })

  test('MapServer (WFS 2.0), whose count is unknown and envelope is not a feature', () => {
    const page = parseWfsFeatures(fixture('mapserver.gml'))
    expect(page.total).toBeNull()
    expect(page.rows).toHaveLength(2)
    expect(page.rows[0]).toEqual({ gid: '1', lib_dep: 'Cher', emi_nox_kg: expect.any(String) })
  })

  test('MapServer (WFS 1.1, gml:featureMember)', () => {
    expect(parseWfsFeatures(fixture('mapserver-1.1.gml')).rows.map(row => row.lib_dep)).toEqual(['Cher', 'Eure-et-Loir'])
  })

  test('QGIS Server (WFS 1.1): no total, the page count is not the layer\'s', () => {
    expect(parseWfsFeatures(fixture('qgis.gml'))).toEqual({
      rows: [{ valeur: '91.591', unite: 'nb d\'individus/km2' }, { valeur: '1394.79', unite: 'nb d\'individus/km2' }],
      total: null,
    })
  })

  test('ArcGIS (WFS 2.0)', () => {
    const page = parseWfsFeatures(fixture('arcgis.gml'))
    expect(page.total).toBe(11597)
    expect(page.rows[0]).toEqual({ id_zh: '36', nom: 'Quistinic', surf: '3399.77661133', datappro: '2019-12-19' })
  })

  test('gml:featureMembers, nil and empty values, a geometry sent anyway', () => {
    const gml = `<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns="urn:ns" numberOfFeatures="2">
      <gml:featureMembers>
        <ns:layer gml:id="l.1"><gml:boundedBy><gml:Envelope/></gml:boundedBy><ns:code>A</ns:code><ns:label xsi:nil="true"/><ns:note></ns:note><ns:geom><gml:Point><gml:pos>0 0</gml:pos></gml:Point></ns:geom></ns:layer>
        <ns:layer gml:id="l.2"><ns:code>B</ns:code></ns:layer>
      </gml:featureMembers>
    </wfs:FeatureCollection>`
    expect(parseWfsFeatures(gml)).toEqual({
      rows: [{ code: 'A', label: null, note: null }, { code: 'B' }],
      total: null,
    })
  })

  test('throws the server message when an exception comes instead of features', () => {
    expect(() => parseWfsFeatures(SERVICE_EXCEPTION)).toThrow(new WfsServiceError('TypeName \'nope\' could not be found'))
  })

  test('throws on anything else', () => {
    // A gateway error, as sent by geobretagne.fr for an unknown layer.
    expect(() => parseWfsFeatures('{"status":400,"error":"Bad Request"}')).toThrow(WfsMalformedResponseError)
    expect(() => parseWfsFeatures('Unauthorized')).toThrow(WfsMalformedResponseError)
    expect(() => parseWfsFeatures(fixture('geoserver.xsd'))).toThrow(WfsMalformedResponseError)
  })
})
