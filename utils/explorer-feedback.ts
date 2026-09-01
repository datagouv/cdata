import type { DatasetV2, Resource } from '@datagouv/components-next'

export type ExplorerFeedbackContext = {
  dataset: Pick<DatasetV2, 'id' | 'page' | 'title'>
  resource: Pick<Resource, 'url' | 'format'> | null
  userAgent: string | null
}

// Builds the banner's feedback-form URL with the current context pre-filled as
// query params, so the form owner knows what the visitor was looking at. The
// base URL comes from runtime config (`NUXT_PUBLIC_EXPLORER_FEEDBACK_URL`) and
// may carry query params of its own. Resource params are omitted (not sent
// empty) until the explorer resolves its selection, and the user agent only
// exists client-side.
export function buildExplorerFeedbackUrl(baseUrl: string, { dataset, resource, userAgent }: ExplorerFeedbackContext): string {
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
  if (resource) {
    url.searchParams.set('url_ressource', resource.url)
    url.searchParams.set('format_ressource', resource.format)
  }
  if (userAgent) {
    url.searchParams.set('navigateur_appareil', userAgent)
  }
  return url.toString()
}
