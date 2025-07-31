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

/**
 * Returns the short description to display.
 * If description_short is provided, it is used.
 * Otherwise, the first 200 characters of description are used.
 */
export function getShortDescription(
  description: string | null | undefined,
  descriptionShort: string | null | undefined
): string {
  if (descriptionShort?.trim()) {
    return descriptionShort
  }
  if (description?.trim()) {
    //  description field is a markdown field that may contain HTML tags, so we should trim it
    const plainText = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    if (plainText.length > 200) {
      return `${plainText.substring(0, 197)}...`
    }
    return plainText
  }
  return ''
}
