/**
 * Albert API TypeScript Client
 * 
 * A comprehensive TypeScript client for interacting with the Albert API.
 * Based on the OpenAPI 3.1.0 specification.
 * 
 * Documentation:
 * - API Documentation: https://albert.api.etalab.gouv.fr/documentation
 * - Swagger UI: https://albert.api.etalab.gouv.fr/swagger
 */

// TypeScript declaration for $fetch (globally available in Nuxt context)
declare const $fetch: any

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as FormData from 'form-data'

export interface ChatMessage {
  role: string
  content: string
}

export class AlbertAPIClient {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  /**
   * Initialize the Albert API client.
   * 
   * @param albertApiBaseUrl - Base URL for the Albert API
   * @param albertApiKey - API key for authentication
   * @param timeout - Request timeout in seconds
   */
  constructor(
    albertApiBaseUrl: string,
    albertApiKey?: string,
    timeout: number = 30
  ) {
    this.baseUrl = albertApiBaseUrl
    this.apiKey = albertApiKey
    this.timeout = timeout
    if (!this.apiKey) {
      throw new Error(
        "API key is required. Set albertApiKey parameter or NUXT_PUBLIC_ALBERT_API_KEY environment variable."
      )
    }
  }

  /**
   * Make a request to the Albert API.
   * 
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param config - Additional request configuration
   * @returns API response as dictionary
   * @throws Error if the request fails
   */
  private async _make_request(
    method: string,
    endpoint: string,
    config: any = {}
  ): Promise<any> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

    try {
      const options: any = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...config.headers
        }
      }
      options.body = config.body ?? config.data

      // Remove Content-Type header for FormData requests
      if (options.body instanceof FormData) {
        delete options.headers['Content-Type']
      }

      // Add other config options (like params for GET requests)
      Object.keys(config).forEach(key => {
        if (key !== 'body' && key !== 'data' && key !== 'headers') {
          options[key] = config[key]
        }
      })

      const response = await $fetch(url, options)

      // Handle empty responses
      if (response === null || response === undefined) {
        return {}
      }

      return response
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.statusText}`)
      } else if (error.request) {
        throw new Error(`API request failed: ${error.message}`)
      } else {
        throw new Error(`API request failed: ${error.message}`)
      }
    }
  }

  // ============================================================================
  // MODELS
  // ============================================================================

  /**
   * Get list of available models.
   * 
   * @returns Dictionary containing available models
   */
  async get_models(): Promise<any> {
    return this._make_request('GET', '/v1/models')
  }

  /**
   * Get information about a specific model.
   * 
   * @param model - Model name/ID
   * @returns Model information
   */
  async get_model(model: string): Promise<any> {
    return this._make_request('GET', `/v1/models/${model}`)
  }

  /**
   * Get the list of the official names for all the available Albert models.
   */
  async get_models_ids(): Promise<string[]> {
    try {
      const models = await this.get_models()
      return models.data?.map((m: any) => m.id) || []
    } catch (error: any) {
      console.error(`Unable to get the list of Albert models: ${error.message}`)
      return []
    }
  }

  // ============================================================================
  // CHAT COMPLETIONS
  // ============================================================================

  /**
   * Create a chat completion.
   * 
   * @param messages - List of message dictionaries
   * @param model - Model to use for completion
   * @param kwargs - Additional parameters (temperature, max_tokens, etc.)
   * @returns Chat completion response
   */
  async chat_completions(
    messages: ChatMessage[],
    model: string,
    kwargs: any = {}
  ): Promise<any> {
    const data = { messages, model, ...kwargs }
    return this._make_request('POST', '/v1/chat/completions', { body: data })
  }

  /**
   * Create an agent completion with MCP bridge tools.
   * 
   * @param messages - List of message dictionaries
   * @param model - Model to use for completion
   * @param kwargs - Additional parameters
   * @returns Agent completion response
   */
  async agents_completions(
    messages: ChatMessage[],
    model: string,
    kwargs: any = {}
  ): Promise<any> {
    const data = { messages, model, ...kwargs }
    return this._make_request('POST', '/v1/agents/completions', { body: data })
  }

  /**
   * Get available tools for agents.
   * 
   * @returns Available tools
   */
  async get_agents_tools(): Promise<any> {
    return this._make_request('GET', '/v1/agents/tools')
  }

  // ============================================================================
  // EMBEDDINGS
  // ============================================================================

  /**
   * Create embeddings for text.
   * 
   * @param input_text - Text or list of texts to embed
   * @param model - Embedding model to use
   * @param kwargs - Additional parameters
   * @returns Embeddings response
   */
  async create_embeddings(
    input_text: string | string[],
    model: string,
    kwargs: any = {}
  ): Promise<any> {
    const data = { input: input_text, model, ...kwargs }
    return this._make_request('POST', '/v1/embeddings', { body: data })
  }

  // ============================================================================
  // AUDIO TRANSCRIPTION
  // ============================================================================

  /**
   * Transcribe audio file.
   * 
   * @param file_path - Path to audio file
   * @param model - Transcription model to use
   * @param kwargs - Additional parameters (language, response_format, etc.)
   * @returns Transcription response
   */
  async transcribe_audio(
    file_path: string,
    model: string,
    kwargs: any = {}
  ): Promise<any> {
    const fullPath = path.resolve(file_path)

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Audio file not found: ${file_path}`)
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(fullPath))
    formData.append('model', model)

    // Add additional parameters
    Object.entries(kwargs).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    return this._make_request('POST', '/v1/audio/transcriptions', {
      body: formData
    })
  }

  // ============================================================================
  // DOCUMENT PROCESSING
  // ============================================================================

  /**
   * Parse a document (PDF, etc.).
   * 
   * @param file_path - Path to document file
   * @param kwargs - Additional parameters (output_format, force_ocr, etc.)
   * @returns Parsed document response
   */
  async parse_document(
    file_path: string,
    kwargs: any = {}
  ): Promise<any> {
    const fullPath = path.resolve(file_path)

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Document file not found: ${file_path}`)
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(fullPath))

    // Add additional parameters
    Object.entries(kwargs).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    return this._make_request('POST', '/v1/parse-beta', {
      body: formData
    })
  }

  /**
   * Extract text from PDF using OCR.
   * 
   * @param file_path - Path to PDF file
   * @param model - OCR model to use
   * @param kwargs - Additional parameters (dpi, prompt, etc.)
   * @returns OCR response
   */
  async ocr_document(
    file_path: string,
    model: string,
    kwargs: any = {}
  ): Promise<any> {
    const fullPath = path.resolve(file_path)

    if (!fs.existsSync(fullPath)) {
      throw new Error(`PDF file not found: ${file_path}`)
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(fullPath))
    formData.append('model', model)

    // Add additional parameters
    Object.entries(kwargs).forEach(([key, value]) => {
      formData.append(key, String(value))
    });

    return this._make_request('POST', '/v1/ocr-beta', {
      body: formData
    })
  }

  // ============================================================================
  // COLLECTIONS AND DOCUMENTS
  // ============================================================================

  /**
   * Create a new collection.
   * 
   * @param name - Collection name
   * @param description - Collection description
   * @param visibility - Collection visibility (private/public)
   * @returns Created collection response
   */
  async create_collection(
    name: string,
    description?: string,
    visibility: string = 'private'
  ): Promise<any> {
    const data = { name, description, visibility }
    return this._make_request('POST', '/v1/collections', { body: data })
  }

  /**
   * Get list of collections.
   * 
   * @param offset - Pagination offset
   * @param limit - Number of collections to return
   * @returns Collections list
   */
  async get_collections(
    offset: number = 0,
    limit: number = 10
  ): Promise<any> {
    const params = { offset, limit }
    return this._make_request('GET', '/v1/collections', { params })
  }

  /**
   * Get collection by ID.
   * 
   * @param collection_id - Collection ID
   * @returns Collection information
   */
  async get_collection(collection_id: number): Promise<any> {
    return this._make_request('GET', `/v1/collections/${collection_id}`)
  }

  /**
   * Update collection.
   * 
   * @param collection_id - Collection ID
   * @param kwargs - Fields to update (name, description, visibility)
   */
  async update_collection(
    collection_id: number,
    kwargs: any = {}
  ): Promise<void> {
    await this._make_request('PATCH', `/v1/collections/${collection_id}`, { body: kwargs })
  }

  /**
   * Delete collection.
   * 
   * @param collection_id - Collection ID
   */
  async delete_collection(collection_id: number): Promise<void> {
    await this._make_request('DELETE', `/v1/collections/${collection_id}`)
  }

  /**
   * Create a document in a collection.
   * 
   * @param file_path - Path to document file
   * @param collection_id - Collection ID
   * @param kwargs - Additional parameters (chunk_size, output_format, etc.)
   * @returns Created document response
   */
  async create_document(
    file_path: string,
    collection_id: number,
    kwargs: any = {}
  ): Promise<any> {
    const fullPath = path.resolve(file_path)

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Document file not found: ${file_path}`)
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(fullPath))
    formData.append('collection', String(collection_id))

    // Add additional parameters
    Object.entries(kwargs).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    return this._make_request('POST', '/v1/documents', {
      body: formData
    })
  }

  /**
   * Get documents from collection.
   * 
   * @param collection_id - Collection ID (optional, to filter by collection)
   * @param limit - Number of documents to return
   * @param offset - Pagination offset
   * @returns Documents list
   */
  async get_documents(
    collection_id?: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<any> {
    const params: any = { limit, offset }
    if (collection_id !== undefined) {
      params.collection = collection_id
    }

    return this._make_request('GET', '/v1/documents', { params })
  }

  /**
   * Get document by ID.
   * 
   * @param document_id - Document ID
   * @returns Document information
   */
  async get_document(document_id: number): Promise<any> {
    return this._make_request('GET', `/v1/documents/${document_id}`)
  }

  /**
   * Delete document.
   * 
   * @param document_id - Document ID
   */
  async delete_document(document_id: number): Promise<void> {
    await this._make_request('DELETE', `/v1/documents/${document_id}`)
  }

  // ============================================================================
  // CHUNKS
  // ============================================================================

  /**
   * Get chunks of a document.
   * 
   * @param document_id - Document ID
   * @param limit - Number of chunks to return
   * @param offset - Pagination offset
   * @returns Chunks list
   */
  async get_chunks(
    document_id: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<any> {
    const params = { limit, offset }
    return this._make_request('GET', `/v1/chunks/${document_id}`, { params })
  }

  /**
   * Get specific chunk of a document.
   * 
   * @param document_id - Document ID
   * @param chunk_id - Chunk ID
   * @returns Chunk information
   */
  async get_chunk(document_id: number, chunk_id: number): Promise<any> {
    return this._make_request('GET', `/v1/chunks/${document_id}/${chunk_id}`)
  }

  // ============================================================================
  // SEARCH
  // ============================================================================

  /**
   * Search for relevant chunks.
   * 
   * @param prompt - Search query
   * @param collections - List of collection IDs to search in
   * @param kwargs - Additional parameters (method, k, score_threshold, etc.)
   * @returns Search results
   */
  async search(
    prompt: string,
    collections?: number[],
    kwargs: any = {}
  ): Promise<any> {
    const data = { prompt, collections: collections || [], ...kwargs }
    return this._make_request('POST', '/v1/search', { body: data })
  }

  // ============================================================================
  // RERANK
  // ============================================================================

  /**
   * Rerank texts by relevance to prompt.
   * 
   * @param prompt - Reranking prompt
   * @param input_texts - List of texts to rerank
   * @param model - Reranking model to use
   * @returns Reranking results
   */
  async rerank(
    prompt: string,
    input_texts: string[],
    model: string
  ): Promise<any> {
    const data = { prompt, input: input_texts, model }
    return this._make_request('POST', '/v1/rerank', { body: data })
  }

  // ============================================================================
  // USAGE
  // ============================================================================

  /**
   * Get account usage information.
   * 
   * @param limit - Number of records per page
   * @param page - Page number
   * @param kwargs - Additional parameters (order_by, order_direction, date_from, date_to)
   * @returns Usage information
   */
  async get_usage(
    limit: number = 50,
    page: number = 1,
    kwargs: any = {}
  ): Promise<any> {
    const params = { limit, page, ...kwargs }
    return this._make_request('GET', '/v1/usage', { params })
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Create a new token.
   * 
   * @param name - Token name
   * @param user - User ID (optional, for admin use)
   * @param expires_at - Expiration timestamp (optional)
   * @returns Created token response
   */
  async create_token(
    name: string,
    user?: number,
    expires_at?: number
  ): Promise<any> {
    const data: any = { name }
    if (user !== undefined) {
      data.user = user
    }
    if (expires_at !== undefined) {
      data.expires_at = expires_at
    }

    return this._make_request('POST', '/tokens', { body: data })
  }

  /**
   * Get list of tokens.
   * 
   * @param offset - Pagination offset
   * @param limit - Number of tokens to return
   * @param kwargs - Additional parameters (order_by, order_direction)
   * @returns Tokens list
   */
  async get_tokens(
    offset: number = 0,
    limit: number = 10,
    kwargs: any = {}
  ): Promise<any> {
    const params = { offset, limit, ...kwargs }
    return this._make_request('GET', '/tokens', { params })
  }

  /**
   * Get token by ID.
   * 
   * @param token_id - Token ID
   * @returns Token information
   */
  async get_token(token_id: number): Promise<any> {
    return this._make_request('GET', `/tokens/${token_id}`)
  }

  /**
   * Delete token.
   * 
   * @param token_id - Token ID
   */
  async delete_token(token_id: number): Promise<void> {
    await this._make_request('DELETE', `/tokens/${token_id}`)
  }

}
