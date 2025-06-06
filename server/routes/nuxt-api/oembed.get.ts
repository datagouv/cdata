import { z } from 'zod'

const oembedSchema = z.object({
  /**
   * from https://oembed.com/
   */
  url: z.string().trim().url(),
  maxheight: z.coerce.number().optional().default(0),
  maxwidth: z.coerce.number().optional().default(0),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, params => oembedSchema.safeParse(params))
  const config = useRuntimeConfig()

  if (!query.success)
    throw query.error.issues

  // Remove empty string from array
  const splitted = query.data.url.split('/').filter(Boolean)
  const slug = splitted.pop()
  const object = splitted.pop()
  const width = query.data.maxwidth ? `${query.data.maxwidth}px` : '100%'
  const height = `${query.data.maxheight ? query.data.maxheight : '180'}px`

  return {
    version: '1.0',
    type: 'rich',
    html: `<div><iframe style="width:${width};height:${height};" src="${config.public.frontBase}/embeds/${object}/${slug}"></iframe></div>`,
  }
})
