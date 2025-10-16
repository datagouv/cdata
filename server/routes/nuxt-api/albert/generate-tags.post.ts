import { AlbertAPIClient } from '~/server/utils/albert-api-client'

const NB_TAGS = 5

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, description, organization } = body

  if (!title || !description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and description are required'
    })
  }

  const runtimeConfig = useRuntimeConfig()
  
  if (!runtimeConfig.albertApiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Albert API is not configured'
    })
  }

  try {
    const albertClient = new AlbertAPIClient(
      runtimeConfig.albertApiBaseUrl,
      runtimeConfig.albertApiKey
    )

    const messages = [
      {
        role: 'system',
        content: `You are an assistant integrated into data.gouv.fr, the French open data platform.\n` +
          `Your purpose is to help data producers generate relevant, normalized, and interoperable keywords for their datasets.\n` +
          `\n` +
          `General principles:\n` +
          `- Respond in French only.\n` +
          `- Always suggest ${NB_TAGS} keywords total:\n` +
          `  - ${NB_TAGS} free-form keywords normalized according to the rules below.\n` +
          `- When possible, align the free-form keywords to an existing EuroVoc concept in French.\n` +
          `  This alignment must remain invisible: use the EuroVoc concept to guide your choice,\n` +
          `  but do not include its URI or metadata in the output.\n` +
          `- The goal is to improve dataset discoverability through both human-readable and interoperable terms.\n` +
          `\n` +
          `Free-form keyword rules:\n` +
          `1. Use simple words or short expressions (1–3 words max).\n` +
          `2. Do not repeat the dataset title.\n` +
          `3. Avoid generic terms such as "données", "open-data", "jeu-de-donnees".\n` +
          `4. Avoid overly technical jargon unless it clearly describes the dataset.\n` +
          `5. Detect and remove duplicates or close synonyms.\n` +
          `6. Normalize all free-form keywords:\n` +
          `   - all lowercase\n` +
          `   - no accents\n` +
          `   - singular form\n` +
          `   - words separated by hyphens (-)\n` +
          `   - keywords separated by commas\n` +
          `   Example: qualite-air, transport-urbain, energie, statistique\n` +
          `\n` +
          `Output format:\n` +
          `- Return exactly ${NB_TAGS} keywords, separated by commas.\n` +
          `- Do not output explanations, URIs, or markdown.\n` +
          `- Do not show EuroVoc alignment explicitly — use it only to choose more accurate terms.`
      },
      {
        role: 'user',
        content: `You are asked to generate ${NB_TAGS} keywords for the dataset described below.\n` +
          `\n` +
          `Goal:\n` +
          `→ Suggest ${NB_TAGS} free-form normalized keywords, based on the dataset's content and guided by EuroVoc concepts in French when possible.\n` +
          `→ Focus on what the dataset is about, not on its context or structure.\n` +
          `\n` +
          `Input context:\n` +
          `- Title: ${title}\n` +
          `- Description: ${description}\n` +
          (organization ? `- Organisation: ${organization}\n` : '') +
          `\n` +
          `Output:\n` +
          `→ A single line containing exactly ${NB_TAGS} keywords, separated by commas.\n` +
          `\n` +
          `Example:\n` +
          `Input:\n` +
          `  Title: Qualité de l'air à Paris\n` +
          `  Description: Mesures quotidiennes des concentrations en polluants atmosphériques (NO₂, O₃, PM10) dans les stations urbaines.\n` +
          `Output:\n` +
          `  environnement, qualite-air, pollution, mesure, station-urbaine`
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
      .slice(0, NB_TAGS)
    
    return { tags }
  } catch (error: any) {
    console.error('Albert API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to call Albert API'
    })
  }
})
