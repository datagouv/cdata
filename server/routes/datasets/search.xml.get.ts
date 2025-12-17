interface Dataset {
  title: string
  slug: string
  description: string | null
  created_at: string
  organization?: {
    name: string
  }
  owner?: {
    first_name: string
    last_name: string
  }
}

interface DatasetsResponse {
  data: Dataset[]
  total: number
}

const ALLOWED_PARAMS = [
  'q', 'sort', 'tag', 'license', 'format', 'organization', 'owner',
  'badge', 'geozone', 'granularity', 'topic',
]

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const pageSize = Math.min(Math.max(Number(query.page_size) || 20, 1), 100)

  const params = new URLSearchParams({ page_size: String(pageSize) })

  // Tri par date de création décroissante par défaut
  if (!query.sort) {
    params.set('sort', '-created')
  }

  for (const key of ALLOWED_PARAMS) {
    const value = query[key]
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)))
      }
      else {
        params.set(key, String(value))
      }
    }
  }

  let datasets: Dataset[] = []
  let total = 0

  try {
    const response = await $fetch<DatasetsResponse>(
      `${config.public.apiBase}/api/1/datasets/?${params}`,
    )
    datasets = response.data
    total = response.total
  }
  catch {
    setResponseStatus(event, 502)
    return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Erreur</title><description>Impossible de récupérer les données</description></channel></rss>'
  }

  const q = query.q ? String(query.q).trim() : ''
  const hasFilters = params.toString() !== `page_size=${pageSize}`

  const searchUrl = hasFilters
    ? `${config.public.frontBase}/datasets/search?${params}`
    : `${config.public.frontBase}/datasets`

  const channelTitle = q
    ? `data.gouv.fr - Recherche : ${escapeXml(q)}`
    : 'data.gouv.fr - Jeux de données'

  const channelDescription = hasFilters
    ? `${total} résultats sur data.gouv.fr`
    : `Les derniers jeux de données publiés sur data.gouv.fr`

  const items = datasets.map((dataset) => {
    const author = dataset.organization?.name
      || (dataset.owner ? `${dataset.owner.first_name} ${dataset.owner.last_name}` : '')

    return `    <item>
      <title><![CDATA[${dataset.title}]]></title>
      <link>${config.public.frontBase}/datasets/${dataset.slug}</link>
      <description><![CDATA[${dataset.description || ''}]]></description>
      <pubDate>${new Date(dataset.created_at).toUTCString()}</pubDate>
      ${author ? `<author><![CDATA[${author}]]></author>` : ''}
      <guid>${config.public.frontBase}/datasets/${dataset.slug}</guid>
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${channelTitle}</title>
    <link>${searchUrl}</link>
    <description>${channelDescription}</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return rss
})
