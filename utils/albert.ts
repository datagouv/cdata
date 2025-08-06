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
}

interface ChatCompletionResponse {
  id: string
  choices: Array<{
    finish_reason: string
    index: number
    message: {
      content: string | null
      role: string
    }
  }>
  created: number
  model: string
  object: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    cost: number
  }
}

/**
 * Generate a summary from text using Albert LLM API
 * @param text - The text to summarize
 * @returns Promise<string> - The generated summary
 */
export async function generateSummary(text: string): Promise<string> {
  try {
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
      model: 'mistral-large-latest', // Using a text-generation model
      temperature: 0.3,
      max_completion_tokens: 500
    }

    const response = await fetch(`${ALBERT_API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ALBERT_API_KEY || ''}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Albert API error: ${response.status} ${response.statusText}`)
    }

    const data: ChatCompletionResponse = await response.json()
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
 * @returns Promise<string> - The generated short description
 */
export async function generateShortDescription(fullDescription: string): Promise<string> {
  try {
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
      model: 'mistral-large-latest',
      temperature: 0.2,
      max_completion_tokens: 200
    }

    const response = await fetch(`${ALBERT_API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ALBERT_API_KEY || ''}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Albert API error: ${response.status} ${response.statusText}`)
    }

    const data: ChatCompletionResponse = await response.json()
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
 * @returns Promise<string> - The generated summary
 */
export async function generateSummaryWithConstraints(
  text: string, 
  maxLength: number = 150, 
  preserveSentences: boolean = true
): Promise<string> {
  try {
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
      model: 'mistral-large-latest',
      temperature: 0.3,
      max_completion_tokens: Math.min(maxLength * 2, 1000)
    }

    const response = await fetch(`${ALBERT_API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ALBERT_API_KEY || ''}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Albert API error: ${response.status} ${response.statusText}`)
    }

    const data: ChatCompletionResponse = await response.json()
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