import { DESCRIPTION_SHORT_MAX_LENGTH } from '~/datagouv-components/src/functions/datasets'
import { AlbertAPIClient } from '~/server/utils/albert-api-client'


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { description } = body

    if (!description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Description is required'
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
        content: `Tu es un assistant spécialisé dans la création de descriptions courtes. Tu dois créer une description courte (maximum ${DESCRIPTION_SHORT_MAX_LENGTH} caractères) qui résume efficacement le contenu principal. IMPORTANT: Retourne UNIQUEMENT le texte de la description, sans guillemets ni ponctuation supplémentaire.`
      },
      {
        role: 'user',
        content: `Crée une description courte (max ${DESCRIPTION_SHORT_MAX_LENGTH} caractères) basée sur cette description complète. Retourne uniquement le texte sans guillemets :\n\n${description}`
      }
    ]
  
    // As of 2025/08, models available for text generation:
    // - albert-small
    // - AgentPublic/albert-spp-8b
    // - albert-code-beta
    // - albert-ministral
    const response = await albertClient.chat_completions(messages, 'albert-small')
    const generatedShortDescription = response.choices?.[0]?.message?.content || ''

    // Ensure the description doesn't exceed maxChars
    const finalDescription = generatedShortDescription.length > DESCRIPTION_SHORT_MAX_LENGTH
      ? `${generatedShortDescription.substring(0, DESCRIPTION_SHORT_MAX_LENGTH - 1)}…`
      : generatedShortDescription
    
    return { shortDescription: finalDescription }
  } catch (error: any) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to call Albert API'
    })
  }
})
