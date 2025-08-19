import { AlbertAPIClient } from '~/server/utils/albert-api-client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { description, minTagsNb = 1, maxTagsNb = 6 } = body

    if (!description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Description is required'
      })
    }

    // Validate tags nb limits
    if (minTagsNb < 1 || maxTagsNb > 20 || minTagsNb > maxTagsNb) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid tags nb limits. minTagsNb must be >= 1, maxTagsNb must be <= 20, and minTagsNb <= maxTagsNb'
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
        content: `Tu es un assistant spécialisé dans l'extraction de mots-clés pertinents à partir de descriptions de jeux de données. Tu dois extraire entre ${minTagsNb} et ${maxTagsNb} mots-clés qui caractérisent le mieux le contenu. IMPORTANT: Retourne UNIQUEMENT la liste des mots-clés séparés par des virgules, sans numérotation, sans guillemets, sans ponctuation supplémentaire. Format attendu: mot1, mot2, mot3`
      },
      {
        role: 'user',
        content: `Extrais entre ${minTagsNb} et ${maxTagsNb} mots-clés pertinents à partir de cette description de jeu de données. Retourne uniquement la liste séparée par des virgules :\n\n${description}`
      }
    ]
  
    // As of 2025/08, models available for text generation:
    // - albert-small
    // - AgentPublic/albert-spp-8b
    // - albert-code-beta
    // - albert-ministral
    const response = await albertClient.chat_completions(messages, 'albert-small')
    const generatedTags = response.choices?.[0]?.message?.content || ''

    // Parse the comma-separated tags and clean them
    const tags = generatedTags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .slice(0, maxTagsNb) // Ensure maximum tags limit
    
    return { tags }
  } catch (error: any) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to call Albert API'
    })
  }
})
