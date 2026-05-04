import type { ResourceForm } from '~/types/types'

const MAX_BYTES_PER_FILE = 800_000

/** Maximum characters sent to the suggestion API (combined across files). */
export const MAX_COMBINED_EXCERPT_CHARS = 100_000

/** Minimum useful content length for the model input. */
export const MIN_COMBINED_EXCERPT_CHARS = 50

const TEXT_EXTENSIONS = new Set([
  'csv',
  'tsv',
  'txt',
  'md',
  'json',
  'jsonl',
  'xml',
  'yaml',
  'yml',
  'geojson',
  'html',
  'htm',
])

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

function isProbablyTextFile(file: File): boolean {
  const mime = file.type.toLowerCase()
  if (mime.startsWith('text/')) {
    return true
  }
  if (mime === 'application/json' || mime === 'application/xml' || mime === 'application/geo+json') {
    return true
  }
  return TEXT_EXTENSIONS.has(fileExtension(file.name))
}

/**
 * Reads a bounded UTF-8 excerpt from a local file for dataset description suggestion.
 */
export async function readDatasetFileExcerptForDescription(file: File): Promise<string | null> {
  if (!isProbablyTextFile(file)) {
    return null
  }
  const byteLength = Math.min(MAX_BYTES_PER_FILE, file.size)
  if (byteLength === 0) {
    return null
  }
  const slice = file.slice(0, byteLength)
  const buffer = await slice.arrayBuffer()
  const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
  if (text.includes('\0')) {
    return null
  }
  const trimmed = text.trim()
  if (trimmed.length < MIN_COMBINED_EXCERPT_CHARS) {
    return null
  }
  return trimmed.length > MAX_COMBINED_EXCERPT_CHARS
    ? trimmed.slice(0, MAX_COMBINED_EXCERPT_CHARS)
    : trimmed
}

/**
 * Builds one prompt excerpt from readable local files in order.
 */
export async function buildCombinedExcerptFromResourceForms(resources: Array<ResourceForm>): Promise<string | null> {
  const chunks: string[] = []
  let total = 0

  for (const resource of resources) {
    if (resource.filetype !== 'file' || !resource.file?.raw) {
      continue
    }
    const excerpt = await readDatasetFileExcerptForDescription(resource.file.raw)
    if (!excerpt) {
      continue
    }
    const label = resource.title?.trim() || resource.file.raw.name
    const header = `--- ${label} ---\n`
    const remaining = MAX_COMBINED_EXCERPT_CHARS - total
    if (remaining <= header.length + MIN_COMBINED_EXCERPT_CHARS) {
      break
    }
    const maxBody = remaining - header.length
    const body = excerpt.length > maxBody ? excerpt.slice(0, maxBody) : excerpt
    const piece = `${header}${body}`
    chunks.push(piece)
    total += piece.length
    if (total >= MAX_COMBINED_EXCERPT_CHARS) {
      break
    }
  }

  if (!chunks.length) {
    return null
  }
  const combined = chunks.join('\n')
  return combined.length >= MIN_COMBINED_EXCERPT_CHARS ? combined : null
}
