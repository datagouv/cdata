// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoadingBlock from '~/datagouv-components/src/components/LoadingBlock.vue'
import ChartViewerWrapper from '~/datagouv-components/src/components/Chart/ChartViewerWrapper.vue'
import { configKey } from '~/datagouv-components/src/config'
import type { ChartForApi } from '~/datagouv-components/src/types/visualizations'
import type { TabularDataResponse } from '~/datagouv-components/src/functions/tabularApi'

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

function tabularResponse(data: TabularDataResponse['data'], { next = null, total }: { next?: string | null, total?: number } = {}): TabularDataResponse {
  return {
    data,
    links: { profile: '', swagger: '', next, prev: null },
    meta: { page: 1, page_size: 50, ...(total === undefined ? {} : { total }) },
  }
}

// Like api-tabular 0.4.2, which sends a next link for any full page of an aggregate
function rows(count: number, options: { next?: string | null, total?: number } = {}) {
  return tabularResponse(Array.from({ length: count }, (_, i) => ({ dep: String(i), n: i })), {
    next: count >= 50 ? 'https://tabular.example.com/api/resources/r/data/?page=2&page_size=50' : null,
    ...options,
  })
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

function mountWrapper(chart: ChartForApi, searchDebounce = 0) {
  return mount(ChartViewerWrapper, {
    props: { chart },
    global: {
      stubs: { ChartViewer: ChartViewerStub },
      provide: { [configKey as symbol]: { tabularApiUrl: 'https://tabular.example.com', searchDebounce } },
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

  it('shows the chart loader while the data loads, then the chart', async () => {
    let resolveData: (v: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      return new Promise((resolve) => {
        resolveData = resolve
      })
    })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    const loader = wrapper.find('[data-testid="chart-loader"]')
    expect(loader.exists()).toBe(true)
    expect(loader.text()).toContain('Préparation du graphique')
    expect(loader.find('canvas').attributes('aria-hidden')).toBe('true')

    resolveData(rows(3))
    await settle()
    expect(wrapper.find('[data-testid="chart-loader"]').exists()).toBe(false)
  })

  it('keeps the first-load loader, without veil, until the debounced data request answers', async () => {
    let resolveData: (v: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      return new Promise((resolve) => {
        resolveData = resolve
      })
    })
    const wrapper = mountWrapper(chartFixture(), 300)
    for (let elapsed = 0; elapsed < 1000; elapsed += 100) {
      await vi.advanceTimersByTimeAsync(100)
      expect(wrapper.find('[data-testid="chart-loader"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="chart-reloading"]').exists()).toBe(false)
    }
    expect(dataCalls()).toHaveLength(1)

    resolveData(rows(3))
    await settle()
    expect(wrapper.find('[data-testid="chart-loader"]').exists()).toBe(false)
    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(true)
  })

  it('keeps the chart on screen while it reloads, veiled only when the reload is slow', async () => {
    let resolveData: (v: unknown) => void = () => {}
    let firstLoad = true
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      if (firstLoad) return Promise.resolve(rows(3))
      return new Promise((resolve) => {
        resolveData = resolve
      })
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(true)

    firstLoad = false
    await wrapper.setProps({ chart: { ...chart, x_axis: { ...chart.x_axis, column_x: 'reg' } } })
    await settle()
    expect(wrapper.find('[data-testid="chart-loader"]').exists()).toBe(false)
    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(true)
    expect(wrapper.find('[data-testid="chart-reloading"]').exists()).toBe(false)

    await vi.advanceTimersByTimeAsync(300)
    expect(wrapper.find('[data-testid="chart-reloading"]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-testid="chart-loader"]').exists()).toBe(false)

    resolveData(rows(3))
    await settle()
    expect(wrapper.find('[data-testid="chart-reloading"]').exists()).toBe(false)
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
      'Graphique tronqué : seules les 50 premières valeurs de dep sont prises en compte, le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.',
    )
  })

  it('shows the X-sort warning when sorted on X', async () => {
    mockApi(50, true)
    const chart = chartFixture()
    chart.x_axis.sort_x_by = 'axis_x'
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').text()).toBe('Graphique tronqué : seules les 50 premières valeurs de dep sont affichées. Ajoutez un filtre pour voir les autres valeurs.')
    // Over the chart, which is dimmed: a truncated chart must not read as the whole data.
    expect(wrapper.find('[data-testid="chart-notes"]').classes()).toEqual(expect.arrayContaining(['absolute', 'inset-0', 'bg-white/85']))
  })

  // RGAA 7.5: a live region announces what is added to it, so it is there before the note.
  it('announces the warning in a status region that exists before it, its icon hidden', async () => {
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
    const status = wrapper.find('[role="status"][data-testid="chart-notes"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('')

    resolveProbe(rows(1))
    await settle()
    const note = status.find('[data-testid="chart-truncation-warning"]')
    expect(note.exists()).toBe(true)
    expect(note.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('announces the loader as a status and a failed load as an alert', async () => {
    let rejectData: (e: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      return new Promise((_, reject) => {
        rejectData = reject
      })
    })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[data-testid="chart-loader"] [role="status"]').text()).toContain('Préparation du graphique')

    rejectData(Object.assign(new Error('400'), { statusCode: 400 }))
    await settle()
    expect(wrapper.find('[role="alert"]').text()).toContain('Une erreur est survenue lors du chargement des données du graphique.')
  })

  it('shows no warning when the 51st group is absent', async () => {
    mockApi(50, false)
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="chart-notes"]').classes()).not.toContain('bg-white/85')
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
      if (url.includes('m__max')) return tabularResponse([{ dep: 'a', m__max: 2 }])
      return tabularResponse([{ dep: 'a', n__max: 1 }])
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
      if (url.includes('page=51')) return Promise.resolve(tabularResponse([{ dep: 'z', n: 0 }]))
      if (url.includes('n__max')) return new Promise((resolve) => {
        resolveA = resolve
      })
      return Promise.resolve(tabularResponse([{ dep: 'b', n: 1 }]))
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    resolveA(tabularResponse(Array.from({ length: 50 }, () => ({ dep: 'a', n: 9 }))))
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

  it('shows the error message when tabular-api rejects the data request', async () => {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      throw Object.assign(new Error('[GET] /data/: 400 Bad Request'), { statusCode: 400 })
    })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(loaderStatus(wrapper)).toBe('error')
    expect(wrapper.text()).toContain('Une erreur est survenue lors du chargement des données du graphique.')
  })

  it('shows the series that loaded and a note when another series fails', async () => {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (url.includes('m__max')) throw new Error('400 Bad Request')
      return tabularResponse([{ dep: 'a', n__max: 1 }])
    })
    const chart = chartFixture()
    chart.series.push({ ...chart.series[0]!, column_y: 'm' })
    const wrapper = mountWrapper(chart)
    await settle()
    expect(loaderStatus(wrapper)).toBe('success')
    expect(wrapper.findComponent(ChartViewerStub).props('series').data).toEqual({ 0: [{ dep: 'a', n__max: 1 }] })
    expect(wrapper.find('[data-testid="chart-series-error"]').text()).toBe('Une série n’a pas pu être chargée.')
  })

  it('adds the readable reason of the failed series to its note', async () => {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (url.includes('m__max')) throw tabularError(404, databaseError('42883', 'function max(boolean) does not exist'))
      return tabularResponse([{ dep: 'a', n__max: 1 }])
    })
    const chart = chartFixture()
    chart.series.push({ ...chart.series[0]!, column_y: 'm' })
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('[data-testid="chart-series-error"]').text())
      .toBe('Une série n’a pas pu être chargée. Ce calcul n’est pas possible sur cette colonne.')
  })

  it('keeps the previous chart with its data while the data of a new aggregate loads', async () => {
    let resolveData: (v: unknown) => void = () => {}
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      if (url.includes('n__max')) return Promise.resolve(tabularResponse([{ dep: 'a', n__max: 1 }]))
      return new Promise((resolve) => {
        resolveData = resolve
      })
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    const viewer = () => wrapper.findComponent(ChartViewerStub)
    expect(viewer().props('chart').series[0].aggregate_y).toBe('max')
    expect(viewer().props('series').data[0]).toEqual([{ dep: 'a', n__max: 1 }])

    resolveData(tabularResponse([{ dep: 'a', n__sum: 5 }]))
    await settle()
    expect(viewer().props('chart').series[0].aggregate_y).toBe('sum')
    expect(viewer().props('series').data[0]).toEqual([{ dep: 'a', n__sum: 5 }])
  })

  it('passes a presentation-only change to the viewer right away', async () => {
    mockApi(3, false)
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    const next = structuredClone(chart)
    next.title = 'Other'
    await wrapper.setProps({ chart: next })
    expect(wrapper.findComponent(ChartViewerStub).props('chart').title).toBe('Other')
  })

  it('keeps the truncation warning during a reload until the new probe answers', async () => {
    let resolveProbe: (v: unknown) => void = () => {}
    let probes = 0
    ofetchMock.mockImplementation((url: string) => {
      if (url.includes('/profile/')) return Promise.resolve({ profile: { header: [] }, columns: {} })
      if (url.includes('page=51')) {
        probes++
        if (probes === 1) return Promise.resolve(rows(1))
        return new Promise((resolve) => {
          resolveProbe = resolve
        })
      }
      return Promise.resolve(rows(50))
    })
    const chart = chartFixture()
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(true)
    const next = structuredClone(chart)
    next.series[0]!.aggregate_y = 'sum'
    await wrapper.setProps({ chart: next })
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(true)
    resolveProbe(rows(0))
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })

  it('hides the X-sort truncation warning when the limit keeps fewer values than fetched', async () => {
    mockApi(50, true)
    const chart = chartFixture()
    chart.x_axis.sort_x_by = 'axis_x'
    chart.x_axis.limit = 5
    const wrapper = mountWrapper(chart)
    await settle()
    expect(wrapper.find('[data-testid="chart-truncation-warning"]').exists()).toBe(false)
  })
})

// Shaped like the FetchError ofetch throws: `data` is the parsed body.
function tabularError(statusCode: number | undefined, data?: unknown) {
  return Object.assign(new Error(`[GET] /data/: ${statusCode}`), { statusCode, data })
}

function databaseError(code: string, message: string) {
  return { errors: [{ code: null, title: 'Database error', detail: { code, details: null, hint: null, message } }] }
}

describe('ChartViewerWrapper load errors', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    ofetchMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function failDataWith(error: unknown) {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      throw error
    })
  }

  it('shows the readable reason of a refused query, without a retry button', async () => {
    failDataWith(tabularError(400, databaseError('22P02', 'invalid input syntax for type bigint: "abc"')))
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[role="alert"]').text()).toBe('Une valeur de filtre n’a pas le bon type : « abc » n’est pas un nombre entier.')
    expect(wrapper.find('[data-testid="chart-retry"]').exists()).toBe(false)
  })

  it('shows the unavailable-data message with a retry button for an unknown resource', async () => {
    failDataWith(tabularError(404, '404: Not Found'))
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[role="alert"]').text()).toBe('Les données de cette ressource ne sont pas disponibles.')
    expect(wrapper.find('[data-testid="chart-retry"]').text()).toBe('Réessayer')
  })

  it('keeps the generic message, with a retry button, for a network or CORS failure', async () => {
    failDataWith(tabularError(undefined))
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(wrapper.find('[role="alert"]').text()).toBe('Une erreur est survenue lors du chargement des données du graphique.')
    expect(wrapper.find('[data-testid="chart-retry"]').exists()).toBe(true)
  })

  it('reloads the data on retry and shows the chart once it answers', async () => {
    let failing = true
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (failing) throw tabularError(undefined)
      return rows(3)
    })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(loaderStatus(wrapper)).toBe('error')
    const callsBefore = dataCalls().length

    failing = false
    await wrapper.find('[data-testid="chart-retry"]').trigger('click')
    await settle()
    expect(dataCalls()).toHaveLength(callsBefore + 1)
    expect(loaderStatus(wrapper)).toBe('success')
    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})

describe('ChartViewerWrapper truncation note without probe', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    ofetchMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mockResponses({ page, probe }: { page: TabularDataResponse, probe?: () => unknown }) {
    ofetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/profile/')) return { profile: { header: [] }, columns: {} }
      if (url.includes('page=51')) return probe ? probe() : rows(0)
      return page
    })
  }

  const warning = (wrapper: ReturnType<typeof mountWrapper>) => wrapper.find('[data-testid="chart-truncation-warning"]').exists()

  function rawChart() {
    const chart = chartFixture()
    chart.series[0]!.aggregate_y = null
    return chart
  }

  function filteredChart() {
    const chart = chartFixture()
    chart.series[0]!.filters = { _cls: 'Filter', column: 'n', condition: 'less', value: '10' }
    return chart
  }

  it('reads the total of a raw series instead of probing', async () => {
    mockResponses({ page: rows(50, { total: 926 }) })
    const wrapper = mountWrapper(rawChart())
    await settle()
    expect(warning(wrapper)).toBe(true)
    expect(dataCalls()).toHaveLength(1)
  })

  it('shows no note for a raw series of exactly 50 rows, without probing', async () => {
    mockResponses({ page: rows(50, { total: 50 }) })
    const wrapper = mountWrapper(rawChart())
    await settle()
    expect(warning(wrapper)).toBe(false)
    expect(dataCalls()).toHaveLength(1)
  })

  // api-tabular from the exact-next-link version on
  it('shows no note for a full aggregated page without a next link, without probing', async () => {
    mockResponses({ page: rows(50, { next: null }) })
    const wrapper = mountWrapper(chartFixture())
    await settle()
    expect(warning(wrapper)).toBe(false)
    expect(dataCalls()).toHaveLength(1)
  })

  it('probes a full aggregated page with a next link, and reads a 416 as no further group', async () => {
    mockResponses({
      page: rows(50),
      probe: () => {
        throw Object.assign(new Error('[GET] /data/: 416 Range Not Satisfiable'), { statusCode: 416 })
      },
    })
    const wrapper = mountWrapper(filteredChart())
    await settle()
    expect(dataCalls()).toHaveLength(2)
    expect(warning(wrapper)).toBe(false)
  })

  it('does not probe a filtered aggregate whose page is not full', async () => {
    mockResponses({ page: rows(12) })
    const wrapper = mountWrapper(filteredChart())
    await settle()
    expect(dataCalls()).toHaveLength(1)
    expect(warning(wrapper)).toBe(false)
  })
})
