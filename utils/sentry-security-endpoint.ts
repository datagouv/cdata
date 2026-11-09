/**
 * The Sentry endpoint receiving the violation reports of the Content Security Policy, from
 * the DSN of the project (`https://<key>@<host>/<path>/<project>`), in the same environment
 * as the errors (sentry.client.config.ts).
 */
export function sentrySecurityEndpoint(dsn: string, apiBase: string): string {
  const url = new URL(dsn)
  const segments = url.pathname.split('/').filter(Boolean)
  const project = segments.pop()!
  const endpoint = new URL(`${url.origin}/${[...segments, 'api', project, 'security'].join('/')}/`)
  endpoint.searchParams.set('sentry_key', url.username)
  endpoint.searchParams.set('sentry_environment', apiBase.replace(/https?:\/\//, ''))
  return endpoint.href
}
