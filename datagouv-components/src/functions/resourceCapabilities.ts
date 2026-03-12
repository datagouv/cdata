import type { Resource, WfsMetadata, OgcLayerInfo } from '../types/resources'

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
  const formats = WFS_EXPORT_FORMATS.filter(format => outputFormats.includes(format.mimetype.toLowerCase()))
    .map(format => ({
      url: buildWfsDownloadUrl(resource.url, wfsMetadata, format, layer),
      format: format.name,
    }))
  return formats
}
