import { AlbertAPIClient } from '~/server/utils/albert-api-client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { description, minKeywords = 1, maxKeywords = 6 } = body

    if (!description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Description is required'
      })
    }

    // Validate keyword limits
    if (minKeywords < 1 || maxKeywords > 20 || minKeywords > maxKeywords) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid keyword limits. minKeywords must be >= 1, maxKeywords must be <= 20, and minKeywords <= maxKeywords'
      })
    }

    const runtimeConfig = useRuntimeConfig()
    
    const albertClient = new AlbertAPIClient(
      runtimeConfig.public.albertApiBaseUrl,
      runtimeConfig.public.albertApiKey
    )

    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant spécialisé dans l'extraction de mots-clés pertinents à partir de descriptions de jeux de données. Tu dois extraire entre ${minKeywords} et ${maxKeywords} mots-clés qui caractérisent le mieux le contenu. IMPORTANT: Retourne UNIQUEMENT la liste des mots-clés séparés par des virgules, sans numérotation, sans guillemets, sans ponctuation supplémentaire. Format attendu: mot1, mot2, mot3`
      },
      {
        role: 'user',
        content: `Extrais entre ${minKeywords} et ${maxKeywords} mots-clés pertinents à partir de cette description de jeu de données. Retourne uniquement la liste séparée par des virgules :\n\n${description}`
      }
    ]
  
    // As of 2025/08, models available for text generation:
    // - albert-small
    // - AgentPublic/albert-spp-8b
    // - albert-code-beta
    // - albert-ministral
    const response = await albertClient.chat_completions(messages, 'albert-small')
    const generatedKeywords = response.choices?.[0]?.message?.content || ''

    // Parse the comma-separated keywords and clean them
    const keywords = generatedKeywords
      .split(',')
      .map((keyword: string) => keyword.trim())
      .filter((keyword: string) => keyword.length > 0)
      .slice(0, maxKeywords) // Ensure maximum keywords limit
    
    return { keywords }
  } catch (error: any) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to call Albert API'
    })
  }
})
