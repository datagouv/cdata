import { DESCRIPTION_MIN_LENGTH } from '~/datagouv-components/src/functions/description'
import { callAlbertAPI } from './utils/albert-helpers'
import {
  MAX_COMBINED_EXCERPT_CHARS,
  MIN_COMBINED_EXCERPT_CHARS,
} from '~/utils/read-dataset-file-excerpt'

const MAXIMUM_PROMPT_LENGTH = 120_000

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, organization, fileExcerpt } = body

  if (!title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const excerpt = typeof fileExcerpt === 'string' ? fileExcerpt.trim() : ''
  if (!excerpt || excerpt.length < MIN_COMBINED_EXCERPT_CHARS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File excerpt is required and must contain enough text',
    })
  }

  if (excerpt.length > MAX_COMBINED_EXCERPT_CHARS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File excerpt exceeds maximum length',
    })
  }

  const systemContent = `You are an assistant integrated into data.gouv.fr, the French open data platform.
Your purpose is to help data producers write clear, comprehensive, and factual long descriptions of datasets.

Guidelines:
- Always respond in French.
- Your tone is factual, neutral, and accessible to non-experts.
- Use plain language and clear sentences; use Markdown when it helps structure (headings ##, bullet lists).
- Do not make assumptions or add information that is not clearly supported by the excerpt or title.
- Cover content, structure, and limits of the data when the excerpt allows it (variables, scope, updates, methodology if present).
- Always start the main text with a capital letter.
- IMPORTANT: Return ONLY the description text (Markdown allowed), without a preamble or labels such as "Description:".`

  const userContent = `You are asked to generate a long description for a dataset on data.gouv.fr.

Goal:
→ Write a detailed, reusable description that helps people understand what the dataset contains and how to use it.
→ Reflect only what can be inferred from the excerpt below (column names, codes, dates, geography, etc. when visible).
→ If the excerpt is only a data sample, describe the likely subject matter and structure without inventing methodology or sources not shown.

Dataset title: ${title.trim()}
${organization ? `Producer organization: ${organization}\n` : ''}
Excerpt from uploaded file(s):

${excerpt}

Output:
→ A description in French with Markdown allowed (e.g. ## sections, lists).
→ Minimum length: at least ${DESCRIPTION_MIN_LENGTH} characters.
→ No generic filler about "open data" unless the excerpt supports it.`

  const totalLength = systemContent.length + userContent.length
  if (totalLength > MAXIMUM_PROMPT_LENGTH) {
    throw createError({
      statusCode: 422,
      statusMessage: `The excerpt is too long to process (${totalLength} characters, maximum ${MAXIMUM_PROMPT_LENGTH}).`,
    })
  }

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent },
  ]

  const generatedDescription = (await callAlbertAPI(messages, 'openweight-small')).trim()

  if (generatedDescription.length < DESCRIPTION_MIN_LENGTH) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The model could not generate a sufficient description. Try a more descriptive text or CSV with headers.',
    })
  }

  return { description: generatedDescription }
})
