import type { FacetItem, OrganizationSource } from '../types/search'

/**
 * The `organization_id_with_name` facet encodes both the organization id and its
 * display name in a single string, e.g. "534fff7aa3a7292c64a77e0c|Métropole de Lyon".
 * The first separator wins: organization names legitimately contain "|".
 */
const FACET_SEPARATOR = '|'

/**
 * Pseudo facet entry holding the total, as opposed to a real organization.
 */
const FACET_ALL = 'all'

/**
 * An organization offered in the search filters. Facet-derived options carry a
 * result count and no logo, suggest-derived options carry a logo and a count only
 * when the organization also appears in the current facet.
 */
export type OrganizationOption = {
  id: string
  name: string
  count?: number
  image_url?: string
}

/**
 * Maps each organization id to the count it holds in the current search facet, so
 * that suggest results reached by name can be annotated with the same count as the
 * facet shortlist. Organizations absent from the facet (e.g. beyond its cap) keep
 * no count.
 */
export function facetCountById(facets: FacetItem[] | undefined): Map<string, number> {
  const byId = new Map<string, number>()
  for (const option of facetOptions(facets)) {
    if (option.count !== undefined) byId.set(option.id, option.count)
  }
  return byId
}

/**
 * Turns the `organization_id_with_name` facet into selectable options, keeping the
 * count of each organization. The facet is only meaningful once the results have
 * been narrowed by a query or a filter: with no narrowing it is just the global
 * top publishers, and it is capped, so it cannot replace a full-text lookup.
 */
export function facetOptions(facets: FacetItem[] | undefined): OrganizationOption[] {
  const options: OrganizationOption[] = []

  for (const facet of facets ?? []) {
    if (facet.name === FACET_ALL) continue

    const separatorIndex = facet.name.indexOf(FACET_SEPARATOR)
    if (separatorIndex === -1) continue

    const id = facet.name.slice(0, separatorIndex)
    const name = facet.name.slice(separatorIndex + FACET_SEPARATOR.length)
    if (!id || !name) continue

    options.push({ id, name, count: facet.count })
  }

  return options
}

/**
 * Picks where the organization options come from, following the configured
 * `source`. Whatever the source, the suggest endpoint takes over when the search
 * exposes no usable facet — the `organizations` search has none, and a result set
 * with no match left has none either. An unusable filter would be worse than a
 * partial one.
 */
export async function resolveOrganizationOptions(options: {
  query: string
  source: OrganizationSource
  /**
   * Whether a query or a filter narrowed the current results down, which is what
   * makes the facet a short and relevant shortlist rather than the global top
   * publishers. Ignored unless the source is `facets-then-suggest`.
   */
  resultsNarrowed: boolean
  facets: FacetItem[] | undefined
  suggest: (query: string) => Promise<OrganizationOption[]>
}): Promise<OrganizationOption[]> {
  const { query, source, resultsNarrowed, facets, suggest } = options

  if (source !== 'suggest') {
    // In the mixed source the facets hand over to suggest as soon as the user
    // types, since the facet is capped: it must not be the only way to reach an
    // organization.
    const facetsAreTheOptionList = source === 'facets' || (resultsNarrowed && !query)
    if (facetsAreTheOptionList) {
      const fromFacets = facetOptions(facets)
      if (fromFacets.length) return Promise.resolve(fromFacets)
    }
  }

  // Whatever the source, annotate the suggest results with the counts held in the
  // current facet, so the same organization carries the same count whether it is
  // reached through the facet shortlist or by typing its name. This keeps the count
  // signal aligned between organizations inside the facet and those only reachable
  // through suggest. It only applies in the mixed source once the results are
  // narrowed: with no narrowing the facet is just the global top publishers, and
  // attaching those counts to suggest results would be misleading.
  const countsById = resultsNarrowed && source === 'facets-then-suggest' ? facetCountById(facets) : undefined
  const suggested = await suggest(query)
  return suggested.map(option => (countsById?.has(option.id) ? { ...option, count: countsById.get(option.id) } : option))
}
