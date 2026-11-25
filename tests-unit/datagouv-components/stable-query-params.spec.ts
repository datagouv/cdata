import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useStableQueryParams } from '~/datagouv-components/src/composables/useStableQueryParams'
import type { SearchTypeConfig } from '~/datagouv-components/src/types/search'

const datasets: SearchTypeConfig = {
  class: 'datasets',
  basicFilters: ['tag'],
  sortOptions: [{ value: '-created', label: 'Plus récents' }],
}

const reuses: SearchTypeConfig = {
  class: 'reuses',
  basicFilters: ['tag'],
  sortOptions: [{ value: '-created', label: 'Plus récents' }],
}

function setup() {
  const q = ref('')
  const sort = ref<string | undefined>(undefined)
  const page = ref(1)
  const tag = ref<string | undefined>(undefined)
  const currentType = ref('datasets')
  const shared = {
    allFilters: { tag },
    customFilterRegistry: new Map(),
    q,
    sort,
    page,
    pageSize: 20,
    currentType,
  }
  return {
    q,
    sort,
    page,
    tag,
    currentType,
    displayedParams: useStableQueryParams({ ...shared, typeConfig: datasets }),
    otherParams: useStableQueryParams({ ...shared, typeConfig: reuses }),
  }
}

describe('useStableQueryParams', () => {
  it('only sends sort and pagination to the displayed type', async () => {
    const { sort, page, displayedParams, otherParams } = setup()

    expect(displayedParams.value).toEqual({ page: 1, page_size: 20 })
    expect(otherParams.value).toEqual({ page_size: 1 })

    sort.value = '-created'
    page.value = 2
    await nextTick()

    expect(displayedParams.value).toEqual({ sort: '-created', page: 2, page_size: 20 })
    expect(otherParams.value).toEqual({ page_size: 1 })
  })

  it('keeps the params identity of the other types stable on sort and page changes', async () => {
    const { sort, page, otherParams } = setup()
    const before = otherParams.value

    sort.value = '-created'
    await nextTick()
    expect(otherParams.value).toBe(before)

    page.value = 2
    await nextTick()
    expect(otherParams.value).toBe(before)
  })

  it('still sends filters and q to the other types', async () => {
    const { q, tag, otherParams } = setup()

    tag.value = 'energy'
    q.value = 'test'
    await nextTick()

    expect(otherParams.value).toEqual({ tag: 'energy', q: 'test', page_size: 1 })
  })

  it('swaps sort and pagination over when the displayed type changes', async () => {
    const { page, currentType, displayedParams, otherParams } = setup()

    page.value = 2
    await nextTick()
    currentType.value = 'reuses'
    await nextTick()

    // page is reset by GlobalSearch on type change; here it stays at 2 to show
    // which type carries it.
    expect(otherParams.value).toEqual({ page: 2, page_size: 20 })
    expect(displayedParams.value).toEqual({ page_size: 1 })
  })
})
