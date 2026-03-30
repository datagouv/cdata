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

export function getResourceTitleId(resource: Resource) {
  return 'resource-' + resource.id + '-title'
}

export const RESOURCE_TYPE = readonly(['main', 'documentation', 'update', 'api', 'code', 'other'] as const)
export type ResourceType = typeof RESOURCE_TYPE[number]

export const getResourceLabel = (type: ResourceType, count?: number) => {
  const { t } = useTranslation()
  switch (type) {
    case 'main':
      if (typeof count === 'number') {
        return t('Aucun fichier principal | 1 fichier principal | {n} fichiers principaux', count)
      }
      return t('Fichiers principaux')
    case 'documentation':
      return t('Documentation')
    case 'update':
      return t('Mise à jour')
    case 'api':
      return t('API')
    case 'code':
      return t('Code source')
    case 'other':
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
