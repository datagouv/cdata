import { readonly, type Component } from 'vue'

import { RiEarthLine, RiMap2Line } from '@remixicon/vue'
import { useComponentsConfig } from '../config'
import Archive from '../components/Icons/Archive.vue'
import Code from '../components/Icons/Code.vue'
import type { Dataset, DatasetV2 } from '../types/datasets'
import Documentation from '../components/Icons/Documentation.vue'
import Image from '../components/Icons/Image.vue'
import Link from '../components/Icons/Link.vue'
import Table from '../components/Icons/Table.vue'
import type { CommunityResource, Resource } from '../types/resources'
import { useTranslation } from '../composables/useTranslation'

export function getResourceFormatIcon(format: string): Component | null {
  switch (format?.trim()?.toLowerCase()) {
    case 'txt':
    case 'pdf':
    case 'rtf':
    case 'odt':
    case 'doc':
    case 'docx':
    case 'epub':
      return Documentation
    case 'json':
    case 'sql':
    case 'xml':
    case 'xsd':
    case 'shp':
    case 'kml':
    case 'kmz':
    case 'gpx':
    case 'shx':
    case 'ovr':
    case 'gpkg':
    case 'grib2':
    case 'dbf':
    case 'prj':
    case 'sqlite':
    case 'db':
    case 'sbn':
    case 'sbx':
    case 'cpg':
    case 'lyr':
    case 'owl':
    case 'dxf':
    case 'ics':
    case 'rdf':
    case 'ttl':
    case 'n3':
      return Code
    case 'tar':
    case 'gz':
    case 'tgz':
    case 'rar':
    case 'zip':
    case '7z':
    case 'xz':
    case 'bz2':
      return Archive
    case 'url':
      return Link
    case 'csv':
    case 'ods':
    case 'xls':
    case 'xlsx':
    case 'parquet':
    case 'csv.gz':
      return Table
    case 'geojson':
      return RiMap2Line
    case 'ogc:wfs':
    case 'ogc:wms':
    case 'wfs':
    case 'wms':
      return RiEarthLine
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return Image
    default:
      return null
  }
}

// Badge colors for the resource icon, keyed on the same format categorization as
// getResourceFormatIcon so tabular/geo/code/documentation stay consistent with the icon.
export function getResourceIconColor(format?: string | null): string {
  const icon = format ? getResourceFormatIcon(format) : null
  switch (icon) {
    case Table:
      return 'bg-[#c3fad5] text-[#18753c]'
    case RiMap2Line:
    case RiEarthLine:
      return 'bg-[#e6eefe] text-[#0063cb]'
    case Code:
      return 'bg-[#fce164] text-[#716043]'
    case Documentation:
      return 'bg-[#fee7fc] text-[#6e445a]'
    default:
      return 'bg-gray-100 text-gray-plain'
  }
}

export function getResourceTitleId(resource: Resource) {
  return 'resource-' + resource.id + '-title'
}

export const RESOURCE_TYPE = readonly(['main', 'documentation', 'update', 'api', 'code', 'other'] as const)
export type ResourceType = typeof RESOURCE_TYPE[number]

// Page size used by ResourceExplorer for its per-type resource fetches.
// Exported so consumers (e.g. the dataset page's `main` prefetch) can build a
// byte-for-byte identical cache key and let Nuxt dedupe the request.
export const RESOURCE_EXPLORER_PAGE_SIZE = 10

export const getResourceLabel = (type: ResourceType, count?: number) => {
  const { t } = useTranslation()
  switch (type) {
    case 'main':
      if (typeof count === 'number') {
        return t('Aucun fichier principal | 1 fichier principal | {n} fichiers principaux', count)
      }
      return t('Fichiers principaux')
    case 'documentation':
      if (typeof count === 'number') {
        return t('Aucun fichier de documentation | 1 fichier de documentation | {n} fichiers de documentation', count)
      }
      return t('Documentation')
    case 'update':
      if (typeof count === 'number') {
        return t('Aucune mise à jour | 1 mise à jour | {n} mises à jour', count)
      }
      return t('Mise à jour')
    case 'api':
      if (typeof count === 'number') {
        return t('Aucune API | 1 API | {n} API', count)
      }
      return t('API')
    case 'code':
      if (typeof count === 'number') {
        return t('Aucun fichier de code source | 1 fichier de code source | {n} fichiers de code source', count)
      }
      return t('Code source')
    case 'other':
      if (typeof count === 'number') {
        return t('Aucun autre fichier | 1 autre fichier | {n} autres fichiers', count)
      }
      return t('Autre')
  }
}

export const OGC_SERVICES_FORMATS = ['wfs', 'wms']

export const detectOgcService = (resource: Resource) => {
  // Detect OGC Services either based on format or a URL with GetCapabilities and known REQUEST type
  // Return the format if found else false
  if (resource.format) {
    const format = resource.format.replace(/^ogc:/, '')
    if (OGC_SERVICES_FORMATS.includes(format))
      return format
  }
  const url = resource.url.toLowerCase()
  if (url.includes('request=getcapabilities')) {
    for (const format of OGC_SERVICES_FORMATS)
      if (url.includes(`service=${format}`)) {
        return format
      }
  }
  return false
}

export function isCommunityResource(resource: Resource | CommunityResource): boolean {
  return 'organization' in resource || 'owner' in resource
}

export function getResourceExternalUrl(dataset: Dataset | DatasetV2 | Omit<Dataset, 'resources' | 'community_resources'>, resource: Resource | CommunityResource): string {
  return `${dataset.page}${isCommunityResource(resource) ? '/community-resources' : ''}?resource_id=${resource.id}`
}

export function getResourceFilesize(resource: Resource): null | number {
  if (resource.filesize) return resource.filesize
  if ('analysis:content-length' in resource.extras) return resource.extras['analysis:content-length'] as number

  return null
}

// Parsing errors are stored as `<step>:<message>`, where `<step>` names the
// analysis step that failed (e.g. `pmtiles_export`, `geojson_export`).

/** The analysis step that failed, or null when there is no parsing error. */
export function getParsingErrorStep(resource: Resource): string | null {
  const error = resource.extras['analysis:parsing:error']
  if (typeof error !== 'string' || !error) return null
  const [step] = error.split(':', 1)
  return step ?? null
}

/** The parsing error message without its `<step>:` prefix, or null when there is none. */
export function getParsingErrorMessage(resource: Resource): string | null {
  const error = resource.extras['analysis:parsing:error']
  if (typeof error !== 'string' || !error) return null
  const colon = error.indexOf(':')
  return colon === -1 ? error : error.slice(colon + 1)
}

// Geo/format export steps run *after* the tabular table has been built, so a
// failure here (e.g. a huge geometry timing out the pmtiles export) leaves the
// tabular data fully usable and must not disable the tabular explorer.
const NON_TABULAR_PARSING_ERROR_STEPS = ['pmtiles_export', 'geojson_export']

/**
 * Whether the resource's parsing error prevents reading its tabular data.
 * Only errors from the tabular parsing itself are fatal; downstream geo/format
 * export failures are not.
 */
export function hasTabularParsingError(resource: Resource): boolean {
  const step = getParsingErrorStep(resource)
  return step !== null && !NON_TABULAR_PARSING_ERROR_STEPS.includes(step)
}

type CorsStatus = 'allowed' | 'blocked' | 'unknown'

export const getResourceCorsStatus = (resource: Resource): CorsStatus => {
  const extras = resource.extras
  if (!extras || !('check:cors:allow-origin' in extras)) {
    return 'unknown'
  }

  const allowOrigin = extras['check:cors:allow-origin'] as string | undefined
  const rawMethods = extras['check:cors:allow-methods'] as string | undefined

  // Check if allow-origin is '*' or contains one of our trusted domains
  const config = useComponentsConfig()
  const trustedDomains = config.trustedDomains ?? []
  const hasPublicCors = allowOrigin === '*'
  const hasSpecificCors = allowOrigin
    ? trustedDomains.some((domain) => {
        try {
          const hostname = new URL(allowOrigin).hostname
          return hostname === domain || hostname.endsWith(`.${domain}`)
        }
        catch {
          return false
        }
      })
    : false

  const isOriginAllowed = hasPublicCors || hasSpecificCors

  // Ensure GET method is allowed
  const allowedMethods = rawMethods
    ? rawMethods.split(',').map(m => m.trim().toUpperCase())
    : []
  const supportsGet = allowedMethods.length === 0 || allowedMethods.includes('GET')

  return isOriginAllowed && supportsGet ? 'allowed' : 'blocked'
}
