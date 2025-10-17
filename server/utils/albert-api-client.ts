/**
 * Albert API Client
 *
 * Documentation:
 * - API Documentation: https://albert.api.etalab.gouv.fr/documentation
 * - Swagger UI: https://albert.api.etalab.gouv.fr/swagger
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// Types
export type ChatMessage = {
  role: string
  content: string
}

export type AlbertConfig = {
  baseUrl: string
  apiKey: string
  timeout?: number
}

export type ChatResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

type RequestConfig = {
  body?: unknown
  data?: unknown
  headers?: Record<string, string>
  params?: Record<string, unknown>
  [key: string]: unknown
}

// ============================================================================
// CORE REQUEST FUNCTION
// ============================================================================

/**
 * Make a request to the Albert API
 */
async function makeAlbertRequest(
  method: string,
  endpoint: string,
  config: AlbertConfig,
  requestConfig: RequestConfig = {},
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

  try {
    const options: Record<string, unknown> = {
      method,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...requestConfig.headers,
      },
    }
    options.body = requestConfig.body ?? requestConfig.data

    // Remove Content-Type header for FormData requests
    if (options.body instanceof FormData) {
      delete (options.headers as Record<string, string>)['Content-Type']
    }

    // Add other config options (like params for GET requests)
    Object.keys(requestConfig).forEach((key) => {
      if (key !== 'body' && key !== 'data' && key !== 'headers') {
        options[key] = requestConfig[key]
      }
    })

    const response = await $fetch(url, options)

    // Handle empty responses
    if (response === null || response === undefined) {
      return {}
    }

    return response
  }
  catch (error) {
    throw new Error(`API request failed: ${(error as Error).message}`)
  }
}

// ============================================================================
// HELPER COMPOSABLE
// ============================================================================

/**
 * Helper to create an Albert config from runtime config
 */
export function useAlbertConfig(): AlbertConfig {
  const runtimeConfig = useRuntimeConfig()

  if (!runtimeConfig.albertApiKey) {
    throw new Error(
      'API key is required. Set NUXT_ALBERT_API_KEY environment variable.',
    )
  }

  return {
    baseUrl: runtimeConfig.albertApiBaseUrl,
    apiKey: runtimeConfig.albertApiKey,
  }
}

// ============================================================================
// MODELS
// ============================================================================

export async function getAlbertModels(config: AlbertConfig) {
  return makeAlbertRequest('GET', '/v1/models', config)
}

export async function getAlbertModel(model: string, config: AlbertConfig) {
  return makeAlbertRequest('GET', `/v1/models/${model}`, config)
}

export async function getAlbertModelsIds(config: AlbertConfig): Promise<string[]> {
  try {
    const models = await getAlbertModels(config) as { data?: Array<{ id: string }> }
    return models.data?.map(m => m.id) || []
  }
  catch (error) {
    console.error(`Unable to get the list of Albert models: ${(error as Error).message}`)
    return []
  }
}

// ============================================================================
// CHAT COMPLETIONS
// ============================================================================

export async function createChatCompletion(
  messages: ChatMessage[],
  model: string,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const data = { messages, model, ...additionalParams }
  return makeAlbertRequest('POST', '/v1/chat/completions', config, { body: data })
}

export async function createAgentCompletion(
  messages: ChatMessage[],
  model: string,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const data = { messages, model, ...additionalParams }
  return makeAlbertRequest('POST', '/v1/agents/completions', config, { body: data })
}

export async function getAgentsTools(config: AlbertConfig) {
  return makeAlbertRequest('GET', '/v1/agents/tools', config)
}

// ============================================================================
// EMBEDDINGS
// ============================================================================

export async function createEmbeddings(
  inputText: string | string[],
  model: string,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const data = { input: inputText, model, ...additionalParams }
  return makeAlbertRequest('POST', '/v1/embeddings', config, { body: data })
}

// ============================================================================
// AUDIO TRANSCRIPTION
// ============================================================================

export async function transcribeAudio(
  filePath: string,
  model: string,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Audio file not found: ${filePath}`)
  }

  const formData = new FormData()
  const fileBuffer = fs.readFileSync(fullPath)
  formData.append('file', new Blob([fileBuffer]))
  formData.append('model', model)

  Object.entries(additionalParams).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return makeAlbertRequest('POST', '/v1/audio/transcriptions', config, {
    body: formData,
  })
}

// ============================================================================
// DOCUMENT PROCESSING
// ============================================================================

export async function parseDocument(
  filePath: string,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Document file not found: ${filePath}`)
  }

  const formData = new FormData()
  const fileBuffer = fs.readFileSync(fullPath)
  formData.append('file', new Blob([fileBuffer]))

  Object.entries(additionalParams).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return makeAlbertRequest('POST', '/v1/parse-beta', config, {
    body: formData,
  })
}

export async function ocrDocument(
  filePath: string,
  model: string,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`PDF file not found: ${filePath}`)
  }

  const formData = new FormData()
  const fileBuffer = fs.readFileSync(fullPath)
  formData.append('file', new Blob([fileBuffer]))
  formData.append('model', model)

  Object.entries(additionalParams).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return makeAlbertRequest('POST', '/v1/ocr-beta', config, {
    body: formData,
  })
}

// ============================================================================
// COLLECTIONS
// ============================================================================

export async function createCollection(
  name: string,
  config: AlbertConfig,
  description?: string,
  visibility: string = 'private',
) {
  const data = { name, description, visibility }
  return makeAlbertRequest('POST', '/v1/collections', config, { body: data })
}

export async function getCollections(
  config: AlbertConfig,
  offset: number = 0,
  limit: number = 10,
) {
  const params = { offset, limit }
  return makeAlbertRequest('GET', '/v1/collections', config, { params })
}

export async function getCollection(collectionId: number, config: AlbertConfig) {
  return makeAlbertRequest('GET', `/v1/collections/${collectionId}`, config)
}

export async function updateCollection(
  collectionId: number,
  config: AlbertConfig,
  updateData: Record<string, unknown> = {},
) {
  return makeAlbertRequest('PATCH', `/v1/collections/${collectionId}`, config, { body: updateData })
}

export async function deleteCollection(collectionId: number, config: AlbertConfig) {
  return makeAlbertRequest('DELETE', `/v1/collections/${collectionId}`, config)
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function createDocument(
  filePath: string,
  collectionId: number,
  config: AlbertConfig,
  additionalParams: Record<string, unknown> = {},
) {
  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Document file not found: ${filePath}`)
  }

  const formData = new FormData()
  const fileBuffer = fs.readFileSync(fullPath)
  formData.append('file', new Blob([fileBuffer]))
  formData.append('collection', String(collectionId))

  Object.entries(additionalParams).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return makeAlbertRequest('POST', '/v1/documents', config, {
    body: formData,
  })
}

export async function getDocuments(
  config: AlbertConfig,
  collectionId?: number,
  limit: number = 10,
  offset: number = 0,
) {
  const params: { limit: number, offset: number, collection?: number } = { limit, offset }
  if (collectionId !== undefined) {
    params.collection = collectionId
  }

  return makeAlbertRequest('GET', '/v1/documents', config, { params })
}

export async function getDocument(documentId: number, config: AlbertConfig) {
  return makeAlbertRequest('GET', `/v1/documents/${documentId}`, config)
}

export async function deleteDocument(documentId: number, config: AlbertConfig) {
  return makeAlbertRequest('DELETE', `/v1/documents/${documentId}`, config)
}

// ============================================================================
// CHUNKS
// ============================================================================

export async function getChunks(
  documentId: number,
  config: AlbertConfig,
  limit: number = 10,
  offset: number = 0,
) {
  const params = { limit, offset }
  return makeAlbertRequest('GET', `/v1/chunks/${documentId}`, config, { params })
}

export async function getChunk(documentId: number, chunkId: number, config: AlbertConfig) {
  return makeAlbertRequest('GET', `/v1/chunks/${documentId}/${chunkId}`, config)
}

// ============================================================================
// SEARCH
// ============================================================================

export async function search(
  prompt: string,
  config: AlbertConfig,
  collections?: number[],
  additionalParams: Record<string, unknown> = {},
) {
  const data = { prompt, collections: collections || [], ...additionalParams }
  return makeAlbertRequest('POST', '/v1/search', config, { body: data })
}

// ============================================================================
// RERANK
// ============================================================================

export async function rerank(
  prompt: string,
  inputTexts: string[],
  model: string,
  config: AlbertConfig,
) {
  const data = { prompt, input: inputTexts, model }
  return makeAlbertRequest('POST', '/v1/rerank', config, { body: data })
}

// ============================================================================
// USAGE
// ============================================================================

export async function getUsage(
  config: AlbertConfig,
  limit: number = 50,
  page: number = 1,
  additionalParams: Record<string, unknown> = {},
) {
  const params = { limit, page, ...additionalParams }
  return makeAlbertRequest('GET', '/v1/usage', config, { params })
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export async function createToken(
  name: string,
  config: AlbertConfig,
  user?: number,
  expiresAt?: number,
) {
  const data: { name: string, user?: number, expires_at?: number } = { name }
  if (user !== undefined) {
    data.user = user
  }
  if (expiresAt !== undefined) {
    data.expires_at = expiresAt
  }

  return makeAlbertRequest('POST', '/tokens', config, { body: data })
}

export async function getTokens(
  config: AlbertConfig,
  offset: number = 0,
  limit: number = 10,
  additionalParams: Record<string, unknown> = {},
) {
  const params = { offset, limit, ...additionalParams }
  return makeAlbertRequest('GET', '/tokens', config, { params })
}

export async function getToken(tokenId: number, config: AlbertConfig) {
  return makeAlbertRequest('GET', `/tokens/${tokenId}`, config)
}

export async function deleteToken(tokenId: number, config: AlbertConfig) {
  return makeAlbertRequest('DELETE', `/tokens/${tokenId}`, config)
}
