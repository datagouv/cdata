import { createHash } from 'node:crypto'
import { sentrySecurityEndpoint } from '../utils/sentry-security-endpoint'

const HEADERS = {
  'report-only': 'Content-Security-Policy-Report-Only',
  'enforce': 'Content-Security-Policy',
} as const

// The inline scripts of a chunk of the document, with their attributes and their source.
const INLINE_SCRIPTS = /<script\b(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g

// Inline scripts the browser never runs, so the policy does not apply to them.
const DATA_TYPES = ['application/json', 'application/ld+json']

function hash(source: string): string {
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`
}

/**
 * Only lets the browser run the scripts we serve and the inline ones Nuxt writes (its
 * import map and `window.__NUXT__.config`), so that some HTML slipping into a page
 * (an HTML post, a description…) cannot run any.
 *
 * The inline scripts are allowed by their hash rather than a nonce: pages are cached by
 * nginx, a nonce would be served again to every visitor.
 *
 * Nuxt has no policy of its own: it only copies onto its streaming scripts a nonce some
 * other module set on the head. And `nuxt-security` only hashes prerendered pages: on
 * server rendered ones it uses a nonce, which it sets on every `<script>` of the rendered
 * HTML whatever wrote it, so a script slipping into the page would be allowed to run.
 */
export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const header = HEADERS[config.contentSecurityPolicy as keyof typeof HEADERS]
  if (!header) return

  const hosts = [config.app.cdnURL, config.public.matomo.host]
    .filter(Boolean)
    .map(url => new URL(url).origin)
  const reportUri = config.public.sentry.dsn
    ? sentrySecurityEndpoint(config.public.sentry.dsn, config.public.apiBase)
    : undefined
  // `report-to` is the newer directive, `report-uri` the one most browsers still use
  const reporting = reportUri ? [`report-uri ${reportUri}`, 'report-to csp'] : []

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const hashes = new Set<string>()
    // The body, where the content of the users ends up, is left out on purpose: Nuxt
    // writes its inline scripts in the head and at the end of the body.
    for (const chunk of [...html.head, ...html.bodyAppend]) {
      for (const [, attributes, source] of chunk.matchAll(INLINE_SCRIPTS)) {
        const type = attributes!.match(/\stype="([^"]*)"/)?.[1]
        if (!type || !DATA_TYPES.includes(type)) hashes.add(hash(source!))
      }
    }

    setResponseHeader(event, header, [
      ['script-src', '\'self\'', ...hosts, ...hashes].join(' '),
      'object-src \'none\'',
      'base-uri \'self\'',
      ...reporting,
    ].join('; '))
    if (reportUri) setResponseHeader(event, 'Reporting-Endpoints', `csp="${reportUri}"`)
  })
})
