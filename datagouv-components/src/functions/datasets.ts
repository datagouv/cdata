import { useComponentsConfig } from '../config'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { CommunityResource, Resource } from '../types/resources'

function constructUrl(baseUrl: string, path: string): string {
  const url = new URL(baseUrl)
  url.pathname = `${url.pathname}${path}`
  return url.toString()
}

export function getDatasetOEmbedHtml(type: string, id: string): string {
  const config = useComponentsConfig()

  const staticUrl = constructUrl(config.baseUrl, 'oembed.js')
  return `<div data-udata-${type}="${id}"></div><script data-udata="${config.baseUrl}" src="${staticUrl}" async defer></script>`
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

export const isResourceCorsEnabled = (resource: Resource): boolean => {
  const extras = resource.extras
  if (!extras) return false

  const status = extras['check:status'] as number | undefined
  const allowOrigin = extras['check:cors:allow-origin'] as string | undefined
  const rawMethods = extras['check:cors:allow-methods'] as string | undefined

  // Verify the last cors probe was successful (HTTP 200)
  const isHealthy = status === 200
  if (!isHealthy) return false

  // Validate Origin (Wildcard OR specific domain)
  const trustedDomains = ['data.gouv.fr', 'www.data.gouv.fr']

  // Check if allow-origin is '*' or contains one of our trusted domains
  const hasPublicCors = allowOrigin === '*'
  const hasSpecificCors = allowOrigin
    ? trustedDomains.some(domain => allowOrigin.includes(domain))
    : false

  const isOriginAllowed = hasPublicCors || hasSpecificCors

  // Ensure GET method is allowed
  const allowedMethods = rawMethods
    ? rawMethods.split(',').map(m => m.trim().toUpperCase())
    : []
  const supportsGet = allowedMethods.length === 0 || allowedMethods.includes('GET')

  return isOriginAllowed && supportsGet
}
