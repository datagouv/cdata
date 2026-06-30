import type { PreviewType } from '~/types/preview-dashboard'

export function parsePreviews(value: string | null | undefined): PreviewType[] {
  if (!value) return []
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean) as PreviewType[]
}

export function getFormatFamily(format: string): string {
  const normalized = format.toLowerCase().trim()

  const tabular = ['csv', 'xls', 'xlsx', 'ods']
  const structured = ['json', 'geojson']
  const geospatial = ['shp', 'kml', 'gpx', 'kmz', 'geopackage']
  const document = ['pdf', 'doc', 'docx', 'odt']

  if (tabular.includes(normalized)) return 'Tabulaire'
  if (structured.includes(normalized)) return 'Structuré'
  if (geospatial.includes(normalized)) return 'Géospatial'
  if (document.includes(normalized)) return 'Document'
  if (normalized === 'xml') return 'XML'

  return 'Autre'
}
