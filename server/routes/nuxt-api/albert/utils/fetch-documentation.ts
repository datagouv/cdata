/**
 * Fetches documentation content from a URL for use in Albert prompts.
 * Handles HTML (strips tags, decodes character references), trims and normalizes whitespace.
 */

import { assertPublicFetchHost } from '~/server/utils/assert-public-fetch-host'

const FETCH_TIMEOUT_MS = 15_000

/**
 * Maximum bytes read per documentation URL (streaming cap + Content-Length check).
 * Should stay aligned with the prompt budget in `generate-dataservice-description.post.ts`.
 */
export const MAX_DOCUMENTATION_DOWNLOAD_BYTES = 120_000 + 16_384

const MAX_REDIRECTS = 5

const DISALLOWED_URL_MESSAGE = 'Documentation URL is not allowed. Use a public http(s) URL.'

const FETCH_HEADERS = {
  'Accept': 'text/html, application/json, application/x-yaml, text/yaml, text/plain, */*',
  'User-Agent': 'cdata',
} as const

/**
 * Common HTML named character references (ASCII names only; accents use exact case).
 * Numeric &#…; / &#x…; are handled separately for full Unicode coverage.
 */
const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: '\u00A0',
  iexcl: '\u00A1',
  cent: '\u00A2',
  pound: '\u00A3',
  curren: '\u00A4',
  yen: '\u00A5',
  brvbar: '\u00A6',
  sect: '\u00A7',
  uml: '\u00A8',
  copy: '\u00A9',
  ordf: '\u00AA',
  laquo: '\u00AB',
  not: '\u00AC',
  shy: '\u00AD',
  reg: '\u00AE',
  macr: '\u00AF',
  deg: '\u00B0',
  plusmn: '\u00B1',
  sup2: '\u00B2',
  sup3: '\u00B3',
  acute: '\u00B4',
  micro: '\u00B5',
  para: '\u00B6',
  middot: '\u00B7',
  cedil: '\u00B8',
  sup1: '\u00B9',
  ordm: '\u00BA',
  raquo: '\u00BB',
  frac14: '\u00BC',
  frac12: '\u00BD',
  frac34: '\u00BE',
  iquest: '\u00BF',
  Agrave: '\u00C0',
  Aacute: '\u00C1',
  Acirc: '\u00C2',
  Atilde: '\u00C3',
  Auml: '\u00C4',
  Aring: '\u00C5',
  AElig: '\u00C6',
  Ccedil: '\u00C7',
  Egrave: '\u00C8',
  Eacute: '\u00C9',
  Ecirc: '\u00CA',
  Euml: '\u00CB',
  Igrave: '\u00CC',
  Iacute: '\u00CD',
  Icirc: '\u00CE',
  Iuml: '\u00CF',
  ETH: '\u00D0',
  Ntilde: '\u00D1',
  Ograve: '\u00D2',
  Oacute: '\u00D3',
  Ocirc: '\u00D4',
  Otilde: '\u00D5',
  Ouml: '\u00D6',
  times: '\u00D7',
  Oslash: '\u00D8',
  Ugrave: '\u00D9',
  Uacute: '\u00DA',
  Ucirc: '\u00DB',
  Uuml: '\u00DC',
  Yacute: '\u00DD',
  THORN: '\u00DE',
  szlig: '\u00DF',
  agrave: '\u00E0',
  aacute: '\u00E1',
  acirc: '\u00E2',
  atilde: '\u00E3',
  auml: '\u00E4',
  aring: '\u00E5',
  aelig: '\u00E6',
  ccedil: '\u00E7',
  egrave: '\u00E8',
  eacute: '\u00E9',
  ecirc: '\u00EA',
  euml: '\u00EB',
  igrave: '\u00EC',
  iacute: '\u00ED',
  icirc: '\u00EE',
  iuml: '\u00EF',
  eth: '\u00F0',
  ntilde: '\u00F1',
  ograve: '\u00F2',
  oacute: '\u00F3',
  ocirc: '\u00F4',
  otilde: '\u00F5',
  ouml: '\u00F6',
  divide: '\u00F7',
  oslash: '\u00F8',
  ugrave: '\u00F9',
  uacute: '\u00FA',
  ucirc: '\u00FB',
  uuml: '\u00FC',
  yacute: '\u00FD',
  thorn: '\u00FE',
  yuml: '\u00FF',
  OElig: '\u0152',
  oelig: '\u0153',
  Scaron: '\u0160',
  scaron: '\u0161',
  Yuml: '\u0178',
  circ: '\u02C6',
  tilde: '\u02DC',
  ensp: '\u2002',
  emsp: '\u2003',
  thinsp: '\u2009',
  zwnj: '\u200C',
  zwj: '\u200D',
  lrm: '\u200E',
  rlm: '\u200F',
  ndash: '\u2013',
  mdash: '\u2014',
  lsquo: '\u2018',
  rsquo: '\u2019',
  sbquo: '\u201A',
  ldquo: '\u201C',
  rdquo: '\u201D',
  bdquo: '\u201E',
  dagger: '\u2020',
  Dagger: '\u2021',
  permil: '\u2030',
  lsaquo: '\u2039',
  rsaquo: '\u203A',
  euro: '\u20AC',
  trade: '\u2122',
  hellip: '\u2026',
  bull: '\u2022',
}

async function assertSafeDocumentationUrl(urlString: string): Promise<URL> {
  let parsed: URL
  try {
    parsed = new URL(urlString)
  }
  catch {
    throw new Error(DISALLOWED_URL_MESSAGE)
  }
  const proto = parsed.protocol.toLowerCase()
  if (proto !== 'http:' && proto !== 'https:') {
    throw new Error(DISALLOWED_URL_MESSAGE)
  }
  await assertPublicFetchHost(parsed.hostname, DISALLOWED_URL_MESSAGE)
  return parsed
}

function parseContentLength(headers: Headers): number | null {
  const raw = headers.get('content-length')
  if (raw == null || raw === '') {
    return null
  }
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 0) {
    return null
  }
  return n
}

async function readBodyWithByteCap(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) {
    return ''
  }
  const decoder = new TextDecoder('utf-8')
  let total = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      if (!value?.byteLength) {
        continue
      }
      const nextTotal = total + value.byteLength
      if (nextTotal > maxBytes) {
        await reader.cancel().catch(() => {})
        throw new Error(`Documentation response exceeds maximum size (${maxBytes} bytes).`)
      }
      total = nextTotal
      chunks.push(value)
    }
  }
  catch (err) {
    await reader.cancel().catch(() => {})
    throw err
  }
  return decoder.decode(Buffer.concat(chunks.map(c => Buffer.from(c))))
}

async function fetchDocumentationResponse(
  initialUrl: string,
  signal: AbortSignal,
): Promise<{ text: string, finalUrl: string }> {
  let currentHref = (await assertSafeDocumentationUrl(initialUrl)).href
  let redirects = 0

  while (true) {
    const response = await fetch(currentHref, {
      method: 'GET',
      redirect: 'manual',
      signal,
      headers: FETCH_HEADERS,
    })

    if (response.status >= 300 && response.status < 400) {
      if (redirects >= MAX_REDIRECTS) {
        response.body?.cancel().catch(() => {})
        throw new Error('Too many redirects when loading documentation URL.')
      }
      const location = response.headers.get('location')
      if (!location) {
        response.body?.cancel().catch(() => {})
        throw new Error('Failed to load documentation from URL.')
      }
      redirects++
      let nextUrl: URL
      try {
        nextUrl = new URL(location, currentHref)
      }
      catch {
        response.body?.cancel().catch(() => {})
        throw new Error('Failed to load documentation from URL.')
      }
      await assertSafeDocumentationUrl(nextUrl.href)
      currentHref = nextUrl.href
      response.body?.cancel().catch(() => {})
      continue
    }

    if (!response.ok) {
      response.body?.cancel().catch(() => {})
      throw new Error(`Failed to load documentation from URL: HTTP ${response.status}`)
    }

    const declared = parseContentLength(response.headers)
    if (declared != null && declared > MAX_DOCUMENTATION_DOWNLOAD_BYTES) {
      response.body?.cancel().catch(() => {})
      throw new Error(`Documentation response exceeds maximum size (${MAX_DOCUMENTATION_DOWNLOAD_BYTES} bytes).`)
    }

    const text = await readBodyWithByteCap(response, MAX_DOCUMENTATION_DOWNLOAD_BYTES)
    return { text, finalUrl: currentHref }
  }
}

function decodeHtmlEntitiesOnce(text: string): string {
  return text.replace(
    /&(#(?:x[0-9a-f]{1,6}|\d{1,7})|[a-zA-Z][a-zA-Z0-9]*);/gi,
    (full, inner: string) => {
      if (inner.startsWith('#')) {
        const body = inner.slice(1)
        const isHex = body.toLowerCase().startsWith('x')
        const numStr = isHex ? body.slice(1) : body
        const radix = isHex ? 16 : 10
        const cp = Number.parseInt(numStr, radix)
        if (!Number.isFinite(cp) || cp < 0 || cp > 0x10_FFFF) {
          return full
        }
        try {
          return String.fromCodePoint(cp)
        }
        catch {
          return full
        }
      }
      const decoded = NAMED_HTML_ENTITIES[inner]
      return decoded ?? full
    },
  )
}

/**
 * Decodes HTML character references (named + numeric), repeatedly for chains like &amp;amp;.
 */
function decodeHtmlEntities(text: string): string {
  let decoded = text
  for (let i = 0; i < 32; i++) {
    const next = decodeHtmlEntitiesOnce(decoded)
    if (next === decoded) {
      break
    }
    decoded = next
  }
  return decoded
}

/**
 * Fetches raw content from a URL as text.
 * @throws Error if request fails, times out, or returns non-2xx
 */
export async function fetchDocumentationContent(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const { text, finalUrl } = await fetchDocumentationResponse(url, controller.signal)
    clearTimeout(timeoutId)
    const raw = typeof text === 'string' ? text : String(text)
    return formatDocumentationContent(raw, finalUrl)
  }
  catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Documentation URL could not be loaded within ${FETCH_TIMEOUT_MS / 1000} seconds.`)
      }
      if (
        error.message === DISALLOWED_URL_MESSAGE
        || error.message.includes('maximum size')
        || error.message.includes('Too many redirects')
      ) {
        throw error
      }
      throw new Error(`Failed to load documentation from URL: ${error.message}`)
    }
    throw new Error('Failed to load documentation from URL.')
  }
}

function pathnameExtensionFromUrl(urlString: string): string {
  try {
    const { pathname } = new URL(urlString)
    const lastSegment = pathname.split('/').pop() ?? ''
    const dot = lastSegment.lastIndexOf('.')
    if (dot <= 0 || dot === lastSegment.length - 1) {
      return ''
    }
    return lastSegment.slice(dot + 1).toLowerCase()
  }
  catch {
    return ''
  }
}

/**
 * Trims and formats content: strips HTML tags if present, decodes entities, normalizes whitespace.
 * Uses the URL path extension as a hint when the body lacks typical HTML markers.
 */
function formatDocumentationContent(raw: string, url: string): string {
  let text = raw.trim()
  if (!text) {
    return ''
  }
  const ext = pathnameExtensionFromUrl(url)
  const treatAsHtml
    = ext === 'html'
      || ext === 'htm'
      || /<html[\s>]|<body[\s>]|<!DOCTYPE/i.test(text)
  if (treatAsHtml) {
    text = text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    text = decodeHtmlEntities(text)
      .replace(/\s+/g, ' ')
      .trim()
  }
  else {
    // Normalize excessive newlines for JSON/YAML/text
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = text.split('\n').map(line => line.trimEnd())
    text = lines.join('\n').trim()
  }
  return text
}
