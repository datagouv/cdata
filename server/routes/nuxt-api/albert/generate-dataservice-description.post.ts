import { DESCRIPTION_MIN_LENGTH } from '~/datagouv-components/src/functions/description'
import { callAlbertAPI } from './utils/albert-helpers'
import { fetchDocumentationContent } from './utils/fetch-documentation'

/**
 * Maximum total prompt length in characters (not tokens).
 * Covers the full payload sent to the model: system message + user message, where the user
 * message includes the prompt template and the formatted documentation content (technical
 * and/or machine) fetched from the URLs. openweight-small/medium: 128k tokens,
 * openweight-large: 256k tokens; 120k chars ≈ 30k tokens leaves ample headroom. Large API
 * specs may still hit this limit and trigger a "documentation too long" error.
 */
const MAXIMUM_PROMPT_LENGTH = 120_000

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, technicalDocumentationUrl, machineDocumentationUrl } = body

  if (!title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const technicalUrl = technicalDocumentationUrl?.trim() || ''
  const machineUrl = machineDocumentationUrl?.trim() || ''
  if (!technicalUrl && !machineUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Either technical documentation URL or machine documentation URL is required',
    })
  }

  const systemContent = `You are an assistant integrated into data.gouv.fr, the French open data platform.
Your purpose is to help API producers write clear, comprehensive, and factual descriptions of APIs.

Guidelines:
- Always respond in French.
- Your tone is factual, neutral, and accessible to non-experts.
- Use plain language and clear sentences, avoiding unnecessary technical jargon.
- Do not make assumptions or add information that is not present in the input.
- Focus on what the API does, what data it provides, and how it can be used.
- Always start with a capital letter and end with a period.
- The goal is to produce informative descriptions that help users understand the API's purpose and capabilities.
- IMPORTANT: Return ONLY the description text, without quotes or additional punctuation.`

  let technicalContent = ''
  let machineContent = ''

  const fetchPromises: Promise<void>[] = []
  if (technicalUrl) {
    fetchPromises.push(
      fetchDocumentationContent(technicalUrl)
        .then((content) => { technicalContent = content })
        .catch((err) => {
          throw createError({
            statusCode: 422,
            statusMessage: err instanceof Error ? err.message : 'Failed to load technical documentation URL.',
          })
        }),
    )
  }
  if (machineUrl) {
    fetchPromises.push(
      fetchDocumentationContent(machineUrl)
        .then((content) => { machineContent = content })
        .catch((err) => {
          throw createError({
            statusCode: 422,
            statusMessage: err instanceof Error ? err.message : 'Failed to load machine documentation URL.',
          })
        }),
    )
  }

  await Promise.all(fetchPromises)

  if (!technicalContent && !machineContent) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The documentation URLs returned no usable content. Please check that the links point to readable API documentation (e.g. OpenAPI/Swagger or a technical doc page).',
    })
  }

  const documentationParts: string[] = []
  if (technicalContent) {
    documentationParts.push(`Technical documentation content:\n\n${technicalContent}`)
  }
  if (machineContent) {
    documentationParts.push(`Machine documentation content (OpenAPI/Swagger):\n\n${machineContent}`)
  }

  const userContent = `You are asked to generate a description for an API on data.gouv.fr.

Goal:
→ Write a comprehensive and accessible description of the API.
→ Focus on what the API does, what data it provides, and its main capabilities.
→ Mention key endpoints, data types, and use cases if available.
→ Explain the API's purpose and how it can be used.

Here is the API information:

Title: ${title.trim()}

${documentationParts.join('\n\n---\n\n')}

Output:
→ A comprehensive description in French (no markdown, no introduction, no labels, no emojis).
→ The description should be detailed enough to help users understand the API's purpose and capabilities.
→ Minimum length: at least ${DESCRIPTION_MIN_LENGTH} characters.`

  const totalLength = systemContent.length + userContent.length
  if (totalLength > MAXIMUM_PROMPT_LENGTH) {
    throw createError({
      statusCode: 422,
      statusMessage: `The documentation is too long to process (${totalLength} characters, maximum ${MAXIMUM_PROMPT_LENGTH}). Please use shorter documentation or provide a single, smaller documentation URL.`,
    })
  }

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent },
  ]

  // Models available for text generation:
  // - openweight-small (replaces albert-small): 128k tokens
  // - openweight-medium (replaces albert-large): 128k tokens
  // - openweight-large: 256k tokens
  const generatedDescription = (await callAlbertAPI(messages, 'openweight-small')).trim()

  if (generatedDescription.length < DESCRIPTION_MIN_LENGTH) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The model could not generate a sufficient description. Please try again or provide more detailed documentation.',
    })
  }

  return { description: generatedDescription }
})
