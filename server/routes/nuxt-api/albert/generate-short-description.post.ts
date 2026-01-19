import { DESCRIPTION_SHORT_MAX_LENGTH } from '~/datagouv-components/src/functions/description'
import { createChatCompletion, useAlbertConfig, type ChatResponse } from '~/server/utils/albert-api-client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, description, organization } = body

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
          + `Your purpose is to help data producers write short, clear, and factual descriptions of datasets.\n`
          + `\n`
          + `Guidelines:\n`
          + `- Always respond in French.\n`
          + `- Your tone is factual, neutral, and accessible to non-experts.\n`
          + `- Use plain language and short sentences, without technical jargon.\n`
          + `- Do not make assumptions or add information that is not present in the input.\n`
          + `- Avoid generic phrases such as "jeu de données", "ensemble de données", or "fichier contenant".\n`
          + `- Always start with a capital letter and end with a period.\n`
          + `- The goal is to produce concise, informative summaries that improve dataset discoverability and understanding.\n`
          + `- Output should never be over ${DESCRIPTION_SHORT_MAX_LENGTH} characters.\n`
          + `- IMPORTANT: Return ONLY the description text, without quotes or additional punctuation.`,
      },
      {
        role: 'user',
        content: `You are asked to generate a short description for a dataset on data.gouv.fr.\n`
          + `\n`
          + `Goal:\n`
          + `→ Write a concise and accessible summary of the dataset (1–2 sentences, around ${DESCRIPTION_SHORT_MAX_LENGTH - 50}–${DESCRIPTION_SHORT_MAX_LENGTH} characters).\n`
          + `→ Focus on what the dataset contains and what type of information it provides — not its context or uses.\n`
          + `→ Mention key variables, geographic or temporal scope if clearly present.\n`
          + `→ Do not repeat the dataset title.\n`
          + (organization ? `→ Mention the organization.\n` : '')
          + `\n`
          + `\n`
          + `Here is the dataset information:\n`
          + `Title: ${title}\n`
          + (organization ? `Organization: ${organization}\n` : '')
          + `Description: ${description}\n`
          + `\n`
          + `Output:\n`
          + `→ A single sentence in French (no markdown, no introduction, no labels, no emojis).\n`
          + `→ Approximately ${DESCRIPTION_SHORT_MAX_LENGTH - 50}–${DESCRIPTION_SHORT_MAX_LENGTH} characters. Never more than ${DESCRIPTION_SHORT_MAX_LENGTH}.\n`
          + `\n`
          + `Example format:\n`
          + `Taux de chômage trimestriel par région en France depuis 2015, selon les données de l'INSEE.`,
      },
    ]

    // Models available for text generation:
    // - openweight-small (replaces albert-small)
    // - openweight-medium (replaces albert-large)
    // - openweight-large
    const response = await createChatCompletion(messages, 'openweight-small', albertConfig) as ChatResponse
    const generatedDescriptionShort = response.choices?.[0]?.message?.content || ''

    // Ensure the description doesn't exceed maxChars
    const finalDescriptionShort = generatedDescriptionShort.length > DESCRIPTION_SHORT_MAX_LENGTH
      ? `${generatedDescriptionShort.substring(0, DESCRIPTION_SHORT_MAX_LENGTH - 1)}…`
      : generatedDescriptionShort

    return { descriptionShort: finalDescriptionShort }
  }
  catch (error) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message || 'Failed to call Albert API',
    })
  }
})
