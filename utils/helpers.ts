import type { FieldsErrors } from '~/types/form'

export function useAbsoluteUrlToRelative() {
  const currentUrl = useRequestURL()

  return (url: string): string => {
    try {
      const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`

      if (!url.startsWith(baseUrl)) return url
      return url.slice(baseUrl.length)
    }
    catch {
      // This is not an absolute URL, return the raw one
    }

    return url
  }
}

function trimEndSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function useIsCurrentUrl() {
  const absoluteUrlToRelative = useAbsoluteUrlToRelative()
  const route = useRoute()

  return (url: string): boolean => {
    return trimEndSlash(absoluteUrlToRelative(url)) === trimEndSlash(route.fullPath)
  }
}

export function humanJoin(source: Array<string>): string {
  const array = [...source]

  const { t } = useTranslation()
  if (!array.length) return ''
  if (array.length === 1) return array[0]

  const last = array.pop()
  return `${array.join(', ')} ${t('et')} ${last}`
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
    if (queryParam && route.hash.startsWith(`#${from}-`)) {
      const query = {} as Record<string, string>
      query[queryParam] = route.hash.substring(`#${from}-`.length)
      await navigateTo({ path: to, query }, { redirectCode: 301 })
      return
    }
  }
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function useJsonLd(type: 'dataset' | 'dataservice' | 'organization', id: string) {
  /**
   * First we included the full JSON-LD inline in a script tag for Google but it adds
   * a lot of perfomances problems for datasets or organizations with a lot of resources.
   * By W3C, JSON-LD could be linked in a <link> alternate tag. Google doesn't seems to support
   * this way of doing but the DCAT in JSON-LD exposition may not be understand by Google either.
   *
   * https://www.w3.org/TR/json-ld11/#alternate-document-location
   */
  const url = {
    dataset: `/api/1/datasets/${id}/rdf.jsonld`,
    dataservice: `/api/1/dataservices/${id}/rdf.jsonld`,
    organization: `/api/1/organizations/${id}/catalog.jsonld`,
  }[type]

  useHead({
    link: [
      {
        type: 'application/ld+json',
        rel: 'alternate',
        href: url,
      },
    ],
  })
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export function getAllErrorsInErrorFields(errors: FieldsErrors, key: string): string | null {
  if (!(key in errors)) return null
  if (!errors[key].length) return null
  return errors[key].join(', ')
}

export function removeLangPrefix(url: string): string {
  return url.replace(/^\/(fr)|(en)/, '')
}
