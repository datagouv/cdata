import type { Resource, WfsMetadata } from '../types/resources'
import { isSafeHttpUrl } from './helpers'

// Building blocks to query a WFS layer from the browser, relying on the
// metadata the analysis robot already stored on the resource
// (`analysis:parsing:ogc_metadata`) instead of fetching the GetCapabilities
// document, which weighs several MB on the big servers.

export type WfsLayer = {
  // The resource URL, kept whole: its non-WFS parameters (QGIS's `MAP=`…) are
  // needed by the server.
  url: string
  version: string
  typeName: string
  defaultCrs: string | null
  outputFormats: string[]
}

export type WfsPreviewLayer = WfsLayer

export type WfsAttribute = {
  name: string
  // The XSD type, without its prefix: `string`, `int`, `double`, `date`…
  type: string
  nullable: boolean
}

export type WfsGeometryType = 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'Geometry'

export type WfsSchema = {
  attributes: WfsAttribute[]
  geometry: { name: string, type: WfsGeometryType } | null
}

export type WfsFeaturePage = {
  rows: Record<string, unknown>[]
  // Total number of features in the layer, when the server tells it.
  total: number | null
}

// An error document sent back by the server (ows:ExceptionReport,
// ServiceExceptionReport), often with a 200 status.
export class WfsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WfsServiceError'
  }
}

// A response that is neither the expected document nor a service exception.
export class WfsMalformedResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WfsMalformedResponseError'
  }
}

const isV2 = (version: string) => Number(version.split('.')[0]) >= 2

export function getWfsLayer(resource: Pick<Resource, 'extras' | 'url'>): WfsLayer | null {
  const metadata = resource.extras['analysis:parsing:ogc_metadata'] as WfsMetadata | null | undefined
  if (!metadata || metadata.format !== 'wfs' || !metadata.detected_layer) return null
  // Extras are free-form JSON: check the fields used to build URLs before trusting them.
  if (typeof metadata.version !== 'string' || typeof metadata.detected_layer.name !== 'string') return null
  // Every URL built from the layer starts with `resource.url`: an owner-writable
  // field that must never smuggle a `javascript:` URL into an href.
  if (!isSafeHttpUrl(resource.url)) return null
  return {
    url: resource.url,
    version: metadata.version,
    typeName: metadata.detected_layer.name,
    defaultCrs: typeof metadata.detected_layer.default_crs === 'string' ? metadata.detected_layer.default_crs : null,
    outputFormats: Array.isArray(metadata.output_formats) ? metadata.output_formats.filter(format => typeof format === 'string') : [],
  }
}

// A layer the browser can query: https only, the browser blocks an http
// request from an https page. Its rows are read as GML, which every WFS
// server outputs.
export function getWfsPreviewLayer(resource: Pick<Resource, 'extras' | 'url'>): WfsPreviewLayer | null {
  const layer = getWfsLayer(resource)
  return layer && new URL(layer.url).protocol === 'https:' ? layer : null
}

// Parameters dropped from the resource URL because the built request sets them.
// The catalogue holds URLs with HTML-escaped separators (`&amp;request=…`),
// hence the `amp;` prefix stripped before comparing.
const WFS_PARAMS = new Set([
  'service', 'request', 'version', 'typename', 'typenames', 'outputformat', 'srsname',
  'count', 'maxfeatures', 'startindex', 'propertyname', 'resulttype', 'bbox', 'filter',
  'featureid', 'resourceid', 'sortby', 'acceptversions',
])

export type WfsRequestOptions = {
  outputFormat?: string
  srsName?: string | null
  count?: number
  startIndex?: number
  propertyNames?: string[]
}

export function buildWfsUrl(layer: WfsLayer, request: 'GetFeature' | 'DescribeFeatureType', options: WfsRequestOptions = {}): string {
  const url = new URL(layer.url)
  const params = new URLSearchParams()
  for (const [rawKey, value] of url.searchParams) {
    const key = rawKey.replace(/^(amp;)+/i, '')
    if (!WFS_PARAMS.has(key.toLowerCase())) params.append(key, value)
  }
  const v2 = isV2(layer.version)
  params.set('SERVICE', 'WFS')
  params.set('REQUEST', request)
  params.set('VERSION', layer.version)
  params.set(v2 ? 'TYPENAMES' : 'TYPENAME', layer.typeName)
  if (request === 'GetFeature') {
    if (options.outputFormat) params.set('OUTPUTFORMAT', options.outputFormat)
    if (options.srsName) params.set('SRSNAME', options.srsName)
    if (options.count !== undefined) params.set(v2 ? 'COUNT' : 'MAXFEATURES', String(options.count))
    // STARTINDEX only came with WFS 2.0.
    if (options.startIndex !== undefined && v2) params.set('STARTINDEX', String(options.startIndex))
    if (options.propertyNames?.length) params.set('PROPERTYNAME', options.propertyNames.join(','))
  }
  url.search = params.toString()
  return url.toString()
}

const XSD_NS = 'http://www.w3.org/2001/XMLSchema'
const isGmlNamespace = (ns: string | null) => !!ns && ns.startsWith('http://www.opengis.net/gml')

function parseXml(text: string): Document {
  let doc: Document
  try {
    doc = new DOMParser().parseFromString(text, 'application/xml')
  }
  catch {
    throw new WfsMalformedResponseError('Invalid XML document')
  }
  if (!doc.documentElement || doc.getElementsByTagName('parsererror').length) {
    throw new WfsMalformedResponseError('Invalid XML document')
  }
  return doc
}

// The text of a service exception document, or null if `text` is something else.
export function readServiceException(text: string): string | null {
  if (!text.trimStart().startsWith('<')) return null
  try {
    return readServiceExceptionDocument(parseXml(text))
  }
  catch {
    return null
  }
}

function readServiceExceptionDocument(doc: Document): string | null {
  const root = doc.documentElement
  if (!/exception/i.test(root.localName)) return null
  const messages = [
    ...Array.from(doc.getElementsByTagNameNS('*', 'ExceptionText')),
    ...Array.from(doc.getElementsByTagNameNS('*', 'ServiceException')),
  ].map(el => el.textContent?.trim()).filter(Boolean)
  return messages.length ? messages.join('\n') : (root.textContent?.trim() || root.localName)
}

const localPart = (qname: string) => qname.slice(qname.indexOf(':') + 1)

// Resolves a `prefix:name` type against the namespaces in scope of `el`
// (MapServer and QGIS declare XSD as the default namespace: `type="string"`).
function resolveType(el: Element, qname: string): { ns: string | null, name: string } {
  const colon = qname.indexOf(':')
  const prefix = colon === -1 ? null : qname.slice(0, colon)
  return { ns: el.lookupNamespaceURI(prefix), name: localPart(qname) }
}

const GEOMETRY_TYPES: Record<string, WfsGeometryType> = {
  Point: 'Point',
  MultiPoint: 'MultiPoint',
  Curve: 'LineString',
  LineString: 'LineString',
  MultiCurve: 'MultiLineString',
  MultiLineString: 'MultiLineString',
  Surface: 'Polygon',
  Polygon: 'Polygon',
  MultiSurface: 'MultiPolygon',
  MultiPolygon: 'MultiPolygon',
}

function isNestedElement(el: Element, container: Element): boolean {
  for (let node = el.parentNode; node && node !== container; node = node.parentNode) {
    if (node.nodeType === 1 && (node as Element).namespaceURI === XSD_NS && (node as Element).localName === 'element') return true
  }
  return false
}

const childElements = (el: Element, localName: string) =>
  Array.from(el.childNodes).filter((node): node is Element =>
    node.nodeType === 1 && (node as Element).namespaceURI === XSD_NS && (node as Element).localName === localName,
  )

export function parseWfsSchema(text: string, typeName: string): WfsSchema {
  const doc = parseXml(text)
  const exception = readServiceExceptionDocument(doc)
  if (exception) throw new WfsServiceError(exception)
  const schema = doc.documentElement
  if (schema.namespaceURI !== XSD_NS || schema.localName !== 'schema') {
    throw new WfsMalformedResponseError('Not an XML schema')
  }

  // The layer is a top-level element pointing to its complexType. A response
  // can describe several layers, hence the lookup by name.
  const layerName = localPart(typeName)
  const complexTypes = childElements(schema, 'complexType')
  const layerElement = childElements(schema, 'element').find(el => el.getAttribute('name') === layerName)
  const typeRef = layerElement?.getAttribute('type')
  const complexType = (typeRef && complexTypes.find(el => el.getAttribute('name') === localPart(typeRef)))
    || (complexTypes.length === 1 ? complexTypes[0] : undefined)
  if (!complexType) throw new WfsMalformedResponseError(`No type found for layer ${typeName}`)

  const attributes: WfsAttribute[] = []
  let geometry: WfsSchema['geometry'] = null
  for (const el of Array.from(complexType.getElementsByTagNameNS(XSD_NS, 'element'))) {
    const name = el.getAttribute('name')
    // Only the layer's own fields: not the children of a field declared with an inline type.
    if (!name || isNestedElement(el, complexType) || attributes.some(attribute => attribute.name === name)) continue
    // ArcGIS declares constrained strings inline: <simpleType><restriction base="xsd:string">
    const typeAttr = el.getAttribute('type') || el.getElementsByTagNameNS(XSD_NS, 'restriction')[0]?.getAttribute('base')
    const type = typeAttr ? resolveType(el, typeAttr) : { ns: XSD_NS, name: 'string' }
    if (isGmlNamespace(type.ns)) {
      geometry ??= { name, type: GEOMETRY_TYPES[type.name.replace(/PropertyType$/, '')] ?? 'Geometry' }
      continue
    }
    attributes.push({
      name,
      type: type.name,
      nullable: el.getAttribute('nillable') === 'true' || el.getAttribute('minOccurs') === '0',
    })
  }
  return { attributes, geometry }
}

const WFS_2_NS = 'http://www.opengis.net/wfs/2.0'
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance'

const elementChildren = (el: Element) => Array.from(el.childNodes).filter((node): node is Element => node.nodeType === 1)

// The features of a GML FeatureCollection, wrapped in `wfs:member` (WFS 2.0),
// `gml:featureMember` or `gml:featureMembers` (WFS 1.x).
function featureElements(root: Element): Element[] {
  return elementChildren(root).flatMap((child) => {
    if (child.namespaceURI === WFS_2_NS && child.localName === 'member') return elementChildren(child).slice(0, 1)
    if (isGmlNamespace(child.namespaceURI) && child.localName === 'featureMember') return elementChildren(child).slice(0, 1)
    if (isGmlNamespace(child.namespaceURI) && child.localName === 'featureMembers') return elementChildren(child)
    return []
  })
}

// Rows read from GML rather than GeoJSON: MapServer's GeoJSON output always
// carries the geometries, whatever PROPERTYNAME says, when its GML output
// leaves them out. The values stay text: the table formats them from the
// schema's types.
export function parseWfsFeatures(text: string): WfsFeaturePage {
  const doc = parseXml(text)
  const exception = readServiceExceptionDocument(doc)
  if (exception) throw new WfsServiceError(exception)
  const root = doc.documentElement
  if (root.localName !== 'FeatureCollection') throw new WfsMalformedResponseError('Not a FeatureCollection')

  const rows = featureElements(root).map((feature) => {
    const row: Record<string, string | null> = {}
    for (const property of elementChildren(feature)) {
      // GML's own properties (gml:boundedBy, gml:name…) and a geometry the
      // server sent anyway: neither is an attribute of the layer.
      if (isGmlNamespace(property.namespaceURI) || elementChildren(property).length) continue
      const value = property.textContent?.trim()
      row[property.localName] = property.getAttributeNS(XSI_NS, 'nil') === 'true' || !value ? null : value
    }
    return row
  })
  // WFS 2.0 only: `numberOfFeatures` (WFS 1.1) counts this page, not the layer.
  // MapServer answers `numberMatched="unknown"`.
  const total = Number.parseInt(root.getAttribute('numberMatched') ?? '', 10)
  return { rows, total: Number.isNaN(total) ? null : total }
}
