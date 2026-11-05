import type { PreviewErrorType } from './previewErrors'
import {
  buildWfsUrl,
  parseWfsFeatures,
  parseWfsSchema,
  readServiceException,
  WfsMalformedResponseError,
  WfsServiceError,
  type WfsFeaturePage,
  type WfsPreviewLayer,
  type WfsSchema,
} from './wfs'

// Fetching a WFS layer from the browser: the third-party server answers
// directly, so every response is capped in size and time.

export class WfsTooLargeError extends Error {
  constructor() {
    super('Response too large')
    this.name = 'WfsTooLargeError'
  }
}

export class WfsTimeoutError extends Error {
  constructor() {
    super('Request timed out')
    this.name = 'WfsTimeoutError'
  }
}

export class WfsHttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`)
    this.name = 'WfsHttpError'
  }
}

// The request itself failed: the server is unreachable, or blocks us (CORS),
// the browser does not tell which.
export class WfsRequestError extends Error {
  constructor(public original?: unknown) {
    super('Request failed')
    this.name = 'WfsRequestError'
  }
}

export type WfsFetchOptions = {
  maxBytes: number
  timeoutMs?: number
  // Aborts the request, e.g. when the component unmounts.
  signal?: AbortSignal
}

const DEFAULT_TIMEOUT_MS = 20_000
// An error page is only read for the service exception it may hold.
const ERROR_MAX_BYTES = 100_000

export const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    const text = await response.text()
    if (new TextEncoder().encode(text).byteLength > maxBytes) throw new WfsTooLargeError()
    return text
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      // Stops the download: MapServer sends the geometries whatever we ask.
      await reader.cancel()
      throw new WfsTooLargeError()
    }
    text += decoder.decode(value, { stream: true })
  }
  return text + decoder.decode()
}

export async function fetchWfsText(url: string, { maxBytes, timeoutMs = DEFAULT_TIMEOUT_MS, signal }: WfsFetchOptions): Promise<string> {
  const controller = new AbortController()
  const timeout = new WfsTimeoutError()
  const timer = setTimeout(() => controller.abort(timeout), timeoutMs)
  const onAbort = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', onAbort)
  // `abort(reason)` makes fetch reject with that reason, but a read cut short
  // may still surface as a generic AbortError.
  const rethrow = (error: unknown): never => {
    if (controller.signal.reason === timeout) throw timeout
    if (isAbortError(error) || error instanceof WfsTooLargeError || controller.signal.aborted) throw error
    throw new WfsRequestError(error)
  }
  try {
    const response = await fetch(url, { signal: controller.signal }).catch(rethrow)
    if (!response.ok) {
      // A large error page is still an HTTP error, not a large layer.
      const text = await readCapped(response, ERROR_MAX_BYTES).catch(() => '')
      const message = readServiceException(text)
      throw message ? new WfsServiceError(message) : new WfsHttpError(response.status)
    }
    // Compressed size when the response is compressed: only a first hint,
    // `readCapped` counts the decoded bytes.
    if (Number(response.headers.get('content-length')) > maxBytes) {
      controller.abort()
      throw new WfsTooLargeError()
    }
    return await readCapped(response, maxBytes).catch(rethrow)
  }
  finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

const SCHEMA_MAX_BYTES = 1_000_000
// Some servers (MapServer) send the geometries even when only attributes are
// asked: their answer can then go over the cap.
const FEATURES_MAX_BYTES = 5_000_000
export const WFS_PAGE_SIZE = 20

export async function loadWfsSchema(layer: WfsPreviewLayer, options: { signal?: AbortSignal } = {}): Promise<WfsSchema> {
  const text = await fetchWfsText(buildWfsUrl(layer, 'DescribeFeatureType'), { maxBytes: SCHEMA_MAX_BYTES, ...options })
  return parseWfsSchema(text, layer.typeName)
}

export async function loadWfsFeatures(layer: WfsPreviewLayer, schema: WfsSchema, options: { signal?: AbortSignal } = {}): Promise<WfsFeaturePage> {
  // A layer with only a geometry has nothing to show in a table, and asking it
  // without PROPERTYNAME would download all of its geometries.
  if (!schema.attributes.length) return { rows: [], total: null }
  const url = buildWfsUrl(layer, 'GetFeature', {
    outputFormat: layer.jsonFormat,
    count: WFS_PAGE_SIZE,
    // The table never shows the geometry, which weighs most of the answer.
    propertyNames: schema.attributes.map(attribute => attribute.name),
  })
  return parseWfsFeatures(await fetchWfsText(url, { maxBytes: FEATURES_MAX_BYTES, signal: options.signal }))
}

export type WfsLoadError = {
  type: PreviewErrorType
  // The server's own words, shown under the error message.
  detail?: string
}

// Turns a failed load into the error shown to the user.
export function diagnoseWfsError(error: unknown): WfsLoadError {
  if (error instanceof WfsServiceError) return { type: 'load_failed', detail: error.message }
  if (error instanceof WfsHttpError) return { type: 'load_failed', detail: error.message }
  if (error instanceof WfsMalformedResponseError) return { type: 'malformed' }
  if (error instanceof WfsTooLargeError) return { type: 'too_large' }
  // A CORS block looks the same: the robot's own CORS check catches most of
  // them before any request (`getWfsBlocker`).
  if (error instanceof WfsRequestError || error instanceof WfsTimeoutError) return { type: 'network' }
  // Anything else is a bug on our side, not the server's doing.
  return { type: 'unknown' }
}
