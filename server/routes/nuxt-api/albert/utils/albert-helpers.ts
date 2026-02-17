import { type ChatResponse, createChatCompletion, useAlbertConfig } from '~/server/utils/albert-api-client'

/**
 * Validates that Albert API is properly configured
 * @throws {Error} If Albert API key is not configured
 */
export function validateAlbertConfig() {
  const runtimeConfig = useRuntimeConfig()
  if (!runtimeConfig.albertApiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Albert API is not configured',
    })
  }
}

/**
 * Calls Albert API with the given messages and model
 * @param messages - Array of chat messages (system and user prompts)
 * @param model - Model to use for generation (default: 'openweight-small')
 * @returns The generated content from Albert API
 * @throws {Error} If the API call fails
 */
export async function callAlbertAPI(
  messages: Array<{ role: string, content: string }>,
  model = 'openweight-small',
) {
  try {
    const albertConfig = useAlbertConfig()
    const response = await createChatCompletion(messages, model, albertConfig) as ChatResponse
    return response.choices?.[0]?.message?.content || ''
  }
  catch (error) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message || 'Failed to call Albert API',
    })
  }
}
