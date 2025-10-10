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
        content: `You are an assistant integrated into data.gouv.fr, the French open data platform.
Your purpose is to help data producers write short, clear, and factual descriptions of datasets.

Guidelines:
- Always respond in French.
- Your tone is factual, neutral, and accessible to non-experts.
- Use plain language and short sentences, without technical jargon.
- Do not make assumptions or add information that is not present in the input.
- Avoid generic phrases such as "jeu de données", "ensemble de données", or "fichier contenant".
- Always start with a capital letter and end with a period.
- The goal is to produce concise, informative summaries that improve dataset discoverability and understanding.
- Output should never be over ${DESCRIPTION_SHORT_MAX_LENGTH} characters.
- IMPORTANT: Return ONLY the description text, without quotes or additional punctuation.`
      },
      {
        role: 'user',
        content: `You are asked to generate a short description for a dataset on data.gouv.fr.

Goal:
→ Write a concise and accessible summary of the dataset (1–2 sentences, around ${DESCRIPTION_SHORT_MAX_LENGTH - 50}–${DESCRIPTION_SHORT_MAX_LENGTH} characters).
→ Focus on what the dataset contains and what type of information it provides — not its context or uses.
→ Mention key variables, geographic or temporal scope if clearly present.
→ Do not repeat the dataset title.
→ Mention the organization.


Input context:
- Title
- Description
- Organisation

Output:
→ A single sentence in French (no markdown, no introduction, no labels, no emojis).
→ Approximately ${DESCRIPTION_SHORT_MAX_LENGTH - 50}–${DESCRIPTION_SHORT_MAX_LENGTH} characters. Never more than ${DESCRIPTION_SHORT_MAX_LENGTH}.

Example:
Input:
  Title: Taux de chômage par région
  Description: Données trimestrielles issues de l'INSEE sur le taux de chômage dans les régions françaises depuis 2015.
Output:
  Taux de chômage trimestriel par région en France depuis 2015, selon les données de l'INSEE.`
      }
    ]
  
    // As of 2025/08, models available for text generation:
    // - albert-small
    // - AgentPublic/albert-spp-8b
    // - albert-code-beta
    // - albert-ministral
    const response = await albertClient.chat_completions(messages, 'albert-small')
    const generatedDescriptionShort = response.choices?.[0]?.message?.content || ''

    // Ensure the description doesn't exceed maxChars
    const finalDescriptionShort = generatedDescriptionShort.length > DESCRIPTION_SHORT_MAX_LENGTH
      ? `${generatedDescriptionShort.substring(0, DESCRIPTION_SHORT_MAX_LENGTH - 1)}…`
      : generatedDescriptionShort
    
    return { descriptionShort: finalDescriptionShort }
  } catch (error: any) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to call Albert API'
    })
  }
})
