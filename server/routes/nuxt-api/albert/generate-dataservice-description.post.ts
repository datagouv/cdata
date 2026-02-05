import { createChatCompletion, useAlbertConfig, type ChatResponse } from '~/server/utils/albert-api-client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, technicalDocumentationUrl, machineDocumentationUrl } = body

  if (!title?.trim()) {
    console.error('[Albert API] Missing required field: title')
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const hasTechnical = !!technicalDocumentationUrl?.trim()
  const hasMachine = !!machineDocumentationUrl?.trim()
  if (!hasTechnical && !hasMachine) {
    console.error('[Albert API] At least one of technicalDocumentationUrl or machineDocumentationUrl is required')
    throw createError({
      statusCode: 400,
      statusMessage: 'Either technical documentation URL or machine documentation URL is required',
    })
  }

  const runtimeConfig = useRuntimeConfig()

  if (!runtimeConfig.albertApiKey) {
    console.error('[Albert API] API key not configured')
    throw createError({
      statusCode: 400,
      statusMessage: 'Albert API is not configured',
    })
  }

  try {
    const albertConfig = useAlbertConfig()

    const messages = [
      {
        role: 'system',
        content: `You are an assistant integrated into data.gouv.fr, the French open data platform.\n`
          + `Your purpose is to help API producers write clear, comprehensive, and factual descriptions of APIs.\n`
          + `\n`
          + `Guidelines:\n`
          + `- Always respond in French.\n`
          + `- Your tone is factual, neutral, and accessible to non-experts.\n`
          + `- Use plain language and clear sentences, avoiding unnecessary technical jargon.\n`
          + `- Do not make assumptions or add information that is not present in the input.\n`
          + `- Focus on what the API does, what data it provides, and how it can be used.\n`
          + `- Always start with a capital letter and end with a period.\n`
          + `- The goal is to produce informative descriptions that help users understand the API's purpose and capabilities.\n`
          + `- IMPORTANT: Return ONLY the description text, without quotes or additional punctuation.`,
      },
      {
        role: 'user',
        content: `You are asked to generate a description for an API on data.gouv.fr.\n`
          + `\n`
          + `Goal:\n`
          + `→ Write a comprehensive and accessible description of the API.\n`
          + `→ Focus on what the API does, what data it provides, and its main capabilities.\n`
          + `→ Mention key endpoints, data types, and use cases if available.\n`
          + `→ Explain the API's purpose and how it can be used.\n`
          + `\n`
          + `Here is the API information:\n`
          + `Title: ${title.trim()}\n`
          + (hasTechnical ? `Technical documentation URL: ${technicalDocumentationUrl.trim()}\n` : '')
          + (hasMachine ? `Machine documentation URL (OpenAPI/Swagger): ${machineDocumentationUrl.trim()}\n` : '')
          + `\n`
          + `Output:\n`
          + `→ A comprehensive description in French (no markdown, no introduction, no labels, no emojis).\n`
          + `→ The description should be detailed enough to help users understand the API's purpose and capabilities.`,
      },
    ]

    // Models available for text generation:
    // - openweight-small (replaces albert-small)
    // - openweight-medium (replaces albert-large)
    // - openweight-large
    const response = await createChatCompletion(messages, 'openweight-small', albertConfig) as ChatResponse
    const generatedDescription = (response.choices?.[0]?.message?.content || '').trim()

    const MIN_DESCRIPTION_LENGTH = 50
    if (generatedDescription.length < MIN_DESCRIPTION_LENGTH) {
      console.error('[Albert API] Generated description too short or empty - documentation may be unreachable or insufficient')
      throw createError({
        statusCode: 422,
        statusMessage: 'Could not generate a sufficient description from the provided documentation. Please check that the URLs are valid, reachable, and point to API documentation.',
      })
    }

    return { description: generatedDescription }
  }
  catch (error) {
    console.error('[Albert API] Error calling Albert API:', error)
    if (error && typeof error === 'object') {
      console.error('[Albert API] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        ...error,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message || 'Failed to call Albert API',
    })
  }
})
