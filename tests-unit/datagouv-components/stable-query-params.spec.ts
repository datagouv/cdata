import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useStableQueryParams } from '~/datagouv-components/src/composables/useStableQueryParams'
import type { SearchTypeConfig } from '~/datagouv-components/src/types/search'

function setup() {
  const q = ref('')
  const sort = ref<string | undefined>(undefined)
  const page = ref(1)
  const tag = ref<string | undefined>(undefined)
  const typeConfig: SearchTypeConfig = {
    class: 'datasets',
    basicFilters: ['tag'],
    sortOptions: [{ value: '-created', label: 'Plus récents' }],
  }
  const { params, facetParams } = useStableQueryParams({
    typeConfig,
    allFilters: { tag },
    customFilterRegistry: new Map(),
    q,
    sort,
    page,
    pageSize: 20,
  })
  return { q, sort, page, tag, params, facetParams }
}

describe('useStableQueryParams', () => {
  it('excludes sort and page from facetParams', () => {
    const { params, facetParams } = setup()

    expect(params.value).toEqual({ page: 1, page_size: 20 })
    expect(facetParams.value).toEqual({})
  })

  it('keeps facetParams identity stable when only sort or page change', async () => {
    const { sort, page, params, facetParams } = setup()
    const before = facetParams.value

    sort.value = '-created'
    await nextTick()
    expect(params.value.sort).toBe('-created')
    expect(facetParams.value).toBe(before)

    page.value = 2
    await nextTick()
    expect(params.value.page).toBe(2)
    expect(facetParams.value).toBe(before)
  })

  it('updates facetParams when a facet-affecting param changes', async () => {
    const { q, tag, facetParams } = setup()
    const before = facetParams.value

    tag.value = 'energy'
    await nextTick()
    expect(facetParams.value).toEqual({ tag: 'energy' })
    expect(facetParams.value).not.toBe(before)

    const afterTag = facetParams.value
    q.value = 'test'
    await nextTick()
    expect(facetParams.value).toEqual({ tag: 'energy', q: 'test' })
    expect(facetParams.value).not.toBe(afterTag)
  })
})
