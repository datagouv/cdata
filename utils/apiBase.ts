/**
 * On the server (SSR / Nitro), rewrite an API URL to the private-network base so requests don't
 * go over the public internet. Handles three cases:
 *   - a relative path (`/api/1/datasets/`) → prefixed with the private-network base
 *   - an absolute URL on the public API (e.g. the `next_page` returned by paginated endpoints)
 *     → host swapped for the private-network base
 *   - any other absolute URL (external service) → left untouched
 *
 * Returns the URL unchanged when no private-network base is configured, so the public base is used as-is.
 */
export function toServerApiUrl(url: string, publicBase: string, privateNetworkBase: string): string {
  if (!privateNetworkBase) return url

  const pub = publicBase.replace(/\/$/, '')
  const priv = privateNetworkBase.replace(/\/$/, '')

  if (url.startsWith(pub)) return priv + url.slice(pub.length)
  if (/^https?:\/\//.test(url)) return url
  return priv + (url.startsWith('/') ? url : `/${url}`)
}
