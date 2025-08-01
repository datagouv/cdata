import { useComponentsConfig } from '../config'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { CommunityResource, Resource } from '../types/resources'
import { removeMarkdown } from './markdown'

// Dataset description constants
export const DESCRIPTION_SHORT_MAX_LENGTH = 200
export const DESCRIPTION_MIN_LENGTH = 200

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
 * Otherwise, the first DESCRIPTION_SHORT_MAX_LENGTH characters of description are used.
 */
export async function getShortDescription(
  description: string | null | undefined,
  descriptionShort: string | null | undefined
): Promise<string> {
  if (descriptionShort?.trim()) {
    return descriptionShort
  }
  if (description?.trim()) {
    // description field is a markdown field that may contain HTML tags, so we should trim it
    const plainText = await removeMarkdown(description)
    if (plainText.length > DESCRIPTION_SHORT_MAX_LENGTH) {
      return `${plainText.substring(0, DESCRIPTION_SHORT_MAX_LENGTH - 1)}…`
    }
    return plainText
  }
  return ''
}
