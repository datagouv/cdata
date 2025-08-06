/**
 * Albert LLM API utilities
 * Collection of methods to interact with the Albert LLM API
 */

const ALBERT_API_BASE_URL = 'https://albert.api.etalab.gouv.fr/'
const ALBERT_API_KEY = process.env.ALBERT_API_KEY || ''

// Types based on Albert API OpenAPI specification
interface ChatCompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model: string
  temperature?: number
  max_completion_tokens?: number
  stream?: boolean
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string | string[]
  n?: number
  logprobs?: boolean
  top_logprobs?: number
  response_format?: {
    type: 'json_object' | 'text'
  }
  max_tokens?: number // Deprecated but still supported
  seed?: number
  stream_options?: any
}

interface ChatCompletionResponse {
  id: string
  choices: Array<{
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call'
    index: number
    message: {
      content: string | null
      role: 'assistant'
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: {
          name: string
          arguments: string
        }
      }>
      function_call?: {
        name: string
        arguments: string
      }
    }
    logprobs?: {
      content: Array<{
        token: string
        logprob: number
        top_logprobs: Array<{
          token: string
          logprob: number
        }>
      }>
    }
  }>
  created: number
  model: string
  object: 'chat.completion'
  system_fingerprint?: string
  service_tier?: 'scale' | 'default'
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    cost: number
    carbon: {
      kWh: {
        min: number | null
        max: number | null
      }
      kgCO2eq: {
        min: number | null
        max: number | null
      }
    }
  }
  search_results?: Array<{
    method: string
    score: number
    chunk: {
      object: 'chunk'
      id: number
      metadata: any
      content: string
    }
  }>
}

interface Model {
  id: string
  created: number
  object: 'model'
  owned_by: string
  max_context_length: number | null
  type: 'text-generation' | 'text-embeddings-inference' | 'automatic-speech-recognition' | 'image-text-to-text' | 'text-classification'
  aliases: string[]
  costs: {
    prompt_tokens: number
    completion_tokens: number
  }
}

interface ModelsResponse {
  object: 'list'
  data: Model[]
}

interface HTTPValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

/**
 * Get available models from Albert API
 * @returns Promise<Model[]> - List of available models
 */
export async function getAvailableModels(): Promise<Model[]> {
  try {
    if (!ALBERT_API_KEY) {
      throw new Error('ALBERT_API_KEY environment variable is not set')
    }

    const response = await fetch(`${ALBERT_API_BASE_URL}/v1/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ALBERT_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Albert API error: ${response.status} ${response.statusText}`)
    }

    const data: ModelsResponse = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching available models:', error)
    return []
  }
}

/**
 * Get text generation models specifically
 * @returns Promise<Model[]> - List of text generation models
 */
export async function getTextGenerationModels(): Promise<Model[]> {
  const models = await getAvailableModels()
  return models.filter(model => model.type === 'text-generation')
}

/**
 * Make a chat completion request to Albert API
 * @param request - The chat completion request
 * @returns Promise<ChatCompletionResponse> - The API response
 */
async function makeChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  if (!ALBERT_API_KEY) {
    throw new Error('ALBERT_API_KEY environment variable is not set')
  }

  const response = await fetch(`${ALBERT_API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ALBERT_API_KEY}`
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Albert API error: ${response.status} ${response.statusText}`
    
    try {
      const errorData: HTTPValidationError = JSON.parse(errorText)
      if (errorData.detail && errorData.detail.length > 0) {
        errorMessage += ` - ${errorData.detail[0].msg}`
      }
    } catch {
      // If we can't parse the error as JSON, use the raw text
      if (errorText) {
        errorMessage += ` - ${errorText}`
      }
    }
    
    throw new Error(errorMessage)
  }

  return await response.json()
}

/**
 * Generate a summary from text using Albert LLM API
 * @param text - The text to summarize
 * @param model - The model to use (defaults to first available text-generation model)
 * @returns Promise<string> - The generated summary
 */
export async function generateSummary(text: string, model?: string): Promise<string> {
  try {
    // Get available models if no specific model is provided
    let modelToUse = model
    if (!modelToUse) {
      const textModels = await getTextGenerationModels()
      if (textModels.length === 0) {
        throw new Error('No text generation models available')
      }
      modelToUse = textModels[0].id
    }

    const request: ChatCompletionRequest = {
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant spécialisé dans la génération de résumés concis et informatifs. Tu dois créer un résumé qui capture les points essentiels du texte fourni.'
        },
        {
          role: 'user',
          content: `Génère un résumé concis du texte suivant :\n\n${text}`
        }
      ],
      model: modelToUse,
      temperature: 0.3,
      max_completion_tokens: 500,
      top_p: 0.9
    }

    const data = await makeChatCompletion(request)
    return data.choices[0]?.message?.content || 'Résumé non disponible'
  } catch (error) {
    console.error('Error calling Albert API for summary:', error)
    // Fallback to placeholder implementation
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }
}

/**
 * Generate a short description from a full description using Albert LLM API
 * @param fullDescription - The full description text
 * @param model - The model to use (defaults to first available text-generation model)
 * @returns Promise<string> - The generated short description
 */
export async function generateShortDescription(fullDescription: string, model?: string): Promise<string> {
  try {
    // Get available models if no specific model is provided
    let modelToUse = model
    if (!modelToUse) {
      const textModels = await getTextGenerationModels()
      if (textModels.length === 0) {
        throw new Error('No text generation models available')
      }
      modelToUse = textModels[0].id
    }

    const request: ChatCompletionRequest = {
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant spécialisé dans la création de descriptions courtes et percutantes. Tu dois créer une description courte (maximum 150 caractères) qui résume efficacement le contenu principal.'
        },
        {
          role: 'user',
          content: `Crée une description courte (max 150 caractères) basée sur cette description complète :\n\n${fullDescription}`
        }
      ],
      model: modelToUse,
      temperature: 0.2,
      max_completion_tokens: 200,
      top_p: 0.9
    }

    const data = await makeChatCompletion(request)
    const generatedDescription = data.choices[0]?.message?.content || ''
    
    // Ensure the description doesn't exceed 150 characters
    return generatedDescription.length > 150 
      ? generatedDescription.substring(0, 147) + '...' 
      : generatedDescription
  } catch (error) {
    console.error('Error calling Albert API for short description:', error)
    // Fallback to placeholder implementation
    const firstSentence = fullDescription.split(/[.!?]/)[0]
    const maxLength = 150
    
    if (firstSentence.length <= maxLength) {
      return firstSentence
    }
    
    return fullDescription.substring(0, maxLength).split(/\s+/).slice(0, -1).join(' ') + '...'
  }
}

/**
 * Generate a summary with specific constraints using Albert LLM API
 * @param text - The text to summarize
 * @param maxLength - Maximum length of the summary
 * @param preserveSentences - Whether to preserve complete sentences
 * @param model - The model to use (defaults to first available text-generation model)
 * @returns Promise<string> - The generated summary
 */
export async function generateSummaryWithConstraints(
  text: string, 
  maxLength: number = 150, 
  preserveSentences: boolean = true,
  model?: string
): Promise<string> {
  try {
    // Get available models if no specific model is provided
    let modelToUse = model
    if (!modelToUse) {
      const textModels = await getTextGenerationModels()
      if (textModels.length === 0) {
        throw new Error('No text generation models available')
      }
      modelToUse = textModels[0].id
    }

    const constraintInstruction = preserveSentences 
      ? `Préserve les phrases complètes et ne dépasse pas ${maxLength} caractères.`
      : `Crée un résumé de maximum ${maxLength} caractères.`

    const request: ChatCompletionRequest = {
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant spécialisé dans la génération de résumés avec contraintes spécifiques. ${constraintInstruction}`
        },
        {
          role: 'user',
          content: `Génère un résumé du texte suivant en respectant les contraintes :\n\n${text}`
        }
      ],
      model: modelToUse,
      temperature: 0.3,
      max_completion_tokens: Math.min(maxLength * 2, 1000),
      top_p: 0.9
    }

    const data = await makeChatCompletion(request)
    const generatedSummary = data.choices[0]?.message?.content || ''
    
    // Ensure the summary doesn't exceed maxLength
    return generatedSummary.length > maxLength 
      ? generatedSummary.substring(0, maxLength - 3) + '...' 
      : generatedSummary
  } catch (error) {
    console.error('Error calling Albert API for constrained summary:', error)
    // Fallback to placeholder implementation
    if (text.length <= maxLength) {
      return text
    }
    
    if (preserveSentences) {
      const sentences = text.split(/[.!?]/)
      let result = ''
      
      for (const sentence of sentences) {
        if ((result + sentence).length <= maxLength) {
          result += sentence + '.'
        } else {
          break
        }
      }
      
      return result || text.substring(0, maxLength) + '...'
    }
    
    return text.substring(0, maxLength) + '...'
  }
} 