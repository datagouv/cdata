import { createChatCompletion, useAlbertConfig, type ChatResponse } from '~/server/utils/albert-api-client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, description, organization, nbTags = 5 } = body

  if (!title || !description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and description are required',
    })
  }

  const runtimeConfig = useRuntimeConfig()

  if (!runtimeConfig.albertApiKey) {
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
          + `Your task is to identify and synthesize the main topics of a dataset as five normalized keywords.\n`
          + `\n`
          + `Task goal:\n`
          + `Generate exactly ${nbTags} keywords that best represent the dataset's content.\n`
          + `Your goal is to improve search and discoverability through clear, consistent terms.\n`
          + `\n`
          + `Semantic guidance:\n`
          + `- Respond in French only.\n`
          + `- When possible, align the keywords with existing EuroVoc concepts in French (invisibly).\n`
          + `- Focus on the dataset's topics, not its context or technical structure.\n`
          + `\n`
          + `🧾Normalization rules:\n`
          + `1. Use simple, concrete words (1–3 words max).\n`
          + `2. Avoid repeating the dataset title.\n`
          + `3. Avoid generic words like "données", "open-data", or "jeu-de-donnees".\n`
          + `4. Avoid technical jargon unless necessary.\n`
          + `5. Use lowercase, singular, no accents, words separated by hyphens, keywords separated by commas.\n`
          + `6. Remove duplicates or close synonyms.\n`
          + `\n`
          + `Output format:\n`
          + `- Exactly ${nbTags} keywords, separated by commas, and nothing else in the output.\n`
          + `- No explanations, no labels, no extra punctuation.\n`
          + `- Follow this example format: qualite-air, pollution, mesure, station-urbaine, environnement\n`
          + `\n`
          + `Your answer must strictly match this format.`,
      },
      {
        role: 'user',
        content: `You are asked to generate ${nbTags} keywords for the following dataset.\n`
          + `\n`
          + `The title describes the main topic, the description explains the content,\n`
          + `and the organisation indicates the source or domain of activity.\n`
          + `\n`
          + `Goal:\n`
          + `→ Suggest ${nbTags} normalized French keywords representing the dataset's content.\n`
          + `→ When possible, use wording aligned with EuroVoc concepts in French.\n`
          + `→ Focus on what the dataset is about, not on its context or structure.\n`
          + `\n`
          + `Input context:\n`
          + `- Title: ${title}\n`
          + `- Description: ${description}\n`
          + (organization ? `- Organisation: ${organization}\n` : '')
          + `\n`
          + `Output:\n`
          + `→ A single line containing ${nbTags} normalized keywords, separated by commas.\n`
          + `→ Example: energie, consommation, electricite, region, environnement`,
      },
    ]

    // As of 2025/08, models available for text generation:
    // - albert-small
    // - AgentPublic/albert-spp-8b
    // - albert-code-beta
    // - albert-ministral
    const response = await createChatCompletion(messages, 'albert-small', albertConfig) as ChatResponse
    const generatedTags = response.choices?.[0]?.message?.content || ''

    // Parse the comma-separated tags and clean them
    const tags = generatedTags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .slice(0, nbTags)

    return { tags }
  }
  catch (error) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message || 'Failed to call Albert API',
    })
  }
})
