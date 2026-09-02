import type { DatasetV2 } from '@datagouv/components-next'

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
// Detection is intentionally simple: the form owner only needs a rough idea of
// the visitor's environment, not a full parser.
export function getSimplifiedUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase()

  let browser = 'Other'
  if (ua.includes('firefox/')) {
    browser = 'Firefox'
  }
  else if (ua.includes('edg/')) {
    browser = 'Edge'
  }
  else if (ua.includes('chrome/') || ua.includes('chromium/')) {
    browser = 'Chrome'
  }
  else if (ua.includes('safari/')) {
    browser = 'Safari'
  }
  else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera'
  }

  let device = 'desktop'
  if (ua.includes('ipad') || ua.includes('tablet')) {
    device = 'tablet'
  }
  else if (ua.includes('mobile')) {
    device = 'mobile'
  }
  else if (ua.includes('android')) {
    // Android tablets usually omit both "Mobile" and "Tablet".
    device = 'tablet'
  }

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
