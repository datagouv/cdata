import { validateAlbertConfig, callAlbertAPI, parseTags } from './utils/albert-helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, description, type, nbTags } = body

  if (!title || !description || !type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title, description and type are required',
    })
  }

  validateAlbertConfig()

  const messages = [
    {
      role: 'system',
      content: `You are an assistant integrated into data.gouv.fr, the French open data platform.\n`
        + `Your task is to identify and synthesize the main topics of a reuse (a digital resource created from open data) as five normalized keywords.\n`
        + `The reuse you're analyzing is of type "${type}".\n`
        + `\n`
        + `Task goal:\n`
        + `Generate exactly ${nbTags} keywords that best represent this reuse's content.\n`
        + `Your goal is to improve search and discoverability through clear, consistent terms.\n`
        + `\n`
        + `Semantic guidance:\n`
        + `- Respond in French only.\n`
        + `- When possible, align the keywords with existing EuroVoc concepts in French (invisibly).\n`
        + `- Focus on the reuse's topics, not its context or technical structure.\n`
        + `\n`
        + `🧾Normalization rules:\n`
        + `1. Use simple, concrete words (1–3 words max).\n`
        + `2. Avoid repeating the reuse title.\n`
        + `3. Avoid generic words like "données" or "open-data".\n`
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
      content: `You are asked to generate ${nbTags} keywords for the following reuse.\n`
        + `\n`
        + `The title describes the main topic, the description explains the content.\n`
        + `\n`
        + `Goal:\n`
        + `→ Suggest ${nbTags} normalized French keywords representing this reuse's content.\n`
        + `→ When possible, use wording aligned with EuroVoc concepts in French.\n`
        + `→ Focus on what the reuse is about, not on its context or structure.\n`
        + `\n`
        + `Input context:\n`
        + `- Title: ${title}\n`
        + `- Description: ${description}\n`
        + `- Type: ${type}\n`
        + `\n`
        + `Output:\n`
        + `→ A single line containing ${nbTags} normalized keywords, separated by commas.\n`
        + `→ Example: energie, consommation, electricite, region, environnement`,
    },
  ]

  // Models available for text generation:
  // - openweight-small (replaces albert-small)
  // - openweight-medium (replaces albert-large)
  // - openweight-large
  const generatedTags = await callAlbertAPI(messages, 'openweight-small')

  // Parse the comma-separated tags and clean them
  const tags = parseTags(generatedTags, nbTags)

  return { tags }
})
