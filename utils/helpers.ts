export function humanJoin(source: Array<string>): string {
  const array = [...source]

  const nuxtApp = useNuxtApp()
  if (!array.length) return ''
  if (array.length === 1) return array[0]

  const last = array.pop()
  return `${array.join(', ')} ${nuxtApp.$i18n.t('and')} ${last}`
}

export async function redirectLegacyHashes(instructions: Array<{ from: string, to: string, queryParam?: string }>): Promise<void> {
  const route = useRoute()
  if (!route.hash) return

  for (const { from, to, queryParam } of instructions) {
    if (route.hash === `#/${from}`) {
      await navigateTo(to, { redirectCode: 301 })
      return
    }
    if (queryParam && route.hash.startsWith(`#/${from}/`)) {
      const query = {} as Record<string, string>
      query[queryParam] = route.hash.substring(`#/${from}/`.length)
      await navigateTo({ path: to, query }, { redirectCode: 301 })
      return
    }
  }
}

export async function useJsonLd(type: 'dataset' | 'dataservice' | 'organization', id: string) {
  const url = {
    dataset: `/api/1/datasets/${id}/rdf.jsonld`,
    dataservice: `/api/1/dataservices/${id}/rdf.jsonld`,
    organization: `/api/1/organizations/${id}/catalog.jsonld`,
  }[type]

  const { data: jsonld } = await useAPI(url)

  useHead({
    script: [
      {
        type: 'application/ld-json',
        textContent: jsonld,
      },
    ],
  })
}
