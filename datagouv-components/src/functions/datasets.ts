import { useComponentsConfig } from '../config'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { CommunityResource, Resource } from '../types/resources'

function constructUrl(baseUrl: string, path: string): string {
  const url = new URL(baseUrl)
  url.pathname = `${url.pathname}${path}`
  return url.toString()
}

export default function getDatasetOEmbedHtml(type: string, id: string): string {
  const config = useComponentsConfig()

  const staticUrl = constructUrl(config.staticUrl, 'oembed.js')
  return `<div data-udata-${type}="${id}"></div><script data-udata="${config.baseUrl}" src="${staticUrl}" async defer></script>`
}

export function isCommunityResource(resource: Resource | CommunityResource): boolean {
  return 'organization' in resource || 'owner' in resource
}

export function getResourceExternalUrl(dataset: Dataset | DatasetV2 | Omit<Dataset, 'resources' | 'community_resources'>, resource: Resource | CommunityResource): string {
  return `${dataset.page}#/${isCommunityResource(resource) ? 'community-resources' : 'resources'}/${resource.id}`
}
