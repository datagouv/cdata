import type { DatasetV2 } from '@datagouv/components-next'
import Bowser from 'bowser'

export type ExplorerFeedbackContext = {
  dataset: Pick<DatasetV2, 'id' | 'page' | 'title'>
  // The selected resource's canonical permalink (getResourceExternalUrl), not
  // its raw file URL.
  resourceExternalUrl: string | null
  // The selected resource's format; only set together with resourceExternalUrl.
  resourceFormat: string | null
  simplifiedUserAgent: string | null
}

// Returns a human-readable "Browser - device" string from a raw user agent.
// The form owner only needs a rough idea of the visitor's environment.
export function getSimplifiedUserAgent(userAgent: string): string {
  const parsed = Bowser.parse(userAgent)

  const browser = parsed.browser.name || 'Other'

  const device = parsed.platform.type === 'tablet' || parsed.platform.type === 'mobile'
    ? parsed.platform.type
    : 'desktop'

  return `${browser} - ${device}`
}

// Builds the banner's feedback-form URL with the current context pre-filled as
// query params, so the form owner knows what the visitor was looking at. Resource
// params are omitted (not sent empty) until the explorer resolves its selection,
// and the simplified user agent only exists client-side.
export function buildExplorerFeedbackUrl(baseUrl: string, { dataset, resourceExternalUrl, resourceFormat, simplifiedUserAgent }: ExplorerFeedbackContext): string {
  let url: URL
  try {
    url = new URL(baseUrl)
  }
  catch {
    // Misconfigured base URL: better an un-prefilled form than a broken page.
    return baseUrl
  }
  url.searchParams.set('dataset_id', dataset.id)
  url.searchParams.set('dataset_url', dataset.page)
  url.searchParams.set('dataset_name', dataset.title)
  if (resourceExternalUrl) {
    url.searchParams.set('url_ressource', resourceExternalUrl)
  }
  if (resourceFormat) {
    url.searchParams.set('format_ressource', resourceFormat)
  }
  if (simplifiedUserAgent) {
    url.searchParams.set('navigateur_appareil', simplifiedUserAgent)
  }
  return url.toString()
}
