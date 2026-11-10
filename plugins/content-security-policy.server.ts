import { createHash } from 'node:crypto'
import type { HeadTag } from 'unhead/types'
import { tagToString } from 'unhead/server'
import { sentrySecurityEndpoint } from '~/utils/sentry-security-endpoint'

const HEADERS: Partial<Record<string, string>> = {
  'report-only': 'Content-Security-Policy-Report-Only',
  'enforce': 'Content-Security-Policy',
}

// The two inline scripts Nuxt writes on every page: the import map the app is loaded
// through, and its runtime config.
function isNuxtInlineScript(tag: HeadTag): boolean {
  if (tag.tag !== 'script' || tag.props.src) return false
  return tag.props.type === 'importmap'
    || (!tag.props.type && String(tag.innerHTML).startsWith('window.__NUXT__={};window.__NUXT__.config='))
}

// Hashed as unhead serializes it, between the opening and the closing tags.
function hash(tag: HeadTag): string {
  const html = tagToString(tag)
  const source = html.slice(html.indexOf('>') + 1, -'</script>'.length)
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`
}

/**
 * Only lets the browser run the scripts we serve and the two inline ones Nuxt writes, so that
 * some HTML slipping into a page (an HTML post, a description…) cannot run any.
 *
 * The inline scripts are picked among the tags unhead renders, not in the HTML: some text of
 * the users ends up, unescaped, in the attributes of the head (`<meta content="…">`), and a
 * `<script>` written there would read as one of ours.
 *
 * They are allowed by their hash rather than a nonce: pages are cached by nginx, a nonce
 * would be served again to every visitor.
 *
 * Nuxt has no policy of its own: it only copies onto its streaming scripts a nonce some
 * other module set on the head. And `nuxt-security` only hashes prerendered pages: on
 * server rendered ones it uses a nonce, which it sets on every `<script>` of the rendered
 * HTML whatever wrote it, so a script slipping into the page would be allowed to run.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const header = HEADERS[config.contentSecurityPolicy]
  if (!header) return

  const policy = useResponseHeader(header)
  const reportingEndpoints = useResponseHeader('Reporting-Endpoints')
  // Only matomo.js on the Matomo host: its other URLs include a JSONP API, which would run as
  // a script any callback an injected `<script src>` passes it.
  const sources = [
    config.app.cdnURL && new URL(config.app.cdnURL).origin,
    config.public.matomo.host && new URL('/matomo.js', config.public.matomo.host).href,
  ].filter(Boolean)
  const reportUri = config.public.sentry.dsn
    ? sentrySecurityEndpoint(config.public.sentry.dsn, config.public.apiBase)
    : undefined
  // `report-to` is the newer directive, `report-uri` the one most browsers still use
  const reporting = reportUri ? [`report-uri ${reportUri}`, 'report-to csp'] : []

  injectHead().hooks!.hook('ssr:rendered', ({ tags }) => {
    const hashes = tags.filter(isNuxtInlineScript).map(hash)
    policy.value = [
      ['script-src', '\'self\'', ...sources, ...hashes].join(' '),
      'object-src \'none\'',
      'base-uri \'self\'',
      ...reporting,
    ].join('; ')
    if (reportUri) reportingEndpoints.value = `csp="${reportUri}"`
  })
})
