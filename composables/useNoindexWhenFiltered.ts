// Keeps the filtered variants of a listing page out of the search index: they are
// subsets of the bare page, and the filters combine into as many URLs as there are
// value combinations. `nofollow` on top because those variants are crawled far more
// than they are visited, and every link they carry is one more URL to fetch.
export function useNoindexWhenFiltered() {
  const route = useRoute()

  useSeoMeta({
    robots: () => Object.keys(route.query).length > 0 ? 'noindex, nofollow' : undefined,
  })
}
