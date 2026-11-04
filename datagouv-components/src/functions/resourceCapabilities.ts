import type { Resource } from '../types/resources'
import { isSafeHttpUrl } from './helpers'
import { buildWfsUrl, getWfsLayer } from './wfs'

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

export function getWfsExportFormats(resource: Pick<Resource, 'extras' | 'url'>) {
  // `getWfsLayer` rejects a non-http(s) `resource.url`, which every URL below is built on.
  const layer = getWfsLayer(resource)
  if (!layer) return []
  const outputFormats = layer.outputFormats.map(format => format.toLowerCase())
  return WFS_EXPORT_FORMATS.filter(format => outputFormats.includes(format.mimetype.toLowerCase()))
    .map(format => ({
      url: buildWfsUrl(layer, 'GetFeature', { outputFormat: format.mimetype, srsName: layer.defaultCrs }),
      format: format.name,
    }))
}
