/**
 * Fetches documentation content from a URL for use in Albert prompts.
 * Handles HTML (strips tags), trims and normalizes whitespace.
 */

const FETCH_TIMEOUT_MS = 15_000

/**
 * Fetches raw content from a URL as text.
 * @throws Error if request fails, times out, or returns non-2xx
 */
export async function fetchDocumentationContent(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await $fetch<string>(url, {
      responseType: 'text',
      signal: controller.signal,
      headers: {
        'Accept': 'text/html, application/json, application/x-yaml, text/yaml, text/plain, */*',
        'User-Agent': 'data.gouv.fr-dataservice-description-generator/1.0',
      },
      ignoreResponseError: false,
    })
    clearTimeout(timeoutId)
    const raw = typeof response === 'string' ? response : String(response)
    return formatDocumentationContent(raw, url)
  }
  catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Documentation URL could not be loaded within ${FETCH_TIMEOUT_MS / 1000} seconds: ${url}`)
      }
      throw new Error(`Failed to load documentation from URL: ${error.message}`)
    }
    throw new Error('Failed to load documentation from URL.')
  }
}

/**
 * Trims and formats content: strips HTML tags if present, normalizes whitespace.
 */
function formatDocumentationContent(raw: string, _url: string): string {
  let text = raw.trim()
  if (!text) {
    return ''
  }
  // If content looks like HTML, strip tags and collapse whitespace
  if (/<html[\s>]|<body[\s>]|<!DOCTYPE/i.test(text)) {
    text = text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
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
