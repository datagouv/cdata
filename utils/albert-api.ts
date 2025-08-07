/**
 * Albert API TypeScript Client
 * 
 * A comprehensive TypeScript client for interacting with the Albert API.
 * Based on the OpenAPI 3.1.0 specification.
 * 
 * Documentation:
 * - API Documentation: https://albert.api.etalab.gouv.fr/documentation
 * - Swagger UI: https://albert.api.etalab.gouv.fr/swagger
 * 
 * Environment Variables:
 * - ALBERT_API_BASE_URL: Base URL for the Albert API
 * - ALBERT_API_KEY: API key for authentication
 */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import FormData from 'form-data'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Message interface for chat completions
 */
export interface ChatMessage {
  role: string
  content: string
}

/**
 * Albert API Client
 * 
 * A comprehensive client for interacting with the Albert API, providing access to:
 * - Chat completions
 * - Embeddings
 * - Document processing and search
 * - Audio transcription
 * - OCR and parsing
 * - Collections and documents management
 * - Usage tracking
 * - Token management
 * 
 * Documentation:
 * - API Documentation: https://albert.api.etalab.gouv.fr/documentation
 * - Swagger UI: https://albert.api.etalab.gouv.fr/swagger
 */
export class AlbertAPI {
  private base_url: string
  private api_key: string
  private timeout: number
  private client: AxiosInstance

  /**
   * Initialize the Albert API client.
   * 
   * @param base_url - Base URL for the API (defaults to ALBERT_API_BASE_URL env var)
   * @param api_key - API key for authentication (defaults to ALBERT_API_KEY env var)
   * @param timeout - Request timeout in seconds
   */
  constructor(
    base_url?: string,
    api_key?: string,
    timeout: number = 30
  ) {
    this.base_url = base_url || process.env.ALBERT_API_BASE_URL || ''
    this.api_key = api_key || process.env.ALBERT_API_KEY || ''
    this.timeout = timeout

    if (!this.base_url) {
      throw new Error(
        "Base URL is required. Set ALBERT_API_BASE_URL environment variable or pass base_url parameter."
      )
    }
    if (!this.api_key) {
      throw new Error(
        "API key is required. Set ALBERT_API_KEY environment variable or pass api_key parameter."
      )
    }

    this.client = axios.create({
      baseURL: this.base_url,
      timeout: this.timeout * 1000, // Convert to milliseconds
      headers: {
        'Authorization': `Bearer ${this.api_key}`,
        'Content-Type': 'application/json',
      }
    })
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
    config: AxiosRequestConfig = {}
  ): Promise<any> {
    const url = `${this.base_url.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

    try {
      const response: AxiosResponse = await this.client.request({
        method,
        url,
        ...config
      })

      // Handle empty responses
      if (response.status === 204) {
        return {}
      }

      return response.data
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
    return this._make_request('POST', '/v1/chat/completions', { data })
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
    return this._make_request('POST', '/v1/agents/completions', { data })
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
    return this._make_request('POST', '/v1/embeddings', { data })
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
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
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
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
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
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
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
    return this._make_request('POST', '/v1/collections', { data })
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
    await this._make_request('PATCH', `/v1/collections/${collection_id}`, { data: kwargs })
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
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
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
    return this._make_request('POST', '/v1/search', { data })
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
    return this._make_request('POST', '/v1/rerank', { data })
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

    return this._make_request('POST', '/tokens', { data })
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
