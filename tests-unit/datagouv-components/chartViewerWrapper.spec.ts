// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoadingBlock from '~/datagouv-components/src/components/LoadingBlock.vue'
import ChartViewerWrapper from '~/datagouv-components/src/components/Chart/ChartViewerWrapper.vue'
import { configKey } from '~/datagouv-components/src/config'
import type { ChartForApi } from '~/datagouv-components/src/types/visualizations'

const { ofetchMock } = vi.hoisted(() => ({ ofetchMock: vi.fn() }))
vi.mock('ofetch', () => ({ ofetch: ofetchMock }))

const RESOURCE_ID = '847057e0-4c03-4099-85aa-9796fb6003bf'

function chartFixture(): ChartForApi {
  return {
    title: 'T',
    description: '',
    private: false,
    extras: {},
    x_axis: { column_x: 'dep', type: 'discrete', sort_x_by: 'axis_y', sort_x_direction: 'desc' },
    y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
    series: [{ type: 'line', column_y: 'n', aggregate_y: 'max', resource_id: RESOURCE_ID, column_x_name_override: null, filters: null }],
    owner: null,
    organization: null,
  } as unknown as ChartForApi
}

const ChartViewerStub = defineComponent({
  name: 'ChartViewer',
  props: { chart: { type: Object, required: true }, series: { type: Object, required: true } },
  setup: () => () => h('div', { class: 'chart-viewer-stub' }),
})

function rows(count: number) {
  return { data: Array.from({ length: count }, (_, i) => ({ dep: String(i), n: i })) }
}

function dataCalls(): Array<string> {
  return ofetchMock.mock.calls.map(c => String(c[0])).filter(url => url.includes('/data/'))
}

function mockApi(firstPage: number, hasFiftyFirst: boolean) {
  ofetchMock.mockImplementation(async (url: string) => {
    if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
    if (url.includes('page=51')) return rows(hasFiftyFirst ? 1 : 0)
    return rows(firstPage)
  })
}

function mountWrapper(chart: ChartForApi) {
  return mount(ChartViewerWrapper, {
    props: { chart },
    global: {
      stubs: { ChartViewer: ChartViewerStub },
      provide: { [configKey as symbol]: { tabularApiUrl: 'https://tabular.example.com', searchDebounce: 0 } },
    },
  })
}

// LoadingBlock is generic: its props are not typed through findComponent.
function loaderStatus(wrapper: ReturnType<typeof mountWrapper>): string {
  return (wrapper.findComponent(LoadingBlock).props() as { status: string }).status
}

async function settle() {
  await vi.advanceTimersByTimeAsync(10)
  await flushPromises()
}

describe('ChartViewerWrapper data fetching', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    ofetchMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('requests 50 groups sorted on the X column', async () => {
    mockApi(3, false)
    mountWrapper(chartFixture())
    await settle()
    const [url] = dataCalls()
    expect(url).toContain('page_size=50')
    expect(url).toContain('dep__sort=asc')
  })

  it('checks the 51st group only when the page is full', async () => {
    mockApi(49, false)
    mountWrapper(chartFixture())
    await settle()
    expect(dataCalls()).toHaveLength(1)

    ofetchMock.mockReset()
    mockApi(50, false)
    mountWrapper(chartFixture())
    await settle()
    const calls = dataCalls()
    expect(calls).toHaveLength(2)
    expect(calls[1]).toContain('page=51&page_size=1')
  })

  it('shows the Y-sort warning when the 51st group exists', async () => {
    mockApi(50, true)
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').text()).toBe(
      'Seules les 50 premières valeurs de dep sont prises en compte : le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.',
    )
  })

  it('shows the X-sort warning when sorted on X', async () => {
    mockApi(50, true)
    const chart = chartFixture()
    chart.x_axis.sort_x_by = 'axis_x'
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').text()).toBe('Seules les 50 premières valeurs de dep sont affichées.')
  })

  it('shows no warning when the 51st group is absent', async () => {
    mockApi(50, false)
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })

  it('does not refetch when only presentation fields change', async () => {
    mockApi(3, false)
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const count = ofetchMock.mock.calls.length
    // Any further request (profile or data) would hang and leave the loader on.
    ofetchMock.mockImplementation(() => new Promise(() => {}))
    const next = structuredClone(chart)
    next.series[0]!.type = 'histogram'
    next.title = 'Other'
    next.y_axis.unit = '%'
    next.x_axis.sort_x_direction = 'asc'
    next.x_axis.limit = 10
    await wrapper.setProps({ chart: next })
    expect(loaderStatus(wrapper)).toBe('success')
    await settle()
    expect(ofetchMock.mock.calls).toHaveLength(count)
    expect(loaderStatus(wrapper)).toBe('success')
  })

  it('does not refetch when switching between Y sort directions', async () => {
    mockApi(3, false)
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const count = dataCalls().length
    for (const direction of ['asc', 'desc'] as const) {
      const next = structuredClone(chart)
      next.x_axis.sort_x_direction = direction
      await wrapper.setProps({ chart: next })
      await settle()
    }
    expect(dataCalls()).toHaveLength(count)
  })

  it('requests the X column in descending order when sorted by X descending', async () => {
    mockApi(3, false)
    const chart = chartFixture()
    chart.x_axis.sort_x_by = 'axis_x'
    chart.x_axis.sort_x_direction = 'desc'
    mountWrapper(chart)
    await settle()
    expect(dataCalls()[0]).toContain('dep__sort=desc')
  })

  it('refetches in ascending order when the X sort switches from descending to ascending', async () => {
    mockApi(3, false)
    const chart = chartFixture()
    chart.x_axis.sort_x_by = 'axis_x'
    chart.x_axis.sort_x_direction = 'desc'
    const wrapper = mountWrapper(chart)
    await settle()
    const next = structuredClone(chart)
    next.x_axis.sort_x_direction = 'asc'
    await wrapper.setProps({ chart: next })
    await settle()
    const calls = dataCalls()
    expect(calls).toHaveLength(2)
    expect(calls[1]).toContain('dep__sort=asc')
  })

  it('keeps the data of each series on the same resource', async () => {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (url.includes('m__max')) return { data: [{ dep: 'a', m__max: 2 }] }
      return { data: [{ dep: 'a', n__max: 1 }] }
    })
    const chart = chartFixture()
    chart.series.push({ ...chart.series[0]!, column_y: 'm' })
    const wrapper = mountWrapper(chart)
    await settle()
    const data = wrapper.findComponent(ChartViewerStub).props('series').data
    expect(data[0]).toEqual([{ dep: 'a', n__max: 1 }])
    expect(data[1]).toEqual([{ dep: 'a', m__max: 2 }])
  })

  it('shows the chart before the 51st-group probe answers', async () => {
    let resolveProbe: (v: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      if (url.includes('page=51')) return new Promise((resolve) => {
        resolveProbe = resolve
      })
      return Promise.resolve(rows(50))
    })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(loaderStatus(wrapper)).toBe('success')
    expect(wrapper.findComponent(ChartViewerStub).props('series').data[0]).toHaveLength(50)
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
    resolveProbe(rows(1))
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(true)
  })

  it('ignores a stale probe answer', async () => {
    let resolveProbe: (v: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      if (url.includes('page=51')) return new Promise((resolve) => {
        resolveProbe = resolve
      })
      return Promise.resolve(url.includes('n__max') ? rows(50) : rows(3))
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    resolveProbe(rows(1))
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })

  it('refetches when a data field changes', async () => {
    mockApi(3, false)
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const count = dataCalls().length
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    expect(dataCalls()).toHaveLength(count + 1)
  })

  it('keeps the newest chart when a stale response resolves last', async () => {
    let resolveA: (v: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      if (url.includes('page=51')) return Promise.resolve({ data: [{ dep: 'z', n: 0 }] })
      if (url.includes('n__max')) return new Promise((resolve) => {
        resolveA = resolve
      })
      return Promise.resolve({ data: [{ dep: 'b', n: 1 }] })
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    resolveA({ data: Array.from({ length: 50 }, () => ({ dep: 'a', n: 9 })) })
    await settle()
    expect(wrapper.findComponent(ChartViewerStub).props('series').data[0]).toEqual([{ dep: 'b', n: 1 }])
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })

  it('keeps the data and shows no warning when the 51st-group probe fails', async () => {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (url.includes('page=51')) throw new Error('boom')
      return rows(50)
    })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.findComponent(ChartViewerStub).props('series').data[0]).toHaveLength(50)
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })

  it('resets the warning when the chart changes to one with fewer groups', async () => {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (url.includes('page=51')) return rows(1)
      return url.includes('n__max') ? rows(50) : rows(3)
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(true)
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })
})
