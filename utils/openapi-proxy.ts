const devProxyMap: Record<string, string> = {
  'https://entreprise.api.gouv.fr': '/proxy/entreprise-api',
  'https://particulier.api.gouv.fr': '/proxy/particulier-api',
}

export function getProxiedUrl(url: string): string {
  if (import.meta.dev) {
    for (const [origin, proxy] of Object.entries(devProxyMap)) {
      if (url.startsWith(origin)) {
        return url.replace(origin, proxy)
      }
    }
  }
  return url
}
