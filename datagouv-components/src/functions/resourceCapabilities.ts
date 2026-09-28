import type { Resource, WfsMetadata, OgcLayerInfo } from '../types/resources'
import { isSafeHttpUrl } from './helpers'

const GENERATED_FORMATS = ['parquet', 'pmtiles', 'geojson']

export type GeneratedFormat = {
  url: string
  size: number | undefined
  format: string
}

export function getGeneratedFormats(resource: Pick<Resource, 'extras' | 'id'>, tabularApiUrl: string | undefined): GeneratedFormat[] {
  const formats: GeneratedFormat[] = GENERATED_FORMATS.flatMap((format) => {
    const url = resource.extras[`analysis:parsing:${format}_url`]
    // The URL is read verbatim from owner-writable extras: drop any entry that is not
    // a plain http(s) URL so a `javascript:`/`data:` value never reaches an href.
    if (!isSafeHttpUrl(url)) return []
    return [{
      url,
      size: resource.extras[`analysis:parsing:${format}_size`] as number | undefined,
      format,
    }]
  })
  if ('analysis:parsing:parsing_table' in resource.extras) {
    formats.push({
      url: `${tabularApiUrl}/api/resources/${resource.id}/data/json/`,
      size: undefined,
      format: 'json',
    })
  }
  return formats
}

const WFS_EXPORT_FORMATS = [
  {
    name: 'csv',
    mimetype: 'csv',
  },
  {
    name: 'json',
    mimetype: 'application/json',
  },
  {
    name: 'shp',
    mimetype: 'SHAPE-ZIP',
  },
  {
    name: 'gml',
    mimetype: 'application/gml+xml',
  },
  {
    name: 'kml',
    mimetype: 'KML',
  },
  {
    name: 'gpkg',
    mimetype: 'application/geopackage+sqlite3',
  },
]

function buildWfsDownloadUrl(baseUrl: string, wfsMetadata: WfsMetadata, format: { name: string, mimetype: string }, layer: OgcLayerInfo) {
  const version = wfsMetadata.version
  const query = new URLSearchParams({
    SERVICE: 'WFS',
    REQUEST: 'GetFeature',
    VERSION: version,
    ...(Number(version.split('.')[0]) >= 2 ? { TYPENAMES: layer.name } : { TYPENAME: layer.name }),
    OUTPUTFORMAT: format.mimetype,
    ...(layer.default_crs ? { SRSNAME: layer.default_crs } : {}),
  })
  return `${baseUrl.split('?')[0]}?${query.toString()}`
}

export function getWfsExportFormats(resource: Pick<Resource, 'extras' | 'url'>) {
  const wfsMetadata = resource.extras['analysis:parsing:ogc_metadata'] as WfsMetadata | null
  if (!wfsMetadata || wfsMetadata.format !== `wfs`) return []
  const outputFormats = wfsMetadata.output_formats.map((format: string) => format.toLowerCase())
  const layer = wfsMetadata.detected_layer
  if (!layer) return []
  // Every download URL below is built on top of `resource.url`, so its scheme is the one
  // of `resource.url`: guard it once here rather than on each of the built URLs.
  if (!isSafeHttpUrl(resource.url)) return []
  const formats = WFS_EXPORT_FORMATS.filter(format => outputFormats.includes(format.mimetype.toLowerCase()))
    .map(format => ({
      url: buildWfsDownloadUrl(resource.url, wfsMetadata, format, layer),
      format: format.name,
    }))
  return formats
}
