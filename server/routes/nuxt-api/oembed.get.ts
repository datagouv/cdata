function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  }
  catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  // Manual validation
  const url = query.url ? String(query.url).trim() : ''
  const maxheight = query.maxheight ? Number(query.maxheight) : 0
  const maxwidth = query.maxwidth ? Number(query.maxwidth) : 0

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return {
      version: '1.0',
      type: 'rich',
      html: '<div>Erreur : URL invalide ou manquante</div>',
    }
  }

  // Validate maxheight and maxwidth
  if (isNaN(maxheight) || maxheight < 0) {
    return {
      version: '1.0',
      type: 'rich',
      html: '<div>Erreur : maxheight invalide</div>',
    }
  }

  if (isNaN(maxwidth) || maxwidth < 0) {
    return {
      version: '1.0',
      type: 'rich',
      html: '<div>Erreur : maxwidth invalide</div>',
    }
  }

  // Remove empty string from array
  const splitted = url.split('/').filter(Boolean)
  const slug = splitted.pop()
  const object = splitted.pop()
  const width = maxwidth ? `${maxwidth}px` : '100%'
  const height = `${maxheight ? maxheight : '180'}px`

  return {
    version: '1.0',
    type: 'rich',
    html: `<div><iframe style="width:${width};height:${height};" src="${config.public.frontBase}/embeds/${object}/${slug}"></iframe></div>`,
  }
})
